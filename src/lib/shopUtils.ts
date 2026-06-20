import { formatMoney } from './formatMoney';

export function canAffordPurchase(coins: number, level: number, price: number, reqLevel: number): boolean {
  return level >= reqLevel && coins >= price;
}

export function getPurchaseBlockReason(
  coins: number,
  level: number,
  price: number,
  reqLevel: number
): string | null {
  if (level < reqLevel) return `Lv ${reqLevel} required`;
  if (coins < price) return `Need ${formatMoney(price)}`;
  return null;
}
