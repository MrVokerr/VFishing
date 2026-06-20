'use client';

import { useEffect } from 'react';
import { GameStatus, FightAbilityId } from '@/lib/gameTypes';

interface UseGameInputOptions {
  status: GameStatus;
  locationTier: number;
  qteActive: boolean;
  onCastLine: () => void;
  onHookFish: () => void;
  onSetPlayerAction: (action: 'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null | ((prev: 'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null) => 'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null)) => void;
  onBigReel: () => void;
  onActivateAbility: (id: FightAbilityId) => void;
  onPrevLocation: () => void;
  onNextLocation: () => void;
}

function fightKeyToAction(key: string, tier: number): 'LEFT' | 'RIGHT' | 'REEL' | 'SLACK' | null {
  switch (key) {
    case 'a':
    case 'arrowleft':
      return 'LEFT';
    case 'd':
    case 'arrowright':
      return 'RIGHT';
    case 'w':
    case 'arrowup':
      return 'REEL';
    case 's':
    case 'arrowdown':
      return tier >= 2 ? 'SLACK' : null;
    default:
      return null;
  }
}

export function useGameInput({
  status,
  locationTier,
  qteActive,
  onCastLine,
  onHookFish,
  onSetPlayerAction,
  onBigReel,
  onActivateAbility,
  onPrevLocation,
  onNextLocation,
}: UseGameInputOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (status === 'HOOKED') {
          onHookFish();
          return;
        }
        if (status === 'FIGHTING' && locationTier >= 3) {
          onBigReel();
          return;
        }
      }

      if (status === 'IDLE') {
        if (key === 'a' || key === 'arrowleft') onPrevLocation();
        else if (key === 'd' || key === 'arrowright') onNextLocation();
        else if (key === 'w' || key === 's') onCastLine();
      } else if (status === 'HOOKED') {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
          onHookFish();
        }
      } else if (status === 'FIGHTING') {
        const action = fightKeyToAction(key, locationTier);
        if (action) onSetPlayerAction(action);
        else if (key === '1') onActivateAbility('pumpReel');
        else if (key === '2') onActivateAbility('featherDrag');
        else if (key === '3') onActivateAbility('netAssist');
        else if (key === '4') onActivateAbility('harpoons');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (status !== 'FIGHTING' || qteActive) return;
      const key = e.key.toLowerCase();
      const action = fightKeyToAction(key, locationTier);
      if (action) {
        onSetPlayerAction(prev => (prev === action ? null : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    status,
    locationTier,
    qteActive,
    onCastLine,
    onHookFish,
    onSetPlayerAction,
    onBigReel,
    onActivateAbility,
    onPrevLocation,
    onNextLocation,
  ]);
}
