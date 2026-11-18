import type { TFunction } from 'i18next';

import { formatNumber } from '../i18n/format';
import type { IconName } from '../components/Icon';
import type { Advice, AdviceLevel, AdviceMetric } from './advice';

/** Each plan item's icon (its metric) and the disc color for how urgent it is. */
export const ADVICE_ICON: Record<AdviceMetric, IconName> = {
  visceral: 'abdomen',
  fat: 'bodyFat',
  muscle: 'muscle',
  water: 'drop',
};
export const LEVEL_DISC: Record<AdviceLevel, string> = {
  act: 'lu-disc-act',
  watch: 'lu-disc-gold',
  keep: 'lu-disc-lime',
};

/** A plan item's title, reason and how-to, with its numbers formatted for the language. */
export function adviceText(t: TFunction, a: Advice): { title: string; why: string; how: string } {
  const kg = (n: number) => `${formatNumber(n, 1)} ${t('units.kg')}`;
  const pct = (n: number, digits = 1) => `${formatNumber(n, digits)}%`;
  const p = a.params;
  const values: Record<string, string> = {};
  if (p.level !== undefined) values.level = formatNumber(p.level);
  if (p.limit !== undefined) values.limit = formatNumber(p.limit);
  if (p.pct !== undefined) values.pct = pct(p.pct);
  if (p.max !== undefined) values.max = pct(p.max, 0);
  if (p.min !== undefined) values.min = a.metric === 'fat' ? pct(p.min, 0) : kg(p.min);
  if (p.kg !== undefined) values.kg = kg(p.kg);
  const base = `plan.item.${a.key}`;
  return { title: t(`${base}.title`), why: t(`${base}.why`, values), how: t(`${base}.do`) };
}
