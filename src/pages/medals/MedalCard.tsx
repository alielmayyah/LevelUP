import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatPercent } from '../../i18n/format';
import { formatMedalDate, medalTarget, medalTitle, medalValue } from './format';
import MedalArt from './MedalArt';
import type { MedalStatus } from './types';

interface Props {
  medal: MedalStatus;
  onOpen: (medal: MedalStatus) => void;
}

/** A medal in the Trophy Room grid. Tapping it opens the detail sheet. */
const MedalCard: React.FC<Props> = ({ medal, onOpen }) => {
  const { t } = useTranslation();
  const title = medalTitle(t, medal);
  const rarity = t(`medals.rarity.${medal.rarity}`);
  const showProgress = !medal.unlocked && medal.progress !== null && medal.current !== null;
  const value = (n: number) => medalValue(t, medal.category, medal.unit, n);

  return (
    <button
      type="button"
      className="lu-medal-card"
      data-testid={`medal-${medal.id}`}
      data-unlocked={medal.unlocked}
      onClick={() => onOpen(medal)}
    >
      <MedalArt category={medal.category} rarity={medal.rarity} locked={!medal.unlocked} />
      <span className="text-[0.86rem] leading-tight font-extrabold">{title}</span>
      <bdi className="text-[0.77rem] font-bold text-muted">{medalTarget(t, medal)}</bdi>
      <span className="lu-rarity" data-rarity={medal.rarity}>
        {rarity}
      </span>
      {medal.unlocked && medal.unlockedAt ? (
        <span className="text-[0.72rem] font-semibold text-muted">
          {t('medals.unlockedOn', { date: formatMedalDate(medal.unlockedAt) })}
        </span>
      ) : (
        <span className="text-[0.72rem] font-semibold text-muted">{t('medals.locked')}</span>
      )}
      {showProgress && (
        <>
          <span
            className="lu-medal-progress mt-0.5"
            role="progressbar"
            aria-label={t('medals.detail.progress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(medal.progress! * 100)}
            aria-valuetext={formatPercent(Math.round(medal.progress! * 100))}
          >
            <span className="rtl:ms-auto" style={{ inlineSize: `${medal.progress! * 100}%` }} />
          </span>
          <bdi className="text-[0.7rem] font-bold text-muted tabular-nums">
            {medal.unit === 'percent'
              ? value(medal.current!)
              : t('medals.progress', { current: value(medal.current!), target: value(medal.threshold) })}
          </bdi>
        </>
      )}
    </button>
  );
};

export default memo(MedalCard);
