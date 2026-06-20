import { CaughtFish, Fish, PlayerStats } from './gameTypes';

export function createCaughtFish(fish: Fish): CaughtFish {
  return {
    ...fish,
    caughtAt: Date.now(),
    instanceId: `${fish.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
}

export function isInventoryFull(stats: PlayerStats): boolean {
  return stats.inventory.length >= stats.inventoryCapacity;
}

export function applyBoatCapacity(stats: PlayerStats, capacity: number): PlayerStats {
  return { ...stats, inventoryCapacity: capacity };
}
