'use client';

import React, { memo } from 'react';
import { Fish, FightState, Rod } from '@/lib/gameTypes';

interface FightArenaProps {
  fish: Fish;
  fight: FightState;
  rod: Rod;
}

const ROD_BASE = { x: 20, y: 160 };
const ROD_LENGTH = 130;
const ROD_ANGLE_DEG = 60;
const ROD_TIP = {
  x: ROD_BASE.x + ROD_LENGTH * Math.cos((ROD_ANGLE_DEG * Math.PI) / 180),
  y: ROD_BASE.y - ROD_LENGTH * Math.sin((ROD_ANGLE_DEG * Math.PI) / 180),
};
const FISH_ANCHOR = { x: 240, y: 72 };

const STATE_OFFSETS: Record<string, { x: number; y: number }> = {
  LEFT: { x: -40, y: 0 },
  RIGHT: { x: 40, y: 0 },
  JUMP: { x: 0, y: -35 },
  DIVE: { x: 0, y: 30 },
  RUN: { x: -60, y: 15 },
};

const STATE_ARROWS: Record<string, string> = {
  LEFT: '←',
  RIGHT: '→',
  JUMP: '↑',
  DIVE: '↓',
  RUN: '↙',
};

function FightArenaComponent({ fish, fight, rod }: FightArenaProps) {
  const displayState = fight.telegraphState ?? fight.fishState;
  const offset = STATE_OFFSETS[displayState] ?? { x: 0, y: 0 };
  const tension = fight.lineTension;
  const maxTension = rod.maxTension;
  const tensionRatio = tension / maxTension;
  const staminaRatio = fight.maxStamina > 0 ? fight.fightStamina / fight.maxStamina : 0;
  const lineCurve = 20 + tensionRatio * 60;
  const hpPct = (fight.fishHp / fight.maxFishHp) * 100;
  const fishX = FISH_ANCHOR.x + offset.x;
  const fishY = FISH_ANCHOR.y + offset.y;

  return (
    <div className="relative w-full">
      {fight.telegraphState && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-2xl font-black text-yellow-400 animate-pulse">
          !
        </div>
      )}

      <svg viewBox="0 0 320 180" className="w-full h-44 bg-gradient-to-b from-sky-800/50 to-sky-950/80 rounded-xl border border-sky-700/50">
        <line x1={ROD_BASE.x} y1={ROD_BASE.y} x2={ROD_TIP.x} y2={ROD_TIP.y} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx={ROD_BASE.x} cy={ROD_BASE.y} r="5" fill="#475569" />
        <path
          d={`M ${ROD_TIP.x} ${ROD_TIP.y} Q ${ROD_TIP.x + lineCurve + 50} ${ROD_TIP.y + 35 + tensionRatio * 20} ${fishX} ${fishY}`}
          fill="none"
          stroke={tensionRatio > 0.8 ? '#ef4444' : tensionRatio > 0.5 ? '#eab308' : '#22c55e'}
          strokeWidth={2 + tensionRatio * 2}
        />
        <ellipse cx="160" cy="165" rx="140" ry="12" fill="#0ea5e9" opacity="0.3" />
        <g transform={`translate(${fishX}, ${fishY})`}>
          <circle r="22" fill="#1e293b" stroke="currentColor" className={fish.color} strokeWidth="2" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="16" fill="white">
            {STATE_ARROWS[displayState]}
          </text>
        </g>
      </svg>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span className={fish.color}>{fish.name}</span>
          <span>
            HP {Math.floor(fight.fishHp)} / {Math.floor(fight.maxFishHp)}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${hpPct}%` }} />
        </div>

        <div className="relative">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Line Tension</span>
            <span>
              {Math.floor(tension)} / {maxTension}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${tensionRatio > 0.8 ? 'bg-red-600' : tensionRatio > 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${(tension / maxTension) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>Stamina (Big Reel fuel)</span>
          <span>
            {Math.floor(fight.fightStamina)} / {Math.floor(fight.maxStamina)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${staminaRatio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(FightArenaComponent);
