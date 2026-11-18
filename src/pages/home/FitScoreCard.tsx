import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { FitScoreSummary } from '../../api/types';
import { formatNumber } from '../../i18n/format';
import { useCountUp } from '../../motion/gsapMotion';
import Icon from '../../components/Icon';

/** The member's headline number. A null score shows the first-scan empty state with its next step. */
const FitScoreCard: React.FC<{ fitScore: FitScoreSummary | null }> = ({ fitScore }) => {
  const { t } = useTranslation();
  const scoreEl = useRef<HTMLSpanElement>(null);
  const score = fitScore?.score;
  useCountUp(scoreEl, score);

  return (
    <section
      className="lu-card lu-hero lu-fitscore relative overflow-hidden md:row-span-2 md:flex md:flex-col"
      data-testid="fitscore-card"
      aria-labelledby="fitscore-title"
    >
      <header className="lu-card-head -my-2 justify-between">
        <h2 id="fitscore-title" className="lu-card-title text-hero">
          <Icon name="pulse" />
          {t('home.fitScore.title')}
        </h2>
      </header>

      {fitScore ? (
        <div className="mt-1 grid justify-items-center gap-3 md:flex-1 md:content-center">
          <span
            className="lu-display text-[clamp(3.5rem,17vw,4.5rem)] leading-[0.9] text-hero tabular-nums"
            ref={scoreEl}
            data-testid="fitscore-value"
          >
            {formatNumber(fitScore.score)}
          </span>
          <span className="mt-1 text-[0.8125rem] font-semibold text-hero-muted">{t('home.fitScore.outOf')}</span>
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
    </section>
  );
};

export default FitScoreCard;
