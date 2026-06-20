'use client';

import { Fish, FightState, Location, Rod, PlayerAction } from '@/lib/gameTypes';
import FightAbilitiesPanel from './FightAbilitiesPanel';
import FightArena from './FightArena';
import FinalBurstQTE from './FinalBurstQTE';
import { FightAbilityId } from '@/lib/gameTypes';

interface FightScreenProps {
  fish: Fish;
  fight: FightState;
  rod: Rod;
  location: Location;
  playerLevel: number;
  qteActive: boolean;
  onActivateAbility: (id: FightAbilityId) => void;
  onSetPlayerAction: (action: PlayerAction) => void;
  onClearPlayerAction: () => void;
  onBigReel: () => void;
}

export default function FightScreen({
  fish,
  fight,
  rod,
  location,
  playerLevel,
  qteActive,
  onActivateAbility,
  onSetPlayerAction,
  onClearPlayerAction,
  onBigReel,
}: FightScreenProps) {
  const btn = (action: PlayerAction, label: string, activeClass: string) =>
    `p-3 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition ${
      fight.playerAction === action ? activeClass : 'bg-slate-700 border-slate-900 hover:bg-slate-600'
    }`;

  const mainFight = (
    <div className="w-full max-w-md bg-slate-900/80 p-6 rounded-2xl border-2 border-blue-500 backdrop-blur-sm">
      <FinalBurstQTE fight={fight} />
      <FightArena fish={fish} fight={fight} rod={rod} />

      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onMouseDown={() => onSetPlayerAction('LEFT')}
            onMouseUp={qteActive ? undefined : onClearPlayerAction}
            className={btn('LEFT', '', 'bg-indigo-500 border-indigo-700')}
          >
            LEFT (A)
          </button>
          <button
            onMouseDown={() => onSetPlayerAction('REEL')}
            onMouseUp={qteActive ? undefined : onClearPlayerAction}
            className={btn('REEL', '', 'bg-green-500 border-green-700')}
          >
            REEL (W)
          </button>
          <button
            onMouseDown={() => onSetPlayerAction('RIGHT')}
            onMouseUp={qteActive ? undefined : onClearPlayerAction}
            className={btn('RIGHT', '', 'bg-indigo-500 border-indigo-700')}
          >
            RIGHT (D)
          </button>
        </div>

        {location.tier >= 2 && (
          <button
            onMouseDown={() => onSetPlayerAction('SLACK')}
            onMouseUp={qteActive ? undefined : onClearPlayerAction}
            className={btn('SLACK', '', 'bg-yellow-500 border-yellow-700')}
          >
            SLACK (S) — counter DIVE / RUN
          </button>
        )}

        {location.tier >= 3 && (
          <button
            onClick={onBigReel}
            className="p-3 rounded-xl font-bold border-b-4 border-red-900 bg-red-600 active:border-b-0 transition text-white hover:bg-red-500"
          >
            BIG REEL (Space) — burst damage, costs stamina
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,17rem)_minmax(0,28rem)_minmax(0,17rem)] gap-4 lg:gap-6 items-start justify-items-center">
      <aside className="w-full max-w-md lg:max-w-none lg:w-full lg:justify-self-end order-2 lg:order-1 lg:sticky lg:top-24">
        <FightAbilitiesPanel fight={fight} playerLevel={playerLevel} onActivate={onActivateAbility} />
      </aside>

      <div className="w-full flex justify-center order-1 lg:order-2 lg:col-start-2">{mainFight}</div>

      <div className="hidden lg:block order-3" aria-hidden />
    </div>
  );
}
