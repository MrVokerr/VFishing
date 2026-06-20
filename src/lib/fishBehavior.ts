import { Fish, FishActionState, FishBehavior, FightState, PlayerAction } from './gameTypes';

const DEFAULT_WEIGHTS: Record<FishActionState, number> = {
  LEFT: 30,
  RIGHT: 30,
  JUMP: 20,
  DIVE: 15,
  RUN: 5,
};

export const FISH_BEHAVIORS: Record<string, FishBehavior> = {
  f1: {
    stateDurationMs: 2200,
    stateWeights: { LEFT: 40, RIGHT: 40, JUMP: 15, DIVE: 5 },
    tensionOnWrong: 1.2,
    tensionOnIdle: 0.3,
    tensionOnCorrectDecay: 0.4,
    tensionOnSlack: 0.8,
    tensionOnReelJump: 0.6,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.1,
    feintChance: 0,
    bigReelPenaltyMultiplier: 1,
  },
  f2: {
    stateDurationMs: 2000,
    stateWeights: { LEFT: 35, RIGHT: 35, JUMP: 20, DIVE: 10 },
    tensionOnWrong: 1.4,
    tensionOnIdle: 0.35,
    tensionOnCorrectDecay: 0.35,
    tensionOnSlack: 0.9,
    tensionOnReelJump: 0.7,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.12,
    feintChance: 0,
    bigReelPenaltyMultiplier: 1,
  },
  f3: {
    stateDurationMs: 1800,
    stateWeights: { LEFT: 25, RIGHT: 25, JUMP: 35, DIVE: 15 },
    patternSequences: [['LEFT', 'JUMP'], ['RIGHT', 'JUMP']],
    tensionOnWrong: 1.6,
    tensionOnIdle: 0.4,
    tensionOnCorrectDecay: 0.35,
    tensionOnSlack: 1.0,
    tensionOnReelJump: 0.8,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.15,
    feintChance: 0.1,
    bigReelPenaltyMultiplier: 1.2,
  },
  f4: {
    stateDurationMs: 1700,
    stateWeights: { LEFT: 30, RIGHT: 30, JUMP: 25, DIVE: 15 },
    patternSequences: [['LEFT', 'LEFT', 'JUMP'], ['RIGHT', 'DIVE']],
    tensionOnWrong: 1.8,
    tensionOnIdle: 0.45,
    tensionOnCorrectDecay: 0.3,
    tensionOnSlack: 1.1,
    tensionOnReelJump: 0.9,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.18,
    feintChance: 0.15,
    bigReelPenaltyMultiplier: 1.3,
  },
  f5: {
    stateDurationMs: 1400,
    stateWeights: { LEFT: 25, RIGHT: 25, JUMP: 30, DIVE: 20 },
    patternSequences: [['LEFT', 'RIGHT', 'JUMP'], ['JUMP', 'DIVE', 'LEFT']],
    tensionOnWrong: 2.0,
    tensionOnIdle: 0.5,
    tensionOnCorrectDecay: 0.3,
    tensionOnSlack: 1.2,
    tensionOnReelJump: 1.0,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.2,
    feintChance: 0.25,
    bigReelPenaltyMultiplier: 1.4,
  },
  f6: {
    stateDurationMs: 1200,
    stateWeights: { LEFT: 30, RIGHT: 30, JUMP: 20, DIVE: 15, RUN: 5 },
    patternSequences: [['LEFT', 'RIGHT', 'LEFT', 'JUMP'], ['DIVE', 'RUN']],
    tensionOnWrong: 2.2,
    tensionOnIdle: 0.55,
    tensionOnCorrectDecay: 0.28,
    tensionOnSlack: 1.3,
    tensionOnReelJump: 1.1,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.22,
    feintChance: 0.3,
    bigReelPenaltyMultiplier: 1.5,
  },
  f7: {
    stateDurationMs: 900,
    stateWeights: { LEFT: 35, RIGHT: 35, JUMP: 15, DIVE: 10, RUN: 5 },
    patternSequences: [['LEFT', 'RIGHT', 'LEFT', 'RIGHT'], ['JUMP', 'RUN']],
    tensionOnWrong: 2.5,
    tensionOnIdle: 0.6,
    tensionOnCorrectDecay: 0.25,
    tensionOnSlack: 1.4,
    tensionOnReelJump: 1.2,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.25,
    feintChance: 0.2,
    bigReelPenaltyMultiplier: 2.0,
  },
  f8: {
    stateDurationMs: 750,
    stateWeights: { LEFT: 30, RIGHT: 30, JUMP: 15, DIVE: 10, RUN: 15 },
    patternSequences: [
      ['LEFT', 'RIGHT', 'LEFT', 'RIGHT'],
      ['JUMP', 'DIVE', 'RUN'],
      ['LEFT', 'RIGHT', 'JUMP', 'DIVE'],
    ],
    tensionOnWrong: 2.8,
    tensionOnIdle: 0.65,
    tensionOnCorrectDecay: 0.22,
    tensionOnSlack: 1.5,
    tensionOnReelJump: 1.3,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.3,
    feintChance: 0.35,
    bigReelPenaltyMultiplier: 2.2,
  },
};

export function getFishBehavior(fish: Fish): FishBehavior {
  return FISH_BEHAVIORS[fish.id] ?? buildBehaviorFromDifficulty(fish);
}

