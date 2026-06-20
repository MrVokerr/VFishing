'use client';

import React, { memo } from 'react';
import { FightAbilityId, FightState, FIGHT_ABILITIES } from '@/lib/gameTypes';
import { useNow } from '@/hooks/useNow';

interface FightAbilitiesPanelProps {
  fight: FightState;
  playerLevel: number;
  onActivate: (id: FightAbilityId) => void;
}

function FightAbilitiesPanelComponent({ fight, playerLevel, onActivate }: FightAbilitiesPanelProps) {
  const now = useNow(250);

  return (
    <div className="bg-slate-900/90 border border-slate-600 rounded-2xl p-4 backdrop-blur-sm w-full">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Fight Abilities</h3>
      <div className="flex flex-col gap-2">
        {FIGHT_ABILITIES.map(ability => {
          const unlocked = playerLevel >= ability.reqLevel;
          const onCooldown = fight.abilityCooldowns[ability.id] > now;
          const cooldownLeft = onCooldown ? Math.ceil((fight.abilityCooldowns[ability.id] - now) / 1000) : 0;
          const cooldownSec = ability.cooldownMs / 1000;
          const isActive =
            (ability.id === 'pumpReel' && fight.pumpReelUntil > now) ||
            (ability.id === 'featherDrag' && fight.featherDragUntil > now);

          return (
            <div
              key={ability.id}
              className={`rounded-lg border p-2 ${
                isActive
                  ? 'border-purple-500 bg-purple-950/40'
                  : unlocked
                    ? 'border-slate-600 bg-slate-800/60'
                    : 'border-slate-700 bg-slate-900/40'
              }`}
            >
              <button
                onClick={() => onActivate(ability.id)}
                disabled={!unlocked || onCooldown}
                className={`w-full text-left rounded-md px-2 py-1.5 font-bold text-sm transition ${
                  !unlocked
                    ? 'text-slate-600 cursor-not-allowed'
                    : isActive
                      ? 'text-purple-200'
                      : onCooldown
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-white hover:bg-slate-700/80'
                }`}
              >
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-700 text-[10px] font-mono shrink-0">
                    {ability.hotkey}
                  </span>
                  {ability.name}
                  {isActive && <span className="text-[10px] font-normal text-purple-300">ACTIVE</span>}
                  {onCooldown && unlocked && (
                    <span className="text-[10px] font-normal text-slate-500">{cooldownLeft}s CD</span>
                  )}
                </span>
              </button>
              <p className={`mt-1 px-2 text-[11px] leading-snug ${unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                {unlocked ? (
                  <>
                    <span className="text-slate-500">
                      Lv {ability.reqLevel} • {cooldownSec}s cooldown —{' '}
                    </span>
                    {ability.description}
                  </>
                ) : (
                  <>
                    Unlocks at Lv {ability.reqLevel}. {ability.description}
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FightAbilitiesPanelComponent);
