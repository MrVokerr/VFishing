import { z } from 'zod';
import { INITIAL_STATS, PlayerStats } from './gameTypes';
import { applyBoatCapacity } from './inventoryUtils';
import { clampBaitCounts } from './baitUtils';
import { BOATS, RODS, BAIT_TYPES, LOCATIONS } from './data';

const CaughtFishSchema = z.object({
  id: z.string(),
  name: z.string(),
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Legendary']),
  baseHp: z.number(),
  xpReward: z.number(),
  coinValue: z.number(),
  difficulty: z.number(),
  color: z.string(),
  minLocationTier: z.number(),
  tags: z.array(z.string()).optional(),
  caughtAt: z.number(),
  instanceId: z.string(),
});

export const PlayerStatsSchema = z.object({
  level: z.number().int().min(1),
  xp: z.number().min(0),
  xpToNextLevel: z.number().positive(),
  coins: z.number().min(0),
  inventory: z.array(CaughtFishSchema),
  inventoryCapacity: z.number().int().positive(),
  baitCounts: z.record(z.string(), z.number().int().min(0).max(999)),
  unlockedRodIds: z.array(z.string()),
  unlockedBoatIds: z.array(z.string()),
  unlockedBaitIds: z.array(z.string()),
});

export const PersistedSaveSchema = z.object({
  stats: PlayerStatsSchema,
  currentRodId: z.string(),
  currentBoatId: z.string(),
  currentBaitId: z.string(),
  currentLocationId: z.string(),
});

export type PersistedSave = z.infer<typeof PersistedSaveSchema>;

export function migrateStats(raw: Partial<PlayerStats>, boatCapacity?: number): PlayerStats {
  const base = { ...INITIAL_STATS, ...raw };
  if (!base.baitCounts) base.baitCounts = { bt1: 99 };
  if (boatCapacity) {
    base.inventoryCapacity = boatCapacity;
  } else if (!base.inventoryCapacity) {
    base.inventoryCapacity = INITIAL_STATS.inventoryCapacity;
  }
  base.inventory = (base.inventory ?? []).map(f => ({
    ...f,
    instanceId: f.instanceId ?? `${f.id}_${f.caughtAt ?? Date.now()}`,
  }));
  base.baitCounts = clampBaitCounts(base.baitCounts ?? { bt1: 99 });
  return base;
}

export type LoadSaveResult =
  | { ok: true; save: PersistedSave; stats: PlayerStats }
  | { ok: false; reason: 'parse' | 'validation' };

export function loadSave(raw: string): LoadSaveResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'parse' };
  }

  const partial = parsed as Partial<PersistedSave> & { stats?: Partial<PlayerStats> };
  let loadedStats = migrateStats(partial.stats ?? {});

  if (partial.currentBoatId) {
    const boat = BOATS.find(b => b.id === partial.currentBoatId);
    if (boat) loadedStats = applyBoatCapacity(loadedStats, boat.capacity);
  }

  const candidate = {
    stats: loadedStats,
    currentRodId: partial.currentRodId ?? RODS[0].id,
    currentBoatId: partial.currentBoatId ?? BOATS[0].id,
    currentBaitId: partial.currentBaitId ?? BAIT_TYPES[0].id,
    currentLocationId: partial.currentLocationId ?? LOCATIONS[0].id,
  };

  const result = PersistedSaveSchema.safeParse(candidate);
  if (!result.success) return { ok: false, reason: 'validation' };

  return { ok: true, save: result.data, stats: result.data.stats };
}
