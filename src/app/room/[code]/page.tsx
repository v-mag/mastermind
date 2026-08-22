import { RoomClient } from "@/components/game/room-client";
import { normalizeRoomCode } from "@/lib/game/rules";

type RoomPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { code } = await params;
  const query = await searchParams;
  const roomCode = normalizeRoomCode(code);
  const playerName = (query.name ?? "Player").trim().slice(0, 20) || "Player";

  return (
    <main className="relative flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_50%_0%,rgba(212,165,116,0.1),transparent_40%),repeating-linear-gradient(90deg,transparent,transparent_3px,rgba(0,0,0,0.12)_4px)]" />
      <div className="relative z-10">
        <RoomClient roomCode={roomCode} playerName={playerName} />
      </div>
    </main>
  );
}
