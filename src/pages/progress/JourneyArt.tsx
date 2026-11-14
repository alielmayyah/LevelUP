import type { AvatarConfigDto } from '../../api/types';
import Avatar from '../../avatar/Avatar';

/*
 * The Progress header's pixel landscape: a night sky with a moon and stars,
 * two mountain ranges, and the member's own character standing on a rock,
 * looking out over the journey. Drawn on a 120×48 grid; it fades into the
 * page toward the title side and mirrors in Arabic (Progress.scss).
 */

const STARS: [number, number][] = [
  [14, 6],
  [30, 12],
  [48, 4],
  [62, 14],
  [96, 5],
  [108, 13],
  [40, 18],
];

const JourneyArt: React.FC<{ avatar: AvatarConfigDto }> = ({ avatar }) => (
  <div className="lu-journey relative size-full">
    <svg
      className="absolute inset-0 size-full"
      viewBox="0 0 120 48"
      preserveAspectRatio="xMaxYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/* Sky in hard bands, darkest at the top. */}
      <rect className="lu-j-sky-1" width={120} height={48} />
      <rect className="lu-j-sky-2" y={16} width={120} height={32} />
      <rect className="lu-j-sky-3" y={28} width={120} height={20} />

      {/* Moon with a shadowed edge. */}
      <path className="lu-j-moon" d="M84 4h6v1h2v2h1v6h-1v2h-2v1h-6v-1h-2v-2h-1V7h1V5h2z" />
      <path className="lu-j-moon-shade" d="M90 5h2v2h1v6h-1v2h-2v-1h1v-2h1V8h-1V6h-1z" />
      {STARS.map(([x, y]) => (
        <rect key={`${x}-${y}`} className="lu-j-star" x={x} y={y} width={1} height={1} />
      ))}

      {/* Far range, with snow on the peaks. */}
      <path
        className="lu-j-far"
        d="M0 34h6v-2h4v-3h3v-3h4v-3h3v3h3v3h4v2h5v-4h4v-4h3v-4h3v4h3v4h4v3h5v2h6v-3h4v-3h4v-4h3v4h4v3h4v3h5v-2h6v-3h4v-2h4v2h3v3h4v26H0z"
      />
      <path className="lu-j-snow" d="M20 23h3v3h-2v-1h-1zM47 15h3v4h-1v-1h-2zM77 19h3v4h-1v-2h-2z" />
      {/* Near range, darker. */}
      <path
        className="lu-j-near"
        d="M0 40h8v-3h5v-3h4v-2h5v2h4v3h6v-2h6v-3h5v-3h5v3h5v3h6v2h7v-3h6v-2h5v2h5v3h6v2h8v-2h6v9H0z"
      />
      {/* Ground, grass tufts, and the rock the character stands on. */}
      <rect className="lu-j-ground" y={43} width={120} height={5} />
      <path
        className="lu-j-grass"
        d="M0 43h120v1H0zM6 42h1v1H6zM18 41h1v2h-1zM19 42h1v1h-1zM44 42h1v1h-1zM70 41h1v2h-1zM71 42h1v1h-1z"
      />
      <path className="lu-j-rock" d="M88 43v-3h2v-2h4v-1h10v1h4v2h2v3z" />
      <path className="lu-j-rock-hi" d="M90 40h2v-1h4v-1h6v1h-6v1h-4v1h-2z" />
      <path className="lu-j-grass" d="M86 42h1v1h-1zM109 41h1v2h-1zM110 42h1v1h-1z" />
    </svg>
    {/* The member's own character, standing on the rock (same art as Profile and the leaderboard). */}
    <div className="lu-journey-hero absolute right-[8%] bottom-[14%] h-[62%]">
      <Avatar config={avatar} crop="full" className="block h-full w-auto" />
    </div>
  </div>
);

export default JourneyArt;
