'use client';

import { useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import {
  FightState,
  Fish,
  FishActionState,
  PlayerAction,
  Rod,
  Boat,
  Location,
  TICK_RATE,
  FightAbilityId,
  createInitialFightState,
} from '@/lib/gameTypes';
import {
  getFishBehavior,
  getAvailableStates,
  getStateDurationMs,
  getNextPatternState,
  getFeintState,
  shouldUseFeint,
  isInRage,
} from '@/lib/fishBehavior';
import {
  tickFight,
  triggerBigReel,
  applyFightAbility,
  applyFinalBurstQTEInput,
  getMaxStamina,
  BIG_REEL_STAMINA_COST,
  buildFightContext,
} from '@/lib/fightEngine';

const TELEGRAPH_MS = 200;
const UI_UPDATE_MS = 100;

function fightUiSnapshot(a: FightState, b: FightState): boolean {
  return (
    a.fishHp === b.fishHp &&
    a.lineTension === b.lineTension &&
    a.fightStamina === b.fightStamina &&
    a.fishState === b.fishState &&
    a.telegraphState === b.telegraphState &&
    a.phase === b.phase &&
    a.playerAction === b.playerAction &&
    a.qteIndex === b.qteIndex &&
    a.qteMissCount === b.qteMissCount &&
    a.qteLastMissAt === b.qteLastMissAt &&
    a.qteSequence.length === b.qteSequence.length
  );
}

interface UseFightLoopOptions {
  isFighting: boolean;
  fight: FightState | null;
  activeFish: Fish | null;
  currentRod: Rod;
  currentBoat: Boat;
  currentLocation: Location;
  playerLevel: number;
  onFightUpdate: React.Dispatch<React.SetStateAction<FightState | null>>;
  onCaught: () => void;
  onLost: (reason: 'snap') => void;
}

export function useFightLoop({
  isFighting,
  fight,
  activeFish,
  currentRod,
  currentBoat,
  currentLocation,
  playerLevel,
  onFightUpdate,
  onCaught,
  onLost,
}: UseFightLoopOptions) {
  const fightRef = useRef(fight);
  const fightSimRef = useRef(fight);
  const playerActionRef = useRef<PlayerAction>(null);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const telegraphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const outcomeHandledRef = useRef(false);
  const pausedRef = useRef(false);
  const lastUiPushRef = useRef(0);
  const scheduleNextStateRef = useRef<() => void>(() => {});

  useEffect(() => {
    fightRef.current = fight;
    if (fight) fightSimRef.current = fight;
    playerActionRef.current = fight?.playerAction ?? null;
  }, [fight]);

  useEffect(() => {
    outcomeHandledRef.current = false;
    if (fight) fightSimRef.current = fight;
  }, [activeFish?.id, isFighting, fight]);

  const pushUiState = useCallback(
    (sim: FightState, force = false) => {
      const now = Date.now();
      if (!force && now - lastUiPushRef.current < UI_UPDATE_MS) return;
      if (!force && fightRef.current && fightUiSnapshot(fightRef.current, sim)) return;
      lastUiPushRef.current = now;
      onFightUpdate(sim);
    },
    [onFightUpdate]
  );

  const buildCtx = useCallback(
    (now: number) =>
      buildFightContext({
        rod: currentRod,
        boat: currentBoat,
        fish: activeFish!,
        locationTier: currentLocation.tier,
        locationMultiplier: currentLocation.difficultyMultiplier,
        playerLevel,
        now,
        tickMs: TICK_RATE,
      }),
    [activeFish, currentRod, currentBoat, currentLocation, playerLevel]
  );

  const clearFightTimers = useCallback(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (stateTimerRef.current) {
      clearTimeout(stateTimerRef.current);
      stateTimerRef.current = null;
    }
    if (telegraphTimerRef.current) {
      clearTimeout(telegraphTimerRef.current);
      telegraphTimerRef.current = null;
    }
  }, []);

  const handleOutcome = useCallback(
    (outcome: 'caught' | 'lost', lossReason?: 'snap') => {
      if (outcomeHandledRef.current) return;
      outcomeHandledRef.current = true;
      clearFightTimers();
      if (outcome === 'caught') onCaught();
      else onLost(lossReason ?? 'snap');
    },
    [clearFightTimers, onCaught, onLost]
  );

  scheduleNextStateRef.current = () => {
    if (!fightSimRef.current || !activeFish || pausedRef.current) return;

    const behavior = getFishBehavior(activeFish);
    const f = fightSimRef.current;
    const rage = isInRage(f, behavior);
    const available = getAvailableStates(behavior, currentLocation.tier, rage);

    if (f.phase === 'finalBurst') {
      stateTimerRef.current = setTimeout(() => scheduleNextStateRef.current(), 500);
      return;
    }

    const { state: nextState, patternIndex, patternStep } = getNextPatternState(behavior, f, available);
    let displayState = nextState;

    if (shouldUseFeint(behavior)) {
      displayState = getFeintState(nextState, available);
    }

    const telegraphed = displayState;
    const telegraphUpdate = (prev: FightState | null) => {
      if (!prev) return prev;
      const next = { ...prev, telegraphState: telegraphed, pendingFishState: nextState };
      fightSimRef.current = next;
      pushUiState(next, true);
      return next;
    };
    onFightUpdate(telegraphUpdate);

    telegraphTimerRef.current = setTimeout(() => {
      if (pausedRef.current) return;
      const commitUpdate = (prev: FightState | null) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          fishState: nextState,
          telegraphState: null,
          pendingFishState: null,
          patternIndex,
          patternStep,
          fishStateChangedAt: Date.now(),
        };
        fightSimRef.current = next;
        pushUiState(next, true);
        return next;
      };
      onFightUpdate(commitUpdate);

      const duration = getStateDurationMs(
        behavior,
        currentLocation.difficultyMultiplier,
        activeFish.difficulty,
        isInRage(fightSimRef.current!, behavior),
        fightSimRef.current!.phase
      );

      stateTimerRef.current = setTimeout(() => scheduleNextStateRef.current(), duration);
    }, TELEGRAPH_MS);
  };

  const scheduleNextState = useCallback(() => {
    scheduleNextStateRef.current();
  }, []);

  useEffect(() => {
    if (!isFighting || !fight || !activeFish) {
      clearFightTimers();
      return;
    }

    outcomeHandledRef.current = false;
    fightSimRef.current = fight;

    tickTimerRef.current = setInterval(() => {
      if (pausedRef.current || outcomeHandledRef.current) return;
      const current = fightSimRef.current;
      if (!current) return;

      const ctx = buildCtx(Date.now());
      const withAction = { ...current, playerAction: playerActionRef.current };
      const result = tickFight(withAction, ctx);

      fightSimRef.current = result.state;

      if (result.outcome === 'caught') {
        pushUiState(result.state, true);
        handleOutcome('caught');
        return;
      }
      if (result.outcome === 'lost') {
        pushUiState(result.state, true);
        handleOutcome('lost', result.lossReason);
        return;
      }

      pushUiState(result.state);
    }, TICK_RATE);

    return clearFightTimers;
    // fight/activeFish read via refs during tick; re-bind only when fight session changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFighting, activeFish?.id, buildCtx, clearFightTimers, handleOutcome, pushUiState]);

  useEffect(() => {
    if (!isFighting || !activeFish) {
      clearFightTimers();
      return;
    }

    scheduleNextState();

    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (telegraphTimerRef.current) clearTimeout(telegraphTimerRef.current);
    };
    // scheduleNextState uses refs for latest fish/location; fish id gates new sessions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFighting, activeFish?.id, scheduleNextState, clearFightTimers]);

  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const applyQTEOrHoldAction = useCallback(
    (action: PlayerAction, updateReactState: boolean) => {
      if (!activeFish) return;

      const current = fightSimRef.current;
      const inQTE = current?.phase === 'finalBurst' && (current.qteSequence.length ?? 0) > 0;

      if (action === null) {
        if (inQTE) return;
        playerActionRef.current = null;
        if (updateReactState) {
          onFightUpdate(prev => (prev ? { ...prev, playerAction: null } : prev));
        }
        return;
      }

      if (inQTE) {
        const ctx = buildCtx(Date.now());
        const result = applyFinalBurstQTEInput(current!, action, ctx);
        fightSimRef.current = result.state;
        playerActionRef.current = null;

        if (result.outcome === 'caught') {
          pushUiState(result.state, true);
          handleOutcome('caught');
          return;
        }
        if (result.outcome === 'lost') {
          pushUiState(result.state, true);
          handleOutcome('lost', result.lossReason);
          return;
        }

        pushUiState(result.state, true);
        if (updateReactState) {
          onFightUpdate(result.state);
        }
        return;
      }

      playerActionRef.current = action;
      if (updateReactState) {
        onFightUpdate(prev => (prev ? { ...prev, playerAction: action } : prev));
      }
    },
    [activeFish, buildCtx, handleOutcome, onFightUpdate, pushUiState]
  );

  const setPlayerActionSilent = useCallback(
    (action: PlayerAction) => {
      applyQTEOrHoldAction(action, false);
    },
    [applyQTEOrHoldAction]
  );

  const setPlayerAction = useCallback(
    (action: PlayerAction | ((prev: PlayerAction) => PlayerAction)) => {
      const resolved = typeof action === 'function' ? action(playerActionRef.current) : action;
      applyQTEOrHoldAction(resolved, true);
    },
    [applyQTEOrHoldAction]
  );

  const doBigReel = useCallback(() => {
    if (!activeFish) return;
    onFightUpdate(prev => {
      if (!prev || prev.fightStamina < BIG_REEL_STAMINA_COST) return prev;
      const ctx = buildCtx(Date.now());
      const next = triggerBigReel(prev, ctx);
      fightSimRef.current = next;
      return next;
    });
  }, [activeFish, buildCtx, onFightUpdate]);

  const activateAbility = useCallback(
    (abilityId: FightAbilityId) => {
      if (!activeFish) return;
      onFightUpdate(prev => {
        if (!prev) return prev;
        const ctx = buildCtx(Date.now());
        const updated = applyFightAbility(prev, abilityId, ctx);
        if (!updated) return prev;
        fightSimRef.current = updated;
        return updated;
      });
    },
    [activeFish, buildCtx, onFightUpdate]
  );

  return { setPlayerAction, setPlayerActionSilent, doBigReel, activateAbility };
}

export function initFightFromHook(
  fish: Fish,
  location: Location,
  boat: Boat,
  hookBonus: boolean,
  initialState: FishActionState
): FightState {
  const maxHp = fish.baseHp * location.difficultyMultiplier;
  const maxStamina = getMaxStamina(boat);
  return createInitialFightState(fish, maxHp, maxStamina, hookBonus, initialState);
}
