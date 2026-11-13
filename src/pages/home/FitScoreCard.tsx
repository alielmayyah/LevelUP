import { useGSAP } from '@gsap/react';
import { IonIcon } from '@ionic/react';
import { gsap } from 'gsap';
import { flash, lockClosedOutline, pulseOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary, FitScoreTier } from '../../api/types';
import { formatNumber, formatSigned } from '../../i18n/format';
import { tierKey } from './homeText';

gsap.registerPlugin(useGSAP);

/** Lowest to highest. */
const TIERS: FitScoreTier[] = ['Needs Improvement', 'Building', 'On Track', 'Strong', 'Elite'];

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
    <section className="lu-px-card lu-fitscore" data-testid="fitscore-card" aria-labelledby="fitscore-title">
      <header className="lu-card-head">
        <h2 id="fitscore-title" className="lu-card-title">
          <IonIcon icon={pulseOutline} aria-hidden="true" />
          {t('home.fitScore.title')}
        </h2>
        <span className="lu-fitscore-private">
          <IonIcon icon={lockClosedOutline} aria-hidden="true" />
          {t('home.fitScore.private')}
        </span>
      </header>

      {fitScore ? (
        <div className="lu-fitscore-main">
          <span className="lu-fitscore-score lu-display" ref={scoreEl} data-testid="fitscore-value">
            {formatNumber(fitScore.score)}
          </span>
          <span className="lu-fitscore-side">
            <span className={`lu-chip lu-chip-tier lu-tier-${TIERS.indexOf(fitScore.tier) + 1}`}>
              <IonIcon icon={flash} aria-hidden="true" />
              {t(tierKey(fitScore.tier))}
            </span>
            <span className={`lu-fitscore-change lu-trend-${trend}`} data-testid="fitscore-change">
              {trend === 'up' || trend === 'down' ? (
                <>
                  {/* Trend arrows are never mirrored: up means better in both languages. */}
                  <IonIcon icon={trend === 'up' ? trendingUpOutline : trendingDownOutline} aria-hidden="true" />
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
          <span className="lu-tier-meter" data-testid="tier-meter" aria-hidden="true">
            {TIERS.map((tier, i) => (
              <span
                key={tier}
                className={`lu-tier-block lu-tier-${i + 1}${i <= TIERS.indexOf(fitScore.tier) ? ' is-on' : ''}${tier === fitScore.tier ? ' is-current' : ''}`}
              />
            ))}
          </span>
        </div>
      ) : (
        <p className="lu-fitscore-empty">{t('home.fitScore.empty')}</p>
      )}
    </section>
  );
};

export default FitScoreCard;
