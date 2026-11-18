import type { Sex } from '../api/types';

/** Illustrated portrait textures share one canvas (scripts/build-avatar-portrait.mjs). */
export const PORTRAIT_SIZE = 418;
export const portraitLayerUrl = (id: string, sex: Sex): string =>
  `${import.meta.env.BASE_URL}avatar/cartoon-portrait/${sex === 'FEMALE' ? 'girl-' : ''}${id}.webp`;
export const GIRL_VIEW = '6 -9 406 406';
export const PORTRAIT_VIEW = '0 -5 418 418';
