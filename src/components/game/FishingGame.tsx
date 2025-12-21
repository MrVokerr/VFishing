'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, PlayerStats, INITIAL_STATS, Fish, Rod, Boat, Bait, Location } from '@/lib/gameTypes';
import { FISH_TYPES, RODS, BOATS, BAIT_TYPES, LOCATIONS } from '@/lib/data';
import { Swords, Anchor, Fish as FishIcon, DollarSign, TrendingUp, AlertCircle, ShoppingBag, Backpack, Map, ChevronRight, ChevronLeft, Ship, Waves, Bot, Settings } from 'lucide-react';

const TICK_RATE = 100; // ms

const FishingRodIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M2 22 22 2" />
        <path d="M15 5l-3 3" />
        <path d="M18 2s2 2 2 5-2 5-2 5" />
    </svg>
);

const MENU_ICONS = [FishingRodIcon, FishIcon, Anchor, Ship, Waves];

export default function FishingGame() {
  // Persistent State
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [currentRod, setCurrentRod] = useState<Rod>(RODS[0]);
  const [currentBoat, setCurrentBoat] = useState<Boat>(BOATS[0]);
  const [currentBait, setCurrentBait] = useState<Bait>(BAIT_TYPES[0]);
  const [currentLocation, setCurrentLocation] = useState<Location>(LOCATIONS[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Session State
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [activeFish, setActiveFish] = useState<Fish | null>(null);
  const [fishHp, setFishHp] = useState(0);
  const [lineTension, setLineTension] = useState(0); // 0-100
  const [fishState, setFishState] = useState<'LEFT' | 'RIGHT' | 'JUMP' | 'DIVE'>('LEFT');
  const [playerAction, setPlayerAction] = useState<'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null>(null);
  const [menuIconIndex, setMenuIconIndex] = useState(0);
  
  // Dev State
  const [autoPlay, setAutoPlay] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);

  // Timers
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const stateChangeRef = useRef<NodeJS.Timeout | null>(null);

  // --- Persistence ---
  
  // Load Game
  useEffect(() => {
    const saved = localStorage.getItem('vfishing_save_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        let loadedStats = { ...INITIAL_STATS };
        if (parsed.stats) {
            loadedStats = { ...loadedStats, ...parsed.stats };
        }

        // Restore Equipment & Ensure Unlocked
        if (parsed.currentRodId) {
            const item = RODS.find(i => i.id === parsed.currentRodId);
            if (item) {
                setTimeout(() => setCurrentRod(item), 0);
                if (!loadedStats.unlockedRodIds.includes(item.id)) {
                    loadedStats.unlockedRodIds = [...loadedStats.unlockedRodIds, item.id];
                }
            }
        }
        if (parsed.currentBoatId) {
            const item = BOATS.find(i => i.id === parsed.currentBoatId);
            if (item) {
                setTimeout(() => setCurrentBoat(item), 0);
                if (!loadedStats.unlockedBoatIds.includes(item.id)) {
                    loadedStats.unlockedBoatIds = [...loadedStats.unlockedBoatIds, item.id];
                }
            }
        }
        if (parsed.currentBaitId) {
             const item = BAIT_TYPES.find(i => i.id === parsed.currentBaitId);
             if (item) {
                 setTimeout(() => setCurrentBait(item), 0);
                 if (!loadedStats.unlockedBaitIds.includes(item.id)) {
                     loadedStats.unlockedBaitIds = [...loadedStats.unlockedBaitIds, item.id];
                 }
             }
        }
        if (parsed.currentLocationId) {
             const item = LOCATIONS.find(i => i.id === parsed.currentLocationId);
             if (item) setTimeout(() => setCurrentLocation(item), 0);
        }

        setTimeout(() => setStats(loadedStats), 0);

      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save Game
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveData = {
        stats,
        currentRodId: currentRod.id,
        currentBoatId: currentBoat.id,
        currentBaitId: currentBait.id,
        currentLocationId: currentLocation.id
    };
    
    localStorage.setItem('vfishing_save_v1', JSON.stringify(saveData));
  }, [stats, currentRod, currentBoat, currentBait, currentLocation, isLoaded]);

  // Cycle Menu Icon on IDLE
  useEffect(() => {
    if (status === 'IDLE') {
        const timer = setTimeout(() => {
             setMenuIconIndex(Math.floor(Math.random() * MENU_ICONS.length));
             setPlayerAction(null); // Reset action on return to idle
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [status]);

  // ... (Actions skipped for brevity in replace block, assuming match is unique enough or I use multiple replaces) ...
  // Wait, I can't skip. I need to target specific blocks.
  // I will do multiple replaces.



  // --- Actions ---

  const canTravelTo = useCallback((loc: Location) => {
    // Check Rod Requirement
    if (loc.reqRodId) {
        const reqRod = RODS.find(r => r.id === loc.reqRodId);
        // Assuming rods are linear in list, but better to check stats or IDs
        // Simple check: is current rod index >= req rod index?
        const currentRodIndex = RODS.findIndex(r => r.id === currentRod.id);
        const reqRodIndex = RODS.findIndex(r => r.id === loc.reqRodId);
        if (currentRodIndex < reqRodIndex) return false;
    }
    // Check Boat Requirement
    if (loc.reqBoatId) {
        const currentBoatIndex = BOATS.findIndex(b => b.id === currentBoat.id);
        const reqBoatIndex = BOATS.findIndex(b => b.id === loc.reqBoatId);
        if (currentBoatIndex < reqBoatIndex) return false;
    }
    return true;
  }, [currentRod.id, currentBoat.id]);

  const castLine = useCallback(() => {
    setStatus('CASTING');
    setTimeout(() => {
      // Pick a fish based on location tier and Luck
      const availableFish = FISH_TYPES.filter(f => f.minLocationTier <= currentLocation.tier);
      
      // Luck Calculation
      // Luck comes from Bait Catch Rate (1.0 = 100%, 1.2 = 120%, 2.0 = 200%)
      const luckMultiplier = currentBait.catchRate;

      // Weighted Random Selection
      const weightedFish = availableFish.map(fish => {
          let weight = 100;
          switch (fish.rarity) {
              case 'Common': weight = 100; break;
              case 'Uncommon': weight = 50 * luckMultiplier; break;
              case 'Rare': weight = 20 * luckMultiplier; break;
              case 'Legendary': weight = 5 * luckMultiplier; break;
          }
          return { fish, weight };
      });

      const totalWeight = weightedFish.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedFish = weightedFish[0].fish;

      for (const item of weightedFish) {
          if (random < item.weight) {
              selectedFish = item.fish;
              break;
          }
          random -= item.weight;
      }
      
      setActiveFish(selectedFish);
      // Apply location difficulty multiplier
      setFishHp(selectedFish.baseHp * currentLocation.difficultyMultiplier);
      setLineTension(0);
      setStatus('HOOKED');
      
    }, 1500 + Math.random() * 2000);
  }, [currentLocation, currentBait]);

  const hookFish = useCallback(() => {
    setStatus('FIGHTING');
  }, []);

  const triggerBigReel = useCallback(() => {
      // Big Reel Logic: +50% Damage instant tick
      // Penalty: If tension > 30%, adds +20% tension.
      if (status !== 'FIGHTING') return;

      const dmg = currentRod.damage * 1.5;
      setFishHp(prev => Math.max(0, prev - dmg));
      
      if (lineTension > 30) {
          setLineTension(prev => Math.min(100, prev + 20));
      } else {
          setLineTension(prev => Math.min(100, prev + 5)); // Base cost
      }
  }, [status, currentRod.damage, lineTension]);

  // Global Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat && status !== 'FIGHTING') return; // Allow repeat for holding keys in fighting? No, logic uses setPlayerAction. 
        // Actually, for Fighting, we used `onMouseDown`/`onMouseUp` logic which corresponds to `keydown`/`keyup`.
        // The previous implementation had `if (e.repeat) return;` for fighting too.
        if (e.repeat) return;

        const key = e.key.toLowerCase();

        if (status === 'IDLE') {
            if (key === 'a' || key === 'arrowleft') {
                // Previous Location
                const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
                if (idx > 0) setCurrentLocation(LOCATIONS[idx - 1]);
            } else if (key === 'd' || key === 'arrowright') {
                // Next Location
                const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
                if (idx < LOCATIONS.length - 1) setCurrentLocation(LOCATIONS[idx + 1]);
            } else if (key === 'w' || key === 's') {
                // Cast Line
                if (stats.inventory.length < stats.inventoryCapacity && canTravelTo(currentLocation)) {
                    castLine();
                }
            }
        } else if (status === 'HOOKED') {
            if (['w', 'a', 's', 'd'].includes(key)) {
                hookFish();
            }
        } else if (status === 'FIGHTING') {
            switch (key) {
                case 'a': setPlayerAction('LEFT'); break;
                case 'd': setPlayerAction('RIGHT'); break;
                case 'w': setPlayerAction('REEL'); break;
                case 's': if (currentLocation.tier >= 2) setPlayerAction('SLACK'); break;
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (status === 'FIGHTING') {
             switch (e.key.toLowerCase()) {
                case 'a': setPlayerAction(prev => prev === 'LEFT' ? null : prev); break;
                case 'd': setPlayerAction(prev => prev === 'RIGHT' ? null : prev); break;
                case 'w': setPlayerAction(prev => prev === 'REEL' ? null : prev); break;
                case 's': setPlayerAction(prev => prev === 'SLACK' ? null : prev); break;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, currentLocation, stats.inventory.length, stats.inventoryCapacity, canTravelTo, castLine, hookFish]);

  // Need to use refs for status inside intervals usually, but with fast ticks and state setters it might be ok for simple logic.
  // Actually, intervals with closures are tricky. Better to use a useEffect hook that depends on status.

  useEffect(() => {
    if (status === 'FIGHTING') {
      const interval = setInterval(() => {
        setFishHp((prev) => {
          if (prev <= 0) return 0;
          return prev;
        });
        
        // We need to access the LATEST playerAction and fishState.
        // Sets inside intervals don't see updated state unless we use refs or functional updates.
        // Let's move logic to a useEffect driven by tick or use refs.
      }, TICK_RATE);
      return () => clearInterval(interval);
    } else {
        // Reset action when not fighting
        const t = setTimeout(() => setPlayerAction(null), 0);
        return () => clearTimeout(t);
    }
  }, [status]);

  // Damage Accumulator
  const lastDamageTick = useRef<number>(0);

  // Main Game Logic Effect
  useEffect(() => {
    if (status !== 'FIGHTING') return;
    
    // We'll use a fast interval to process tension, but damage is throttled
    const timer = setInterval(() => {
      // Determine if matching
      // Rule: 
      // Fish LEFT -> Player LEFT (A)
      // Fish RIGHT -> Player RIGHT (D)
      // Fish JUMP -> Player REEL (W)
      // Fish DIVE -> Player SLACK (S)
      
      let isCorrect = false;
      const isIdle = playerAction === null;
      
      if (fishState === 'LEFT' && playerAction === 'LEFT') isCorrect = true;
      if (fishState === 'RIGHT' && playerAction === 'RIGHT') isCorrect = true;
      if (fishState === 'JUMP' && playerAction === 'REEL') isCorrect = true;
      if (fishState === 'DIVE' && playerAction === 'SLACK') isCorrect = true;

      const now = Date.now();

      if (isCorrect) {
        // Damage Logic: Tick every 0.5s (500ms)
        if (now - lastDamageTick.current >= 500) {
            setFishHp(prev => Math.max(0, prev - (currentRod.damage * 0.8))); // Reduced DPS slightly, distinct ticks
            lastDamageTick.current = now;
        }
        // Tension stays still when correct
      } else if (!isIdle) {
        // Wrong action pressed! Penalty.
        setLineTension(prev => Math.min(100, prev + 2.0));
      } else {
        // Idle (no button pressed)
        setLineTension(prev => Math.min(100, prev + 0.5));
      }
      
      // Check win/loss
      setFishHp(prev => {
        if (prev <= 0) {
           // Win
           setStatus('CAUGHT');
           setPlayerAction(null);
           return 0;
        }
        return prev;
      });
      
      setLineTension(prev => {
        if (prev >= 100) {
            // Lose
            setStatus('LOST');
            setPlayerAction(null);
            return 100;
        }
        return prev;
      });

    }, TICK_RATE);

    return () => clearInterval(timer);
  }, [status, fishState, playerAction, currentRod.damage]);

  // Fish State Randomizer Effect
  useEffect(() => {
    if (status !== 'FIGHTING') return;
    
    const cycleState = () => {
        const states: ('LEFT' | 'RIGHT' | 'JUMP' | 'DIVE')[] = ['LEFT', 'RIGHT', 'JUMP'];
        if (currentLocation.tier >= 2) states.push('DIVE');

        const next = states[Math.floor(Math.random() * states.length)];
        setFishState(next);
        
        const speedFactor = Math.max(1, currentLocation.difficultyMultiplier * 0.8);
        const time = (1500 + Math.random() * 1500) / speedFactor;
        
        stateChangeRef.current = setTimeout(cycleState, time);
    };
    
    // Initialize damage ticker when fight starts
    lastDamageTick.current = Date.now();

    cycleState();
    return () => {
        if (stateChangeRef.current) clearTimeout(stateChangeRef.current);
    };
  }, [status, currentLocation]); // Added currentLocation dependency for difficulty updates

  // End Game Handling
  useEffect(() => {
    const timer = setTimeout(() => {
        if (status === 'CAUGHT' && activeFish) {
            // Add rewards
            setStats(prev => ({
                ...prev,
                xp: prev.xp + activeFish.xpReward,
                inventory: [...prev.inventory, { ...activeFish, caughtAt: Date.now() }]
            }));
            setPlayerAction(null);
        } else if (status === 'LOST') {
            setPlayerAction(null);
        }
    }, 0);
    return () => clearTimeout(timer);
  }, [status, activeFish]);

  // Auto Play Bot Logic (Moved here to access functions)
  useEffect(() => {
    if (!autoPlay) return;

    let timer: NodeJS.Timeout;

    if (status === 'IDLE') {
        // Auto Cast if possible
        if (stats.inventory.length < stats.inventoryCapacity && canTravelTo(currentLocation)) {
            timer = setTimeout(castLine, 1000);
        }
    } else if (status === 'HOOKED') {
        // Auto Hook
        timer = setTimeout(hookFish, 500);
    } else if (status === 'CAUGHT' || status === 'LOST') {
        // Auto Reset
        timer = setTimeout(() => setStatus('IDLE'), 1500);
    } else if (status === 'FIGHTING') {
         // Auto Fight: React to state changes
         let targetAction: typeof playerAction = null;
         if (fishState === 'LEFT') targetAction = 'LEFT';
         if (fishState === 'RIGHT') targetAction = 'RIGHT';
         if (fishState === 'JUMP') targetAction = 'REEL';
         if (fishState === 'DIVE') targetAction = 'SLACK';
         
         timer = setTimeout(() => setPlayerAction(targetAction), 0);
    }

    return () => clearTimeout(timer);
  }, [status, fishState, autoPlay, stats.inventory.length, stats.inventoryCapacity, currentLocation, canTravelTo, castLine, hookFish]); // Added callback dependencies

  const handleContinueFishing = () => {
      if (stats.inventory.length < stats.inventoryCapacity) {
          castLine();
      } else {
          setStatus('IDLE');
      }
  };

  const sellFish = () => {
    const totalValue = stats.inventory.reduce((acc, f) => acc + f.coinValue, 0);
    setStats(prev => ({
        ...prev,
        coins: prev.coins + totalValue,
        inventory: []
    }));
  };
  
  const buyRod = (rod: Rod) => {
      if (stats.unlockedRodIds.includes(rod.id)) {
          setCurrentRod(rod);
          return;
      }
      if (stats.coins >= rod.price && stats.level >= rod.reqLevel) {
          setStats(prev => ({ 
              ...prev, 
              coins: prev.coins - rod.price,
              unlockedRodIds: [...prev.unlockedRodIds, rod.id]
          }));
          setCurrentRod(rod);
      }
  };
  
  const buyBoat = (boat: Boat) => {
      if (stats.unlockedBoatIds.includes(boat.id)) {
          setCurrentBoat(boat);
          setStats(prev => ({ ...prev, inventoryCapacity: boat.capacity }));
          return;
      }
      if (stats.coins >= boat.price && stats.level >= boat.reqLevel) {
          setStats(prev => ({ 
              ...prev, 
              coins: prev.coins - boat.price, 
              inventoryCapacity: boat.capacity,
              unlockedBoatIds: [...prev.unlockedBoatIds, boat.id]
          }));
          setCurrentBoat(boat);
      }
  };

  const buyBait = (bait: Bait) => {
    if (stats.unlockedBaitIds.includes(bait.id)) {
        setCurrentBait(bait);
        return;
    }
    if (stats.coins >= bait.price && stats.level >= bait.reqLevel) {
        setStats(prev => ({ 
            ...prev, 
            coins: prev.coins - bait.price,
            unlockedBaitIds: [...prev.unlockedBaitIds, bait.id]
        }));
        setCurrentBait(bait);
    }
  };

  // Level Up Check
  useEffect(() => {
      if (stats.xp >= stats.xpToNextLevel) {
          setTimeout(() => {
              setStats(prev => ({
                  ...prev,
                  level: prev.level + 1,
                  xp: prev.xp - prev.xpToNextLevel,
                  xpToNextLevel: Math.floor(prev.xpToNextLevel * 1.5)
              }));
          }, 0);
      }
  }, [stats.xp, stats.xpToNextLevel]);


  // --- Render ---
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-900 text-white p-4 font-sans">
        {/* Header UI */}
        <div className="fixed top-0 left-0 w-full bg-sky-950 p-4 flex justify-between items-center shadow-lg z-10">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="font-bold text-xl text-yellow-400">Lv. {stats.level}</span>
                    <span className="text-xs text-sky-300">XP: {Math.floor(stats.xp)} / {stats.xpToNextLevel}</span>
                    <div className="w-24 h-2 bg-sky-800 rounded-full mt-1">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(100, (stats.xp / stats.xpToNextLevel) * 100)}%` }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-yellow-300 font-mono">
                    <DollarSign size={16} />
                    <span>{stats.coins}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Dev Menu Toggle */}
               <div className="relative">
                   <button 
                       onClick={() => setShowDevMenu(!showDevMenu)}
                       className={`p-2 rounded-lg transition ${autoPlay ? 'bg-purple-600 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
                       title="Dev Menu"
                   >
                       <Bot size={20} className={autoPlay ? 'text-white' : 'text-slate-400'} />
                   </button>
                   {showDevMenu && (
                       <div className="absolute top-12 right-0 bg-slate-800 border border-slate-600 p-4 rounded-xl shadow-xl z-50 w-48">
                           <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                               <Settings size={14} /> Dev Tools
                           </h4>
                           <div className="flex items-center justify-between">
                               <span className="text-xs text-white">Auto Play Bot</span>
                               <button 
                                   onClick={() => setAutoPlay(!autoPlay)} 
                                   className={`w-10 h-5 rounded-full relative transition-colors ${autoPlay ? 'bg-green-500' : 'bg-slate-600'}`}
                               >
                                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoPlay ? 'left-6' : 'left-1'}`}></div>
                               </button>
                           </div>
                           <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                               Perfectly catches fish automatically. Disable to play manually.
                           </p>
                       </div>
                   )}
               </div>

               <button onClick={() => setStatus(status === 'SHOP' ? 'IDLE' : 'SHOP')} className="p-2 px-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition flex items-center gap-2">
                   <ShoppingBag size={20} />
                   <span className="font-bold text-sm">Shop</span>
               </button>
               <div className="relative group">
                   <div className="p-2 bg-amber-700 rounded-lg flex items-center gap-2 cursor-pointer">
                       <Backpack size={20} />
                       <span>{stats.inventory.length}/{stats.inventoryCapacity}</span>
                   </div>
                   {/* Inventory Tooltip/Popout could go here */}
               </div>
            </div>
        </div>

        {/* Main Game Area */}
        <div className={`mt-20 w-full flex flex-col items-center gap-8 ${status === 'SHOP' ? 'max-w-4xl' : 'max-w-md'}`}>
            
            {status === 'SHOP' && (
                <div className="w-full bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Fishing Shop</h2>
                        <button onClick={() => setStatus('IDLE')} className="px-4 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg">Close</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {/* RODS COLUMN */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-base font-bold text-blue-300 mb-2 border-b border-slate-600 pb-1 flex items-center gap-2">
                                <Swords size={16} /> Rods
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {RODS.map(rod => (
                                    <div key={rod.id} className={`flex items-center justify-between p-2 rounded ${currentRod.id === rod.id ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-700/50 border border-transparent'}`}>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-base truncate">{rod.name}</div>
                                            <div className="text-xs text-slate-400">Dmg {rod.damage} • Lv {rod.reqLevel}</div>
                                        </div>
                                        {currentRod.id === rod.id ? (
                                            <span className="text-green-400 font-bold px-2 text-sm">Equipped</span>
                                        ) : stats.unlockedRodIds.includes(rod.id) ? (
                                            <button 
                                                onClick={() => buyRod(rod)}
                                                className="px-2 py-1 bg-blue-600 rounded font-bold text-xs hover:bg-blue-500 transition-colors"
                                            >
                                                Equip
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => buyRod(rod)}
                                                disabled={stats.coins < rod.price || stats.level < rod.reqLevel}
                                                className="px-2 py-1 bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-500 rounded font-bold text-xs hover:bg-yellow-500 transition-colors"
                                            >
                                                {rod.price}g
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BOATS COLUMN */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                            <h3 className="text-base font-bold text-blue-300 mb-2 border-b border-slate-600 pb-1 flex items-center gap-2">
                                <Anchor size={16} /> Boats
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {BOATS.map(boat => (
                                    <div key={boat.id} className={`flex items-center justify-between p-2 rounded ${currentBoat.id === boat.id ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-700/50 border border-transparent'}`}>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-base truncate">{boat.name}</div>
                                            <div className="text-xs text-slate-400">Cap {boat.capacity} • Lv {boat.reqLevel}</div>
                                        </div>
                                        {currentBoat.id === boat.id ? (
                                            <span className="text-green-400 font-bold px-2 text-sm">Equipped</span>
                                        ) : stats.unlockedBoatIds.includes(boat.id) ? (
                                            <button 
                                                onClick={() => buyBoat(boat)}
                                                className="px-2 py-1 bg-blue-600 rounded font-bold text-xs hover:bg-blue-500 transition-colors"
                                            >
                                                Equip
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => buyBoat(boat)}
                                                disabled={stats.coins < boat.price || stats.level < boat.reqLevel}
                                                className="px-2 py-1 bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-500 rounded font-bold text-xs hover:bg-yellow-500 transition-colors"
                                            >
                                                {boat.price}g
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BAIT COLUMN */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                             <h3 className="text-base font-bold text-blue-300 mb-2 border-b border-slate-600 pb-1 flex items-center gap-2">
                                <FishIcon size={16} /> Bait
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {BAIT_TYPES.map(bait => (
                                    <div key={bait.id} className={`flex items-center justify-between p-2 rounded ${currentBait.id === bait.id ? 'bg-green-900/20 border border-green-500/50' : 'bg-slate-700/50 border border-transparent'}`}>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-base truncate">{bait.name}</div>
                                            <div className="text-xs text-slate-400">{bait.description}</div>
                                        </div>
                                        {currentBait.id === bait.id ? (
                                            <span className="text-green-400 font-bold px-2 text-sm">Equipped</span>
                                        ) : stats.unlockedBaitIds.includes(bait.id) ? (
                                            <button 
                                                onClick={() => buyBait(bait)}
                                                className="px-2 py-1 bg-blue-600 rounded font-bold text-xs hover:bg-blue-500 transition-colors"
                                            >
                                                Equip
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => buyBait(bait)}
                                                disabled={stats.coins < bait.price || stats.level < bait.reqLevel}
                                                className="px-2 py-1 bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-500 rounded font-bold text-xs hover:bg-yellow-500 transition-colors"
                                            >
                                                {bait.price}g
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => sellFish()} disabled={stats.inventory.length === 0} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg">
                        Sell Catch ({stats.inventory.reduce((a, b) => a + b.coinValue, 0)} coins)
                    </button>
                </div>
            )}

            {status === 'IDLE' && (
                <div className="text-center w-full">
                    <div className="mb-6 relative animate-bounce">
                        {React.createElement(MENU_ICONS[menuIconIndex], { size: 64, className: "text-blue-300 mx-auto" })}
                    </div>

                    {/* Location Selector */}
                    <div className="mb-8 w-full bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                         <div className="flex items-center justify-between mb-2">
                             <button 
                                 onClick={() => {
                                     const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
                                     if (idx > 0) setCurrentLocation(LOCATIONS[idx - 1]);
                                 }}
                                 disabled={LOCATIONS.findIndex(l => l.id === currentLocation.id) === 0}
                                 className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                             >
                                 <ChevronLeft size={24} />
                             </button>
                             
                             <div className="flex flex-col items-center">
                                 <h3 className="text-xl font-bold text-yellow-400">{currentLocation.name}</h3>
                                 <span className="text-xs text-slate-400">Tier {currentLocation.tier} • {currentLocation.difficultyMultiplier}x Difficulty</span>
                             </div>

                             <button 
                                 onClick={() => {
                                     const idx = LOCATIONS.findIndex(l => l.id === currentLocation.id);
                                     if (idx < LOCATIONS.length - 1) setCurrentLocation(LOCATIONS[idx + 1]);
                                 }}
                                 disabled={LOCATIONS.findIndex(l => l.id === currentLocation.id) === LOCATIONS.length - 1}
                                 className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                             >
                                 <ChevronRight size={24} />
                             </button>
                         </div>
                         
                         <p className="text-sm text-slate-300 italic mb-1 min-h-[auto]">{currentLocation.description}</p>
                         
                         {!canTravelTo(currentLocation) && (
                             <div className="bg-red-900/50 border border-red-500/50 p-2 rounded text-xs text-red-200 mb-0">
                                 🔒 Requirements not met:
                                 {currentLocation.reqRodId && !RODS.find(r => r.id === currentLocation.reqRodId && RODS.indexOf(r) <= RODS.findIndex(x => x.id === currentRod.id)) && <span> Need better Rod.</span>}
                                 {currentLocation.reqBoatId && !BOATS.find(b => b.id === currentLocation.reqBoatId && BOATS.indexOf(b) <= BOATS.findIndex(x => x.id === currentBoat.id)) && <span> Need better Boat.</span>}
                             </div>
                         )}
                    </div>

                    <button 
                        onClick={castLine}
                        disabled={stats.inventory.length >= stats.inventoryCapacity || !canTravelTo(currentLocation)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-2xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                    >
                        {stats.inventory.length >= stats.inventoryCapacity ? 'Inventory Full' : !canTravelTo(currentLocation) ? 'Locked' : 'Cast Line'}
                    </button>
                    <div className="mt-4 text-slate-400 text-sm flex flex-col gap-1">
                        <p>Rod: {currentRod.name} (Dmg: {currentRod.damage})</p>
                        <p>Bait: {currentBait.name} ({currentBait.description})</p>
                    </div>
                </div>
            )}

            {status === 'CASTING' && (
                <div className="flex flex-col items-center">
                    <div className="animate-pulse text-2xl font-bold text-blue-200 mb-4">Waiting for bite...</div>
                    <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {status === 'HOOKED' && (
                <div className="flex flex-col items-center animate-ping-once">
                     <AlertCircle size={80} className="text-red-500 mb-4 animate-bounce" />
                     <button onClick={hookFish} className="px-10 py-5 bg-red-600 text-white font-extrabold text-3xl rounded-xl hover:bg-red-500 animate-pulse">
                         HOOK IT!
                     </button>
                </div>
            )}

            {status === 'FIGHTING' && activeFish && (
                <div className="w-full bg-slate-900/80 p-6 rounded-2xl border-2 border-blue-500 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-xl font-bold ${activeFish.color}`}>{activeFish.name}</span>
                        <span className="text-sm font-mono text-slate-400">HP: {Math.floor(fishHp)} / {activeFish.baseHp}</span>
                    </div>

                    {/* HP Bar */}
                    <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${(fishHp / activeFish.baseHp) * 100}%` }}></div>
                    </div>

                    {/* Status & Counter Area */}
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <div className="text-center">
                            <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Fish Action</p>
                            <div className="text-4xl font-black text-white bg-slate-800 px-6 py-3 rounded-lg border border-slate-600 min-w-[200px]">
                                {fishState}
                            </div>
                        </div>

                        {/* Tension Bar */}
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Line Tension</span>
                                <span>{Math.floor(lineTension)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-200 ${lineTension > 80 ? 'bg-red-600' : lineTension > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${lineTension}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-2 w-full">
                        <div className="grid grid-cols-3 gap-2">
                             <button 
                                onMouseDown={() => setPlayerAction('LEFT')} 
                                onMouseUp={() => setPlayerAction(null)}
                                 className={`p-4 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition relative ${playerAction === 'LEFT' ? 'bg-indigo-500 border-indigo-700' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}
                            >
                                COUNTER<br/>LEFT
                                {currentLocation.tier >= 2 && <span className="absolute top-1 right-2 text-xs text-slate-400 font-mono">A</span>}
                            </button>
                            <button 
                                onMouseDown={() => setPlayerAction('REEL')} 
                                onMouseUp={() => setPlayerAction(null)}
                                 className={`p-4 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition relative ${playerAction === 'REEL' ? 'bg-green-500 border-green-700' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}
                            >
                                COUNTER<br/>JUMP
                                {currentLocation.tier >= 2 && <span className="absolute top-1 right-2 text-xs text-slate-400 font-mono">W</span>}
                            </button>
                            <button 
                                onMouseDown={() => setPlayerAction('RIGHT')} 
                                onMouseUp={() => setPlayerAction(null)}
                                className={`p-4 rounded-xl font-bold border-b-4 active:border-b-0 active:translate-y-1 transition relative ${playerAction === 'RIGHT' ? 'bg-indigo-500 border-indigo-700' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}
                            >
                                COUNTER<br/>RIGHT
                                {currentLocation.tier >= 2 && <span className="absolute top-1 right-2 text-xs text-slate-400 font-mono">D</span>}
                            </button>
                        </div>

                        {currentLocation.tier >= 2 && (
                            <button 
                                onMouseDown={() => setPlayerAction('SLACK')} 
                                onMouseUp={() => setPlayerAction(null)}
                                className={`p-4 rounded-xl font-bold border-b-4 active:border-b-0 active:mt-1 transition relative ${playerAction === 'SLACK' ? 'bg-yellow-500 border-yellow-700' : 'bg-slate-700 border-slate-900 hover:bg-slate-600'}`}
                            >
                                GIVE SLACK (COUNTER DIVE)
                                <span className="absolute top-1 right-2 text-xs text-slate-400 font-mono">S</span>
                            </button>
                        )}
                        
                         {currentLocation.tier >= 3 && (
                            <button 
                                onClick={triggerBigReel}
                                className="p-4 rounded-xl font-bold border-b-4 border-red-900 bg-red-600 active:border-b-0 active:mt-3 transition text-white mt-2 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            >
                                ⚡ BIG REEL ⚡
                                <div className="text-[10px] font-normal opacity-80">+50% DMG | High Tension Risk!</div>
                            </button>
                        )}
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-4">Hold button to counter fish direction!</p>
                </div>
            )}

            {status === 'CAUGHT' && activeFish && (
                <div className="flex flex-col items-center bg-slate-800 p-8 rounded-xl border-4 border-yellow-500 shadow-2xl animate-fade-in">
                    <h2 className="text-3xl font-bold text-yellow-400 mb-2">CAUGHT!</h2>
                    <FishIcon size={64} className={activeFish.color} />
                    <p className="text-2xl mt-4 text-white font-bold">{activeFish.name}</p>
                    <div className="flex gap-4 mt-4">
                        <span className="bg-slate-700 px-3 py-1 rounded text-yellow-300">+{activeFish.coinValue} coins</span>
                        <span className="bg-slate-700 px-3 py-1 rounded text-blue-300">+{activeFish.xpReward} XP</span>
                    </div>
                    <button onClick={handleContinueFishing} className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">
                        Continue Fishing
                    </button>
                    <button onClick={() => setStatus('IDLE')} className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-sm text-slate-300">
                        Back to Menu
                    </button>
                </div>
            )}

            {status === 'LOST' && (
                <div className="flex flex-col items-center bg-slate-800 p-8 rounded-xl border-4 border-red-900 shadow-2xl">
                    <h2 className="text-3xl font-bold text-red-500 mb-2">ESCAPED!</h2>
                    <p className="text-slate-400 text-center mb-6">The line snapped. Try upgrading your rod or reacting faster.</p>
                    <button onClick={handleContinueFishing} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-bold">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}
