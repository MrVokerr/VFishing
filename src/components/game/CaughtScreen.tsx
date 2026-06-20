'use client';

import { Fish } from '@/lib/gameTypes';
import { formatMoney } from '@/lib/formatMoney';
import { Fish as FishIcon } from 'lucide-react';

interface CaughtScreenProps {
  fish: Fish;
  inventoryRejected?: boolean;
  onContinue: () => void;
  onBackToMenu: () => void;
}

export default function CaughtScreen({ fish, inventoryRejected, onContinue, onBackToMenu }: CaughtScreenProps) {
  return (
    <div className="flex flex-col items-center bg-slate-800 p-8 rounded-xl border-4 border-yellow-500 shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-yellow-400 mb-2">CAUGHT!</h2>
      <FishIcon size={64} className={fish.color} />
      <p className="text-2xl mt-4 text-white font-bold">{fish.name}</p>
      {inventoryRejected ? (
        <p className="mt-4 text-amber-400 text-center text-sm max-w-xs">
          Pack full — sell your haul first. This catch was not stored.
        </p>
      ) : (
        <div className="flex gap-4 mt-4">
          <span className="bg-slate-700 px-3 py-1 rounded text-yellow-300">Sell value: {formatMoney(fish.coinValue)}</span>
          <span className="bg-slate-700 px-3 py-1 rounded text-blue-300">+{fish.xpReward} XP</span>
        </div>
      )}
      <button onClick={onContinue} className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">
        Continue Fishing
      </button>
      <button onClick={onBackToMenu} className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm text-slate-300">
        Back to Menu
      </button>
    </div>
  );
}

interface LostScreenProps {
  reason: string;
  onRetry: () => void;
}

export function LostScreen({ reason, onRetry }: LostScreenProps) {
  return (
    <div className="flex flex-col items-center bg-slate-800 p-8 rounded-xl border-4 border-red-900 shadow-2xl">
      <h2 className="text-3xl font-bold text-red-500 mb-2">ESCAPED!</h2>
      <p className="text-slate-400 text-center mb-6">{reason || 'The fish got away.'}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-bold">
        Try Again
      </button>
    </div>
  );
}
