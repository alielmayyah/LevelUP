import { DETAIL, detailed } from '../../components/scale2x';

// The original pixel glyphs used by the Home dashboard and its notifications sheet.
const flip = (rows: readonly string[]) => [...rows].reverse();
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
  chevronForward: CHEVRON_FORWARD,
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
  bell: BELL,
  bellOff: slashed(BELL),
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
} as const;

export type HomeIconName = keyof typeof ICONS;

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

const CACHE = new Map<HomeIconName, ReturnType<typeof rects>>();

/**
 * Decorative by default (hidden from screen readers). Pass `label` only when
 * the icon is the only thing that names or explains its control.
 */
const HomeIcon: React.FC<{ name: HomeIconName; className?: string; label?: string }> = ({ name, className, label }) => {
  let parts = CACHE.get(name);
  if (!parts) {
    const rows = ICONS[name];
    CACHE.set(name, (parts = rects(detailed(rows))));
  }
  return (
    <svg
      className={['lu-pixel-icon lu-home-icon', className].filter(Boolean).join(' ')}
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

export default HomeIcon;
