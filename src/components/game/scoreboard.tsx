"use client";

import type { PublicRoomState } from "@/lib/game/types";

type ScoreboardProps = {
  state: PublicRoomState;
  playerId: string;
};

export function Scoreboard({ state, playerId }: ScoreboardProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {state.players.map((player) => {
        const isYou = player.id === playerId;
        const role =
          player.id === state.setterId
            ? "Setter"
            : player.id === state.breakerId
              ? "Breaker"
              : "Waiting";

        return (
          <div
            key={player.id}
            className={[
              "rounded-lg border px-3 py-2",
              isYou
                ? "border-[#d4a574]/60 bg-[#2a2118]"
                : "border-[#3a2e24] bg-[#1a1510]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-[family-name:var(--font-display)] text-sm tracking-wide text-[#f3e6d0]">
                {player.name}
                {isYou ? " (you)" : ""}
              </p>
              <span className="font-mono text-lg text-[#d4a574]">
                {player.score}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#8f7a5e]">
              <span>{role}</span>
              <span className={player.connected ? "text-[#7cb87c]" : "text-[#c07060]"}>
                {player.connected ? "Online" : "Away"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
