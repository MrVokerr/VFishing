import { PlayerStats, INITIAL_STATS, Rod, Boat, Bait, Location } from './gameTypes';
import { RODS, BOATS, BAIT_TYPES, LOCATIONS } from './data';
import { applyBoatCapacity } from './inventoryUtils';
import { loadSave } from './saveSchema';

export interface PersistedGameLoad {
  stats: PlayerStats;
  currentRod: Rod;
  currentBoat: Boat;
  currentBait: Bait;
  currentLocation: Location;
  saveCorrupted: boolean;
}

const DEFAULT_LOAD: PersistedGameLoad = {
  stats: INITIAL_STATS,
  currentRod: RODS[0],
  currentBoat: BOATS[0],
  currentBait: BAIT_TYPES[0],
  currentLocation: LOCATIONS[0],
  saveCorrupted: false,
};

export function readPersistedGame(): PersistedGameLoad {
  if (typeof window === 'undefined') return DEFAULT_LOAD;

  const raw =
    localStorage.getItem('vfishing_save_v3') ??
    localStorage.getItem('vfishing_save_v2') ??
    localStorage.getItem('vfishing_save_v1');

  if (!raw) return DEFAULT_LOAD;

  const result = loadSave(raw);
  if (!result.ok) {
    return { ...DEFAULT_LOAD, saveCorrupted: true };
  }

  let loadedStats = result.stats;
  const parsed = result.save;
  let currentRod = RODS[0];
  let currentBoat = BOATS[0];
  let currentBait = BAIT_TYPES[0];
  let currentLocation = LOCATIONS[0];

  const rod = RODS.find(i => i.id === parsed.currentRodId);
  if (rod) {
    currentRod = rod;
    if (!loadedStats.unlockedRodIds.includes(rod.id)) {
      loadedStats = { ...loadedStats, unlockedRodIds: [...loadedStats.unlockedRodIds, rod.id] };
    }
  }

  const boat = BOATS.find(i => i.id === parsed.currentBoatId);
  if (boat) {
    currentBoat = boat;
    loadedStats = applyBoatCapacity(loadedStats, boat.capacity);
    if (!loadedStats.unlockedBoatIds.includes(boat.id)) {
      loadedStats = { ...loadedStats, unlockedBoatIds: [...loadedStats.unlockedBoatIds, boat.id] };
    }
  }

  const bait = BAIT_TYPES.find(i => i.id === parsed.currentBaitId);
  if (bait) {
    currentBait = bait;
    if (!loadedStats.unlockedBaitIds.includes(bait.id)) {
      loadedStats = { ...loadedStats, unlockedBaitIds: [...loadedStats.unlockedBaitIds, bait.id] };
    }
    if (loadedStats.baitCounts[bait.id] === undefined) {
      loadedStats = { ...loadedStats, baitCounts: { ...loadedStats.baitCounts, [bait.id]: bait.stackSize } };
    }
  }

  const loc = LOCATIONS.find(i => i.id === parsed.currentLocationId);
  if (loc) currentLocation = loc;

  return {
    stats: loadedStats,
    currentRod,
    currentBoat,
    currentBait,
    currentLocation,
    saveCorrupted: false,
  };
}
