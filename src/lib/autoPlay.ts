import { FightState, FishActionState, PlayerAction } from './gameTypes';

function fishStateToPlayerAction(state: FishActionState): PlayerAction {
  if (state === 'LEFT') return 'LEFT';
  if (state === 'RIGHT') return 'RIGHT';
  if (state === 'JUMP') return 'REEL';
  if (state === 'DIVE' || state === 'RUN') return 'SLACK';
  return null;
}

export function getAutoCounterAction(fight: FightState): PlayerAction {
  if (fight.phase === 'finalBurst' && fight.qteSequence.length > 0) {
    return fishStateToPlayerAction(fight.qteSequence[fight.qteIndex]);
  }

  const target =
    fight.telegraphState !== null || fight.pendingFishState !== null
      ? (fight.pendingFishState ?? fight.fishState)
      : fight.fishState;
  return fishStateToPlayerAction(target);
}
