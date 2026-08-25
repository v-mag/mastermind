"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GameBoard } from "@/components/game/game-board";
import { Peg } from "@/components/game/peg";
import { Scoreboard } from "@/components/game/scoreboard";
import { useGameRoom } from "@/hooks/use-game-room";
import { emptyCode } from "@/lib/game/rules";
import type { RoomSettings } from "@/lib/game/types";

type RoomClientProps = {
  roomCode: string;
  playerName: string;
  roomSettings?: Partial<RoomSettings>;
};

export function RoomClient({ roomCode, playerName, roomSettings }: RoomClientProps) {
  const {
    playerId,
    state,
    connected,
    error,
    clearError,
    setSecret,
    guess,
    continueMatch,
  } = useGameRoom({ roomCode, playerName, roomSettings });
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/room/${roomCode}`;
  }, [roomCode]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  const waitingForOpponent =
    !state || state.phase === "lobby" || state.players.length < 2;

  const winner =
    state?.phase === "match_over"
      ? state.players.find((p) => p.id === state.winnerId)
      : null;

  const headline =
    state?.phase === "match_over"
      ? winner
        ? `${winner.name} wins`
        : "It's a draw"
      : null;

  const modeLabel =
    state?.gameMode === "fixed_guesser"
      ? "Fixed guesser"
      : "Alternating roles";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7a5e]">
            Room
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[#f3e6d0]">
            {roomCode}
          </h1>
          <p className="mt-1 text-sm text-[#a89070]">
            {connected ? "Connected" : "Connecting…"}
            {playerName ? ` · ${playerName}` : ""}
            {state ? ` · ${state.totalRounds} rounds · ${modeLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full border border-[#5a4632] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#d4a574] hover:border-[#d4a574]"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#5a4632] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#cbb89a] hover:border-[#d4a574]"
          >
            Leave
          </Link>
        </div>
      </header>

      {error ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[#8a3a2a] bg-[#2a1510] px-3 py-2 text-sm text-[#f0b0a0]">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs uppercase tracking-wider text-[#f0b0a0]/80"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {state ? <Scoreboard state={state} playerId={playerId} /> : null}

      {waitingForOpponent && state?.phase !== "match_over" ? (
        <div className="rounded-xl border border-dashed border-[#6b5438] bg-[#1a1510]/80 px-5 py-10 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl text-[#f3e6d0]">
            Waiting for opponent
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#a89070]">
            Share the room code <span className="text-[#d4a574]">{roomCode}</span>{" "}
            or the link. The match starts when both players are in.
          </p>
          {state ? (
            <p className="mx-auto mt-2 max-w-sm text-xs text-[#8f7a5e]">
              {state.totalRounds} {state.totalRounds === 1 ? "round" : "rounds"} ·{" "}
              {modeLabel}
            </p>
          ) : null}
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#8f7a5e]">
            Players {state?.players.length ?? 0} / 2
          </p>
        </div>
      ) : null}

      {state &&
      state.phase !== "lobby" &&
      state.phase !== "match_over" &&
      state.players.length >= 2 ? (
        <GameBoard
          state={state}
          playerId={playerId}
          onSetSecret={setSecret}
          onGuess={guess}
          onContinue={continueMatch}
        />
      ) : null}

      {state?.phase === "match_over" ? (
        <div className="space-y-5 rounded-xl border border-[#d4a574]/40 bg-[#221a14] px-5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8f7a5e]">
            Match over
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f3e6d0]">
            {headline}
          </h2>
          <div className="mx-auto flex max-w-xs justify-center gap-8 text-sm text-[#cbb89a]">
            {state.players.map((p) => (
              <div key={p.id}>
                <p className="text-[#8f7a5e]">{p.name}</p>
                <p className="font-mono text-2xl text-[#d4a574]">{p.score}</p>
              </div>
            ))}
          </div>
          {state.secret ? (
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#8f7a5e]">
                Last secret
              </p>
              <div className="flex items-center justify-center gap-2">
                {(state.secret ?? emptyCode()).map((color, index) => (
                  <Peg key={index} color={color} size="lg" />
                ))}
              </div>
            </div>
          ) : null}
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#d4a574] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#1a120c]"
          >
            New game
          </Link>
        </div>
      ) : null}
    </div>
  );
}
