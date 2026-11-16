/*
 * Pixel-art icons drawn on a 12×12 or 24×24 grid, to match the app's pixel style.
 * When drawn they are doubled with Scale2x up to a 96×96 grid (DETAIL), which
 * rounds diagonals and curves while keeping straight edges and line weights.
 * Each character is one pixel:
 *   X outline   O fill   Y highlight   H hot spot   C text color   . empty
 * Colors come from CSS variables on the icon or an ancestor:
 *   --px-line, --px-fill, --px-hi, --px-core
 * C pixels always take the text color (currentColor), so interface icons
 * (arrows, close, settings…) follow the button or label they sit in.
 */

/** Flips an icon left to right. */
import { DETAIL, detailed } from './scale2x';

const mirror = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''));
/** Flips an icon top to bottom. */
const flip = (rows: readonly string[]) => [...rows].reverse();
/** Swaps rows and columns, turning a right-pointing shape into a down-pointing one. */
const transpose = (rows: readonly string[]) => [...rows[0]].map((_, x) => rows.map((r) => r[x]).join(''));
/** Draws a diagonal slash over an icon, with a clear pixel beside it so the slash reads on top. */
const slashed = (rows: readonly string[]) => {
  // One pixel wide on the 12 grid, two on the 24 grid.
  const w = rows.length / 12;
  return rows.map((r, y) =>
    [...r].map((c, x) => (x - y >= 0 && x - y < w ? 'C' : x - y >= w && x - y < 2 * w ? '.' : c)).join(''),
  );
};

const CHEVRON_FORWARD = [
  '............',
  '...CC.......',
  '....CC......',
  '.....CC.....',
  '......CC....',
  '.......CC...',
  '.......CC...',
  '......CC....',
  '.....CC.....',
  '....CC......',
  '...CC.......',
  '............',
];

const ARROW_FORWARD = [
  '............',
  '............',
  '......CC....',
  '.......CC...',
  '........CC..',
  '.CCCCCCCCCC.',
  '.CCCCCCCCCC.',
  '........CC..',
  '.......CC...',
  '......CC....',
  '............',
  '............',
];

const BELL = [
  '............',
  '.....CC.....',
  '...CCCCCC...',
  '..C......C..',
  '..C......C..',
  '..C......C..',
  '..C......C..',
  '.C........C.',
  'C..........C',
  'CCCCCCCCCCCC',
  '.....CC.....',
  '............',
];

// Drawn on the 24×24 grid with 2-pixel strokes.
const EYE = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '......CCCCCCCCCCCC......',
  '....CCCCCCCCCCCCCCCC....',
  '...CCCC...CCCC...CCCC...',
  '.CCCC....CCCCCC....CCCC.',
  'CCC.....CCCCCCCC.....CCC',
  'CC......CCCCCCCC......CC',
  'CC......CCCCCCCC......CC',
  'CCC.....CCCCCCCC.....CCC',
  '.CCCC....CCCCCC....CCCC.',
  '...CCCC...CCCC...CCCC...',
  '....CCCCCCCCCCCCCCCC....',
  '......CCCCCCCCCCCC......',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

const TREND_UP = [
  '............',
  '............',
  '.......CCCC.',
  '.........CC.',
  '........C.C.',
  '...C...C..C.',
  '..C.C.C.....',
  '.C...C......',
  'C...........',
  '............',
  '............',
  '............',
];

