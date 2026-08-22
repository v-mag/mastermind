import {
  CODE_LENGTH,
  COLORS,
  type Code,
  type Color,
  type Feedback,
} from "./types";

export function isColor(value: unknown): value is Color {
  return typeof value === "string" && (COLORS as readonly string[]).includes(value);
}

export function isValidCode(value: unknown): value is Code {
  return (
    Array.isArray(value) &&
    value.length === CODE_LENGTH &&
    value.every(isColor)
  );
}

/**
 * Classic Mastermind feedback: black = exact position, white = wrong position.
 * Each peg is counted at most once.
 */
export function evaluateGuess(secret: Code, guess: Code): Feedback {
  let black = 0;
  const secretRemaining: Color[] = [];
  const guessRemaining: Color[] = [];

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secret[i] === guess[i]) {
      black += 1;
    } else {
      secretRemaining.push(secret[i]);
      guessRemaining.push(guess[i]);
    }
  }

  const counts = new Map<Color, number>();
  for (const color of secretRemaining) {
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  let white = 0;
  for (const color of guessRemaining) {
    const remaining = counts.get(color) ?? 0;
    if (remaining > 0) {
      white += 1;
      counts.set(color, remaining - 1);
    }
  }

  return { black, white };
}

/** Breaker scores 11 - N when cracked in N guesses; 0 if unsolved. */
export function scoreRound(guessCount: number, cracked: boolean): number {
  if (!cracked) {
    return 0;
  }
  return 11 - guessCount;
}

export function emptyCode(): (Color | null)[] {
  return Array.from({ length: CODE_LENGTH }, () => null);
}

export function createRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
