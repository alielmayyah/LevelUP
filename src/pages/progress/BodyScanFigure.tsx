import type { BodySegment, Sex } from '../../api/types';
import type { Status } from '../../body/standards';

const ARM = {
  outline:
    'M46 61c-6 2-9.7 7.8-11 15.7l-2.4 18.6-4.1 21.3c-1.2 6.3-.4 11 2 12.1 2.3 1 4.5-1.4 5.7-5.8l2-5.2 6.2-19.4 5.8-17C53 72.4 52 64.8 46 61Z',
  detail: 'M42.5 71c-2.6 5.2-4 11.1-4.5 16.8m-1.2 10-3.9 16.8',
};
const LEG = {
  outline:
    'M52 122c4 5.4 10.2 9.5 19.4 12.5l-1.8 25.8c-.7 10.1-2 17.6-4 23.8l-2 21.5c-.3 4 .2 6.1 2.6 9 1.8 2.4.5 5.4-2.9 5.4H50c-3.6 0-5.4-2.7-3-5.4l5.3-5.6 1-22.8c-2.8-7.3-3.8-14.8-3.7-23.9l-2-20c-.8-7.9 1-15.8 4.4-20.3Z',
  detail: 'M55.6 138c1.5 8.3 2.1 16 1.9 23m.8 10.3c-1.4 5.4-1.6 11-1.4 16.7l-.8 14',
};
const MALE = {
  arm: ARM,
  leg: LEG,
  trunk: {
    outline:
      'M65 49c.1 4.8-2.7 7.7-8.8 9.2l-8.7 2.1c-2.6 1.3-2.2 5.3-.7 10.6l5.1 17.3c2 6.6 3.3 12.5 3 18.5l-3.1 13.2c-.9 4.3 2.4 7.5 9 10l13.2 4.9 13.2-4.9c6.6-2.5 9.9-5.7 9-10l-3.1-13.2c-.3-6 1-11.9 3-18.5l5.1-17.3c1.5-5.3 1.9-9.3-.7-10.6l-8.7-2.1c-6.1-1.5-8.9-4.4-8.8-9.2Z',
    detail:
      'M74 62v50M53 71c5 .3 10.6 2.5 15 6.4m27-6.4c-5 .3-10.6 2.5-15 6.4M59 114c3.1-2.5 7.4-2.8 11-.6m19 .6c-3.1-2.5-7.4-2.8-11-.6',
  },
  head: 'M60 34c0-9.4 5.6-15.5 14-15.5S88 24.6 88 34l-.8 7.1C86 48.3 81.5 53 74 53s-12-4.7-13.2-11.9Z',
};
const FEMALE = {
  arm: {
    outline:
      'M53 62c-5.7 1.5-9 6.4-10.7 14.1l-3.5 17.6-6.2 24c-1.4 5.6-1.2 10 1.4 10.8 2.4.7 4.8-2.4 6-6.6l6.7-21 5.7-16.8C55 75.7 57 66.8 53 62Z',
    detail: 'M49 71c-2.6 4.8-4.3 11.7-5 17.7m-1.7 9.6-4.5 16.2',
  },
  trunk: {
    outline:
      'M68 48c.5 5.2-1.8 8.8-7.5 10.5l-5.5 1.6c-3.2 1-3.6 4.6-2 10l5.4 16.6c2 6.5 4.2 13.4 2.4 19.5-1.7 5.3-7.1 10-10 18-1.7 5 2 7.1 8.6 9.2L74 138l14.6-4.6c6.6-2.1 10.3-4.2 8.6-9.2-2.9-8-8.3-12.7-10-18-1.8-6.1.4-13 2.4-19.5L95 70.1c1.6-5.4 1.2-9-2-10l-5.5-1.6c-5.7-1.7-8-5.3-7.5-10.5Z',
    detail:
      'M74 63v49M59 72c4.1 1.2 7.5 3.2 10.5 6m19.5-6c-4.1 1.2-7.5 3.2-10.5 6M56 124c4-5 8.5-7 14-5m22 5c-4-5-8.5-7-14-5',
  },
  leg: {
    outline:
      'M50 123c4.7 5.4 11.8 10.2 21 13l-1.4 20.2c-.4 9.4-1.8 18.8-4.7 25.9-1.5 8.1-3.2 16.6-3.6 25.5-.1 3 .7 4.9 2.6 7.2 1.7 2.5.5 5.2-2.7 5.2H49c-3.2 0-4.8-2.8-2.7-5.2l4.4-5.1 2-24.7c-2.8-7.6-3.6-14.6-3.5-23.5l-3.7-21.8c-1.3-7.5.3-13.2 4.5-16.7Z',
    detail: 'M54 141c2 8.2 3.8 15.5 4 22m.1 9c-1 5.7-1.2 10.6-.9 16.1l-1.3 14.3',
  },
  head: 'M61.5 34c0-9.6 4.9-15.5 12.5-15.5S86.5 24.4 86.5 34l-1 7.1C84.2 48.1 80 53 74 53s-10.2-4.9-11.5-11.9Z',
};

const FIGURES = { MALE, FEMALE } satisfies Record<Sex, typeof MALE>;
const SEGMENTS = {
  leftArm: 'arm',
  rightArm: 'arm',
  trunk: 'trunk',
  leftLeg: 'leg',
  rightLeg: 'leg',
} as const satisfies Record<BodySegment, keyof Omit<typeof MALE, 'head'>>;

/** Rear view to match the scan sheet and keep the member's left on the left in both languages. */
export default function BodyScanFigure({
  statuses,
  kind,
  sex,
}: {
  statuses: Record<BodySegment, Status>;
  kind: 'lean' | 'fat';
  sex: Sex;
}) {
  const silhouette = FIGURES[sex];
  return (
    <div className="lu-scan-figure-stage grid place-items-center rounded-xl">
      <svg
        className="lu-scan-figure block size-full"
        viewBox="0 0 148 244"
        data-testid="segments-figure"
        data-view={kind}
        data-silhouette={sex}
        aria-hidden="true"
        focusable="false"
      >
        <g className="lu-scan-guides">
          <path d="M12 27V13h14m96 0h14v14M12 217v14h14m96 0h14v-14" />
          <path className="lu-scan-gridlines" d="M16 71h116M16 122h116M16 173h116M74 14v216" />
          <path d="M12 71h5m-5 51h5m-5 51h5m114-102h5m-5 51h5m-5 51h5" />
          <ellipse cx="74" cy="224" rx="33" ry="6" />
          <ellipse cx="74" cy="224" rx="22" ry="3.4" />
        </g>
        {(Object.keys(SEGMENTS) as BodySegment[]).map((part) => {
          const geometry = silhouette[SEGMENTS[part]];
          return (
            <g
              key={part}
              data-part={part}
              data-status={statuses[part]}
              className="lu-scan-segment"
              transform={part === 'rightArm' || part === 'rightLeg' ? 'translate(148 0) scale(-1 1)' : undefined}
            >
              <path className="lu-scan-anatomy" d={geometry.outline} />
              <path className="lu-scan-contours" d={geometry.detail} />
            </g>
          );
        })}
        <path className="lu-scan-anatomy" d={silhouette.head} />
      </svg>
    </div>
  );
}
