# VFishing

[![CI](https://github.com/MrVokerr/VFishing/actions/workflows/ci.yml/badge.svg)](https://github.com/MrVokerr/VFishing/actions/workflows/ci.yml)

ArcheAge-inspired browser fishing RPG built with Next.js and React.

**[Play online](https://vfishinggame.vercel.app/)** · **[GitHub](https://github.com/MrVokerr/VFishing)**

## How it plays

1. **Cast** at your current location and wait for a bite.
2. **Hook** the fish when it strikes.
3. **Fight** — counter the fish's moves (left, right, jump, dive) while managing line tension. Snap the line and you lose.
4. **Catch** — land the fish to earn XP and fill your pack.
5. **Shop** — sell your haul for coins, buy rods, boats, and bait, then travel to harder locations.

Progress is saved automatically in your browser (validated with Zod).

## Features

- **Active fish fights** — counter LEFT / RIGHT / JUMP / DIVE (and RUN in rage) with line tension
- **Legendary Final Burst QTE** — at 15% HP, a randomized 4-step button sequence (retry on miss)
- **Progression** — XP, shop, rods, boats, bait, locations
- **Pack inventory** — sell haul at the shop; boat sets capacity
- **Persistence** — auto-save to localStorage (validated with Zod)

## Progression

Five locations unlock as you upgrade gear. Each tier raises fish HP via a difficulty multiplier.

| Location | Tier | Requirements |
|----------|------|--------------|
| Quiet Pond | 1 | — |
| River Stream | 2 | Bamboo Pole |
| Misty Lake | 3 | Rowboat |
| Coastal Waters | 4 | Fiberglass Rod + Motorboat |
| The Deep Sea | 5 | Carbon Fiber Rod + Trawler |

Rods, boats, and bait unlock from the shop by player level. XP is a fixed amount per fish species (e.g. Sardine 10, Kraken 2000) — see `src/lib/data.ts` for full stats.

### Boat fight stamina

Stamina is Big Reel fuel only; it does not regenerate mid-fight.

| Boat | Fight stamina |
|------|---------------|
| Raft | 0 |
| Rowboat | 5 |
| Motorboat | 10 |
| Fishing Trawler | 15 |

### Big Reel

Available at **location tier 3+**. Costs **1 stamina** per use. Deals instant damage equal to **`rod.damage × 1.5`**. Auto Play only triggers Big Reel when stamina ≥ 1 and line tension is **≤ 75%**.

## Controls

### Menu / Idle
- **W / S** — Cast line
- **A / D** or **Arrow Left / Right** — Change location

### Hooked
- **Click**, **Space**, **WASD**, or **arrow keys** — Hook the fish

### Fighting
- **A / Left** — Counter left
- **D / Right** — Counter right
- **W / Up** — Reel (counter jump)
- **S / Down** — Slack (counter dive/run, tier 2+)
- **Space** — Big Reel (tier 3+, costs 1 stamina)
- **1–4** — Fight abilities (see in-fight ability panel for details)

### Fight abilities

| Key | Ability | Level | Effect |
|-----|---------|-------|--------|
| **1** | Pump Reel | 3 | 3s: +50% reel damage; extra tension only on mistimed reels |
| **2** | Feather Drag | 7 | 2s: tension immunity from idle, mistakes, and jump strain |
| **3** | Net Assist | 12 | Instant −15% fish max HP |
| **4** | Harpoons | 18 | Legendary only: −20% max HP, +35 tension spike |

## Dev Tools (gear icon)

- **Auto Play** — perfect counters + Big Reel when stamina ≥ 1 and tension ≤ 75% (tier 3+)
- **Force Legendary** — always hook Shark/Kraken
- **Jump to Final Burst QTE** — test legendary QTE mid-fight

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest unit tests
```

## Deployment

Production is hosted on [Vercel](https://vfishinggame.vercel.app/). Pushing to `main` triggers a production redeploy when the Vercel Git integration is connected to this repository.

CI runs lint, typecheck, test, and build on every push and pull request (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vitest · Zod

## License

[MIT](LICENSE)
