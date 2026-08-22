"use client";

import { Peg } from "@/components/game/peg";
import { COLORS, type Color } from "@/lib/game/types";

type ColorPaletteProps = {
  selected: Color | null;
  onSelect: (color: Color) => void;
  disabled?: boolean;
};

export function ColorPalette({
  selected,
  onSelect,
  disabled = false,
}: ColorPaletteProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[#4a3a28] bg-[#241c16] px-4 py-3 shadow-[inset_0_1px_0_rgba(212,165,116,0.15)]">
      {COLORS.map((color) => (
        <Peg
          key={color}
          color={color}
          size="lg"
          selected={selected === color}
          muted={disabled}
          onClick={disabled ? undefined : () => onSelect(color)}
        />
      ))}
    </div>
  );
}
