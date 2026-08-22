import { HomeLobby } from "@/components/home-lobby";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(212,165,116,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(120,70,40,0.18),transparent_40%),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_3px)]" />
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <HomeLobby />
      </div>
    </main>
  );
}
