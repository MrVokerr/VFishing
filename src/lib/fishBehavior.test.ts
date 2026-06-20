import { describe, it, expect } from 'vitest';
import { isCorrectCounter, generateFinalBurstSequence, checkPhaseTransition, startFinalBurstPhase } from './fishBehavior';
import { createInitialFightState } from './gameTypes';
import { FISH_TYPES } from './data';

describe('fishBehavior', () => {
  it('isCorrectCounter maps actions', () => {
    expect(isCorrectCounter('LEFT', 'LEFT')).toBe(true);
    expect(isCorrectCounter('JUMP', 'REEL')).toBe(true);
    expect(isCorrectCounter('DIVE', 'SLACK')).toBe(true);
    expect(isCorrectCounter('LEFT', 'RIGHT')).toBe(false);
  });

  it('generateFinalBurstSequence returns 4 shuffled steps', () => {
    const seq = generateFinalBurstSequence(3);
    expect(seq).toHaveLength(4);
    expect(seq.every(s => ['LEFT', 'RIGHT', 'JUMP', 'DIVE'].includes(s))).toBe(true);
  });

  it('omits DIVE on tier 1', () => {
    const seq = generateFinalBurstSequence(1);
    expect(seq).not.toContain('DIVE');
    expect(seq.filter(s => s === 'JUMP').length).toBeGreaterThanOrEqual(2);
  });

  it('transitions legendary to finalBurst at 15% HP only', () => {
    const shark = FISH_TYPES.find(f => f.id === 'f7')!;
    let state = createInitialFightState(shark, 1000, 100, false);
    state = { ...state, fishHp: 160, phase: 'surface' };
    const next = checkPhaseTransition(state, shark, 4);
    expect(next.phase).toBe('surface');

    state = { ...state, fishHp: 140 };
    const burst = checkPhaseTransition(state, shark, 4);
    expect(burst.phase).toBe('finalBurst');
    expect(burst.qteSequence).toHaveLength(4);
  });

  it('startFinalBurstPhase sets QTE state', () => {
    const shark = FISH_TYPES.find(f => f.id === 'f7')!;
    const state = createInitialFightState(shark, 1000, 100, false);
    const burst = startFinalBurstPhase(state, 4, 1000);
    expect(burst.phase).toBe('finalBurst');
    expect(burst.qteDeadline).toBeGreaterThan(1000);
  });
});
