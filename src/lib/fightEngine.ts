import {
  FightState,
  FightTickContext,
  FightTickResult,
  FishActionState,
  PlayerAction,
  FightAbilityId,
  FIGHT_ABILITIES,
  INPUT_GRACE_MS,
  FINAL_BURST_QTE_MS,
  Rod,
  Boat,
  Fish,
  TICK_RATE,
} from './gameTypes';
import {
  getFishBehavior,
  isCorrectCounter,
  checkPhaseTransition,
  startFinalBurstPhase,
  generateFinalBurstSequence,
} from './fishBehavior';

const DAMAGE_INTERVAL_MS = 500;

export function isInputGracePeriod(state: FightState, now: number): boolean {
  if (state.telegraphState !== null) return true;
  return now - state.fishStateChangedAt < INPUT_GRACE_MS;
}

export const BIG_REEL_STAMINA_COST = 1;
export const BIG_REEL_TENSION_THRESHOLD = 0.75;

function applyTensionBuffer(tensionDelta: number, currentTension: number, buffer: number): number {
  if (tensionDelta <= 0 || buffer <= 0) return tensionDelta;
  if (currentTension < 10) return tensionDelta * (1 - buffer);
  return tensionDelta;
}

const QTE_ACTION_MAP: Record<FishActionState, PlayerAction> = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  JUMP: 'REEL',
  DIVE: 'SLACK',
  RUN: 'SLACK',
};

export function buildFightContext(params: {
  rod: Rod;
  boat: Boat;
  fish: Fish;
  locationTier: number;
  locationMultiplier: number;
  playerLevel: number;
  now?: number;
  tickMs?: number;
}): FightTickContext {
  return {
    rod: params.rod,
    boat: params.boat,
    fish: params.fish,
    behavior: getFishBehavior(params.fish),
    locationTier: params.locationTier,
    locationMultiplier: params.locationMultiplier,
    playerLevel: params.playerLevel,
    now: params.now ?? Date.now(),
    tickMs: params.tickMs ?? TICK_RATE,
  };
}

export function tickFight(fight: FightState, ctx: FightTickContext): FightTickResult {
  const behavior = ctx.behavior;
  let state = { ...fight };
  const maxTension = ctx.rod.maxTension;
  const now = ctx.now;
  const tickFactor = ctx.tickMs / 100;

  if (state.featherDragUntil > now) {
    state.lineTension = Math.max(0, state.lineTension - 0.5 * tickFactor);
  }

  if (state.phase === 'finalBurst' && state.qteSequence.length > 0) {
    return tickFinalBurstQTE(state, ctx, behavior);
  }

  const isCorrect = isCorrectCounter(state.fishState, state.playerAction);
  const isIdle = state.playerAction === null;
  const inGrace = isInputGracePeriod(state, now);
  const isRage = state.fishHp / state.maxFishHp <= behavior.rageThreshold;
  const tensionImmune = state.featherDragUntil > now;

  if (isCorrect) {
    const decay = (behavior.tensionOnCorrectDecay + ctx.rod.tensionDecay) * tickFactor;
    if (!tensionImmune) {
      state.lineTension = Math.max(0, state.lineTension - decay);
    }

    if (now - state.lastDamageTick >= DAMAGE_INTERVAL_MS) {
      let dmg = ctx.rod.damage * 0.8;
      if (state.fishState === 'JUMP') {
        dmg *= ctx.rod.reelPower;
      }
      if (state.pumpReelUntil > now) {
        dmg *= 1.5;
      }
      state.fishHp = Math.max(0, state.fishHp - dmg);
      state.lastDamageTick = now;
    }
  } else if (!isIdle && !inGrace) {
    const wrongDelta = behavior.tensionOnWrong * tickFactor;
    if (!tensionImmune) {
      state.lineTension = Math.min(
        maxTension,
        state.lineTension + applyTensionBuffer(wrongDelta, state.lineTension, ctx.boat.tensionBuffer)
      );
    }
  } else if (isIdle && !inGrace) {
    let idleDelta = behavior.tensionOnIdle * tickFactor;
    if (isRage) idleDelta *= 1.3;
    if (!tensionImmune) {
      state.lineTension = Math.min(
        maxTension,
        state.lineTension + applyTensionBuffer(idleDelta, state.lineTension, ctx.boat.tensionBuffer)
      );
    }
  }

  if (state.playerAction === 'SLACK' && (state.fishState === 'DIVE' || state.fishState === 'RUN')) {
    const slackDrop = behavior.tensionOnSlack * 1.5 * tickFactor;
    state.lineTension = Math.max(0, state.lineTension - slackDrop);
  }

  if (state.pumpReelUntil > now && state.playerAction === 'REEL' && !isCorrect && !tensionImmune) {
    state.lineTension = Math.min(maxTension, state.lineTension + 0.4 * tickFactor);
  }

  if (state.lineTension >= maxTension) {
    return { state: { ...state, lineTension: maxTension }, outcome: 'lost', lossReason: 'snap' };
  }

  if (state.fishHp <= 0) {
    return { state: { ...state, fishHp: 0 }, outcome: 'caught' };
  }

  state = checkPhaseTransition(state, ctx.fish, ctx.locationTier);

  return { state, outcome: 'ongoing' };
}

