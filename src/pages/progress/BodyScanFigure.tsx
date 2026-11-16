import type { BodySegment } from '../../api/types';
import type { Status } from '../../body/standards';

const ARM = {
  outline: 'M47 62c-6 2-9 7-10 15l-2 18-4 22c-.9 6-.3 11 2 12 2 1 4-1 5-5l2-5 5-20 5-17c2.5-9 2-16-3-20Z',
  detail: 'M44 72c-2.5 5-3.3 10-3.5 16m-.7 10-3.4 17',
};
const LEG = {
  outline:
    'M54 123c3 5 9 8.4 17 11l-2.3 30.5c-.6 8-1.4 13-3.5 19l-2 22c-.3 4 0 6 2.6 9 1.8 2.2.4 5-2.7 5H51c-4 0-5.3-2.7-2.8-5.5l5-5.2 1-22c-2-7-2.5-13.8-2.1-21l-2.3-23c-.8-8 .6-15.2 4.2-20.3Z',
  detail: 'M58 138c1.6 9 2 16.5 1 23m-.5 10.5c-.8 6-1 11.3-.5 16.5l-.9 14',
};
const SEGMENTS = {
  leftArm: ARM,
  rightArm: { ...ARM, transform: 'translate(148 0) scale(-1 1)' },
  trunk: {
    outline:
      'M66 49c.1 5-2 8.2-7.8 9.5L52 60.3c-2.6 1-3.3 4-2.1 9l4.6 18.8c2 7 3.3 12.3 2.9 18.4l-3.2 13c-1 4 1.8 6.7 8 9.2l11.8 4.9 11.8-4.9c6.2-2.5 9-5.2 8-9.2l-3.2-13c-.4-6.1.9-11.4 2.9-18.4l4.6-18.8c1.2-5 .5-8-2.1-9l-6.2-1.8c-5.8-1.3-7.9-4.5-7.8-9.5Z',
    detail: 'M74 62v49M56 71c4.5 0 9.3 2 13 6m23-6c-4.5 0-9.3 2-13 6M61 114c3-2.5 6-2.5 9-.5m17 .5c-3-2.5-6-2.5-9-.5',
  },
  leftLeg: LEG,
  rightLeg: { ...LEG, transform: 'translate(148 0) scale(-1 1)' },
} satisfies Record<BodySegment, { outline: string; detail: string; transform?: string }>;

/** Rear view to match the scan sheet and keep the member's left on the left in both languages. */
export default function BodyScanFigure({
  statuses,
  kind,
}: {
  statuses: Record<BodySegment, Status>;
  kind: 'lean' | 'fat';
}) {
  return (
    <div className="lu-scan-figure-stage grid place-items-center rounded-xl">
      <svg
        className="lu-scan-figure block size-full"
        viewBox="0 0 148 244"
        data-testid="segments-figure"
        data-view={kind}
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
          const geometry = SEGMENTS[part];
          return (
            <g
              key={part}
              data-part={part}
              data-status={statuses[part]}
              className="lu-scan-segment"
              transform={'transform' in geometry ? geometry.transform : undefined}
            >
              <path className="lu-scan-anatomy" d={geometry.outline} />
              <path className="lu-scan-contours" d={geometry.detail} />
            </g>
          );
        })}
        <path
          className="lu-scan-anatomy"
          d="M60 34c0-9.4 5.6-15.5 14-15.5S88 24.6 88 34l-.8 7.1C86 48.3 81.5 53 74 53s-12-4.7-13.2-11.9Z"
        />
      </svg>
    </div>
  );
}
