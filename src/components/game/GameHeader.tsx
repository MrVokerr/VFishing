'use client';

import { PlayerStats } from '@/lib/gameTypes';
import { formatMoney } from '@/lib/formatMoney';
import { Bot, ShoppingBag, Backpack } from 'lucide-react';
import DevToolsMenu from './DevToolsMenu';
import InventoryDropdown from './InventoryDropdown';

interface GameHeaderProps {
  stats: PlayerStats;
  autoPlay: boolean;
  showDevMenu: boolean;
  showInventory: boolean;
  forceLegendary: boolean;
  status: string;
  activeFishRarity?: string;
  onToggleDevMenu: () => void;
  onToggleAutoPlay: () => void;
  onToggleForceLegendary: () => void;
  onJumpToFinalBurst: () => void;
  onToggleShop: () => void;
  onToggleInventory: () => void;
  onCloseInventory: () => void;
}

export default function GameHeader({
  stats,
  autoPlay,
  showDevMenu,
  showInventory,
  forceLegendary,
  status,
  activeFishRarity,
  onToggleDevMenu,
  onToggleAutoPlay,
  onToggleForceLegendary,
  onJumpToFinalBurst,
  onToggleShop,
  onToggleInventory,
  onCloseInventory,
}: GameHeaderProps) {
  return (
    <div className="fixed top-0 left-0 w-full bg-sky-950 p-4 flex justify-between items-center shadow-lg z-10">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="font-bold text-xl text-yellow-400">Lv. {stats.level}</span>
          <span className="text-xs text-sky-300">
            XP: {Math.floor(stats.xp)} / {stats.xpToNextLevel}
          </span>
          <div className="w-24 h-2 bg-sky-800 rounded-full mt-1">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${Math.min(100, (stats.xp / stats.xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>
        <div className="text-yellow-300 font-mono font-bold">
          {formatMoney(stats.coins)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={onToggleDevMenu}
            className={`p-2 rounded-lg transition ${autoPlay ? 'bg-purple-600 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
            title="Dev Menu"
          >
            <Bot size={20} className={autoPlay ? 'text-white' : 'text-slate-400'} />
          </button>
          {showDevMenu && (
            <DevToolsMenu
              autoPlay={autoPlay}
              forceLegendary={forceLegendary}
              canJumpFinalBurst={status === 'FIGHTING' && activeFishRarity === 'Legendary'}
              onToggleAutoPlay={onToggleAutoPlay}
              onToggleForceLegendary={onToggleForceLegendary}
              onJumpToFinalBurst={onJumpToFinalBurst}
            />
          )}
        </div>

        <button
          onClick={onToggleShop}
          className="p-2 px-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition flex items-center gap-2"
        >
          <ShoppingBag size={20} />
          <span className="font-bold text-sm">Shop</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleInventory}
            className={`p-2 rounded-lg flex items-center gap-2 transition ${showInventory ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-amber-700 hover:bg-amber-600'}`}
            title="View inventory"
          >
            <Backpack size={20} />
            <span>
              {stats.inventory.length}/{stats.inventoryCapacity}
            </span>
          </button>
          {showInventory && (
            <InventoryDropdown stats={stats} onClose={onCloseInventory} />
          )}
        </div>
      </div>
    </div>
  );
}
