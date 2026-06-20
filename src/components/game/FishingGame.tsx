'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Fish, Rod, Boat, Bait, Location, LEVEL_SCALING_FACTOR } from '@/lib/gameTypes';
import { RODS, BOATS, LOCATIONS } from '@/lib/data';
import { selectRandomFish, getCastDelayMs } from '@/lib/castEngine';
import { createCaughtFish, isInventoryFull, applyBoatCapacity } from '@/lib/inventoryUtils';
import { clampBaitQuantity, addBaitQuantity, baitRestockAmount } from '@/lib/baitUtils';
import { selectLegendaryFish, forceFinalBurstPhase } from '@/lib/devTools';
import { getAutoCounterAction } from '@/lib/autoPlay';
import { useGamePersistence } from '@/hooks/useGamePersistence';
import { useFightLoop, initFightFromHook } from '@/hooks/useFightLoop';
import { useGameInput } from '@/hooks/useGameInput';
import { BIG_REEL_STAMINA_COST, BIG_REEL_TENSION_THRESHOLD } from '@/lib/fightEngine';
import GameHeader from '@/components/game/GameHeader';
import ShopPanel from '@/components/game/ShopPanel';
import IdleScreen from '@/components/game/IdleScreen';
import HookedScreen, { CastingScreen } from '@/components/game/HookedScreen';
import FightScreen from '@/components/game/FightScreen';
import CaughtScreen, { LostScreen } from '@/components/game/CaughtScreen';

