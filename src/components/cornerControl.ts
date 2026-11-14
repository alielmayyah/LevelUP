/**
 * Look of the language and sound buttons. Both sit together in the top
 * inline-end corner of the full-bleed screens (splash and login), over the dusk backdrop.
 */
export const CORNER_BUTTON = [
  'inline-grid size-11 cursor-pointer place-items-center rounded-lg p-0 text-splash-text',
  'border border-[color-mix(in_srgb,var(--ion-color-secondary)_55%,var(--lu-splash-bg))]',
  'bg-[color-mix(in_srgb,var(--lu-splash-bg)_80%,var(--ion-color-primary))]',
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-splash-text',
].join(' ');

/** The corner that holds them, clear of the notch and rounded corners. */
export const CORNER_CONTROLS =
  'absolute end-[calc(12px+max(var(--ion-safe-area-left,0px),var(--ion-safe-area-right,0px)))] top-[calc(10px+var(--ion-safe-area-top,0px))] z-2 flex gap-2';

/** The opposite corner, for a back button: top inline-start, clear of the notch. */
export const CORNER_START =
  'absolute start-[calc(12px+max(var(--ion-safe-area-left,0px),var(--ion-safe-area-right,0px)))] top-[calc(10px+var(--ion-safe-area-top,0px))] z-2 flex gap-2';
