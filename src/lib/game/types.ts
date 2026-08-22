export const COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "pink",
  "white",
  "gray",
] as const;

export type Color = (typeof COLORS)[number];

export const CODE_LENGTH = 4;
export const MAX_GUESSES = 10;
export const MAX_PLAYERS = 2;
export const TOTAL_ROUNDS = 2;

export type Phase =
  | "lobby"
  | "setting"
  | "guessing"
  | "reveal"
  | "match_over";

export type Code = Color[];

export type Feedback = {
  black: number;
  white: number;
};

export type GuessRow = {
  code: Code;
  feedback: Feedback;
};

export type Player = {
  id: string;
  name: string;
  connected: boolean;
  score: number;
};

export type RoomState = {
  roomCode: string;
  phase: Phase;
  players: Player[];
  hostId: string | null;
  round: number;
  setterId: string | null;
  breakerId: string | null;
  guesses: GuessRow[];
  /** Present only for the setter during a round, or for everyone after reveal / match over. */
  secret: Code | null;
  lastError: string | null;
  winnerId: string | null;
};

export type PublicRoomState = Omit<RoomState, "secret"> & {
  secret: Code | null;
};
