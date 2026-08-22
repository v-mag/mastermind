import type { Code, PublicRoomState } from "./types";

export type ClientMessage =
  | { type: "join"; playerId: string; name: string }
  | { type: "setSecret"; code: Code }
  | { type: "guess"; code: Code }
  | { type: "continue" };

export type ServerMessage =
  | { type: "state"; state: PublicRoomState }
  | { type: "error"; message: string };

export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const data = JSON.parse(raw) as {
      type?: unknown;
      playerId?: unknown;
      name?: unknown;
      code?: unknown;
    };

    if (!data || typeof data.type !== "string") {
      return null;
    }

    switch (data.type) {
      case "join": {
        if (typeof data.playerId !== "string") {
          return null;
        }
        return {
          type: "join",
          playerId: data.playerId,
          name: typeof data.name === "string" ? data.name : "Player",
        };
      }
      case "setSecret": {
        return { type: "setSecret", code: data.code as Code };
      }
      case "guess": {
        return { type: "guess", code: data.code as Code };
      }
      case "continue": {
        return { type: "continue" };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
