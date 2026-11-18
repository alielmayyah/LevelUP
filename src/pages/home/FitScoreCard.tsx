import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary, FitScoreTier } from '../../api/types';
import { formatNumber, formatSigned } from '../../i18n/format';
import { gsap, MOTION_OK, useCountUp, useEnterCount, useGSAP } from '../../motion/gsapMotion';
import { TIERS, tierKey } from './homeText';
import Icon from '../../components/Icon';
import { InfoButton } from '../progress/MetricInfo';
import FitScoreInfo from './FitScoreInfo';

const TREND_COLOR = {
  up: 'text-hero-up',
  down: 'text-hero-down',
  flat: 'text-hero-muted',
  none: 'text-hero-muted',
} as const;

/** The lowest score of each tier (FitScore info sheet: under 50, 50, 60, 70, 80 and up). */
const TIER_FLOOR: Record<FitScoreTier, number> = {
  'Needs Improvement': 0,
  Building: 50,
  'On Track': 60,
  Strong: 70,
  Elite: 80,
};

/** The gauge: a half circle of ticks, one per ~3 points, from 0 (start side) to 100. */
const TICKS = 33;
const CX = 120;
const CY = 122;
const R_IN = 84;
const R_OUT = 106;

const tickAt = (i: number, outer = R_OUT) => {
  const angle = Math.PI - (i / (TICKS - 1)) * Math.PI;
  const point = (r: number) => [CX + r * Math.cos(angle), CY - r * Math.sin(angle)];
  const [x1, y1] = point(R_IN);
  const [x2, y2] = point(outer);
  return { x1, y1, x2, y2 };
};

/** How many ticks a score lights: every tick at or below the score. */
const litTicks = (score: number) =>
  score <= 0 ? 0 : Math.min(TICKS, Math.floor((Math.min(100, score) / 100) * (TICKS - 1)) + 1);

/**
 * The member's headline number. A null score shows the first-scan empty state
 * with its next step. The ⓘ opens a sheet that explains FitScore and its tiers.
 */
const FitScoreCard: React.FC<{ fitScore: FitScoreSummary | null }> = ({ fitScore }) => {
  const { t } = useTranslation();
  const card = useRef<HTMLElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const closeInfo = useCallback(() => setInfoOpen(false), []);
  const score = fitScore?.score;
  const lit = score === undefined ? 0 : litTicks(score);

  // The score counts up while the gauge's ticks light one after another from
  // the start side, every time Home is opened.
  const visits = useEnterCount();
  useCountUp(scoreEl, score);
  useGSAP(
    () => {
      if (!lit) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        const tl = gsap.timeline({ delay: 0.15 });
        tl.from('.lu-tick', {
          opacity: 0,
          duration: 0.4,
          stagger: { amount: 0.3 },
          ease: 'power1.out',
          clearProps: 'opacity',
        });
        tl.from(
          '.lu-tick-lit',
          {
            opacity: 0,
            scale: 0.2,
            transformOrigin: '50% 50%',
            duration: 0.45,
            ease: 'back.out(3)',
            stagger: { amount: 0.9 },
            clearProps: 'opacity,transform',
          },
          0.1,
        );
      });
    },
    { scope: card, dependencies: [lit, visits] },
  );

  const change = fitScore?.changeSinceLastScan;
  const trend = change == null ? 'none' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  const tierIndex = fitScore ? TIERS.indexOf(fitScore.tier) : -1;
  const next = fitScore && tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null;
  const toNext = fitScore && next ? Math.max(0, TIER_FLOOR[next] - fitScore.score) : 0;

  return (
    <section
      className="lu-card lu-hero lu-fitscore relative overflow-hidden md:row-span-2 md:flex md:flex-col"
      data-testid="fitscore-card"
      aria-labelledby="fitscore-title"
      ref={card}
    >
      <header className="lu-card-head -my-2 justify-between">
        <h2 id="fitscore-title" className="lu-card-title text-hero">
          <Icon name="pulse" />
          {t('home.fitScore.title')}
        </h2>
        <InfoButton
          className="lu-fitscore-info -me-2.5 text-hero-muted"
          label={t('home.fitScore.about')}
          onClick={() => setInfoOpen(true)}
          testId="fitscore-info-button"
        />
      </header>

      {fitScore ? (
        <div className="mt-1 grid justify-items-center gap-3 md:flex-1 md:content-center">
          {/* A half circle of ticks from 0 to 100; the lit ones reach the score. */}
          <div className="lu-gauge relative w-[min(260px,100%)]">
            <svg viewBox="0 0 240 132" aria-hidden="true">
              {Array.from({ length: TICKS }, (_, i) => (
                <line key={i} className="lu-tick" {...tickAt(i)} />
              ))}
              {Array.from({ length: lit }, (_, i) => (
                <line
                  key={i}
                  className={`lu-tick-lit ${i === lit - 1 ? 'is-head' : ''}`}
                  {...tickAt(i, i === lit - 1 ? R_OUT + 6 : R_OUT)}
                />
              ))}
            </svg>
            <div className="absolute inset-x-0 bottom-0 grid justify-items-center">
              <span
                className="lu-display text-[clamp(3.5rem,17vw,4.5rem)] leading-[0.9] text-hero tabular-nums"
                ref={scoreEl}
                data-testid="fitscore-value"
              >
                {formatNumber(fitScore.score)}
              </span>
              <span className="mt-1 text-[0.8125rem] font-semibold text-hero-muted">{t('home.fitScore.outOf')}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className={`lu-chip lu-chip-hero lu-tier-${tierIndex + 1}`}>
              <Icon name="bolt" />
              {t(tierKey(fitScore.tier))}
            </span>
            <span
              className={`inline-flex items-center gap-[5px] text-[0.875rem] ${trend === 'up' || trend === 'down' ? 'font-semibold' : 'font-normal'} ${TREND_COLOR[trend]}`}
              data-testid="fitscore-change"
            >
              {trend === 'up' || trend === 'down' ? (
                <>
                  {/* Trend arrows are never mirrored: up means better in both languages. */}
                  <Icon name={trend === 'up' ? 'trendUp' : 'trendDown'} />
                  {formatSigned(change)} {t('home.fitScore.since')}
                </>
              ) : (
                t(trend === 'flat' ? 'home.fitScore.noChange' : 'home.fitScore.firstScan')
              )}
            </span>
          </div>
          <span className="text-center text-[0.8125rem] text-hero-muted" data-testid="fitscore-next">
            {next ? t('home.fitScore.toNext', { count: toNext, tier: t(tierKey(next)) }) : t('home.fitScore.topTier')}
          </span>
        </div>
      ) : (
        <div className="mt-3 grid gap-1" data-testid="fitscore-empty">
          <p className="m-0 font-semibold text-hero">{t('home.fitScore.empty')}</p>
          <p className="m-0 flex items-center gap-2 font-normal text-hero-muted">
            <Icon name="calendar" />
            {t('home.fitScore.emptyNext')}
          </p>
        </div>
      )}

      <FitScoreInfo open={infoOpen} tier={fitScore?.tier ?? null} onClose={closeInfo} />
    </section>
  );
};

export default FitScoreCard;
