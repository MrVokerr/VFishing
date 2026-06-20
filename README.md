# VFishing 🎣

**VFishing** is an interactive, web-based fishing RPG built with Next.js and React. Cast your line, battle various fish species, upgrade your gear, and explore different fishing locations in this persistent browser game.

## ✨ Features

- **🎣 Interactive Fishing System**: 
  - **Cast & Wait**: Cast your line and wait for the perfect bite.
  - **Reaction Minigame**: Hook the fish and counter its movements (Left, Right, Jump, Dive) to tire it out.
  - **Tension Mechanics**: Manage line tension to prevent the fish from snapping your line.

- **📈 RPG Progression**:
  - **Level Up**: Earn XP from catches to level up and unlock better gear.
  - **Economy**: Sell your catch for coins to fund your fishing adventures.
  - **Inventory Management**: Manage your catch within your boat's capacity.

- **🛍️ Shop & Upgrades**:
  - **Rods**: Buy stronger rods to catch tougher fish faster.
  - **Boats**: Upgrade your boat to increase inventory capacity and access new areas.
  - **Bait**: Purchase specialized bait to increase your luck and catch rate.

- **🌍 Exploration**:
  - Travel to different fishing spots, each with unique difficulty tiers and requirements.
  - Unlock new locations as you upgrade your equipment.

- **💾 Persistence**: 
  - Your progress (stats, inventory, upgrades) is automatically saved to your browser's local storage.

- **🤖 Dev Tools**:
  - Includes an experimental Auto-Play Bot for testing and automation.

## 🎮 Controls

### Menu / Idle
- **W / S**: Cast Line (if possible)
- **A / D**: Switch Location
- **Mouse**: Navigate UI, Open Shop

### Fighting the Fish
- **A / Left Arrow**: Counter Fish pulling Left
- **D / Right Arrow**: Counter Fish pulling Right
- **W / Up Arrow**: Counter Fish Jumping (Reel)
- **S / Down Arrow**: Counter Fish Diving (Give Slack) - *Tier 2+ Locations*
- **Big Reel**: Click the "Big Reel" button for massive damage (high risk!) - *Tier 3+ Locations*

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start fishing!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks (`useState`, `useEffect`, `useReducer`)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
