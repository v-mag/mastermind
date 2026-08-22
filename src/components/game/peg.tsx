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
  draggable?: boolean;
  dragging?: boolean;
  dropTarget?: boolean;
  pointerPassThrough?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLButtonElement>) => void;
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
  draggable = false,
  dragging = false,
  dropTarget = false,
  pointerPassThrough = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: PegProps) {
  const interactive =
    typeof onClick === "function" || draggable || dropTarget;
  const style = color ? COLOR_STYLES[color] : null;

  return (
    <button
      type="button"
      disabled={!interactive && !pointerPassThrough}
      draggable={draggable && color !== null}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={pointerPassThrough ? undefined : onClick}
      aria-label={ariaLabel ?? (color ? COLOR_STYLES[color].label : "Empty peg")}
      className={[
        SIZE_CLASS[size],
        "relative shrink-0 rounded-full border transition-transform",
        pointerPassThrough ? "pointer-events-none" : "",
        !pointerPassThrough && interactive
          ? "cursor-pointer hover:scale-105 active:scale-95 touch-none"
          : "cursor-default",
        draggable && color && !pointerPassThrough
          ? "cursor-grab active:cursor-grabbing"
          : "",
        dropTarget ? "cursor-copy" : "",
        selected ? "ring-2 ring-[#d4a574] ring-offset-2 ring-offset-[#1a1510]" : "",
        muted ? "opacity-50" : "",
        dragging ? "scale-95 opacity-40" : "",
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
