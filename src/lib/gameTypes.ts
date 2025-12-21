export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface Fish {
  id: string;
  name: string;
  rarity: Rarity;
  baseHp: number;
  xpReward: number;
  coinValue: number;
  difficulty: number; // 1-10 scale for speed/pattern complexity
  color: string;
  minLocationTier: number;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  inventory: CaughtFish[];
  inventoryCapacity: number;
  unlockedRodIds: string[];
  unlockedBoatIds: string[];
  unlockedBaitIds: string[];
}

export interface CaughtFish extends Fish {
  caughtAt: number;
}

export interface Rod {
  id: string;
  name: string;
  damage: number; // Damage per click/tick
  price: number;
  reqLevel: number;
}

export interface Boat {
  id: string;
  name: string;
  capacity: number;
  price: number;
  reqLevel: number;
}

export interface Bait {
  id: string;
  name: string;
  catchRate: number; // Multiplier for finding better fish
  price: number;
  reqLevel: number;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  tier: number; // 1-5
  reqRodId?: string;
  reqBoatId?: string;
  difficultyMultiplier: number; // Scales HP and Speed
  description: string;
}

export type GameStatus = 'IDLE' | 'CASTING' | 'HOOKED' | 'FIGHTING' | 'CAUGHT' | 'LOST' | 'SHOP';

export const LEVEL_SCALING_FACTOR = 1.5;

export const INITIAL_STATS: PlayerStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  inventory: [],
  inventoryCapacity: 5,
  unlockedRodIds: ['r1'],
  unlockedBoatIds: ['b1'],
  unlockedBaitIds: ['bt1'],
};
