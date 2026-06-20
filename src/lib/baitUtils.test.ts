import { describe, it, expect } from 'vitest';
import { MAX_BAIT_QUANTITY, addBaitQuantity, baitRestockAmount, clampBaitQuantity } from './baitUtils';

describe('baitUtils', () => {
  it('clamps bait at 999', () => {
    expect(clampBaitQuantity(1000)).toBe(999);
    expect(addBaitQuantity(998, 5)).toBe(999);
  });

  it('restock adds up to 5 below cap', () => {
    expect(baitRestockAmount(990)).toBe(5);
    expect(baitRestockAmount(998)).toBe(1);
    expect(baitRestockAmount(999)).toBe(0);
  });

  it('exports max bait cap constant', () => {
    expect(MAX_BAIT_QUANTITY).toBe(999);
  });
});
