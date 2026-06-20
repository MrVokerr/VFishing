'use client';

import React, { memo } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { FightState, FishActionState } from '@/lib/gameTypes';

const STATE_ICONS: Record<FishActionState, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LEFT: ArrowLeft,
  RIGHT: ArrowRight,
  JUMP: ArrowUp,
  DIVE: ArrowDown,
  RUN: ArrowDownLeft,
};

interface FinalBurstQTEProps {
  fight: FightState;
}

function FinalBurstQTEComponent({ fight }: FinalBurstQTEProps) {
  if (fight.phase !== 'finalBurst' || fight.qteSequence.length === 0) return null;

  return (
    <div className="mb-4 flex gap-2 justify-center flex-wrap">
      {fight.qteSequence.map((s, i) => {
        const done = i < fight.qteIndex;
        const active = i === fight.qteIndex;
        const Icon = STATE_ICONS[s];
        return (
          <div
            key={`${i}-${s}`}
            className={`grid place-items-center size-[4.5rem] shrink-0 rounded-xl border-2 transition-all ${
              done
                ? 'bg-green-700/80 border-green-500 text-white scale-95 opacity-80'
                : active
                  ? 'bg-yellow-400 border-yellow-200 text-black scale-110 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse'
                  : 'bg-slate-700 border-slate-600 text-slate-400'
            }`}
          >
            <Icon size={36} strokeWidth={3} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}

export default memo(FinalBurstQTEComponent);
