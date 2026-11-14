/** Home grid: one column on phones; at md, FitScore on one side, rank and mission stacked beside it. */
export const HOME_GRID = 'grid gap-3.5 md:grid-cols-[1fr_1fr]';
/** A Home grid item that spans both columns at md. */
export const HOME_SPAN = 'md:col-span-full';
/** Three stat tiles; below 360 px two per row, the last one full width. */
export const TILES =
  'grid grid-cols-[1fr_1fr] gap-2.5 *:last:col-span-full min-[360px]:grid-cols-3 min-[360px]:*:last:col-auto';
