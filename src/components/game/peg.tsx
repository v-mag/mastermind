"use client";

import { COLOR_STYLES } from "@/lib/game/colors";
import type { Color } from "@/lib/game/types";

type PegProps = {
  color: Color | null;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  muted?: boolean;
};

const SIZE_CLASS = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-11 w-11",
} as const;

export function Peg({
  color,
  size = "md",
  selected = false,
  onClick,
  ariaLabel,
  muted = false,
}: PegProps) {
  const interactive = typeof onClick === "function";
  const style = color ? COLOR_STYLES[color] : null;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      aria-label={ariaLabel ?? (color ? COLOR_STYLES[color].label : "Empty peg")}
      className={[
        SIZE_CLASS[size],
        "relative shrink-0 rounded-full border transition-transform",
        interactive ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default",
        selected ? "ring-2 ring-[#d4a574] ring-offset-2 ring-offset-[#1a1510]" : "",
        muted ? "opacity-50" : "",
      ].join(" ")}
      style={
        style
          ? {
              background: `radial-gradient(circle at 30% 28%, ${style.gloss}, ${style.fill} 55%, #1a0f0a 140%)`,
              borderColor: "#2a1c12",
              boxShadow:
                "inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 5px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.4)",
            }
          : {
              background:
                "radial-gradient(circle at 50% 40%, #2c241c, #14100c 70%)",
              borderColor: "#3a2e24",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.7)",
            }
      }
    />
  );
}
