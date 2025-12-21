import { Fish, Rod, Boat, Location } from './gameTypes';

export const LOCATIONS: Location[] = [
  { id: 'loc1', name: 'Quiet Pond', tier: 1, difficultyMultiplier: 1.0, description: 'Peaceful waters for beginners.' },
  { id: 'loc2', name: 'River Stream', tier: 2, reqRodId: 'r2', difficultyMultiplier: 1.5, description: 'Faster currents. Requires Bamboo Pole.' },
  { id: 'loc3', name: 'Misty Lake', tier: 3, reqBoatId: 'b2', difficultyMultiplier: 2.0, description: 'Deep waters. Requires Rowboat.' },
  { id: 'loc4', name: 'Coastal Waters', tier: 4, reqRodId: 'r3', reqBoatId: 'b3', difficultyMultiplier: 3.5, description: 'Rough seas. Requires Fiberglass Rod & Motorboat.' },
  { id: 'loc5', name: 'The Deep Sea', tier: 5, reqRodId: 'r4', reqBoatId: 'b4', difficultyMultiplier: 5.0, description: 'Where monsters dwell. Requires Carbon Rod & Trawler.' },
];

export const FISH_TYPES: Fish[] = [
  { id: 'f1', name: 'Sardine', rarity: 'Common', baseHp: 50, xpReward: 10, coinValue: 5, difficulty: 1, color: 'text-gray-400', minLocationTier: 1 },
  { id: 'f2', name: 'Mackerel', rarity: 'Common', baseHp: 70, xpReward: 15, coinValue: 8, difficulty: 2, color: 'text-blue-400', minLocationTier: 1 },
  { id: 'f3', name: 'Trout', rarity: 'Uncommon', baseHp: 120, xpReward: 30, coinValue: 20, difficulty: 3, color: 'text-green-500', minLocationTier: 2 },
  { id: 'f4', name: 'Bass', rarity: 'Uncommon', baseHp: 150, xpReward: 40, coinValue: 25, difficulty: 4, color: 'text-green-600', minLocationTier: 2 },
  { id: 'f5', name: 'Salmon', rarity: 'Rare', baseHp: 300, xpReward: 100, coinValue: 75, difficulty: 6, color: 'text-purple-500', minLocationTier: 3 },
  { id: 'f6', name: 'Tuna', rarity: 'Rare', baseHp: 500, xpReward: 200, coinValue: 150, difficulty: 7, color: 'text-purple-700', minLocationTier: 4 },
  { id: 'f7', name: 'Shark', rarity: 'Legendary', baseHp: 1000, xpReward: 500, coinValue: 500, difficulty: 9, color: 'text-orange-500', minLocationTier: 4 },
  { id: 'f8', name: 'Kraken', rarity: 'Legendary', baseHp: 2500, xpReward: 2000, coinValue: 2000, difficulty: 10, color: 'text-red-600', minLocationTier: 5 },
];

export const RODS: Rod[] = [
  { id: 'r1', name: 'Wooden Stick', damage: 5, price: 0, reqLevel: 1 },
  { id: 'r2', name: 'Bamboo Pole', damage: 10, price: 50, reqLevel: 2 },
  { id: 'r3', name: 'Fiberglass Rod', damage: 25, price: 200, reqLevel: 5 },
  { id: 'r4', name: 'Carbon Fiber Rod', damage: 50, price: 1000, reqLevel: 10 },
  { id: 'r5', name: 'Deep Sea Destroyer', damage: 120, price: 5000, reqLevel: 20 },
];

export const BOATS: Boat[] = [
  { id: 'b1', name: 'Raft', capacity: 5, price: 0, reqLevel: 1 },
  { id: 'b2', name: 'Rowboat', capacity: 15, price: 100, reqLevel: 3 },
  { id: 'b3', name: 'Motorboat', capacity: 50, price: 500, reqLevel: 8 },
  { id: 'b4', name: 'Fishing Trawler', capacity: 200, price: 2500, reqLevel: 15 },
];

export const BAIT_TYPES: import('./gameTypes').Bait[] = [
  { id: 'bt1', name: 'Bread Crumb', catchRate: 1.0, price: 0, reqLevel: 1, description: 'Basic bait.' },
  { id: 'bt2', name: 'Worms', catchRate: 1.2, price: 50, reqLevel: 2, description: '+20% Luck' },
  { id: 'bt3', name: 'Shiny Lure', catchRate: 1.5, price: 250, reqLevel: 5, description: '+50% Luck' },
  { id: 'bt4', name: 'Master Bait', catchRate: 2.0, price: 1000, reqLevel: 10, description: 'Doubles Luck' },
  { id: 'bt5', name: 'Golden Fly', catchRate: 5.0, price: 5000, reqLevel: 20, description: 'Legendary Find' },
];
