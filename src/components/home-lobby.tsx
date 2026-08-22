"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";

import { createRoomCode, normalizeRoomCode } from "@/lib/game/rules";

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
  function goToRoom(code: string) {
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
    const qs = params.toString();
    router.push(`/room/${cleaned}${qs ? `?${qs}` : ""}`);
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    goToRoom(createRoomCode());
  }

  function onJoin(event: FormEvent) {
    event.preventDefault();
    goToRoom(joinCode);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7a5e]">
          Two players · Alternating rounds
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl leading-none tracking-wide text-[#f3e6d0] sm:text-6xl">
          Mastermind
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#a89070]">
          One player locks a four-peg secret. The other has ten tries to crack
          it. Then you swap seats for round two. Highest score wins.
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
          You set the secret in round 1. Your guest breaks first.
        </p>
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
