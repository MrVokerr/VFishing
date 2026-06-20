import { describe, it, expect } from 'vitest';
import { forceFinalBurstPhase } from './devTools';
import { createInitialFightState } from './gameTypes';
import { FISH_TYPES } from './data';

describe('devTools', () => {
  it('forceFinalBurstPhase enters QTE at low HP', () => {
    const shark = FISH_TYPES.find(f => f.id === 'f7')!;
    const state = createInitialFightState(shark, 1000, 100, false);
    const burst = forceFinalBurstPhase(state, 4);
    expect(burst.phase).toBe('finalBurst');
    expect(burst.qteSequence.length).toBe(4);
    expect(burst.fishHp).toBeLessThan(state.maxFishHp * 0.2);
  });
});
