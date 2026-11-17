/**
 * New goal hands a "goal set" note to the Goals page it goes back to. Going
 * back can't carry router state, so a one-shot flag does it: New goal sets it,
 * Goals takes it (and clears it) when it shows.
 */
let pending = false;

export const markGoalCreated = (): void => {
  pending = true;
};

/** Whether a goal was just created, without clearing it. */
export const goalJustCreated = (): boolean => pending;

/** True once after a goal was created, then false until the next one. */
export const takeGoalCreated = (): boolean => {
  const was = pending;
  pending = false;
  return was;
};