function buildBehaviorFromDifficulty(fish: Fish): FishBehavior {
  const d = fish.difficulty;
  return {
    stateDurationMs: Math.max(700, 2500 - d * 150),
    stateWeights: DEFAULT_WEIGHTS,
    tensionOnWrong: 1 + d * 0.15,
    tensionOnIdle: 0.3 + d * 0.03,
    tensionOnCorrectDecay: Math.max(0.15, 0.5 - d * 0.02),
    tensionOnSlack: 0.8 + d * 0.05,
    tensionOnReelJump: 0.5 + d * 0.08,
    rageThreshold: 0.3,
    rageSpeedBonus: 0.1 + d * 0.02,
    feintChance: d >= 6 ? (d - 5) * 0.05 : 0,
    bigReelPenaltyMultiplier: 1 + d * 0.1,
  };
}

export function isInRage(fight: FightState, behavior: FishBehavior): boolean {
  return fight.fishHp / fight.maxFishHp <= behavior.rageThreshold;
}

export function getAvailableStates(behavior: FishBehavior, locationTier: number, isRage: boolean): FishActionState[] {
  const states: FishActionState[] = ['LEFT', 'RIGHT', 'JUMP'];
  if (locationTier >= 2) states.push('DIVE');
  if (isRage) states.push('RUN');
  return states.filter(s => (behavior.stateWeights[s] ?? (s === 'RUN' ? 5 : 10)) > 0);
}

export function pickWeightedState(states: FishActionState[], behavior: FishBehavior): FishActionState {
  const weights = states.map(s => behavior.stateWeights[s] ?? DEFAULT_WEIGHTS[s] ?? 10);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < states.length; i++) {
    if (roll < weights[i]) return states[i];
    roll -= weights[i];
  }
  return states[0];
}

export function getStateDurationMs(
  behavior: FishBehavior,
  locationMultiplier: number,
  fishDifficulty: number,
  isRage: boolean,
  phase: FightState['phase']
): number {
  let base = behavior.stateDurationMs / Math.max(1, fishDifficulty * 0.15);
  base /= Math.max(1, locationMultiplier * 0.5);
  if (isRage) base /= 1 + behavior.rageSpeedBonus;
  if (phase === 'finalBurst') base *= 0.7;
  return Math.max(400, base + Math.random() * base * 0.4);
}

export function getNextPatternState(
  behavior: FishBehavior,
  fight: FightState,
  available: FishActionState[]
): { state: FishActionState; patternIndex: number; patternStep: number } {
  const sequences = behavior.patternSequences;
  if (!sequences || sequences.length === 0 || fight.phase === 'finalBurst') {
    return {
      state: pickWeightedState(available, behavior),
      patternIndex: fight.patternIndex,
      patternStep: 0,
    };
  }

  const seqIndex = fight.patternIndex % sequences.length;
  const seq = sequences[seqIndex];
  const step = fight.patternStep;

  if (step >= seq.length) {
    return {
      state: pickWeightedState(available, behavior),
      patternIndex: (fight.patternIndex + 1) % sequences.length,
      patternStep: 0,
    };
  }

  const next = seq[step];
  if (available.includes(next)) {
    return {
      state: next,
      patternIndex: seqIndex,
      patternStep: step + 1,
    };
  }

  return {
    state: pickWeightedState(available, behavior),
    patternIndex: (fight.patternIndex + 1) % sequences.length,
    patternStep: 0,
  };
}

export function getFeintState(actual: FishActionState, available: FishActionState[]): FishActionState {
  if (actual === 'LEFT' && available.includes('RIGHT')) return 'RIGHT';
  if (actual === 'RIGHT' && available.includes('LEFT')) return 'LEFT';
  if (actual === 'JUMP' && available.includes('DIVE')) return 'DIVE';
  return actual;
}

export function shouldUseFeint(behavior: FishBehavior): boolean {
  return behavior.feintChance > 0 && Math.random() < behavior.feintChance;
}

export function isCorrectCounter(fishState: FishActionState, playerAction: PlayerAction): boolean {
  if (fishState === 'LEFT' && playerAction === 'LEFT') return true;
  if (fishState === 'RIGHT' && playerAction === 'RIGHT') return true;
  if (fishState === 'JUMP' && playerAction === 'REEL') return true;
  if ((fishState === 'DIVE' || fishState === 'RUN') && playerAction === 'SLACK') return true;
  return false;
}

export function generateFinalBurstSequence(locationTier: number): FishActionState[] {
  const pool: FishActionState[] =
    locationTier >= 2 ? ['LEFT', 'RIGHT', 'JUMP', 'DIVE'] : ['LEFT', 'RIGHT', 'JUMP', 'JUMP'];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function startFinalBurstPhase(fight: FightState, locationTier: number, now: number): FightState {
  const sequence = generateFinalBurstSequence(locationTier);
  return {
    ...fight,
    phase: 'finalBurst',
    qteSequence: sequence,
    qteIndex: 0,
    qteDeadline: now + 2000,
    fishState: sequence[0],
    telegraphState: null,
    pendingFishState: null,
    fishStateChangedAt: now,
  };
}

export function checkPhaseTransition(fight: FightState, fish: Fish, locationTier: number): FightState {
  const hpRatio = fight.fishHp / fight.maxFishHp;

  if (
    fish.rarity === 'Legendary' &&
    fight.phase !== 'finalBurst' &&
    hpRatio <= 0.15 &&
    fight.qteSequence.length === 0
  ) {
    return startFinalBurstPhase(fight, locationTier, Date.now());
  }

  return fight;
}
