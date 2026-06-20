'use client';

import { PlayerStats } from '@/lib/gameTypes';
import { formatMoney } from '@/lib/formatMoney';
import { Fish as FishIcon, Backpack, X } from 'lucide-react';

interface InventoryDropdownProps {
  stats: PlayerStats;
  onClose: () => void;
}

export default function InventoryDropdown({ stats, onClose }: InventoryDropdownProps) {
  const sortedInventory = [...stats.inventory].sort((a, b) => b.caughtAt - a.caughtAt);
  const inventoryTotalValue = stats.inventory.reduce((sum, f) => sum + f.coinValue, 0);

  return (
    <div className="absolute top-12 right-0 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 w-80 max-h-96 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h4 className="font-bold text-amber-400 flex items-center gap-2">
          <Backpack size={16} /> Your Catch
        </h4>
        <button type="button" onClick={onClose} className="p-1 hover:bg-slate-700 rounded" aria-label="Close inventory">
          <X size={16} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        {sortedInventory.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No fish yet. Go catch something!</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {sortedInventory.map(fish => (
              <li
                key={fish.instanceId}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FishIcon size={18} className={`shrink-0 ${fish.color}`} />
                  <div className="min-w-0">
                    <div className={`font-bold text-sm truncate ${fish.color}`}>{fish.name}</div>
                    <div className="text-[10px] text-slate-500">{fish.rarity}</div>
                  </div>
                </div>
                <span className="text-yellow-400 text-sm font-mono shrink-0 ml-2">{formatMoney(fish.coinValue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 border-t border-slate-700 text-xs text-slate-400 flex justify-between">
        <span>{stats.inventory.length} fish</span>
        <span className="text-yellow-300 font-mono">Total: {formatMoney(inventoryTotalValue)}</span>
      </div>
    </div>
  );
}
