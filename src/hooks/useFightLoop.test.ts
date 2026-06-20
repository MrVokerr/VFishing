import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFightLoop } from './useFightLoop';
import { createInitialFightState, TICK_RATE } from '@/lib/gameTypes';
import { FISH_TYPES, RODS, BOATS, LOCATIONS } from '@/lib/data';
import * as fightEngine from '@/lib/fightEngine';

const fish = FISH_TYPES[0];
const rod = RODS[0];
const boat = BOATS[0];
const location = LOCATIONS[0];

describe('useFightLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fires onCaught only once when tickFight returns caught repeatedly', () => {
    const fight = createInitialFightState(fish, 50, 100, false, 'LEFT');
    const onCaught = vi.fn();
    const onLost = vi.fn();
    const onFightUpdate = vi.fn();

    vi.spyOn(fightEngine, 'tickFight').mockReturnValue({
      outcome: 'caught',
      state: { ...fight, fishHp: 0 },
    });

    renderHook(() =>
      useFightLoop({
        isFighting: true,
        fight,
        activeFish: fish,
        currentRod: rod,
        currentBoat: boat,
        currentLocation: location,
        playerLevel: 1,
        onFightUpdate,
        onCaught,
        onLost,
      })
    );

    act(() => {
      vi.advanceTimersByTime(TICK_RATE * 5);
    });

    expect(onCaught).toHaveBeenCalledTimes(1);
    expect(onLost).not.toHaveBeenCalled();
  });
});
