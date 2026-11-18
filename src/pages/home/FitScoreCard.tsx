import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary, FitScoreTier } from '../../api/types';
import { formatNumber, formatSigned } from '../../i18n/format';
import { TIERS, tierKey } from './homeText';
import Icon from '../../components/Icon';
import { InfoButton } from '../progress/MetricInfo';
import FitScoreInfo from './FitScoreInfo';

gsap.registerPlugin(useGSAP);

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

/**
 * The member's headline number. A null score shows the first-scan empty state
 * with its next step. The ⓘ opens a sheet that explains FitScore and its tiers.
 */
const FitScoreCard: React.FC<{ fitScore: FitScoreSummary | null }> = ({ fitScore }) => {
  const { t } = useTranslation();
  const scoreEl = useRef<HTMLSpanElement>(null);
  // Where the next count-up starts: 0 on first show, then the last score shown.
  const shown = useRef(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const closeInfo = useCallback(() => setInfoOpen(false), []);
  const score = fitScore?.score;

  // A count-up is a scripted sequence, so it uses GSAP (see ui-standards → Animation).
  // useGSAP runs before paint, so writing the start value here means the final
  // number never flashes first. With reduced motion the rendered value just stays.
  useGSAP(
    () => {
      if (score === undefined) return;
      const from = shown.current;
      if (from === score) return;
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { value: from };
        const paint = (value: number) => {
          if (scoreEl.current) scoreEl.current.textContent = formatNumber(Math.round(value));
        };
        paint(from);
        gsap.to(counter, {
          value: score,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => paint(counter.value),
          onComplete: () => {
            shown.current = score;
          },
        });
        // Stopped early (new score, unmount, Strict Mode re-run): the next count
        // starts where this one stopped, and the text matches what React rendered.
        return () => {
          shown.current = Math.round(counter.value);
          paint(score);
        };
      });
    },
    { dependencies: [score] },
  );

  const change = fitScore?.changeSinceLastScan;
  const trend = change == null ? 'none' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  const tierIndex = fitScore ? TIERS.indexOf(fitScore.tier) : -1;
  const next = fitScore && tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null;
  const toNext = fitScore && next ? Math.max(0, TIER_FLOOR[next] - fitScore.score) : 0;

  return (
    <section
      className="lu-card lu-fitscore relative overflow-hidden md:row-span-2 md:flex md:flex-col"
      data-testid="fitscore-card"
      aria-labelledby="fitscore-title"
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
        <div className="mt-2 grid items-center gap-x-5 gap-y-3 min-[360px]:grid-cols-[auto_1fr] md:flex-1">
          {/* A half-ring gauge from 0 to 100, with the score in its middle. */}
          <div className="lu-gauge relative mx-auto w-[176px] max-w-full">
            <svg viewBox="0 0 120 68" aria-hidden="true">
              <path className="lu-gauge-track" d="M10 62 A50 50 0 0 1 110 62" pathLength={100} />
              <path
                className="lu-gauge-fill"
                d="M10 62 A50 50 0 0 1 110 62"
                pathLength={100}
                style={{ strokeDasharray: `${Math.min(100, Math.max(0, fitScore.score))} 100` }}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 grid justify-items-center">
              <span
                className="lu-display text-[3.25rem] leading-none text-hero tabular-nums"
                ref={scoreEl}
                data-testid="fitscore-value"
              >
                {formatNumber(fitScore.score)}
              </span>
              <span className="text-[0.75rem] font-semibold text-hero-muted">{t('home.fitScore.outOf')}</span>
            </div>
          </div>
          <div className="grid justify-items-center gap-2 min-[360px]:justify-items-start">
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
            <span className="text-[0.8125rem] text-hero-muted" data-testid="fitscore-next">
              {next ? t('home.fitScore.toNext', { count: toNext, tier: t(tierKey(next)) }) : t('home.fitScore.topTier')}
            </span>
          </div>
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