export default function FishingGame() {
  const {
    stats,
    setStats,
    currentRod,
    setCurrentRod,
    currentBoat,
    setCurrentBoat,
    currentBait,
    setCurrentBait,
    currentLocation,
    setCurrentLocation,
    isLoaded,
    saveCorrupted,
    dismissSaveCorrupted,
  } = useGamePersistence();

  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [activeFish, setActiveFish] = useState<Fish | null>(null);
  const [fight, setFight] = useState<import('@/lib/gameTypes').FightState | null>(null);
  const fightRef = useRef(fight);
  useEffect(() => {
    fightRef.current = fight;
  }, [fight]);

  const [menuIconIndex, setMenuIconIndex] = useState(() => Math.floor(Math.random() * 5));

  const enterIdle = useCallback(() => {
    setMenuIconIndex(Math.floor(Math.random() * 5));
    setStatus('IDLE');
  }, []);
  const [lossReason, setLossReason] = useState('');
  const [inventoryRejected, setInventoryRejected] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [forceLegendary, setForceLegendary] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const baitCount = stats.baitCounts[currentBait.id] ?? 0;

  const canTravelTo = useCallback(
    (loc: Location) => {
      if (loc.reqRodId) {
        if (RODS.findIndex(r => r.id === currentRod.id) < RODS.findIndex(r => r.id === loc.reqRodId)) return false;
      }
      if (loc.reqBoatId) {
        if (BOATS.findIndex(b => b.id === currentBoat.id) < BOATS.findIndex(b => b.id === loc.reqBoatId)) return false;
      }
      return true;
    },
    [currentRod.id, currentBoat.id]
  );

  const castTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginCast = useCallback(() => {
    if (isInventoryFull(stats)) return false;
    if (!canTravelTo(currentLocation)) return false;
    if (currentBait.restockCost > 0 && baitCount <= 0) return false;

    if (currentBait.restockCost > 0) {
      setStats(prev => ({
        ...prev,
        baitCounts: {
          ...prev.baitCounts,
          [currentBait.id]: clampBaitQuantity((prev.baitCounts[currentBait.id] ?? 0) - 1),
        },
      }));
    }

    setFight(null);
    setActiveFish(null);
    setStatus('CASTING');

    if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
    castTimeoutRef.current = setTimeout(() => {
      const selectedFish = forceLegendary
        ? selectLegendaryFish(currentLocation.tier)
        : selectRandomFish(currentLocation, currentBait);
      setActiveFish(selectedFish);
      setStatus('HOOKED');
      castTimeoutRef.current = null;
    }, getCastDelayMs());

    return true;
  }, [stats, currentLocation, currentBait, baitCount, canTravelTo, setStats, forceLegendary]);

  const castLine = useCallback(() => {
    if (status !== 'IDLE') return;
    beginCast();
  }, [status, beginCast]);

  const hookFish = useCallback(() => {
    if (!activeFish) return;
    setFight(initFightFromHook(activeFish, currentLocation, currentBoat, true, 'LEFT'));
    setStatus('FIGHTING');
  }, [activeFish, currentLocation, currentBoat]);

  const handleCaught = useCallback(() => {
    if (!activeFish) return;
    const full = stats.inventory.length >= stats.inventoryCapacity;
    setInventoryRejected(full);
    if (!full) {
      setStats(prev => ({
        ...prev,
        xp: prev.xp + activeFish.xpReward,
        inventory: [...prev.inventory, createCaughtFish(activeFish)],
      }));
    }
    setFight(null);
    setStatus('CAUGHT');
  }, [activeFish, stats.inventory.length, stats.inventoryCapacity, setStats]);

  const handleLost = useCallback((reason: 'snap') => {
    setLossReason(reason === 'snap' ? 'The line snapped under too much tension.' : 'The fish got away.');
    setFight(null);
    setStatus('LOST');
  }, []);

  const { setPlayerAction, setPlayerActionSilent, doBigReel, activateAbility } = useFightLoop({
    isFighting: status === 'FIGHTING',
    fight,
    activeFish,
    currentRod,
    currentBoat,
    currentLocation,
    playerLevel: stats.level,
    onFightUpdate: setFight,
    onCaught: handleCaught,
    onLost: handleLost,
  });

  const prevLocation = useCallback(() => {
    const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
    if (idx > 0) setCurrentLocation(LOCATIONS[idx - 1]);
  }, [currentLocation.id, setCurrentLocation]);

  const nextLocation = useCallback(() => {
    const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
    if (idx < LOCATIONS.length - 1) setCurrentLocation(LOCATIONS[idx + 1]);
  }, [currentLocation.id, setCurrentLocation]);

  const qteActive =
    status === 'FIGHTING' && fight?.phase === 'finalBurst' && (fight.qteSequence.length ?? 0) > 0;

  useGameInput({
    status,
    locationTier: currentLocation.tier,
    qteActive,
    onCastLine: castLine,
    onHookFish: hookFish,
    onSetPlayerAction: setPlayerAction,
    onBigReel: doBigReel,
    onActivateAbility: activateAbility,
    onPrevLocation: prevLocation,
    onNextLocation: nextLocation,
  });

  useEffect(() => {
    if (stats.xp >= stats.xpToNextLevel) {
      setStats(prev => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - prev.xpToNextLevel,
        xpToNextLevel: Math.floor(prev.xpToNextLevel * LEVEL_SCALING_FACTOR),
      }));
    }
  }, [stats.xp, stats.xpToNextLevel, setStats]);

  useEffect(() => {
    if (!autoPlay) return;
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'IDLE' && !isInventoryFull(stats) && canTravelTo(currentLocation) && (currentBait.restockCost === 0 || baitCount > 0)) {
      timer = setTimeout(castLine, 400);
    } else if (status === 'HOOKED') {
      timer = setTimeout(hookFish, 200);
    } else if (status === 'CAUGHT' || status === 'LOST') {
      timer = setTimeout(enterIdle, 400);
    }
    return () => clearTimeout(timer);
  }, [status, autoPlay, stats, currentLocation, canTravelTo, castLine, hookFish, baitCount, currentBait.restockCost, enterIdle]);

  useEffect(() => {
    if (!autoPlay || status !== 'FIGHTING') return;
    const interval = setInterval(() => {
      const f = fightRef.current;
      if (f) setPlayerActionSilent(getAutoCounterAction(f));
    }, 50);
    return () => clearInterval(interval);
  }, [autoPlay, status, setPlayerActionSilent]);

  useEffect(() => {
    if (!autoPlay || status !== 'FIGHTING' || currentLocation.tier < 3) return;
    const interval = setInterval(() => {
      const f = fightRef.current;
      if (!f) return;
      if (f.fightStamina >= BIG_REEL_STAMINA_COST && f.lineTension / currentRod.maxTension <= BIG_REEL_TENSION_THRESHOLD) {
        doBigReel();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [autoPlay, status, currentLocation.tier, currentRod.maxTension, doBigReel]);

  const handleContinueFishing = useCallback(() => {
    if (!beginCast()) enterIdle();
  }, [beginCast, enterIdle]);

  useEffect(() => {
    return () => {
      if (castTimeoutRef.current) clearTimeout(castTimeoutRef.current);
    };
  }, []);

  const sellFish = useCallback(() => {
    setStats(prev => {
      const totalValue = prev.inventory.reduce((acc, f) => acc + f.coinValue, 0);
      return { ...prev, coins: prev.coins + totalValue, inventory: [] };
    });
  }, [setStats]);

  const buyRod = useCallback(
    (rod: Rod) => {
      let equipRod = false;
      setStats(prev => {
        if (prev.unlockedRodIds.includes(rod.id)) {
          equipRod = true;
          return prev;
        }
        if (prev.coins < rod.price || prev.level < rod.reqLevel) return prev;
        equipRod = true;
        return {
          ...prev,
          coins: prev.coins - rod.price,
          unlockedRodIds: [...prev.unlockedRodIds, rod.id],
        };
      });
      if (equipRod) setCurrentRod(rod);
    },
    [setStats, setCurrentRod]
  );

  const buyBoat = useCallback(
    (boat: Boat) => {
      let equipBoat = false;
      setStats(prev => {
        if (prev.unlockedBoatIds.includes(boat.id)) {
          equipBoat = true;
          return applyBoatCapacity(prev, boat.capacity);
        }
        if (prev.coins < boat.price || prev.level < boat.reqLevel) return prev;
        equipBoat = true;
        return applyBoatCapacity(
          {
            ...prev,
            coins: prev.coins - boat.price,
            unlockedBoatIds: [...prev.unlockedBoatIds, boat.id],
          },
          boat.capacity
        );
      });
      if (equipBoat) setCurrentBoat(boat);
    },
    [setStats, setCurrentBoat]
  );

  const buyBait = useCallback(
    (bait: Bait) => {
      let equipBait = false;
      setStats(prev => {
        if (prev.unlockedBaitIds.includes(bait.id)) {
          equipBait = true;
          return prev;
        }
        if (prev.coins < bait.price || prev.level < bait.reqLevel) return prev;
        equipBait = true;
        return {
          ...prev,
          coins: prev.coins - bait.price,
          unlockedBaitIds: [...prev.unlockedBaitIds, bait.id],
          baitCounts: {
            ...prev.baitCounts,
            [bait.id]: clampBaitQuantity(bait.stackSize),
          },
        };
      });
      if (equipBait) setCurrentBait(bait);
    },
    [setStats, setCurrentBait]
  );

  const restockBait = useCallback(
    (bait: Bait) => {
      setStats(prev => {
        const current = prev.baitCounts[bait.id] ?? 0;
        const add = baitRestockAmount(current);
        if (add <= 0 || prev.coins < bait.restockCost) return prev;
        return {
          ...prev,
          coins: prev.coins - bait.restockCost,
          baitCounts: {
            ...prev.baitCounts,
            [bait.id]: addBaitQuantity(current, add),
          },
        };
      });
    },
    [setStats]
  );

  const jumpToFinalBurst = () => {
    if (!fight || activeFish?.rarity !== 'Legendary') return;
    setFight(forceFinalBurstPhase(fight, currentLocation.tier));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-900 text-white">
        Loading...
      </div>
    );
  }

  const inventoryFull = isInventoryFull(stats);
  const noBait = currentBait.restockCost > 0 && baitCount <= 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-900 text-white p-4 font-sans">
      {saveCorrupted && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-900 border border-amber-500 text-amber-100 px-4 py-2 rounded-lg text-sm flex gap-3 items-center">
          Save corrupted — started fresh.
          <button onClick={dismissSaveCorrupted} className="underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      <GameHeader
        stats={stats}
        autoPlay={autoPlay}
        showDevMenu={showDevMenu}
        showInventory={showInventory}
        forceLegendary={forceLegendary}
        status={status}
        activeFishRarity={activeFish?.rarity}
        onToggleDevMenu={() => setShowDevMenu(v => !v)}
        onToggleAutoPlay={() => setAutoPlay(v => !v)}
        onToggleForceLegendary={() => setForceLegendary(v => !v)}
        onJumpToFinalBurst={jumpToFinalBurst}
        onToggleShop={() => {
          setShowInventory(false);
          if (status === 'SHOP') enterIdle();
          else setStatus('SHOP');
        }}
        onToggleInventory={() => setShowInventory(v => !v)}
        onCloseInventory={() => setShowInventory(false)}
      />

      <div
        className={`mt-20 w-full flex flex-col items-center gap-8 ${
          status === 'SHOP' ? 'max-w-4xl' : status === 'FIGHTING' ? 'max-w-6xl' : 'max-w-md'
        }`}
      >
        {status === 'SHOP' && (
          <ShopPanel
            stats={stats}
            currentRod={currentRod}
            currentBoat={currentBoat}
            currentBait={currentBait}
            onClose={enterIdle}
            onSellHaul={sellFish}
            onBuyRod={buyRod}
            onBuyBoat={buyBoat}
            onBuyBait={buyBait}
            onRestockBait={restockBait}
          />
        )}

        {status === 'IDLE' && (
          <IdleScreen
            menuIconIndex={menuIconIndex}
            currentLocation={currentLocation}
            currentRod={currentRod}
            currentBait={currentBait}
            baitCount={baitCount}
            inventoryFull={inventoryFull}
            noBait={noBait}
            canTravel={canTravelTo(currentLocation)}
            onPrevLocation={prevLocation}
            onNextLocation={nextLocation}
            onCastLine={castLine}
          />
        )}

        {status === 'CASTING' && <CastingScreen />}
        {status === 'HOOKED' && <HookedScreen onHookFish={hookFish} />}

        {status === 'FIGHTING' && activeFish && fight && (
          <FightScreen
            fish={activeFish}
            fight={fight}
            rod={currentRod}
            location={currentLocation}
            playerLevel={stats.level}
            qteActive={qteActive}
            onActivateAbility={activateAbility}
            onSetPlayerAction={a => setPlayerAction(a)}
            onClearPlayerAction={() => setPlayerAction(null)}
            onBigReel={doBigReel}
          />
        )}

        {status === 'CAUGHT' && activeFish && (
          <CaughtScreen
            fish={activeFish}
            inventoryRejected={inventoryRejected}
            onContinue={handleContinueFishing}
            onBackToMenu={enterIdle}
          />
        )}

        {status === 'LOST' && <LostScreen reason={lossReason} onRetry={handleContinueFishing} />}
      </div>
    </div>
  );
}
