import bodyArt from './body-composition.webp';
import enduranceArt from './endurance.webp';
import strengthArt from './strength.webp';
import { MEDAL_RARITIES, type MedalCategory, type MedalRarity } from './types';

type Sheet = {
  src: string;
  width: number;
  height: number;
  columns: readonly number[];
  rows: readonly number[];
};

// Coordinates use the source sheets' pixel grids. The WebP exports keep their proportions.
const strength: Sheet = {
  src: strengthArt,
  width: 1536,
  height: 1024,
  columns: [70, 351, 626, 891, 1182, 1478],
  rows: [0, 249, 503, 750, 1011],
};
const endurance: Sheet = {
  src: enduranceArt,
  width: 1754,
  height: 897,
  columns: [76, 405, 728, 1037, 1382, 1714],
  rows: [5, 303, 578, 867],
};
const body: Sheet = {
  src: bodyArt,
  width: 1536,
  height: 1024,
  columns: [29, 326, 622, 909, 1212, 1524],
  rows: [36, 334, 648, 970],
};

const ART: Record<MedalCategory, readonly [Sheet, number]> = {
  pushUps: [strength, 0],
  bench: [strength, 1],
  squat: [strength, 2],
  deadlift: [strength, 3],
  militaryPress: [endurance, 0],
  pullUps: [endurance, 1],
  plank: [endurance, 2],
  muscle: [body, 0],
  bodyFat: [body, 1],
  bmi: [body, 2],
};

export function medalSprite(category: MedalCategory, rarity: MedalRarity) {
  const [sheet, row] = ART[category];
  const column = MEDAL_RARITIES.indexOf(rarity);
  const x = sheet.columns[column];
  const y = sheet.rows[row];
  return { sheet, crop: [x, y, sheet.columns[column + 1] - x, sheet.rows[row + 1] - y] };
}
