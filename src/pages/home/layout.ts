/**
 * Home grid: one column on phones. At md, FitScore fills the start column and
 * the wins and mission stack beside it; shortcuts run across the bottom.
 */
export const HOME_GRID = 'grid gap-3.5 md:grid-cols-[1fr_1fr] md:gap-4';
/** A Home grid item that spans both columns at md. */
export const HOME_SPAN = 'md:col-span-full';
/** Metric blocks two to a row; a third one runs full width under them. */
export const TILES = 'grid grid-cols-[1fr_1fr] gap-3 [&>:nth-child(3)]:col-span-full';
