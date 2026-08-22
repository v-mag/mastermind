"use client";

import { Peg } from "@/components/game/peg";
import type { Color, Feedback } from "@/lib/game/types";
import { CODE_LENGTH } from "@/lib/game/types";

type KeyPegsProps = {
  feedback: Feedback | null;
};

export function KeyPegs({ feedback }: KeyPegsProps) {
  // "exact" = right color + position (shown red); "near" = right color, wrong place
  const pegs: Array<"exact" | "near" | "empty"> = [];
  if (feedback) {
    for (let i = 0; i < feedback.black; i++) pegs.push("exact");
    for (let i = 0; i < feedback.white; i++) pegs.push("near");
  }
  while (pegs.length < CODE_LENGTH) pegs.push("empty");

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-md border border-[#3a2e24] bg-[#120e0a] p-1.5">
      {pegs.map((kind, index) => (
        <span
          key={`${kind}-${index}`}
          className="h-2.5 w-2.5 rounded-full border border-[#2a2018]"
          style={
            kind === "exact"
              ? {
                  background: "#c62828",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.35), 0 0 4px rgba(198,40,40,0.45)",
                }
              : kind === "near"
                ? {
                    background: "#e8e0d4",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
                  }
                : {
                    background: "#1c1612",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8)",
                  }
          }
        />
      ))}
    </div>
  );
}

type CodeRowProps = {
  code: Array<Color | null>;
  activeIndex?: number | null;
  onSelectSlot?: (index: number) => void;
  feedback?: Feedback | null;
  label?: string;
  dimmed?: boolean;
};

export function CodeRow({
  code,
  activeIndex = null,
  onSelectSlot,
  feedback = null,
  label,
  dimmed = false,
}: CodeRowProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-lg border border-[#3d3126] bg-[#1c1612]/90 px-3 py-2",
        dimmed ? "opacity-55" : "",
      ].join(" ")}
    >
      {label ? (
        <span className="w-6 font-mono text-xs tracking-wider text-[#a89070]">
          {label}
        </span>
      ) : null}
      <div className="flex flex-1 items-center justify-center gap-2">
        {code.map((color, index) => (
          <Peg
            key={index}
            color={color}
            selected={activeIndex === index}
            onClick={onSelectSlot ? () => onSelectSlot(index) : undefined}
            ariaLabel={`Slot ${index + 1}${color ? `: ${color}` : ""}`}
          />
        ))}
      </div>
      <KeyPegs feedback={feedback} />
    </div>
  );
}
