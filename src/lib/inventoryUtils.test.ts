import { describe, it, expect } from 'vitest';
import { isInventoryFull, applyBoatCapacity, createCaughtFish } from './inventoryUtils';
import { INITIAL_STATS } from './gameTypes';
import { FISH_TYPES } from './data';

describe('inventoryUtils', () => {
  it('isInventoryFull when at capacity', () => {
    const caught = createCaughtFish(FISH_TYPES[0]);
    const stats = {
      ...INITIAL_STATS,
      inventoryCapacity: 1,
      inventory: [caught],
    };
    expect(isInventoryFull(stats)).toBe(true);
  });

  it('applyBoatCapacity updates capacity', () => {
    const next = applyBoatCapacity(INITIAL_STATS, 50);
    expect(next.inventoryCapacity).toBe(50);
  });
});
