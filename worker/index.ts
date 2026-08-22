import { routePartykitRequest } from "partyserver";

import { GameRoom } from "./game-room";

export { GameRoom };

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function corsHeaders(origin: string | null): HeadersInit {
  const allowed =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost"));

  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const routed = await routePartykitRequest(request, env);
    if (routed) {
      // WebSocket upgrades must be returned untouched.
      if (
        routed.status === 101 ||
        request.headers.get("Upgrade")?.toLowerCase() === "websocket"
      ) {
        return routed;
      }

      const headers = new Headers(routed.headers);
      const cors = corsHeaders(origin);
      for (const [key, value] of Object.entries(cors)) {
        headers.set(key, value);
      }
      return new Response(routed.body, {
        status: routed.status,
        statusText: routed.statusText,
        headers,
      });
    }

    return new Response("Mastermind PartyServer", {
      status: 200,
      headers: corsHeaders(origin),
    });
  },
};
