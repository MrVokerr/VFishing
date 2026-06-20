'use client';

import { PlayerStats, Rod, Boat, Bait } from '@/lib/gameTypes';
import { RODS, BOATS, BAIT_TYPES } from '@/lib/data';
import { formatMoney } from '@/lib/formatMoney';
import { canAffordPurchase, getPurchaseBlockReason } from '@/lib/shopUtils';
import { MAX_BAIT_QUANTITY, baitRestockAmount } from '@/lib/baitUtils';
import { Swords, Anchor, Fish as FishIcon } from 'lucide-react';

interface ShopPanelProps {
  stats: PlayerStats;
  currentRod: Rod;
  currentBoat: Boat;
  currentBait: Bait;
  onClose: () => void;
  onSellHaul: () => void;
  onBuyRod: (rod: Rod) => void;
  onBuyBoat: (boat: Boat) => void;
  onBuyBait: (bait: Bait) => void;
  onRestockBait: (bait: Bait) => void;
}

export default function ShopPanel({
  stats,
  currentRod,
  currentBoat,
  currentBait,
  onClose,
  onSellHaul,
  onBuyRod,
  onBuyBoat,
  onBuyBait,
  onRestockBait,
}: ShopPanelProps) {
  const haulValue = stats.inventory.reduce((a, b) => a + b.coinValue, 0);

  return (
    <div className="w-full bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Fishing Shop</h2>
          <p className="text-sm text-yellow-300 font-mono mt-1">Balance: {formatMoney(stats.coins)}</p>
        </div>
        <button onClick={onClose} className="px-4 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg">
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <GearColumn title="Rods" icon={<Swords size={16} />}>
          {RODS.map(rod => (
            <GearRow
              key={rod.id}
              name={rod.name}
              detail={`Dmg ${rod.damage} • Decay +${rod.tensionDecay} • Max ${rod.maxTension} • Lv ${rod.reqLevel}`}
              equipped={currentRod.id === rod.id}
              unlocked={stats.unlockedRodIds.includes(rod.id)}
              price={rod.price}
              canBuy={canAffordPurchase(stats.coins, stats.level, rod.price, rod.reqLevel)}
              blockReason={getPurchaseBlockReason(stats.coins, stats.level, rod.price, rod.reqLevel)}
              onAction={() => onBuyRod(rod)}
            />
          ))}
        </GearColumn>

        <GearColumn title="Boats" icon={<Anchor size={16} />}>
          {BOATS.map(boat => (
            <GearRow
              key={boat.id}
              name={boat.name}
              detail={`Cap ${boat.capacity} • Stam +${boat.fightStaminaBonus} • Lv ${boat.reqLevel}`}
              equipped={currentBoat.id === boat.id}
              unlocked={stats.unlockedBoatIds.includes(boat.id)}
              price={boat.price}
              canBuy={canAffordPurchase(stats.coins, stats.level, boat.price, boat.reqLevel)}
              blockReason={getPurchaseBlockReason(stats.coins, stats.level, boat.price, boat.reqLevel)}
              onAction={() => onBuyBoat(boat)}
            />
          ))}
        </GearColumn>

        <GearColumn title="Bait" icon={<FishIcon size={16} />}>
          {BAIT_TYPES.map(bait => {
            const baitQty = stats.baitCounts[bait.id] ?? 0;
            const restockAdd = baitRestockAmount(baitQty);
            return (
              <div
                key={bait.id}
                className={`p-2 rounded ${currentBait.id === bait.id ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-700/50'}`}
              >
                <GearRow
                  name={bait.name}
                  detail={`${bait.description} • x${baitQty}/${MAX_BAIT_QUANTITY}`}
                  equipped={currentBait.id === bait.id}
                  unlocked={stats.unlockedBaitIds.includes(bait.id)}
                  price={bait.price}
                  canBuy={canAffordPurchase(stats.coins, stats.level, bait.price, bait.reqLevel)}
                  blockReason={getPurchaseBlockReason(stats.coins, stats.level, bait.price, bait.reqLevel)}
                  onAction={() => onBuyBait(bait)}
                />
                {stats.unlockedBaitIds.includes(bait.id) && bait.restockCost > 0 && (
                  <button
                    onClick={() => onRestockBait(bait)}
                    disabled={stats.coins < bait.restockCost || restockAdd <= 0}
                    title={
                      restockAdd <= 0
                        ? `Bait capped at ${MAX_BAIT_QUANTITY}`
                        : stats.coins < bait.restockCost
                          ? getPurchaseBlockReason(stats.coins, stats.level, bait.restockCost, 1) ?? undefined
                          : undefined
                    }
                    className="mt-1 w-full px-2 py-1 bg-amber-700 disabled:bg-slate-600 rounded font-bold text-[10px] hover:bg-amber-600"
                  >
                    {restockAdd <= 0
                      ? `Max (${MAX_BAIT_QUANTITY})`
                      : `+${restockAdd} (${formatMoney(bait.restockCost)})`}
                  </button>
                )}
              </div>
            );
          })}
        </GearColumn>
      </div>

      <button
        onClick={onSellHaul}
        disabled={stats.inventory.length === 0}
        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 rounded-lg font-bold text-lg"
      >
        Sell Haul ({formatMoney(haulValue)})
      </button>
    </div>
  );
}

function GearColumn({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
      <h3 className="text-base font-bold text-blue-300 mb-2 border-b border-slate-600 pb-1 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function GearRow({
  name,
  detail,
  equipped,
  unlocked,
  price,
  canBuy,
  blockReason,
  onAction,
}: {
  name: string;
  detail: string;
  equipped: boolean;
  unlocked: boolean;
  price: number;
  canBuy: boolean;
  blockReason: string | null;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-bold text-base truncate">{name}</div>
        <div className="text-xs text-slate-400">{detail}</div>
      </div>
      {equipped ? (
        <span className="text-green-400 font-bold px-2 text-sm shrink-0">Equipped</span>
      ) : unlocked ? (
        <button onClick={onAction} className="px-2 py-1 bg-blue-600 rounded font-bold text-xs hover:bg-blue-500 shrink-0">
          Equip
        </button>
      ) : (
        <button
          onClick={onAction}
          disabled={!canBuy}
          title={blockReason ?? undefined}
          className="px-2 py-1 bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-500 rounded font-bold text-xs hover:bg-yellow-500 shrink-0 min-w-[4.5rem]"
        >
          {canBuy ? formatMoney(price) : blockReason ?? formatMoney(price)}
        </button>
      )}
    </div>
  );
}
