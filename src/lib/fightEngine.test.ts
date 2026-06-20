import { describe, it, expect } from 'vitest';
import { isInputGracePeriod, tickFight, buildFightContext, applyFinalBurstQTEInput, getMaxStamina, BIG_REEL_STAMINA_COST } from './fightEngine';
import { createInitialFightState, TICK_RATE, FishActionState } from './gameTypes';
import { FISH_TYPES, RODS, BOATS } from './data';

const fish = FISH_TYPES[0];
const rod = RODS[0];
const boat = BOATS[0];

function ctx(now: number) {
  return buildFightContext({
    rod,
    boat,
    fish,
    locationTier: 1,
    locationMultiplier: 1,
    playerLevel: 1,
    now,
    tickMs: TICK_RATE,
  });
}

describe('fightEngine', () => {
  it('isInputGracePeriod during telegraph', () => {
    const state = createInitialFightState(fish, 100, 100, false);
    const withTelegraph = { ...state, telegraphState: 'RIGHT' as const };
    expect(isInputGracePeriod(withTelegraph, Date.now())).toBe(true);
  });

  it('applies damage when counter is correct', () => {
    const now = Date.now();
    let state = createInitialFightState(fish, 100, 100, false, 'LEFT');
    state = { ...state, playerAction: 'LEFT', lastDamageTick: now - 600 };
    const result = tickFight(state, ctx(now));
    expect(result.outcome).toBe('ongoing');
    expect(result.state.fishHp).toBeLessThan(100);
  });

  it('correct JUMP + REEL lowers tension instead of adding reel jump penalty', () => {
    const now = Date.now();
    let state = createInitialFightState(fish, 100, 100, false, 'JUMP');
    state = { ...state, playerAction: 'REEL', lineTension: 40, lastDamageTick: now - 600 };
    const result = tickFight(state, ctx(now));
    expect(result.outcome).toBe('ongoing');
    expect(result.state.lineTension).toBeLessThan(40);
  });

  it('getMaxStamina matches boat bonus only', () => {
    expect(getMaxStamina(BOATS[0])).toBe(0);
    expect(getMaxStamina(BOATS[3])).toBe(15);
  });

  it('BIG_REEL_STAMINA_COST is 1', () => {
    expect(BIG_REEL_STAMINA_COST).toBe(1);
  });

  it('QTE accepts correct input immediately without waiting for tick', () => {
    const now = Date.now();
    const legendary = FISH_TYPES.find(f => f.rarity === 'Legendary')!;
    const state = {
      ...createInitialFightState(legendary, 1000, 100, false),
      phase: 'finalBurst' as const,
      fishHp: 100,
      qteSequence: ['LEFT', 'RIGHT', 'JUMP', 'DIVE'] as FishActionState[],
      qteIndex: 0,
      qteDeadline: now + 5000,
      fishState: 'LEFT' as const,
      qteMissCount: 0,
      qteLastMissAt: 0,
    };
    const result = applyFinalBurstQTEInput(state, 'LEFT', ctx(now));
    expect(result.outcome).toBe('ongoing');
    expect(result.state.qteIndex).toBe(1);
    expect(result.state.fishState).toBe('RIGHT');
  });

  it('QTE ignores wrong input without advancing', () => {
    const now = Date.now();
    const legendary = FISH_TYPES.find(f => f.rarity === 'Legendary')!;
    const state = {
      ...createInitialFightState(legendary, 1000, 100, false),
      phase: 'finalBurst' as const,
      qteSequence: ['LEFT', 'RIGHT', 'JUMP', 'DIVE'] as FishActionState[],
      qteIndex: 0,
      qteDeadline: now + 5000,
      fishState: 'LEFT' as const,
    };
    const result = applyFinalBurstQTEInput(state, 'RIGHT', ctx(now));
    expect(result.state.qteIndex).toBe(0);
  });

  it('QTE miss retries with new sequence without healing', () => {
    const now = Date.now();
    const legendary = FISH_TYPES.find(f => f.rarity === 'Legendary')!;
    let state = createInitialFightState(legendary, 1000, 100, false);
    state = {
      ...state,
      phase: 'finalBurst',
      fishHp: 100,
      qteSequence: ['LEFT', 'RIGHT', 'JUMP', 'DIVE'],
      qteIndex: 0,
      qteDeadline: now - 1,
      fishState: 'LEFT',
      qteMissCount: 0,
    };
    const beforeHp = state.fishHp;
    const result = tickFight(state, ctx(now));
    expect(result.state.qteMissCount).toBe(1);
    expect(result.state.qteIndex).toBe(0);
    expect(result.state.fishHp).toBe(beforeHp);
    expect(result.state.qteSequence.length).toBe(4);
  });
});
