export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const key = "mastermind-player-id";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, id);
  return id;
}
