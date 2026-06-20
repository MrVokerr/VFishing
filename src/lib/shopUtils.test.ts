import { describe, it, expect } from 'vitest';
import { canAffordPurchase, getPurchaseBlockReason } from './shopUtils';

describe('shopUtils', () => {
  it('canAffordPurchase when level and coins are sufficient', () => {
    expect(canAffordPurchase(1500, 10, 1000, 10)).toBe(true);
  });

  it('blocks purchase when level is too low despite enough coins', () => {
    expect(canAffordPurchase(1500, 8, 1000, 10)).toBe(false);
    expect(getPurchaseBlockReason(1500, 8, 1000, 10)).toBe('Lv 10 required');
  });

  it('blocks purchase when coins are too low', () => {
    expect(canAffordPurchase(500, 10, 1000, 10)).toBe(false);
    expect(getPurchaseBlockReason(500, 10, 1000, 10)).toBe('Need $1,000');
  });
});
