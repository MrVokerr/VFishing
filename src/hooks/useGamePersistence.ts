'use client';

import { useEffect, useState } from 'react';
import { PlayerStats, Rod, Boat, Bait, Location } from '@/lib/gameTypes';
import { PersistedSave } from '@/lib/saveSchema';
import { readPersistedGame } from '@/lib/persistedGameLoad';

const SAVE_KEY = 'vfishing_save_v3';

export function useGamePersistence() {
  const [initial] = useState(readPersistedGame);
  const [stats, setStats] = useState<PlayerStats>(initial.stats);
  const [currentRod, setCurrentRod] = useState<Rod>(initial.currentRod);
  const [currentBoat, setCurrentBoat] = useState<Boat>(initial.currentBoat);
  const [currentBait, setCurrentBait] = useState<Bait>(initial.currentBait);
  const [currentLocation, setCurrentLocation] = useState<Location>(initial.currentLocation);
  const [saveCorrupted, setSaveCorrupted] = useState(initial.saveCorrupted);

  useEffect(() => {
    const saveData: PersistedSave = {
      stats,
      currentRodId: currentRod.id,
      currentBoatId: currentBoat.id,
      currentBaitId: currentBait.id,
      currentLocationId: currentLocation.id,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game', e);
    }
  }, [stats, currentRod, currentBoat, currentBait, currentLocation]);

  return {
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
    isLoaded: true,
    saveCorrupted,
    dismissSaveCorrupted: () => setSaveCorrupted(false),
  };
}
