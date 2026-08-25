"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";

import {
  createRoomCode,
  normalizeRoomCode,
} from "@/lib/game/rules";
import type { FixedGuesserRole, GameMode } from "@/lib/game/types";

const NAME_KEY = "mastermind-player-name";

function readStoredName(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

function useStoredName(): [string, (value: string) => void] {
  const stored = useSyncExternalStore(
    () => () => undefined,
    readStoredName,
    () => "",
  );
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? stored;

  function persistName(value: string) {
    setDraft(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NAME_KEY, value.trim());
    }
  }

  return [name, persistName];
}

export function HomeLobby() {
  const router = useRouter();
  const [name, persistName] = useStoredName();
  const [joinCode, setJoinCode] = useState("");
  const [totalRounds, setTotalRounds] = useState(2);
  const [gameMode, setGameMode] = useState<GameMode>("alternating");
  const [fixedGuesser, setFixedGuesser] = useState<FixedGuesserRole>("guest");

  function goToRoom(
    code: string,
    settings?: { totalRounds: number; gameMode: GameMode; fixedGuesser: FixedGuesserRole },
  ) {
    const cleaned = normalizeRoomCode(code);
    if (cleaned.length < 4) {
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(NAME_KEY, name.trim());
    }
    const params = new URLSearchParams();
    if (name.trim()) {
      params.set("name", name.trim());
    }
    if (settings) {
      params.set("rounds", String(settings.totalRounds));
      params.set("mode", settings.gameMode === "fixed_guesser" ? "fixed" : "alternating");
      if (settings.gameMode === "fixed_guesser") {
        params.set("guesser", settings.fixedGuesser);
      }
    }
    const qs = params.toString();
    router.push(`/room/${cleaned}${qs ? `?${qs}` : ""}`);
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    goToRoom(createRoomCode(), {
      totalRounds,
      gameMode,
      fixedGuesser,
    });
  }

  function onJoin(event: FormEvent) {
    event.preventDefault();
    goToRoom(joinCode);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7a5e]">
          Two players · Custom rounds & modes
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-wide text-[#f3e6d0] sm:text-6xl">
          Mastermind
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#a89070]">
          One player locks a four-peg secret. The other has ten tries to crack
          it. Swap roles each round, or pick one player to guess every round.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#8f7a5e]">
          Display name
        </span>
        <input
          value={name}
          onChange={(e) => persistName(e.target.value)}
          maxLength={20}
          placeholder="Agent"
          className="w-full rounded-xl border border-[#4a3a28] bg-[#1a1510] px-4 py-3 text-[#f3e6d0] outline-none ring-[#d4a574] placeholder:text-[#6b5a45] focus:ring-1"
        />
      </label>

      <form
        onSubmit={onCreate}
        className="rounded-2xl border border-[#4a3a28] bg-[#221a14]/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[#f3e6d0]">
          Create a room
        </h2>
        <p className="mt-1 text-sm text-[#8f7a5e]">
          Choose how many rounds to play and who guesses.
        </p>

        <label className="mt-4 block space-y-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#8f7a5e]">
            Rounds
          </span>
          <select
            value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            className="w-full rounded-xl border border-[#4a3a28] bg-[#120e0a] px-4 py-3 text-[#f3e6d0] outline-none ring-[#d4a574] focus:ring-1"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((rounds) => (
              <option key={rounds} value={rounds}>
                {rounds} {rounds === 1 ? "round" : "rounds"}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-[11px] uppercase tracking-[0.18em] text-[#8f7a5e]">
            Game mode
          </legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#4a3a28] bg-[#120e0a] px-4 py-3">
            <input
              type="radio"
              name="gameMode"
              value="alternating"
              checked={gameMode === "alternating"}
              onChange={() => setGameMode("alternating")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm text-[#f3e6d0]">Alternating roles</span>
              <span className="mt-0.5 block text-xs text-[#8f7a5e]">
                Players swap setter and breaker each round.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#4a3a28] bg-[#120e0a] px-4 py-3">
            <input
              type="radio"
              name="gameMode"
              value="fixed_guesser"
              checked={gameMode === "fixed_guesser"}
              onChange={() => setGameMode("fixed_guesser")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm text-[#f3e6d0]">Fixed guesser</span>
              <span className="mt-0.5 block text-xs text-[#8f7a5e]">
                One player guesses every round; the other always sets the code.
              </span>
            </span>
          </label>
        </fieldset>

        {gameMode === "fixed_guesser" ? (
          <label className="mt-4 block space-y-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#8f7a5e]">
              Who guesses?
            </span>
            <select
              value={fixedGuesser}
              onChange={(e) => setFixedGuesser(e.target.value as FixedGuesserRole)}
              className="w-full rounded-xl border border-[#4a3a28] bg-[#120e0a] px-4 py-3 text-[#f3e6d0] outline-none ring-[#d4a574] focus:ring-1"
            >
              <option value="guest">Opponent (joiner)</option>
              <option value="host">Me (room host)</option>
            </select>
          </label>
        ) : null}

        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-[#d4a574] py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#1a120c] hover:bg-[#e0b888]"
        >
          New game
        </button>
      </form>

      <form
        onSubmit={onJoin}
        className="rounded-2xl border border-[#3a2e24] bg-[#1a1510]/80 p-5"
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[#f3e6d0]">
          Join a room
        </h2>
        <p className="mt-1 text-sm text-[#8f7a5e]">
          Enter the six-character code from your opponent.
        </p>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
          maxLength={6}
          placeholder="ABC123"
          className="mt-4 w-full rounded-xl border border-[#4a3a28] bg-[#120e0a] px-4 py-3 font-mono text-lg tracking-[0.3em] text-[#d4a574] outline-none ring-[#d4a574] placeholder:text-[#4a3c2e] focus:ring-1"
        />
        <button
          type="submit"
          disabled={joinCode.length < 4}
          className="mt-4 w-full rounded-full border border-[#5a4632] py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#d4a574] hover:border-[#d4a574] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Join
        </button>
      </form>

      <div className="rounded-xl border border-[#3a2e24]/80 bg-[#14100c]/60 px-4 py-3 text-xs leading-relaxed text-[#8f7a5e]">
        <p className="uppercase tracking-[0.16em] text-[#a89070]">Rules</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>4 pegs, 8 colors, duplicates allowed</li>
          <li>Red tab (right) = right color & position</li>
          <li>White tab (left) = right color, wrong position</li>
          <li>Score = 11 − guesses if cracked, else 0</li>
        </ul>
      </div>
    </div>
  );
}
