import { useTranslation } from 'react-i18next';

import type { AssessmentDto, BodySegment, SegmentReading } from '../../api/types';
import { segmentReadings } from '../../body/segments';
import { Chip, FeedCard, Num } from '../../components/ui';
import { formatPercent } from '../../i18n/format';

/** Inside ±2% left/right counts as balanced (ui-standards → BodyFigure). */
export const BALANCED_GAP_PCT = 2;

/** |right − left| as a % of their mean. */
export const sideGap = (right: number, left: number): number => (Math.abs(right - left) / ((right + left) / 2)) * 100;

/*
 * The figure faces the member, so it is never mirrored: their right side is
 * on the drawing's left in both languages. Coordinates are the viewer's.
 */
const SHAPES: Record<BodySegment, { x: number; y: number; w: number; h: number }> = {
  rightArm: { x: 40, y: 50, w: 22, h: 88 },
  trunk: { x: 68, y: 46, w: 64, h: 98 },
  leftArm: { x: 138, y: 50, w: 22, h: 88 },
  rightLeg: { x: 70, y: 150, w: 27, h: 102 },
  leftLeg: { x: 103, y: 150, w: 27, h: 102 },
};

const ORDER: BodySegment[] = ['rightArm', 'leftArm', 'trunk', 'rightLeg', 'leftLeg'];

/** Fuller fill the closer a part is to (or above) its ideal. */
const fillOpacity = (pct: number) => Math.min(1, Math.max(0.3, (pct - 60) / 50));

function Beam({
  label,
  gap,
  flag,
  testId,
}: {
  label: string;
  gap: number;
  /** Two scans in a row out of the balanced zone. */
  flag: boolean;
  testId: string;
}) {
  const { t } = useTranslation();
  const balanced = gap <= BALANCED_GAP_PCT;
  // The beam spans 0–8%; the shaded start is the balanced zone.
  const p = Math.min(1, gap / 8);
  return (
    <div className="grid gap-1.5" data-testid={testId} data-balanced={balanced}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label text-ink">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-label text-muted">
            {t('balance.gap', { pct: formatPercent(Number(gap.toFixed(1))) })}
          </span>
          {flag ? (
            <Chip tone="attention">{t('balance.uneven')}</Chip>
          ) : (
            <span className="text-label text-muted">{balanced ? t('balance.balanced') : ''}</span>
          )}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-3" aria-hidden="true">
        <span
          className="absolute inset-y-0 start-0 rounded-full bg-[color-mix(in_srgb,var(--lu-good)_28%,var(--lu-surface-3))]"
          style={{ inlineSize: `${(BALANCED_GAP_PCT / 8) * 100}%` }}
        />
        <span
          className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-surface-1 bg-ink ltr:-translate-x-1/2 rtl:translate-x-1/2"
          style={{ insetInlineStart: `${p * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Lean mass by body part on an unmirrored figure, with left/right beams.
 * It's lean mass, not muscle (the parts add up to far more than the muscle
 * figure). A difference is flagged only when the scan before shows it too.
 */
export function BodyBalance({ scan, previous }: { scan: AssessmentDto; previous: AssessmentDto | null }) {
  const { t } = useTranslation();
  const lean = segmentReadings(scan, 'lean');
  const before = segmentReadings(previous, 'lean');
  const kg = t('units.kg');

  if (!lean) {
    return (
      <FeedCard icon="body" iconTone="lean" title={t('balance.title')} testId="body-balance">
        <p className="m-0 text-body text-muted" data-testid="body-balance-none">
          {t('balance.none')}
        </p>
      </FeedCard>
    );
  }

  const gaps = {
    arms: sideGap(lean.rightArm.kg, lean.leftArm.kg),
    legs: sideGap(lean.rightLeg.kg, lean.leftLeg.kg),
  };
  const gapsBefore = before && {
    arms: sideGap(before.rightArm.kg, before.leftArm.kg),
    legs: sideGap(before.rightLeg.kg, before.leftLeg.kg),
  };
  const flag = (k: 'arms' | 'legs') => !!gapsBefore && gaps[k] > BALANCED_GAP_PCT && gapsBefore[k] > BALANCED_GAP_PCT;
  const reading = (s: BodySegment): SegmentReading => lean[s];

  return (
    <FeedCard
      icon="body"
      iconTone="lean"
      title={t('balance.title')}
      subtitle={t('balance.subtitle')}
      testId="body-balance"
    >
      <div className="grid grid-cols-[minmax(0,120px)_1fr] items-center gap-4">
        <svg
          viewBox="0 0 200 260"
          className="block h-auto w-full"
          role="img"
          aria-label={t('balance.figureAria', {
            parts: ORDER.map((s) => `${t(`balance.part.${s}`)} ${formatPercent(Math.round(reading(s).pct))}`).join(
              '، ',
            ),
          })}
          data-testid="body-figure"
        >
          <circle cx="100" cy="24" r="17" fill="var(--lu-surface-3)" />
          {ORDER.map((s) => {
            const r = SHAPES[s];
            return (
              <rect
                key={s}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={Math.min(r.w, 28) / 2}
                fill="var(--lu-lean)"
                fillOpacity={fillOpacity(reading(s).pct)}
                stroke="var(--lu-border)"
                data-testid={`figure-${s}`}
              />
            );
          })}
        </svg>
        <dl className="m-0 grid gap-2">
          {ORDER.map((s) => (
            <div key={s} className="flex items-baseline justify-between gap-2" data-testid={`part-${s}`}>
              <dt className="text-label text-muted">{t(`balance.part.${s}`)}</dt>
              <dd className="m-0 flex items-baseline gap-2">
                <Num value={reading(s).kg} digits={2} unit={kg} className="text-label text-ink" />
                <span className="text-caption text-muted">{formatPercent(Math.round(reading(s).pct))}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="m-0 text-caption text-muted">{t('balance.sides')}</p>
      <div className="grid gap-3 border-t border-line pt-3">
        <Beam label={t('balance.arms')} gap={gaps.arms} flag={flag('arms')} testId="beam-arms" />
        <Beam label={t('balance.legs')} gap={gaps.legs} flag={flag('legs')} testId="beam-legs" />
        {!before && <p className="m-0 text-caption text-muted">{t('balance.needTwo')}</p>}
      </div>
    </FeedCard>
  );
}

export default BodyBalance;
