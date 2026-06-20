export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export type FishActionState = 'LEFT' | 'RIGHT' | 'JUMP' | 'DIVE' | 'RUN';
export type PlayerAction = 'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null;
export type FightPhase = 'surface' | 'finalBurst';
export type FightAbilityId = 'pumpReel' | 'featherDrag' | 'netAssist' | 'harpoons';

export interface Fish {
  id: string;
  name: string;
  rarity: Rarity;
  baseHp: number;
  xpReward: number;
  coinValue: number;
  difficulty: number;
  color: string;
  minLocationTier: number;
  tags?: string[];
}

export interface FishBehavior {
  stateDurationMs: number;
  stateWeights: Partial<Record<FishActionState, number>>;
  patternSequences?: FishActionState[][];
  tensionOnWrong: number;
  tensionOnIdle: number;
  tensionOnCorrectDecay: number;
  tensionOnSlack: number;
  tensionOnReelJump: number;
  rageThreshold: number;
  rageSpeedBonus: number;
  feintChance: number;
  bigReelPenaltyMultiplier: number;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  inventory: CaughtFish[];
  inventoryCapacity: number;
  baitCounts: Record<string, number>;
  unlockedRodIds: string[];
  unlockedBoatIds: string[];
  unlockedBaitIds: string[];
}

export interface CaughtFish extends Fish {
  caughtAt: number;
  instanceId: string;
}

export interface Rod {
  id: string;
  name: string;
  damage: number;
  price: number;
  reqLevel: number;
  tensionDecay: number;
  reelPower: number;
  maxTension: number;
}

export interface Boat {
  id: string;
  name: string;
  capacity: number;
  price: number;
  reqLevel: number;
  fightStaminaBonus: number;
  tensionBuffer: number;
}

export interface Bait {
  id: string;
  name: string;
  catchRate: number;
  price: number;
  reqLevel: number;
  description: string;
  preferredFishTags: string[];
  stackSize: number;
  restockCost: number;
}

export interface Location {
  id: string;
  name: string;
  tier: number;
  reqRodId?: string;
  reqBoatId?: string;
  difficultyMultiplier: number;
  description: string;
}

export type GameStatus =
  | 'IDLE'
  | 'CASTING'
  | 'HOOKED'
  | 'FIGHTING'
  | 'CAUGHT'
  | 'LOST'
  | 'SHOP';

export interface FightAbility {
  id: FightAbilityId;
  name: string;
  reqLevel: number;
  cooldownMs: number;
  hotkey: string;
  description: string;
}

export interface FightState {
  fishHp: number;
  maxFishHp: number;
  lineTension: number;
  fightStamina: number;
  maxStamina: number;
  fishState: FishActionState;
  telegraphState: FishActionState | null;
  pendingFishState: FishActionState | null;
  playerAction: PlayerAction;
  phase: FightPhase;
  abilityCooldowns: Record<FightAbilityId, number>;
  pumpReelUntil: number;
  featherDragUntil: number;
  qteSequence: FishActionState[];
  qteIndex: number;
  qteDeadline: number;
  qteMissCount: number;
  qteLastMissAt: number;
  hookBonus: boolean;
  patternIndex: number;
  patternStep: number;
  lastDamageTick: number;
  fishStateChangedAt: number;
}

export interface FightTickContext {
  rod: Rod;
  boat: Boat;
  fish: Fish;
  behavior: FishBehavior;
  locationTier: number;
  locationMultiplier: number;
  playerLevel: number;
  now: number;
  tickMs: number;
}

export type FightTickResult = {
  state: FightState;
  outcome: 'ongoing' | 'caught' | 'lost';
  lossReason?: 'snap';
};

export type GameScreen =
  | { status: 'IDLE' }
  | { status: 'CASTING' }
  | { status: 'HOOKED' }
  | { status: 'FIGHTING'; fight: FightState; fish: Fish }
  | { status: 'CAUGHT'; fish: Fish; inventoryRejected?: boolean }
  | { status: 'LOST'; reason: string }
  | { status: 'SHOP' };

export const LEVEL_SCALING_FACTOR = 1.5;
export const TICK_RATE = 100;
export const INPUT_GRACE_MS = 200;
export const FINAL_BURST_QTE_MS = 2000;

export const FIGHT_ABILITIES: FightAbility[] = [
  {
    id: 'pumpReel',
    name: 'Pump Reel',
    reqLevel: 3,
    cooldownMs: 15000,
    hotkey: '1',
    description: '3s burst: +50% damage while reeling (W). Extra tension only if you reel at the wrong time.',
  },
  {
    id: 'featherDrag',
    name: 'Feather Drag',
    reqLevel: 7,
    cooldownMs: 20000,
    hotkey: '2',
    description: '2s shield: line tension stops building from idle drift, wrong counters, and jump reel strain.',
  },
  {
    id: 'netAssist',
    name: 'Net Assist',
    reqLevel: 12,
    cooldownMs: 45000,
    hotkey: '3',
    description: 'Instantly removes 15% of the fish’s max HP. Safe — no tension spike.',
  },
  {
    id: 'harpoons',
    name: 'Harpoons',
    reqLevel: 18,
    cooldownMs: 60000,
    hotkey: '4',
    description: 'Legendary fish only: removes 20% max HP, but adds a large tension spike (+35).',
  },
];

export const INITIAL_STATS: PlayerStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  inventory: [],
  inventoryCapacity: 5,
  baitCounts: { bt1: 99 },
  unlockedRodIds: ['r1'],
  unlockedBoatIds: ['b1'],
  unlockedBaitIds: ['bt1'],
};

export function createInitialFightState(
  fish: Fish,
  maxFishHp: number,
  maxStamina: number,
  hookBonus: boolean,
  initialFishState: FishActionState = 'LEFT'
): FightState {
  return {
    fishHp: maxFishHp,
    maxFishHp,
    lineTension: 0,
    fightStamina: maxStamina,
    maxStamina,
    fishState: initialFishState,
    telegraphState: null,
    pendingFishState: null,
    playerAction: null,
    phase: 'surface',
    abilityCooldowns: { pumpReel: 0, featherDrag: 0, netAssist: 0, harpoons: 0 },
    pumpReelUntil: 0,
    featherDragUntil: 0,
    qteSequence: [],
    qteIndex: 0,
    qteDeadline: 0,
    qteMissCount: 0,
    qteLastMissAt: 0,
    hookBonus,
    patternIndex: 0,
    patternStep: 0,
    lastDamageTick: Date.now(),
    fishStateChangedAt: Date.now(),
  };
}
