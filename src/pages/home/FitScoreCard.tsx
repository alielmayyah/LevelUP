import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary } from '../../api/types';
import { formatNumber, formatSigned } from '../../i18n/format';
import { TIERS, tierKey } from './homeText';
import Icon from '../../components/Icon';
import { InfoButton } from '../progress/MetricInfo';
import FitScoreInfo from './FitScoreInfo';

gsap.registerPlugin(useGSAP);

const TREND_COLOR = { up: 'text-success', down: 'text-danger', flat: 'text-muted', none: 'text-muted' } as const;

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

  return (
    <section
      className="lu-card lu-fitscore relative overflow-hidden md:row-span-2 md:flex md:flex-col"
      data-testid="fitscore-card"
      aria-labelledby="fitscore-title"
    >
      <header className="lu-card-head -my-2 justify-between">
        <h2 id="fitscore-title" className="lu-card-title">
          <Icon name="pulse" />
          {t('home.fitScore.title')}
        </h2>
        <InfoButton
          className="lu-fitscore-info -me-2.5"
          label={t('home.fitScore.about')}
          onClick={() => setInfoOpen(true)}
          testId="fitscore-info-button"
        />
      </header>

      {fitScore ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 md:flex-1 md:content-center">
          <span
            className="lu-display text-[clamp(4rem,22vw,5.5rem)] leading-none text-ink tabular-nums"
            ref={scoreEl}
            data-testid="fitscore-value"
          >
            {formatNumber(fitScore.score)}
          </span>
          <span className="grid justify-items-start gap-2">
            <span className={`lu-chip lu-chip-tier lu-tier-${TIERS.indexOf(fitScore.tier) + 1}`}>
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
          </span>
        </div>
      ) : (
        <div className="mt-3 grid gap-1" data-testid="fitscore-empty">
          <p className="m-0 font-semibold text-ink">{t('home.fitScore.empty')}</p>
          <p className="m-0 flex items-center gap-2 font-normal text-muted">
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
