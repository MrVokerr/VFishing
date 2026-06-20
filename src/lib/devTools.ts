import { FightState, Fish } from './gameTypes';
import { FISH_TYPES } from './data';
import { startFinalBurstPhase } from './fishBehavior';

export function selectLegendaryFish(locationTier: number): Fish {
  const legendaries = FISH_TYPES.filter(f => f.rarity === 'Legendary' && f.minLocationTier <= locationTier);
  if (legendaries.length === 0) {
    return FISH_TYPES.find(f => f.id === 'f7') ?? FISH_TYPES[FISH_TYPES.length - 1];
  }
  return legendaries[legendaries.length - 1];
}

export function forceFinalBurstPhase(fight: FightState, locationTier: number): FightState {
  const now = Date.now();
  return startFinalBurstPhase(
    {
      ...fight,
      fishHp: fight.maxFishHp * 0.14,
      telegraphState: null,
      pendingFishState: null,
      playerAction: null,
    },
    locationTier,
    now
  );
}
