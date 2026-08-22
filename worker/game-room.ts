import { Server, type Connection, type ConnectionContext } from "partyserver";

import { parseClientMessage, type ServerMessage } from "../src/lib/game/protocol";
import {
  evaluateGuess,
  isValidCode,
  scoreRound,
} from "../src/lib/game/rules";
import {
  MAX_GUESSES,
  MAX_PLAYERS,
  TOTAL_ROUNDS,
  type Code,
  type Phase,
  type Player,
  type PublicRoomState,
  type RoomState,
} from "../src/lib/game/types";

type ConnectionPlayerState = {
  playerId: string | null;
};

function createInitialState(roomCode: string): RoomState {
  return {
    roomCode,
    phase: "lobby",
    players: [],
    hostId: null,
    round: 1,
    setterId: null,
    breakerId: null,
    guesses: [],
    secret: null,
    lastError: null,
    winnerId: null,
  };
}

export class GameRoom extends Server<Env> {
  static options = { hibernate: true };

  private game: RoomState = createInitialState("????");
  private secret: Code | null = null;

  async onStart() {
    const stored = await this.ctx.storage.get<{
      game: RoomState;
      secret: Code | null;
    }>("match");
    if (stored) {
      this.game = stored.game;
      this.secret = stored.secret;
    } else {
      this.game = createInitialState(this.name.toUpperCase());
    }
  }

  async onConnect(connection: Connection<ConnectionPlayerState>, _ctx: ConnectionContext) {
    connection.setState({ playerId: null });
    this.sendState(connection);
  }

  async onMessage(connection: Connection<ConnectionPlayerState>, message: string | ArrayBuffer) {
    if (typeof message !== "string") {
      this.sendError(connection, "Invalid message format.");
      return;
    }

    const parsed = parseClientMessage(message);
    if (!parsed) {
      this.sendError(connection, "Unknown message.");
      return;
    }

    switch (parsed.type) {
      case "join":
        await this.handleJoin(connection, parsed.playerId, parsed.name);
        break;
      case "setSecret":
        await this.handleSetSecret(connection, parsed.code);
        break;
      case "guess":
        await this.handleGuess(connection, parsed.code);
        break;
      case "continue":
        await this.handleContinue(connection);
        break;
      default: {
        const _exhaustive: never = parsed;
        void _exhaustive;
        this.sendError(connection, "Unknown message.");
      }
    }
  }

