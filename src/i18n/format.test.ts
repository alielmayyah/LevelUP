import { afterEach, describe, expect, it } from 'vitest';

import { formatNumber, formatSigned } from './format';
import { setLanguage } from './index';

const LRI = '⁦';
const PDI = '⁩';

describe('formatSigned', () => {
  afterEach(async () => {
    await setLanguage('en');
  });

  it('formats signed values with a true minus and isolates', () => {
    expect(formatSigned(0.8, 'kg')).toBe(`${LRI}+0.8 kg${PDI}`);
    expect(formatSigned(-1.2, '%')).toBe(`${LRI}−1.2%${PDI}`);
    expect(formatSigned(null)).toBe('—');
  });

  it('never prints NaN or Infinity', () => {
    expect(formatSigned(Number.NaN, 'kg')).toBe('—');
    expect(formatSigned(Number.POSITIVE_INFINITY)).toBe('—');
    expect(formatSigned(undefined)).toBe('—');
  });

  it('zero has no sign', () => {
    expect(formatSigned(0, 'kg')).toBe(`${LRI}0 kg${PDI}`);
    expect(formatSigned(-0.04, 'kg')).toBe(`${LRI}0 kg${PDI}`);
  });

  it('integers stay integers, and digits can be fixed', () => {
    expect(formatSigned(3)).toBe(`${LRI}+3${PDI}`);
    expect(formatSigned(3, 'kg', { digits: 1 })).toBe(`${LRI}+3.0 kg${PDI}`);
  });

  it('keeps Latin digits and the same order in Arabic', async () => {
    await setLanguage('ar');
    expect(formatSigned(0.8, 'kg')).toBe(`${LRI}+0.8 kg${PDI}`);
    expect(formatSigned(-1.2, '%')).toBe(`${LRI}−1.2%${PDI}`);
    expect(formatNumber(1234.5, 1)).toMatch(/^[0-9.,]+$/);
  });
});

describe('formatNumber', () => {
  it('formats with fixed digits', () => {
    expect(formatNumber(72)).toBe('72');
    expect(formatNumber(3, 1)).toBe('3.0');
    expect(formatNumber(1234.56, 1)).toBe('1,234.6');
  });

  it('returns a dash for missing values', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
  });
});
