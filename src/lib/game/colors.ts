import type { Color } from "@/lib/game/types";

export const COLOR_STYLES: Record<
  Color,
  { fill: string; gloss: string; label: string }
> = {
  red: {
    fill: "#c62828",
    gloss: "#ef5350",
    label: "Red",
  },
  orange: {
    fill: "#ef6c00",
    gloss: "#ffb74d",
    label: "Orange",
  },
  yellow: {
    fill: "#f9a825",
    gloss: "#ffe082",
    label: "Yellow",
  },
  green: {
    fill: "#2e7d32",
    gloss: "#66bb6a",
    label: "Green",
  },
  blue: {
    fill: "#1565c0",
    gloss: "#64b5f6",
    label: "Blue",
  },
  pink: {
    fill: "#d81b60",
    gloss: "#f48fb1",
    label: "Pink",
  },
  white: {
    fill: "#e8e4dc",
    gloss: "#ffffff",
    label: "White",
  },
  gray: {
    fill: "#616161",
    gloss: "#bdbdbd",
    label: "Gray",
  },
};
