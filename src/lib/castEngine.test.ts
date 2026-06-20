import { describe, it, expect } from 'vitest';
import { selectRandomFish } from './castEngine';
import { LOCATIONS, BAIT_TYPES, FISH_TYPES } from './data';

describe('castEngine', () => {
  it('selectRandomFish returns fish for location tier', () => {
    const pond = LOCATIONS[0];
    const bait = BAIT_TYPES[0];
    const fish = selectRandomFish(pond, bait);
    expect(fish.minLocationTier).toBeLessThanOrEqual(pond.tier);
  });

  it('respects available fish pool override', () => {
    const deep = LOCATIONS[4];
    const bait = BAIT_TYPES[0];
    const pool = FISH_TYPES.filter(f => f.rarity === 'Legendary');
    const fish = selectRandomFish(deep, bait, pool);
    expect(fish.rarity).toBe('Legendary');
  });
});
