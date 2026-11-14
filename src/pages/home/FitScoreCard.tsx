import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary, FitScoreTier } from '../../api/types';
import { formatNumber, formatSigned } from '../../i18n/format';
import { tierKey } from './homeText';
import PixelIcon from '../../components/PixelIcon';

gsap.registerPlugin(useGSAP);

/** Lowest to highest. */
const TIERS: FitScoreTier[] = ['Needs Improvement', 'Building', 'On Track', 'Strong', 'Elite'];

const TREND_COLOR = { up: 'text-success', down: 'text-danger', flat: 'text-muted', none: 'text-muted' } as const;

/** The member's headline number. A null score shows the first-scan empty state. */
const FitScoreCard: React.FC<{ fitScore: FitScoreSummary | null }> = ({ fitScore }) => {
  const { t } = useTranslation();
  const scoreEl = useRef<HTMLSpanElement>(null);
  const score = fitScore?.score;

  // A count-up is a scripted sequence, so it uses GSAP (see ui-standards → Animation).
  useGSAP(
    () => {
      if (score === undefined) return;
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: score,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            if (scoreEl.current) scoreEl.current.textContent = formatNumber(Math.round(counter.value));
          },
        });
      });
    },
    { dependencies: [score] },
  );

  const change = fitScore?.changeSinceLastScan;
  const trend = change == null ? 'none' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  return (
    <section
      className="lu-px-card lu-fitscore relative overflow-hidden md:row-span-2 md:flex md:flex-col"
      data-testid="fitscore-card"
      aria-labelledby="fitscore-title"
    >
      <header className="lu-card-head justify-between">
        <h2 id="fitscore-title" className="lu-card-title">
          <PixelIcon name="pulse" />
          {t('home.fitScore.title')}
        </h2>
        <span className="inline-flex items-center gap-1 text-[0.78rem] font-bold text-muted">
          <PixelIcon name="lock" />
          {t('home.fitScore.private')}
        </span>
      </header>

      {fitScore ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 md:flex-1 md:content-center">
          <span
            className="lu-display text-[clamp(4rem,22vw,5.5rem)] leading-none text-ink tabular-nums [text-shadow:4px_4px_0_color-mix(in_srgb,var(--ion-color-primary)_55%,transparent)]"
            ref={scoreEl}
            data-testid="fitscore-value"
          >
            {formatNumber(fitScore.score)}
          </span>
          <span className="grid justify-items-start gap-2">
            <span className={`lu-chip lu-chip-tier lu-tier-${TIERS.indexOf(fitScore.tier) + 1}`}>
              <PixelIcon name="bolt" />
              {t(tierKey(fitScore.tier))}
            </span>
            <span
              className={`inline-flex items-center gap-[5px] text-[0.85rem] font-bold ${TREND_COLOR[trend]}`}
              data-testid="fitscore-change"
            >
              {trend === 'up' || trend === 'down' ? (
                <>
                  {/* Trend arrows are never mirrored: up means better in both languages. */}
                  <PixelIcon name={trend === 'up' ? 'trendUp' : 'trendDown'} />
                  {formatSigned(change)} {t('home.fitScore.since')}
                </>
              ) : (
                <>
                  <span aria-hidden="true">—</span>
                  {t(trend === 'flat' ? 'home.fitScore.noChange' : 'home.fitScore.firstScan')}
                </>
              )}
            </span>
          </span>
          {/* Where the score sits among the five tiers. The tier name above says the same in words. */}
          <span
            className="mt-1.5 grid w-full grid-cols-[repeat(5,1fr)] gap-1"
            data-testid="tier-meter"
            aria-hidden="true"
          >
            {TIERS.map((tier, i) => (
              <span
                key={tier}
                className={`lu-tier-block h-2.5 rounded-[2px] lu-tier-${i + 1} ${i <= TIERS.indexOf(fitScore.tier) ? 'is-on' : ''} ${tier === fitScore.tier ? 'is-current' : ''}`}
              />
            ))}
          </span>
        </div>
      ) : (
        <p className="mx-0 mt-3 mb-0.5 font-bold">{t('home.fitScore.empty')}</p>
      )}
    </section>
  );
};

export default FitScoreCard;
