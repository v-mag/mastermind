# Mastermind — online two-player

Classic Mastermind for two players. Each match has two rounds: one player sets the secret code while the other tries to crack it, then roles swap.

## Stack

- **Next.js** (UI) on port 3000
- **Cloudflare PartyServer** (realtime rooms) via Wrangler on port 8787

## Local development

```bash
npm install
cp .env.example .env.local   # if needed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a room in one browser (or incognito), join with the code in another.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js + Wrangler together |
| `npm run dev:next` | UI only |
| `npm run dev:worker` | PartyServer only |
| `npm run deploy:worker` | Deploy the worker to Cloudflare |
| `npm run build` | Production Next.js build |

Set `NEXT_PUBLIC_PARTY_HOST` to your deployed worker host (no protocol), e.g. `mastermind-game.you.workers.dev`.

## Rules

- 4 pegs, 8 colors, duplicates allowed
- 10 guesses per round
- Red key peg = correct color and position
- White key peg = correct color, wrong position
- Score: `11 - guesses` if cracked, otherwise `0`
