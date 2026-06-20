export const MAX_BAIT_QUANTITY = 999;

export function clampBaitQuantity(count: number): number {
  return Math.max(0, Math.min(MAX_BAIT_QUANTITY, count));
}

export function addBaitQuantity(current: number, delta: number): number {
  return clampBaitQuantity(current + delta);
}

export function baitRestockAmount(current: number, packSize = 5): number {
  if (current >= MAX_BAIT_QUANTITY) return 0;
  return Math.min(packSize, MAX_BAIT_QUANTITY - current);
}

export function clampBaitCounts(counts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(counts).map(([id, count]) => [id, clampBaitQuantity(count)]));
}