  async onClose(connection: Connection<ConnectionPlayerState>) {
    const playerId = connection.state?.playerId;
    if (!playerId) {
      return;
    }

    const stillConnected = [...this.getConnections<ConnectionPlayerState>()].some(
      (c) => c.id !== connection.id && c.state?.playerId === playerId,
    );
    if (stillConnected) {
      return;
    }

    const player = this.game.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = false;
      await this.persist();
      this.broadcastState();
    }
  }

  private async handleJoin(
    connection: Connection<ConnectionPlayerState>,
    playerId: string,
    name: string,
  ) {
    if (!playerId || typeof playerId !== "string") {
      this.sendError(connection, "Missing player id.");
      return;
    }

    const displayName = (name || "Player").trim().slice(0, 20) || "Player";
    const existing = this.game.players.find((p) => p.id === playerId);

    if (existing) {
      existing.name = displayName;
      existing.connected = true;
      connection.setState({ playerId });
      await this.persist();
      this.broadcastState();
      return;
    }

    if (this.game.players.length >= MAX_PLAYERS) {
      this.sendError(connection, "This room is full.");
      connection.close(4000, "Room full");
      return;
    }

    if (this.game.phase !== "lobby") {
      this.sendError(connection, "This match already started.");
      connection.close(4001, "Match started");
      return;
    }

    const player: Player = {
      id: playerId,
      name: displayName,
      connected: true,
      score: 0,
    };
    this.game.players.push(player);
    connection.setState({ playerId });

    if (!this.game.hostId) {
      this.game.hostId = playerId;
    }

    if (this.game.players.length === MAX_PLAYERS) {
      this.startRound(1);
    }

    await this.persist();
    this.broadcastState();
  }

  private startRound(round: number) {
    const [host, guest] = this.game.players;
    this.game.round = round;
    this.game.guesses = [];
    this.secret = null;
    this.game.secret = null;
    this.game.lastError = null;
    this.game.phase = "setting";

    if (round === 1) {
      this.game.setterId = host.id;
      this.game.breakerId = guest.id;
    } else {
      this.game.setterId = guest.id;
      this.game.breakerId = host.id;
    }
  }

  private async handleSetSecret(
    connection: Connection<ConnectionPlayerState>,
    code: Code,
  ) {
    const playerId = connection.state?.playerId;
    if (!playerId || playerId !== this.game.setterId) {
      this.sendError(connection, "Only the code setter can set the secret.");
      return;
    }
    if (this.game.phase !== "setting") {
      this.sendError(connection, "It is not time to set a secret.");
      return;
    }
    if (!isValidCode(code)) {
      this.sendError(connection, "Invalid code. Use 4 colors.");
      return;
    }

    this.secret = [...code];
    this.game.phase = "guessing";
    this.game.lastError = null;
    await this.persist();
    this.broadcastState();
  }

  private async handleGuess(
    connection: Connection<ConnectionPlayerState>,
    code: Code,
  ) {
    const playerId = connection.state?.playerId;
    if (!playerId || playerId !== this.game.breakerId) {
      this.sendError(connection, "Only the code breaker can guess.");
      return;
    }
    if (this.game.phase !== "guessing" || !this.secret) {
      this.sendError(connection, "It is not time to guess.");
      return;
    }
    if (!isValidCode(code)) {
      this.sendError(connection, "Invalid code. Use 4 colors.");
      return;
    }

    const feedback = evaluateGuess(this.secret, code);
    this.game.guesses.push({ code: [...code], feedback });
    this.game.lastError = null;

    const cracked = feedback.black === this.secret.length;
    const outOfGuesses = this.game.guesses.length >= MAX_GUESSES;

    if (cracked || outOfGuesses) {
      const points = scoreRound(this.game.guesses.length, cracked);
      const breaker = this.game.players.find((p) => p.id === this.game.breakerId);
      if (breaker) {
        breaker.score += points;
      }
      this.game.phase = "reveal";
    }

    await this.persist();
    this.broadcastState();
  }

  private async handleContinue(connection: Connection<ConnectionPlayerState>) {
    const playerId = connection.state?.playerId;
    if (!playerId) {
      this.sendError(connection, "Join the room first.");
      return;
    }
    if (this.game.phase !== "reveal") {
      this.sendError(connection, "Nothing to continue yet.");
      return;
    }

    if (this.game.round >= TOTAL_ROUNDS) {
      this.game.phase = "match_over";
      this.game.winnerId = this.computeWinnerId();
    } else {
      this.startRound(this.game.round + 1);
    }

    await this.persist();
    this.broadcastState();
  }

  private computeWinnerId(): string | null {
    if (this.game.players.length < 2) {
      return null;
    }
    const [a, b] = this.game.players;
    if (a.score === b.score) {
      return null;
    }
    return a.score > b.score ? a.id : b.id;
  }

  private async persist() {
    await this.ctx.storage.put("match", {
      game: this.game,
      secret: this.secret,
    });
  }

  private toPublicState(viewerId: string | null): PublicRoomState {
    const canSeeSecret =
      this.game.phase === "reveal" ||
      this.game.phase === "match_over" ||
      (viewerId !== null &&
        viewerId === this.game.setterId &&
        (this.game.phase === "setting" || this.game.phase === "guessing"));

    return {
      ...this.game,
      secret: canSeeSecret ? (this.secret ? [...this.secret] : null) : null,
      phase: this.game.phase as Phase,
    };
  }

  private sendState(connection: Connection<ConnectionPlayerState>) {
    const playerId = connection.state?.playerId ?? null;
    const payload: ServerMessage = {
      type: "state",
      state: this.toPublicState(playerId),
    };
    connection.send(JSON.stringify(payload));
  }

  private broadcastState() {
    for (const connection of this.getConnections<ConnectionPlayerState>()) {
      this.sendState(connection);
    }
  }

  private sendError(connection: Connection, message: string) {
    const payload: ServerMessage = { type: "error", message };
    connection.send(JSON.stringify(payload));
  }
}
