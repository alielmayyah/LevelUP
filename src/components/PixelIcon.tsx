import './PixelIcon.scss';

/*
 * Pixel-art icons drawn on a 12×12 grid, to match the app's pixel style.
 * Each character is one pixel:
 *   X outline   O fill   Y highlight   H hot spot   . empty
 * Colors come from CSS variables on the icon or an ancestor:
 *   --px-line, --px-fill, --px-hi, --px-core
 */
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
  // Protein: a chicken drumstick, meat up top (fill), bone down to the knuckle (core).
  drumstick: [
    '...XXXX.....',
    '..XOOOOX....',
    '.XOYYOOOX...',
    '.XOYOOOOX...',
    '.XOOOOOOX...',
    '..XOOOOOX...',
    '...XOOOX....',
    '....XXHX....',
    '.....XHHX.XX',
    '......XHHXHX',
    '.......XHHHX',
    '........XXX.',
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
  // Visceral fat: a heart, for the organs this deep belly fat sits around.
  heart: [
    '............',
    '..XX....XX..',
    '.XOOX..XOOX.',
    'XOYOOXXOOOOX',
    'XOYOOOOOOOOX',
    'XOOOOOOOOOOX',
    '.XOOOOOOOOX.',
    '..XOOOOOOX..',
    '...XOOOOX...',
    '....XOOX....',
    '.....XX.....',
    '............',
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

const LAYER: Record<string, string> = { X: 'px-line', O: 'px-fill', Y: 'px-hi', H: 'px-core' };

/** Merges each row's runs of the same color into one rect, so an icon is a few dozen nodes. */
function rects(rows: readonly string[]) {
  const out: { x: number; y: number; w: number; cls: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (LAYER[c]) out.push({ x, y, w, cls: LAYER[c] });
      x += w;
    }
  });
  return out;
}

const CACHE = new Map<PixelIconName, ReturnType<typeof rects>>();

const PixelIcon: React.FC<{ name: PixelIconName; className?: string }> = ({ name, className }) => {
  let parts = CACHE.get(name);
  if (!parts) CACHE.set(name, (parts = rects(ICONS[name])));
  return (
    <svg
      className={['lu-pixel-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {parts.map((r) => (
        <rect key={`${r.x}-${r.y}`} className={r.cls} x={r.x} y={r.y} width={r.w} height={1} />
      ))}
    </svg>
  );
};

export default PixelIcon;
