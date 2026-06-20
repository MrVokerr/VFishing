'use client';

import { Bait, Location, Rod } from '@/lib/gameTypes';
import { LOCATIONS } from '@/lib/data';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuIcon } from './MenuIcon';

interface IdleScreenProps {
  menuIconIndex: number;
  currentLocation: Location;
  currentRod: Rod;
  currentBait: Bait;
  baitCount: number;
  inventoryFull: boolean;
  noBait: boolean;
  canTravel: boolean;
  onPrevLocation: () => void;
  onNextLocation: () => void;
  onCastLine: () => void;
}

export default function IdleScreen({
  menuIconIndex,
  currentLocation,
  currentRod,
  currentBait,
  baitCount,
  inventoryFull,
  noBait,
  canTravel,
  onPrevLocation,
  onNextLocation,
  onCastLine,
}: IdleScreenProps) {
  const locIdx = LOCATIONS.findIndex(l => l.id === currentLocation.id);

  return (
    <div className="text-center w-full">
      <div className="mb-6 relative animate-bounce">
        <MenuIcon index={menuIconIndex} size={64} className="text-blue-300 mx-auto" />
      </div>

      <div className="mb-8 w-full bg-slate-800/80 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onPrevLocation}
            disabled={locIdx === 0}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-yellow-400">{currentLocation.name}</h3>
            <span className="text-xs text-slate-400">
              Tier {currentLocation.tier} • {currentLocation.difficultyMultiplier}x Difficulty
            </span>
          </div>
          <button
            onClick={onNextLocation}
            disabled={locIdx === LOCATIONS.length - 1}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <p className="text-sm text-slate-300 italic mb-1">{currentLocation.description}</p>
        {!canTravel && (
          <div className="bg-red-900/50 border border-red-500/50 p-2 rounded text-xs text-red-200">
            Requirements not met for this location.
          </div>
        )}
      </div>

      <button
        onClick={onCastLine}
        disabled={inventoryFull || !canTravel || noBait}
        className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white border-2 border-cyan-400 rounded-full text-2xl font-bold shadow-[0_4px_20px_rgba(59,130,246,0.5)] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:border-slate-500"
      >
        {inventoryFull ? 'Inventory Full' : noBait ? 'Out of Bait' : !canTravel ? 'Locked' : 'Cast Line'}
      </button>
      <div className="mt-4 text-slate-400 text-sm flex flex-col gap-1">
        <p>
          Rod: {currentRod.name} (Dmg {currentRod.damage}, Reel x{currentRod.reelPower})
        </p>
        <p>
          Bait: {currentBait.name} (x{baitCount}) — {currentBait.description}
        </p>
      </div>
    </div>
  );
}
