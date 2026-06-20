import { Bait, Fish, Location } from './gameTypes';
import { FISH_TYPES } from './data';

export function selectRandomFish(
  location: Location,
  bait: Bait,
  availableFish?: Fish[]
): Fish {
  const pool = (availableFish ?? FISH_TYPES).filter(f => f.minLocationTier <= location.tier);

  const luckMultiplier = bait.catchRate;

  const weightedFish = pool.map(fish => {
    let weight = 100;
    switch (fish.rarity) {
      case 'Common':
        weight = 100;
        break;
      case 'Uncommon':
        weight = 50 * luckMultiplier;
        break;
      case 'Rare':
        weight = 20 * luckMultiplier;
        break;
      case 'Legendary':
        weight = 5 * luckMultiplier;
        break;
    }

    if (bait.preferredFishTags.length > 0 && fish.tags) {
      const tagMatch = fish.tags.some(t => bait.preferredFishTags.includes(t));
      if (tagMatch) weight *= 1.5;
    }

    return { fish, weight };
  });

  const totalWeight = weightedFish.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedFish = weightedFish[0].fish;

  for (const item of weightedFish) {
    if (random < item.weight) {
      selectedFish = item.fish;
      break;
    }
    random -= item.weight;
  }

  return selectedFish;
}

export function getCastDelayMs(): number {
  return 1500 + Math.random() * 2000;
}
