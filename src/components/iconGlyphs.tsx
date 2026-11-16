import type { ReactElement } from 'react';

// UI glyphs share a 24-unit canvas, round joins, and a common stroke weight.
export const ICONS = {
  house: (
    <>
      <path className="lu-icon-tint" d="M4.5 10.8 12 4l7.5 6.8V20h-5v-5.5h-5V20h-5z" />
      <path d="m3 12 9-8 9 8" />
    </>
  ),
  chart: <path d="M4 4v16h16M7.5 15l4-4 3 2.5L20 8m-4 0h4v4" />,
  target: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.75" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  flag: (
    <>
      <path
        className="lu-icon-tint"
        d="M5 5c2.5-1.5 4.6-1.3 7 .1s4.5 1.5 7 .1v10c-2.5 1.4-4.6 1.3-7-.1s-4.5-1.6-7-.1z"
      />
      <path d="M5 5v16" />
    </>
  ),
  person: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="7.5" r="3.4" />
      <path className="lu-icon-tint" d="M4.5 20v-1.2a4.8 4.8 0 0 1 4.8-4.8h5.4a4.8 4.8 0 0 1 4.8 4.8V20z" />
    </>
  ),
  community: (
    <>
      <circle className="lu-icon-tint" cx="9" cy="7.5" r="3" />
      <path className="lu-icon-tint" d="M2.75 20v-1a4.5 4.5 0 0 1 4.5-4.5h3.5a4.5 4.5 0 0 1 4.5 4.5v1z" />
      <path d="M16.2 4.9a2.8 2.8 0 0 1 0 5.4m1.7 4.4a4.4 4.4 0 0 1 3.35 4.3v1" />
    </>
  ),
  chevronForward: <path d="m9 5.5 6.5 6.5L9 18.5" />,
  chevronBack: <path d="m15 5.5-6.5 6.5 6.5 6.5" />,
  chevronDown: <path d="m5.5 9 6.5 6.5L18.5 9" />,
  arrowForward: <path d="M4 12h15m-6-6 6 6-6 6" />,
  arrowBack: <path d="M20 12H5m6-6-6 6 6 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  add: <path d="M12 5v14M5 12h14" />,
  remove: <path d="M5 12h14" />,
  check: <path d="m4.5 12 5 5 10-10" />,
  checkDouble: <path d="m2.5 12 4.5 4.5L16 7m-5 10L21 7" />,
  checkCircle: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="12" r="8.5" />
      <path d="m8 12 2.7 2.7 5.3-5.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.5v4.5m0-8v.15" />
    </>
  ),
  settings: (
    <>
      <path
        className="lu-icon-tint"
        d="m9.8 3.5-.6 2.3-1.65.95-2.3-.65-2.2 3.8 1.7 1.65v1.9l-1.7 1.65 2.2 3.8 2.3-.65 1.65.95.6 2.3h4.4l.6-2.3 1.65-.95 2.3.65 2.2-3.8-1.7-1.65v-1.9l1.7-1.65-2.2-3.8-2.3.65-1.65-.95-.6-2.3z"
        transform="translate(.7 .35) scale(.94)"
      />
      <circle cx="12" cy="12" r="2.65" />
    </>
  ),
  bell: (
    <>
      <path
        className="lu-icon-tint"
        d="M18.25 9.5c0-3.7-2.5-6.25-6.25-6.25S5.75 5.8 5.75 9.5c0 4.2-1.2 5.2-2 6.75h16.5c-.8-1.55-2-2.55-2-6.75z"
      />
      <path d="M10 20a2.25 2.25 0 0 0 4 0" />
    </>
  ),
  bellOff: (
    <path d="m3 3 18 18M9.5 4a6.3 6.3 0 0 1 8.75 5.5c0 1.5.15 2.6.4 3.5m.2 3.25H3.75c.8-1.55 2-2.55 2-6.75 0-1 .2-1.9.55-2.65M10 20a2.25 2.25 0 0 0 4 0" />
  ),
  logout: <path d="M11 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6m-1-8h10m-4-4 4 4-4 4" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <ellipse cx="12" cy="12" rx="3.9" ry="8.75" />
      <path d="M3.5 12h17" />
    </>
  ),
  palette: (
    <>
      <path
        className="lu-icon-tint"
        d="M12.25 3.5c-5 0-8.75 3.6-8.75 8.35 0 4.7 3.75 8.65 8.35 8.65 1.65 0 2.5-.9 2.5-2 0-.75-.6-1.25-.6-2.1 0-1.15 1.05-1.4 2.4-1.4h1.1c2.25 0 3.25-1.6 3.25-3.65 0-4.35-3.65-7.85-8.25-7.85z"
      />
      <path d="M7.5 11h.1m2.65-3.45h.1m3.9-.25h.1m2.7 2.7h.1" strokeWidth="2.6" />
    </>
  ),
  volume: <path d="M11 4.5 6 9H3v6h3l5 4.5zM15 8.5a5 5 0 0 1 0 7M18 5.5a9.2 9.2 0 0 1 0 13" />,
  mute: <path d="M11 4.5 6 9H3v6h3l5 4.5zm4 5 5 5m0-5-5 5" />,
  eye: (
    <>
      <path d="M2.75 12s3.5-6 9.25-6 9.25 6 9.25 6-3.5 6-9.25 6-9.25-6-9.25-6z" />
      <circle className="lu-icon-tint" cx="12" cy="12" r="2.75" />
    </>
  ),
  eyeOff: (
    <path d="m3 3 18 18M9.2 6.4A9.2 9.2 0 0 1 12 6c5.75 0 9.25 6 9.25 6a16 16 0 0 1-2.5 2.95M6 8a14.1 14.1 0 0 0-3.25 4s3.5 6 9.25 6c1.38 0 2.65-.34 3.8-.88" />
  ),
  history: <path d="M4 5v4.5h4.5M4.2 9.25a8.25 8.25 0 1 1 .5 6.85M12 7.75v4.6l3 1.9" />,
  filter: <path d="M4 6h5m4 0h7M4 12h9m4 0h3M4 18h2m4 0h10M11 3.5v5m4 1v5m-7 1v5" />,
  dice: (
    <>
      <rect className="lu-icon-tint" x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.3 8.3h.1m3.55 3.7h.1m3.55 3.7h.1" strokeWidth="2.5" />
    </>
  ),
  refresh: <path d="M19.5 10a7.75 7.75 0 1 0-1.15 6.8M19.5 4.5V10h-5.25" />,
  hanger: (
    <path
      className="lu-icon-tint"
      d="M9.65 6.5A2.35 2.35 0 1 1 13 8.65c-.7.4-1 .8-1 1.65v1L3.8 16a1.5 1.5 0 0 0 .75 2.8h14.9a1.5 1.5 0 0 0 .75-2.8L12 11.3"
    />
  ),
  wardrobe: (
    <>
      <rect className="lu-icon-tint" x="4.5" y="3.5" width="15" height="15.5" rx="2" />
      <path d="M12 3.5V19m-4 0v1.5m8-1.5v1.5M9.5 10v2m5-2v2" />
    </>
  ),
  hair: (
    <>
      <path className="lu-icon-tint" d="M4.5 13V10a7.5 7.5 0 0 1 15 0v3c-4-1.1-6.5-3.15-7.5-6-1.4 3.2-4 5.35-7.5 6Z" />
      <path d="M5.8 13v1.4a6.2 6.2 0 0 0 12.4 0V13" />
    </>
  ),
  body: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="5" r="2.5" />
      <path d="m4 10 5 1h6l5-1m-10.5 1v4l-2 5.5m7-9.5v4l2 5.5m-7-5.5h5" />
    </>
  ),
  shirt: (
    <path
      className="lu-icon-tint"
      d="m8 4-4.75 2.5L2 11l4.25 1.65L7 11.5V20h10v-8.5l.75 1.15L22 11l-1.25-4.5L16 4a4 4 0 0 1-8 0Z"
    />
  ),
  pants: (
    <>
      <path className="lu-icon-tint" d="M6 3.5h12l1.15 17H14L12 10l-2 10.5H4.85Z" />
      <path d="M5.8 7h12.4" />
    </>
  ),
  shoe: (
    <>
      <path
        className="lu-icon-tint"
        d="M3 15c0-1.2.8-2 2.35-2.15l4.4-.35 2.5-6.25 3 1.4.75 2.7 3.6 3.1c.95.8 1.4 1.8 1.4 3.05V19H3Z"
      />
      <path d="M3 16h18m-7.65-5.8 1.65.7m-2.9 1.35 1.65.7" />
    </>
  ),
  sock: (
    <>
      <path
        className="lu-icon-tint"
        d="M11 3.5h7v11.25c0 1.8-1 3.3-2.6 4.1l-5.2 2.3a3.05 3.05 0 0 1-2.85-5.35L11 13.2Z"
      />
      <path d="M11 7h7" />
    </>
  ),
  beard: (
    <>
      <path
        className="lu-icon-tint"
        d="M5.5 8v3.4c0 4.9 2.9 8.1 6.5 9.1 3.6-1 6.5-4.2 6.5-9.1V8l-2.4 2.75c-.9 1-2.6.1-4.1-.65-1.5.75-3.2 1.65-4.1.65Z"
      />
      <path d="M10 14.5h4" />
    </>
  ),
  smile: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="12" r="8.4" />
      <path d="M8.5 10h.1m6.8 0h.1m-6.75 4a4.25 4.25 0 0 0 6.5 0" />
    </>
  ),
  podium: (
    <>
      <path className="lu-icon-tint" d="M3 19v-7h6V7h6v8h6v4z" />
      <path d="M9 12v7m6-4v4m-3-8v3" />
    </>
  ),
  trophy: (
    <>
      <path className="lu-icon-tint" d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3m-5 3v5m-4 1h8" />
    </>
  ),
  crown: (
    <>
      <path className="lu-icon-tint" d="m3.5 6 4.25 4 4.25-5 4.25 5 4.25-4-1.75 11H5.25z" />
      <path d="M8 20h8" />
    </>
  ),
  pulse: <path d="M3 12h4l2.75-6 4 12 2.75-6H21" />,
  trendUp: <path d="m3.5 16 5.5-5.5 4 4 7.5-7.5m-5.5 0h5.5v5.5" />,
  trendDown: <path d="M3.5 8 9 13.5l4-4 7.5 7.5m-5.5 0h5.5v-5.5" />,
  sparkles: (
    <>
      <path className="lu-icon-tint" d="m10 3.5 1.75 5.75L17.5 11l-5.75 1.75L10 18.5l-1.75-5.75L2.5 11l5.75-1.75z" />
      <path d="M18.5 3.5v5m-2.5-2.5h5m-2 10.5v4m-2-2h4" />
    </>
  ),
  lock: (
    <>
      <rect className="lu-icon-tint" x="5.5" y="10" width="13" height="10.5" rx="2" />
      <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10M12 14.5v2" />
    </>
  ),
  idCard: (
    <>
      <rect className="lu-icon-tint" x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.4" r="1.5" />
      <path d="M6 15.5a2.7 2.7 0 0 1 5 0m3-5.5h4m-4 4h4" />
    </>
  ),
  scan: <path d="M7.5 4H4v3.5m12.5-3.5H20v3.5M4 16.5V20h3.5M20 16.5V20h-3.5M4 12h16m-12-4h8m-8 8h8" />,
  clock: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  stopwatch: (
    <>
      <circle className="lu-icon-tint" cx="12" cy="13.5" r="7" />
      <path d="M9.5 3.5h5M12 3.5v3m6.3 1.8 1.3-1.3M12 10v3.5" />
    </>
  ),
  bulb: (
    <path
      className="lu-icon-tint"
      d="M9.25 17v-1.2c0-1.7-3-2.7-3-6a5.75 5.75 0 1 1 11.5 0c0 3.3-3 4.3-3 6V17zm.75 3.5h4"
    />
  ),
  muscle: (
    <path
      className="lu-icon-tint"
      d="M4 18c.2-3.15.5-6.4 1.6-9.35C6.4 6.6 7.8 5 9.6 4.5l2.15 1.4-.9 2.2-2.1-.15c-.55 1.6-.8 3.2-.75 4.75 1.4-1.7 3.15-2.25 4.75-.2 1.05-1.3 2.7-1.8 4.35-1.2 2 .75 3.25 2.4 3.15 4.55-.15 2.5-2.7 4.45-6.6 4.45C9.9 20.3 6.4 19.6 4 18z"
    />
  ),
  dumbbell: (
    <>
      <rect className="lu-icon-tint" x="4.5" y="5" width="4" height="14" rx="1" />
      <rect className="lu-icon-tint" x="15.5" y="5" width="4" height="14" rx="1" />
      <path d="M2.4 9.4v5.2m19.2-5.2v5.2M8.5 12h7" />
    </>
  ),
  barbell: <path d="M2.3 12h19.4M5.5 7.5v9m3-11v13m7-13v13m3-11v9" />,
  scale: (
    <>
      <rect className="lu-icon-tint" x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 11.5a4 4 0 0 1 8 0M12 11.5l1.5-2M8 16.5h8" />
    </>
  ),
  gauge: (
    <>
      <path className="lu-icon-tint" d="M4 18a8.5 8.5 0 1 1 16 0z" />
      <path d="m12 14 3.5-4m-9 3h.1M12 8h.1m5.3 5h.1" />
    </>
  ),
  bodyFat: (
    <>
      <path
        className="lu-icon-tint"
        d="M8.2 4.25 5.5 6a3.5 3.5 0 0 0-1.4 3.5l.55 2.4 2.5-.5c1 2.05.2 4.2-.65 6.1l-.7 2.25h12.4l-.7-2.25c-.85-1.9-1.65-4.05-.65-6.1l2.5.5.55-2.4A3.5 3.5 0 0 0 18.5 6l-2.7-1.75"
      />
      <path d="M7.5 14.6c2.55 1.35 6.45 1.35 9 0M12 10.75v.15" />
    </>
  ),
  abdomen: (
    <>
      <path d="M8 4c.1 2.3-.7 3.15-1.35 4.6C5.4 11.55 5 15.25 6.25 20h11.5c1.25-4.75.85-8.45-.4-11.4C16.7 7.15 15.9 6.3 16 4" />
      <circle className="lu-icon-tint" cx="12" cy="12.3" r="3.3" />
      <path d="M12 12.3h.1" />
    </>
  ),
  calendar: (
    <>
      <rect className="lu-icon-tint" x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M8 3.5v4m8-4v4M4 10h16m-11.5 4H10m4 0h1.5m-7 3H10" />
    </>
  ),
  drop: (
    <>
      <path className="lu-icon-tint" d="M12 3.25c-2 3.1-6 7.6-6 11.15a6 6 0 1 0 12 0c0-3.55-4-8.05-6-11.15z" />
      <path d="M9 14.75a3 3 0 0 0 2.6 2.9" />
    </>
  ),
  protein: (
    <>
      <path d="m7.1 8.25 3.5 2.1m3.6 2.2 3.4 2.1m-.5-8.7-3.2 3.6m-3.4 3.6L7 17.2" />
      <circle className="lu-icon-tint" cx="5.5" cy="7.2" r="1.8" />
      <circle className="lu-icon-tint" cx="12.2" cy="11.5" r="2.45" />
      <circle className="lu-icon-tint" cx="18.4" cy="4.6" r="1.75" />
      <circle className="lu-icon-tint" cx="19.2" cy="15.65" r="1.8" />
      <circle className="lu-icon-tint" cx="5.7" cy="18.6" r="1.8" />
    </>
  ),
  gem: (
    <>
      <path className="lu-icon-tint" d="M7 5h10l4 5-9 10-9-10z" />
      <path d="M3 10h18M9.5 5 8 10l4 10 4-10-1.5-5" />
    </>
  ),
  bolt: <path className="lu-icon-tint" d="m13.4 2.8-8 10.4h5.8L10.6 21l8-10.4h-5.8z" />,
  ruler: (
    <>
      <path className="lu-icon-tint" d="m3.5 15.5 12-12 5 5-12 12z" />
      <path d="m12.5 6.5 1.7 1.7m-5.2.8 1.7 1.7m-4.2 1.8 1.7 1.7" />
    </>
  ),
  heart: (
    <path className="lu-icon-tint" d="M12 20.25 4.6 13A4.75 4.75 0 0 1 11.3 6.3l.7.7.7-.7a4.75 4.75 0 0 1 6.7 6.7z" />
  ),
  pushUp: (
    <>
      <circle cx="18.5" cy="9" r="2" />
      <path d="m3 17.5 5.5-3 6.5-2.5 2.25 2.1-1 3.4M13.7 17.5h3.55M3 20h18" />
    </>
  ),
  pullUp: (
    <>
      <path d="M3.5 4.5h17m-14 0V8l3 3.6m8-7.1V8l-3 3.6m-5 0V16l-1 4.5m6-8.9V16l1 4.5m-6-4.5h5" />
      <circle cx="12" cy="8.1" r="2" />
    </>
  ),
} satisfies Record<string, ReactElement>;
