"use client";

import { useState, type DragEvent } from "react";

import { Peg } from "@/components/game/peg";
import { setDragColor } from "@/lib/game/drag";
import { COLORS, type Color } from "@/lib/game/types";

type ColorPaletteProps = {
  selected: Color | null;
  onSelect: (color: Color) => void;
  disabled?: boolean;
  enableDrag?: boolean;
};

export function ColorPalette({
  selected,
  onSelect,
  disabled = false,
  enableDrag = false,
}: ColorPaletteProps) {
  const [draggingColor, setDraggingColor] = useState<Color | null>(null);

  function handleDragStart(event: DragEvent<HTMLDivElement>, color: Color) {
    if (disabled || !enableDrag) {
      return;
    }
    setDragColor(event, color);
    setDraggingColor(color);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[#4a3a28] bg-[#241c16] px-4 py-3 shadow-[inset_0_1px_0_rgba(212,165,116,0.15)]">
      {COLORS.map((color) => (
        <div
          key={color}
          draggable={enableDrag && !disabled}
          onDragStart={(event) => handleDragStart(event, color)}
          onDragEnd={() => setDraggingColor(null)}
          onClick={disabled ? undefined : () => onSelect(color)}
          className={[
            "rounded-full",
            enableDrag && !disabled
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-pointer",
          ].join(" ")}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${color} peg`}
        >
          <Peg
            color={color}
            size="lg"
            selected={selected === color}
            muted={disabled}
            pointerPassThrough
            dragging={draggingColor === color}
          />
        </div>
      ))}
    </div>
  );
}