function retryFinalBurstQTE(
  state: FightState,
  ctx: FightTickContext,
  now: number
): FightState {
  const sequence = generateFinalBurstSequence(ctx.locationTier);
  return {
    ...state,
    qteSequence: sequence,
    qteIndex: 0,
    qteDeadline: now + FINAL_BURST_QTE_MS,
    fishState: sequence[0],
    playerAction: null,
    fishStateChangedAt: now,
    qteMissCount: state.qteMissCount + 1,
    qteLastMissAt: now,
  };
}

function advanceFinalBurstQTEStep(state: FightState, ctx: FightTickContext, now: number): FightState {
  const nextIndex = state.qteIndex + 1;
  if (nextIndex >= state.qteSequence.length) {
    return {
      ...state,
      playerAction: null,
      phase: 'surface',
      qteSequence: [],
      qteIndex: 0,
      fishHp: Math.max(0, state.fishHp - ctx.rod.damage * 3),
    };
  }

  return {
    ...state,
    playerAction: null,
    qteIndex: nextIndex,
    fishState: state.qteSequence[nextIndex],
    qteDeadline: now + FINAL_BURST_QTE_MS,
    fishStateChangedAt: now,
  };
}

function finalizeFinalBurstQTEResult(state: FightState, ctx: FightTickContext): FightTickResult {
  if (state.fishHp <= 0) return { state, outcome: 'caught' };
  if (state.lineTension >= ctx.rod.maxTension) return { state, outcome: 'lost', lossReason: 'snap' };
  const next = checkPhaseTransition(state, ctx.fish, ctx.locationTier);
  return { state: next, outcome: 'ongoing' };
}

/** Apply one QTE input immediately (keydown / mousedown). Ignores wrong keys. */
export function applyFinalBurstQTEInput(
  state: FightState,
  playerAction: PlayerAction,
  ctx: FightTickContext
): FightTickResult {
  if (state.phase !== 'finalBurst' || state.qteSequence.length === 0 || !playerAction) {
    return { state, outcome: 'ongoing' };
  }

  const now = ctx.now;
  if (now > state.qteDeadline) {
    return { state: { ...state, playerAction: null }, outcome: 'ongoing' };
  }

  const expected = state.qteSequence[state.qteIndex];
  if (playerAction !== QTE_ACTION_MAP[expected]) {
    return { state: { ...state, playerAction: null }, outcome: 'ongoing' };
  }

  return finalizeFinalBurstQTEResult(advanceFinalBurstQTEStep(state, ctx, now), ctx);
}

function tickFinalBurstQTE(
  state: FightState,
  ctx: FightTickContext,
  behavior: ReturnType<typeof getFishBehavior>
): FightTickResult {
  const now = ctx.now;
  let s: FightState = { ...state, playerAction: null };

  if (now > s.qteDeadline) {
    s = retryFinalBurstQTE(s, ctx, now);
  }

  s.lineTension = Math.min(
    ctx.rod.maxTension,
    s.lineTension + behavior.tensionOnIdle * (ctx.tickMs / 100)
  );

  if (s.fishHp <= 0) return { state: s, outcome: 'caught' };
  if (s.lineTension >= ctx.rod.maxTension) return { state: s, outcome: 'lost', lossReason: 'snap' };

  s = checkPhaseTransition(s, ctx.fish, ctx.locationTier);

  return { state: s, outcome: 'ongoing' };
}

export function triggerBigReel(fight: FightState, ctx: FightTickContext): FightState {
  const behavior = ctx.behavior;
  if (fight.fightStamina < BIG_REEL_STAMINA_COST) return fight;

  const state = { ...fight };
  const dmg = ctx.rod.damage * 1.5;
  state.fishHp = Math.max(0, state.fishHp - dmg);
  state.fightStamina -= BIG_REEL_STAMINA_COST;

  const penalty = behavior.bigReelPenaltyMultiplier;
  if (state.lineTension > 30) {
    state.lineTension = Math.min(ctx.rod.maxTension, state.lineTension + 20 * penalty);
  } else {
    state.lineTension = Math.min(ctx.rod.maxTension, state.lineTension + 5 * penalty);
  }

  return checkPhaseTransition(state, ctx.fish, ctx.locationTier);
}

export function applyFightAbility(
  fight: FightState,
  abilityId: FightAbilityId,
  ctx: FightTickContext
): FightState | null {
  const ability = FIGHT_ABILITIES.find(a => a.id === abilityId);
  if (!ability || ctx.playerLevel < ability.reqLevel) return null;
  if (fight.abilityCooldowns[abilityId] > ctx.now) return null;

  const state = { ...fight };
  state.abilityCooldowns = {
    ...state.abilityCooldowns,
    [abilityId]: ctx.now + ability.cooldownMs,
  };

  switch (abilityId) {
    case 'pumpReel':
      state.pumpReelUntil = ctx.now + 3000;
      break;
    case 'featherDrag':
      state.featherDragUntil = ctx.now + 2000;
      break;
    case 'netAssist':
      state.fishHp = Math.max(0, state.fishHp - state.maxFishHp * 0.15);
      break;
    case 'harpoons':
      if (ctx.fish.rarity !== 'Legendary') return null;
      state.fishHp = Math.max(0, state.fishHp - state.maxFishHp * 0.2);
      state.lineTension = Math.min(ctx.rod.maxTension, state.lineTension + 35);
      break;
  }

  return checkPhaseTransition(state, ctx.fish, ctx.locationTier);
}

export function getMaxStamina(boat: FightTickContext['boat']): number {
  return boat.fightStaminaBonus;
}

export { startFinalBurstPhase };
