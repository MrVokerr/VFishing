'use client';

import { Anchor, Fish as FishIcon, Ship, Waves } from 'lucide-react';
import { FishingRodIcon } from './FishingRodIcon';

const MENU_ICONS = [FishingRodIcon, FishIcon, Anchor, Ship, Waves];

export function MenuIcon({
  index,
  size,
  className,
}: {
  index: number;
  size?: number;
  className?: string;
}) {
  const Icon = MENU_ICONS[index % MENU_ICONS.length];
  return <Icon size={size} className={className} />;
}
