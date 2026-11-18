/*
 * How a member's body fat compares with people of the same sex and age.
 *
 * Percentile tables follow the body-fat norms published in ACSM's Guidelines
 * for Exercise Testing and Prescription (rounded). They describe a general
 * adult population, not this gym's members, so the app words the result as
 * "people your age", never as a gym ranking. Re-check the values against the
 * current edition before launch.
 */
import type { Sex } from '../api/types';

/** Percentiles in each row, leanest first: the 90th percentile has the least fat. */
const PERCENTILES = [90, 80, 70, 60, 50, 40, 30, 20, 10] as const;

type Band = '20' | '30' | '40' | '50' | '60';

const BODY_FAT: Record<Sex, Record<Band, readonly number[]>> = {
  MALE: {
    '20': [7.9, 10.5, 12.7, 14.8, 16.6, 18.6, 20.6, 23.1, 26.3],
    '30': [11.9, 14.5, 16.5, 18.2, 19.7, 21.3, 23.0, 24.9, 27.5],
    '40': [14.9, 17.4, 19.1, 20.6, 21.9, 23.4, 24.8, 26.6, 29.1],
    '50': [16.7, 19.1, 20.7, 22.1, 23.2, 24.6, 26.0, 27.6, 30.0],
    '60': [17.6, 19.7, 21.3, 22.6, 23.7, 25.2, 26.4, 28.4, 30.5],
  },
  FEMALE: {
    '20': [14.5, 17.1, 19.0, 20.6, 22.1, 23.7, 25.4, 27.7, 32.1],
    '30': [15.5, 18.0, 20.0, 21.6, 23.1, 24.9, 27.0, 29.3, 32.8],
    '40': [18.5, 21.3, 23.5, 24.9, 26.4, 28.1, 30.1, 32.1, 35.0],
    '50': [21.6, 25.0, 26.6, 28.5, 30.1, 31.6, 33.5, 35.6, 37.9],
    '60': [21.1, 25.1, 27.5, 29.3, 30.9, 32.5, 34.3, 36.6, 39.3],
  },
};

const band = (age: number): Band => (age < 30 ? '20' : age < 40 ? '30' : age < 50 ? '40' : age < 60 ? '50' : '60');

/**
 * The share of people of the same sex and age band with more body fat (0–100,
 * clamped to 1–99): 75 means "leaner than 75% of people your age". Null when a
 * value is missing.
 */
export function bodyFatPercentile(bodyFatPct: number, sex: Sex, age: number): number | null {
  if (!Number.isFinite(bodyFatPct) || !Number.isFinite(age)) return null;
  const row = BODY_FAT[sex][band(age)];
  const last = row.length - 1;
  let p: number;
  if (bodyFatPct <= row[0]) {
    // Leaner than the 90th: extend the first step's slope toward 99.
    const step = row[1] - row[0];
    p = PERCENTILES[0] + ((row[0] - bodyFatPct) / step) * 10;
  } else if (bodyFatPct >= row[last]) {
    const step = row[last] - row[last - 1];
    p = PERCENTILES[last] - ((bodyFatPct - row[last]) / step) * 10;
  } else {
    let i = 0;
    while (bodyFatPct > row[i + 1]) i++;
    p = PERCENTILES[i] - ((bodyFatPct - row[i]) / (row[i + 1] - row[i])) * 10;
  }
  return Math.round(Math.min(99, Math.max(1, p)));
}
