"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import usePartySocket from "partysocket/react";
import type { PartySocket } from "partysocket";

import type { ClientMessage, ServerMessage } from "@/lib/game/protocol";
import { getOrCreatePlayerId } from "@/lib/game/client";
import type { Code, PublicRoomState } from "@/lib/game/types";

type UseGameRoomOptions = {
  roomCode: string;
  playerName: string;
};

type UseGameRoomResult = {
  playerId: string;
  state: PublicRoomState | null;
  connected: boolean;
  error: string | null;
  clearError: () => void;
  setSecret: (code: Code) => void;
  guess: (code: Code) => void;
  continueMatch: () => void;
};

function partyHost(): string {
  return process.env.NEXT_PUBLIC_PARTY_HOST ?? "127.0.0.1:8787";
}

function usePlayerId(): string {
  return useSyncExternalStore(
    () => () => undefined,
    () => getOrCreatePlayerId(),
    () => "",
  );
}

export function useGameRoom({
  roomCode,
  playerName,
}: UseGameRoomOptions): UseGameRoomResult {
  const playerId = usePlayerId();
  const [state, setState] = useState<PublicRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const joinedRef = useRef(false);
  const send = useCallback((socket: PartySocket | null, message: ClientMessage) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify(message));
  }, []);

  const socket = usePartySocket({
    host: partyHost(),
    party: "game-room",
    room: roomCode.toLowerCase(),
    onOpen() {
      setConnected(true);
      joinedRef.current = false;
    },
    onClose() {
      setConnected(false);
      joinedRef.current = false;
    },
    onError() {
      setError("Lost connection to the game room.");
    },
    onMessage(event) {
      try {
        const message = JSON.parse(String(event.data)) as ServerMessage;
        if (message.type === "state") {
          setState(message.state);
          if (message.state.lastError) {
            setError(message.state.lastError);
          }
        } else if (message.type === "error") {
          setError(message.message);
        }
      } catch {
        setError("Received a malformed message from the server.");
      }
    },
  });

  useEffect(() => {
    if (!playerId || !connected || joinedRef.current) {
      return;
    }
    send(socket, {
      type: "join",
      playerId,
      name: playerName || "Player",
    });
    joinedRef.current = true;
  }, [playerId, connected, playerName, send, socket]);

  const setSecret = useCallback(
    (code: Code) => {
      send(socket, { type: "setSecret", code });
    },
    [send, socket],
  );

  const guess = useCallback(
    (code: Code) => {
      send(socket, { type: "guess", code });
    },
    [send, socket],
  );

  const continueMatch = useCallback(() => {
    send(socket, { type: "continue" });
  }, [send, socket]);

  return useMemo(
    () => ({
      playerId,
      state,
      connected,
      error,
      clearError: () => setError(null),
      setSecret,
      guess,
      continueMatch,
    }),
    [playerId, state, connected, error, setSecret, guess, continueMatch],
  );
}
