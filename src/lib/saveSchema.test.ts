import { describe, it, expect } from 'vitest';
import { loadSave, migrateStats } from './saveSchema';
import { INITIAL_STATS } from './gameTypes';

describe('saveSchema', () => {
  it('loadSave rejects invalid json', () => {
    expect(loadSave('not json')).toEqual({ ok: false, reason: 'parse' });
  });

  it('loadSave accepts valid save', () => {
    const raw = JSON.stringify({
      stats: INITIAL_STATS,
      currentRodId: 'r1',
      currentBoatId: 'b1',
      currentBaitId: 'bt1',
      currentLocationId: 'loc1',
    });
    const result = loadSave(raw);
    expect(result.ok).toBe(true);
  });

  it('migrateStats fills defaults', () => {
    const migrated = migrateStats({ level: 2, coins: 50 });
    expect(migrated.level).toBe(2);
    expect(migrated.baitCounts.bt1).toBeDefined();
  });
});
