/** Inside ±2% left/right counts as balanced (ui-standards → BodyFigure). */
export const BALANCED_GAP_PCT = 2;

/** |right − left| as a % of their mean. */
export const sideGap = (right: number, left: number): number => (Math.abs(right - left) / ((right + left) / 2)) * 100;
