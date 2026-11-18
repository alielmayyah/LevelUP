import type { TFunction } from 'i18next';

import { formatNumber, formatPercent, formatSigned, numberLocale } from '../../i18n/format';
import type { MedalCategory, MedalDefinition } from './types';

const UNIT_KEY = { kg: 'kg', months: 'months' } as const;

/** Measurements appear beside the artwork, never on it. */
export function medalValue(t: TFunction, category: MedalCategory, unit: MedalDefinition['unit'], n: number): string {
  if (unit === 'percent') return formatPercent(n);
  if (category === 'muscle') return formatSigned(n, t('units.kg'));
  return `${formatNumber(n)} ${t(`units.${UNIT_KEY[unit]}`)}`;
}

export function medalTarget(t: TFunction, medal: MedalDefinition): string {
  if (medal.measurementType === 'BMI_MAINTENANCE' && medal.threshold === 0) return t('medals.enterBmi');
  if (medal.unit === 'percent') return t('medals.below', { value: formatPercent(medal.threshold) });
  return medalValue(t, medal.category, medal.unit, medal.threshold);
}

export const medalTitle = (t: TFunction, medal: MedalDefinition): string =>
  t(`medals.medal.${medal.id}.title`, {
    defaultValue: t('medals.genericTitle', {
      category: t(`medals.category.${medal.category}`),
      rarity: t(`medals.rarity.${medal.rarity}`),
    }),
  });

export const formatMedalDate = (iso: string): string =>
  new Intl.DateTimeFormat(numberLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