const ICONS = {
  flame: [
    '.....X......',
    '....XOX.....',
    '....XOOX....',
    '...XOOOX....',
    '..XOOOOOX...',
    '..XOOYOOX...',
    '.XOOYYYOOX..',
    '.XOYYHYYOX..',
    '.XOYHHHYOX..',
    '..XOYHYOX...',
    '...XXXXX....',
    '............',
  ],
  // A flexed arm: fist up top right, forearm down to the elbow, bicep bulging on the upper arm.
  muscle: [
    '............',
    '.......XXX..',
    '......XOYOX.',
    '......XOOOX.',
    '.......XOOX.',
    '...XXX.XOOX.',
    '..XOYYXXOOX.',
    '.XOYYYOOOOX.',
    'XOOOOOOOOOX.',
    'XOOOOOOOOX..',
    '.XXXXXXXX...',
    '............',
  ],
  // A clean crescent: outline, fill, one highlight pixel, nothing stray.
  moon: [
    '............',
    '....XXXXX...',
    '...XOOOX....',
    '..XOOOX.....',
    '..XOOX......',
    '.XOYOX......',
    '.XOOOX......',
    '..XOOX......',
    '..XOOOX.....',
    '...XOOOX....',
    '....XXXXX...',
    '............',
  ],
  // A round sun with four short rays attached to it (no floating pixels).
  sun: [
    '............',
    '.....XX.....',
    '...XXXXXX...',
    '..XOOOOOOX..',
    '..XOYYOOOX..',
    'XXXOYYOOOXXX',
    'XXXOOOOOOXXX',
    '..XOOOOOOX..',
    '..XOOOOOOX..',
    '...XXXXXX...',
    '.....XX.....',
    '............',
  ],
  dumbbell: [
    '............',
    '............',
    '.XX......XX.',
    'XOOX....XOOX',
    'XOOXXXXXXOOX',
    'XOOXYYYYXOOX',
    'XOOXXXXXXOOX',
    'XOOX....XOOX',
    '.XX......XX.',
    '............',
    '............',
    '............',
  ],
  // A bathroom scale: body, dial window, needle.
  scale: [
    '............',
    '.XXXXXXXXXX.',
    'XOOOOOOOOOOX',
    'XOXXXXXXXXOX',
    'XOXYYHYYYXOX',
    'XOXXXXXXXXOX',
    'XOOOOOOOOOOX',
    'XOOOOOOOOOOX',
    'XOOOOOOOOOOX',
    'XOOOOOOOOOOX',
    '.XXXXXXXXXX.',
    '............',
  ],
  calendar: [
    '............',
    '..X.....X...',
    '.XXXXXXXXXX.',
    '.XOOOOOOOOX.',
    '.XXXXXXXXXX.',
    '.XYYYYYYYYX.',
    '.XYHYHYHYYX.',
    '.XYYYYYYYYX.',
    '.XYHYHYYYYX.',
    '.XYYYYYYYYX.',
    '.XXXXXXXXXX.',
    '............',
  ],
  trophy: [
    '............',
    '..XXXXXXXX..',
    'XXXOOOOYOXXX',
    'X.XOOOOYOX.X',
    'X.XOOOOOOX.X',
    '.XXOOOOOOXX.',
    '...XOOOOX...',
    '....XOOX....',
    '.....XX.....',
    '....XOOX....',
    '...XXXXXX...',
    '............',
  ],
  // Water: one drop with a shine down its left side.
  drop: [
    '.....XX.....',
    '....XOOX....',
    '....XOOX....',
    '...XOOOOX...',
    '...XOOOOX...',
    '..XOYOOOOX..',
    '..XOYOOOOX..',
    '.XOYOOOOOOX.',
    '.XOYOOOOOOX.',
    '.XOOOOOOOOX.',
    '..XOOOOOOX..',
    '...XXXXXX...',
  ],
  // Protein: a chicken drumstick, meat up top right (fill), bone down to the knuckle bottom left (core).
  drumstick: [
    '.....XXXX...',
    '....XOOOOX..',
    '...XOYYOOOX.',
    '...XOYOOOOX.',
    '...XOOOOOOX.',
    '...XOOOOOX..',
    '....XOOOX...',
    '....XHXX....',
    'XX.XHHX.....',
    'XHXHHX......',
    'XHHHX.......',
    '.XXX........',
  ],
  // Minerals: a cut gem, lit from the top left.
  gem: [
    '............',
    '...XXXXXX...',
    '..XYYOOOOX..',
    '.XYYOOOOOOX.',
    'XXXXXXXXXXXX',
    '.XOOYOOOOOX.',
    '..XOYOOOOX..',
    '...XOYOOX...',
    '....XOOX....',
    '.....XX.....',
    '............',
    '............',
  ],
  // Resting calories: a lightning bolt, the energy the body burns.
  bolt: [
    '.....XXXXX..',
    '....XOYOX...',
    '....XOOX....',
    '...XOOX.....',
    '..XOOXXXX...',
    '..XOOOOOOX..',
    '..XXXXOOX...',
    '.....XOX....',
    '....XOX.....',
    '...XOX......',
    '...XX.......',
    '............',
  ],
  // BMI: a ruler with tick marks (size for your height).
  ruler: [
    '............',
    '............',
    '............',
    'XXXXXXXXXXXX',
    'XOYYYYYYYYOX',
    'XOXOXOXOXOOX',
    'XOXOOOXOOOOX',
    'XOOOOOOOOOOX',
    'XXXXXXXXXXXX',
    '............',
    '............',
    '............',
  ],
  // Visceral fat: a heart (the organs this deep belly fat sits around). Two even lobes, a shine top-left, a clean point.
  heart: [
    '............',
    '.XXXX..XXXX.',
    'XOOOOXXOOOOX',
    'XOYYOOOOOOOX',
    'XOYOOOOOOOOX',
    'XOOOOOOOOOOX',
    '.XOOOOOOOOX.',
    '..XOOOOOOX..',
    '...XOOOOX...',
    '....XOOX....',
    '.....XX.....',
    '............',
  ],
  // Tab bar: Home.
  house: [
    '.....XX.....',
    '....XYYX....',
    '...XYOOOX...',
    '..XYOOOOOX..',
    '.XYOOOOOOOX.',
    'XXXOOOOOOXXX',
    '..XOOOOOOX..',
    '..XOOXXOOX..',
    '..XOXHHXOX..',
    '..XOXHHXOX..',
    '..XXXXXXXX..',
    '............',
  ],
  // Tab bar: Progress, bars climbing.
  chart: [
    '............',
    '.........XXX',
    '.........XYX',
    '......XXXXOX',
    '......XYXXOX',
    '...XXXXOXXOX',
    '...XYXXOXXOX',
    'XXXXOXXOXXOX',
    'XYXXOXXOXXOX',
    'XOXXOXXOXXOX',
    'XXXXXXXXXXXX',
    '............',
  ],
  // Tab bar: Goals, a pennant on a pole.
  flag: [
    '.XX.........',
    '.XXXXXXXX...',
    '.XXOOYOOOX..',
    '.XXOOOYOOOX.',
    '.XXOOOOOOX..',
    '.XXXXXXXXX..',
    '.XX.........',
    '.XX.........',
    '.XX.........',
    '.XX.........',
    'XXXX........',
    '............',
  ],
  // Tab bar: Profile, head and shoulders.
  person: [
    '....XXXX....',
    '...XOOOOX...',
    '...XOYOOX...',
    '...XOOOOX...',
    '....XXXX....',
    '..XXXXXXXX..',
    '.XOOOOOOOOX.',
    '.XOYOOOOOOX.',
    '.XOOOOOOOOX.',
    '.XOOOOOOOOX.',
    '.XXXXXXXXXX.',
    '............',
  ],

  community: [
    '............',
    '..XXX..XXX..',
    '.XOOOXXOOOX.',
    '.XOYOXXOYOX.',
    '.XOOOXXOOOX.',
    '..XXX..XXX..',
    '.XXXXX.XXXX.',
    'XOYOOXXOYOOX',
    'XOOOOXXOOOOX',
    'XOOOOXXOOOOX',
    '.XXXXXXXXXX.',
    '............',
  ],

  /* ---------- Interface icons, drawn in the text color ---------- */

  chevronForward: CHEVRON_FORWARD,
  chevronBack: mirror(CHEVRON_FORWARD),
  chevronDown: transpose(CHEVRON_FORWARD),
  arrowForward: ARROW_FORWARD,
  arrowBack: mirror(ARROW_FORWARD),
  close: [
    '............',
    '.CC......CC.',
    '.CCC....CCC.',
    '..CCC..CCC..',
    '...CCCCCC...',
    '....CCCC....',
    '....CCCC....',
    '...CCCCCC...',
    '..CCC..CCC..',
    '.CCC....CCC.',
    '.CC......CC.',
    '............',
  ],
  add: [
    '............',
    '.....CC.....',
    '.....CC.....',
    '.....CC.....',
    '.....CC.....',
    '.CCCCCCCCCC.',
    '.CCCCCCCCCC.',
    '.....CC.....',
    '.....CC.....',
    '.....CC.....',
    '.....CC.....',
    '............',
  ],
  remove: [
    '............',
    '............',
    '............',
    '............',
    '............',
    '.CCCCCCCCCC.',
    '.CCCCCCCCCC.',
    '............',
    '............',
    '............',
    '............',
    '............',
  ],
  check: [
    '............',
    '............',
    '.........CC.',
    '........CCC.',
    '.......CCC..',
    '.CC...CCC...',
    '.CCC.CCC....',
    '..CCCCC.....',
    '...CCC......',
    '....C.......',
    '............',
    '............',
  ],
  checkDouble: [
    '............',
    '............',
    '............',
    '.......C...C',
    '......C...C.',
    '.....C...C..',
    'C...C...C...',
    '.C.C.C.C....',
    '..C...C.....',
    '............',
    '............',
    '............',
  ],
  checkCircle: [
    '....CCCC....',
    '..CC....CC..',
    '.C........C.',
    '.C........C.',
    'C.......C..C',
    'C......C...C',
    'C.C...C....C',
    'C..C.C.....C',
    '.C..C.....C.',
    '.C........C.',
    '..CC....CC..',
    '....CCCC....',
  ],
  info: [
    '....CCCC....',
    '..CC....CC..',
    '.C........C.',
    '.C...CC...C.',
    'C..........C',
    'C....CC....C',
    'C....CC....C',
    'C....CC....C',
    '.C...CC...C.',
    '.C........C.',
    '..CC....CC..',
    '....CCCC....',
  ],
  // 24×24 with 2-pixel strokes, so it stays clear at small sizes.
  settings: [
    '........................',
    '..........CCCC..........',
    '..........CCCC..........',
    '.....C....CCCC....C.....',
    '....CCC..CCCCCC..CCC....',
    '...CCCCCCCCCCCCCCCCCC...',
    '....CCCCCCCCCCCCCCCC....',
    '.....CCCCCCCCCCCCCC.....',
    '.....CCCCCC..CCCCCC.....',
    '....CCCCC......CCCCC....',
    '.CCCCCCCC......CCCCCCCC.',
    '.CCCCCCC........CCCCCCC.',
    '.CCCCCCC........CCCCCCC.',
    '.CCCCCCCC......CCCCCCCC.',
    '....CCCCC......CCCCC....',
    '.....CCCCCC..CCCCCC.....',
    '.....CCCCCCCCCCCCCC.....',
    '....CCCCCCCCCCCCCCCC....',
    '...CCCCCCCCCCCCCCCCCC...',
    '....CCC..CCCCCC..CCC....',
    '.....C....CCCC....C.....',
    '..........CCCC..........',
    '..........CCCC..........',
    '........................',
  ],
  bell: BELL,
  bellOff: slashed(BELL),
  logout: [
    '............',
    'CCCCC.......',
    'CC....CC....',
    'CC.....CC...',
    'CC......CC..',
    'CC.CCCCCCCCC',
    'CC.CCCCCCCCC',
    'CC......CC..',
    'CC.....CC...',
    'CC....CC....',
    'CCCCC.......',
    '............',
  ],
  // 24×24 with 2-pixel strokes, so it stays clear at small sizes.
  globe: [
    '........................',
    '.........CCCCCC.........',
    '......CCCCCCCCCCCC......',
    '.....CCCCCC..CCCCCC.....',
    '....CCC.CC....CC.CCC....',
    '...CCC..CC....CC..CCC...',
    '..CCC...CC....CC...CCC..',
    '..CC...CC......CC...CC..',
    '..CC...CC......CC...CC..',
    '.CC....CC......CC....CC.',
    '.CC....CC......CC....CC.',
    '.CCCCCCCCCCCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCCCCCCCCCCC.',
    '.CC....CC......CC....CC.',
    '.CC....CC......CC....CC.',
    '..CC...CC......CC...CC..',
    '..CC...CC......CC...CC..',
    '..CCC...CC....CC...CCC..',
    '...CCC..CC....CC..CCC...',
    '....CCC.CC....CC.CCC....',
    '.....CCCCCC..CCCCCC.....',
    '......CCCCCCCCCCCC......',
    '.........CCCCCC.........',
    '........................',
  ],
  // 24×24 with 2-pixel strokes, so it stays clear at small sizes.
  palette: [
    '........................',
    '.........CCCCCC.........',
    '......CCCCCCCCCCCC......',
    '.....CCCC......CCCC.....',
    '....CCC...CC.....CCC....',
    '...CCC...CCCC.....CCC...',
    '..CCC....CCCC..CC..CCC..',
    '..CC......CC..CCCC..CC..',
    '..CC..CC......CCCC..CC..',
    '.CC..CCCC......CC....CC.',
    '.CC..CCCC............CC.',
    '.CC...CC.......CCC...CC.',
    '.CC..........CCCCCCC.CC.',
    '.CC.........CCC...CCCCC.',
    '.CC...CCCC..CC.....CCCC.',
    '..CC..CCCC.CC.......CC..',
    '..CC..CCCC.CC.......CC..',
    '..CCC......CC.......CC..',
    '...CCC......CC.....CC...',
    '....CCC.....CCC...CC....',
    '.....CCCC....CCCCCC.....',
    '......CCCCCCCCCCCC......',
    '.........CCCCCC.........',
    '........................',
  ],
  // 24×24 with 2-pixel strokes, so it stays clear at small sizes.
  volume: [
    '........................',
    '........................',
    '...........C............',
    '..........CC.....CC.....',
    '.........CCC.....CCC....',
    '........CCCC......CCC...',
    '.......CCCCC..C....CCC..',
    '......CCCCCC..CCC...CC..',
    '.CCCCCCCCCCC...CC...CC..',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC....CC...CC.',
    '.CCCCCCCCCCC...CC...CC..',
    '......CCCCCC..CCC...CC..',
    '.......CCCCC..C....CCC..',
    '........CCCC......CCC...',
    '.........CCC.....CCC....',
    '..........CC.....CC.....',
    '...........C............',
    '........................',
    '........................',
  ],
  mute: [
    '............',
    '.....C......',
    '....CC......',
    '...C.C......',
    'CCC..C.C..C.',
    'C....C..CC..',
    'C....C..CC..',
    'CCC..C.C..C.',
    '...C.C......',
    '....CC......',
    '.....C......',
    '............',
  ],
  eye: EYE,
  eyeOff: slashed(EYE),
  list: [
    '............',
    'CC.CCCCCCCCC',
    'CC.CCCCCCCCC',
    '............',
    '............',
    'CC.CCCCCCCCC',
    'CC.CCCCCCCCC',
    '............',
    '............',
    'CC.CCCCCCCCC',
    'CC.CCCCCCCCC',
    '............',
  ],
  // Funnel: narrowing a list down.
  filter: [
    '............',
    'CCCCCCCCCCCC',
    'CCCCCCCCCCCC',
    '.CCCCCCCCCC.',
    '..CCCCCCCC..',
    '...CCCCCC...',
    '....CCCC....',
    '....CCCC....',
    '....CCCC....',
    '....CCC.....',
    '....CC......',
    '............',
  ],
  dice: [
    '.CCCCCCCCCC.',
    'C..........C',
    'C.CC....CC.C',
    'C.CC....CC.C',
    'C..........C',
    'C....CC....C',
    'C....CC....C',
    'C..........C',
    'C.CC....CC.C',
    'C.CC....CC.C',
    'C..........C',
    '.CCCCCCCCCC.',
  ],
  refresh: [
    '....CCCC....',
    '..CC.....C..',
    '.C......CCC.',
    '.C.....CCCCC',
    'C..........C',
    'C..........C',
    'C..........C',
    'C..........C',
    '.C........C.',
    '.C........C.',
    '..CC....CC..',
    '....CCCC....',
  ],
  shuffle: [
    '............',
    '.........C..',
    'CC.....CCCC.',
    '..C...C..C..',
    '...C.C......',
    '....C.......',
    '...C.C......',
    '..C...C..C..',
    'CC.....CCCC.',
    '.........C..',
    '............',
    '............',
  ],
  brush: [
    '..........CC',
    '.........CCC',
    '........CCC.',
    '.......CCC..',
    '......CCC...',
    '....CCCC....',
    '...CCCCC....',
    '..CCCCC.....',
    '..CCCC......',
    '.CCC........',
    'CC..........',
    '............',
  ],
  // Customize the character: a clothes hanger.
  hanger: [
    '.....CC.....',
    '....C..C....',
    '.......C....',
    '......C.....',
    '.....CC.....',
    '....C..C....',
    '...C....C...',
    '..C......C..',
    '.C........C.',
    'C..........C',
    'CCCCCCCCCCCC',
    '............',
  ],
  // 24×24 with 2-pixel strokes, so it stays clear at small sizes.
  podium: [
    '........................',
    '........................',
    '........CCCCCCCC........',
    '........CCCCCCCC........',
    '........CC....CC........',
    '........CC....CC........',
    '........CC....CC........',
    '........CC....CC........',
    'CCCCCCCCCC....CC........',
    'CCCCCCCCCC....CC........',
    'CC......CC....CC........',
    'CC......CC....CC........',
    'CC......CC....CCCCCCCCCC',
    'CC......CC....CCCCCCCCCC',
    'CC......CC....CC......CC',
    'CC......CC....CC......CC',
    'CC......CC....CC......CC',
    'CC......CC....CC......CC',
    'CC......CC....CC......CC',
    'CC......CC....CC......CC',
    'CCCCCCCCCCCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCCCCCCCCCCC',
    '........................',
    '........................',
  ],
  pulse: [
    '............',
    '............',
    '....C.......',
    '...C.C......',
    '...C.C......',
    '...C.C......',
    'CCC...C..CCC',
    '......C.C...',
    '.......C....',
    '............',
    '............',
    '............',
  ],
  trendUp: TREND_UP,
  trendDown: flip(TREND_UP),
  sparkles: [
    '....C....C..',
    '....C...CCC.',
    '...CCC...C..',
    '.CCCCCCC....',
    '...CCC......',
    '....C.......',
    '....C.......',
    '.........C..',
    '........CCC.',
    '.......CCCCC',
    '........CCC.',
    '.........C..',
  ],
  lock: [
    '...CCCCCC...',
    '..CC....CC..',
    '..C......C..',
    '..C......C..',
    '.CCCCCCCCCC.',
    '.C........C.',
    '.C...CC...C.',
    '.C...CC...C.',
    '.C...CC...C.',
    '.C........C.',
    '.CCCCCCCCCC.',
    '............',
  ],
  idCard: [
    '............',
    'CCCCCCCCCCCC',
    'C..........C',
    'C..CC......C',
    'C..CC.CCCC.C',
    'C..........C',
    'C.CCCC.CCC.C',
    'C.CCCC.....C',
    'C..........C',
    'CCCCCCCCCCCC',
    '............',
    '............',
  ],
  scan: [
    'CCCC....CCCC',
    'C..........C',
    'C..........C',
    'C..........C',
    '............',
    '............',
    '............',
    '............',
    'C..........C',
    'C..........C',
    'C..........C',
    'CCCC....CCCC',
  ],
  clock: [
    '....CCCC....',
    '..CC....CC..',
    '.C...C....C.',
    '.C...C....C.',
    'C....C.....C',
    'C....C.....C',
    'C....CCCC..C',
    'C..........C',
    '.C........C.',
    '.C........C.',
    '..CC....CC..',
    '....CCCC....',
  ],
  bulb: [
    '....CCCC....',
    '..CC....CC..',
    '.C........C.',
    '.C........C.',
    '.C........C.',
    '..C......C..',
    '...C....C...',
    '...CCCCCC...',
    '............',
    '...CCCCCC...',
    '....CCCC....',
    '............',
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

const LAYER: Record<string, string> = { X: 'px-line', O: 'px-fill', Y: 'px-hi', H: 'px-core', C: 'px-text' };

/**
 * Merges each row's runs of the same color into one rect, then stacks identical
 * runs from consecutive rows into one taller rect, so even a 96-grid icon is a
 * few dozen nodes.
 */
function rects(rows: readonly string[]) {
  const out: { x: number; y: number; w: number; h: number; cls: string }[] = [];
  /** Rects still open from the row above, by "x:w:color", so the next row can extend them. */
  let open = new Map<string, (typeof out)[number]>();
  rows.forEach((row, y) => {
    const next = new Map<string, (typeof out)[number]>();
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (LAYER[c]) {
        const key = `${x}:${w}:${c}`;
        const above = open.get(key);
        if (above) {
          above.h++;
          next.set(key, above);
        } else {
          const r = { x, y, w, h: 1, cls: LAYER[c] };
          out.push(r);
          next.set(key, r);
        }
      }
      x += w;
    }
    open = next;
  });
  return out;
}

const CACHE = new Map<PixelIconName, ReturnType<typeof rects>>();

/** The icon grids, exported for tests. */
export const PIXEL_ICONS: Readonly<Record<PixelIconName, readonly string[]>> = ICONS;

/**
 * Decorative by default (hidden from screen readers). Pass `label` only when
 * the icon is the only thing that names or explains its control.
 */
const PixelIcon: React.FC<{ name: PixelIconName; className?: string; label?: string }> = ({
  name,
  className,
  label,
}) => {
  let parts = CACHE.get(name);
  if (!parts) {
    const rows = ICONS[name];
    CACHE.set(name, (parts = rects(detailed(rows))));
  }
  return (
    <svg
      className={['lu-pixel-icon', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${DETAIL} ${DETAIL}`}
      shapeRendering="crispEdges"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      focusable="false"
    >
      {parts.map((r) => (
        <rect key={`${r.x}-${r.y}`} className={r.cls} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
    </svg>
  );
};

export default PixelIcon;
