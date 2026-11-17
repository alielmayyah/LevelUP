import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatPercent } from '../../i18n/format';
import { medalTarget, medalTitle } from './format';
import MedalArt from './MedalArt';
import type { MedalStatus } from './types';

interface Props {
  medal: MedalStatus;
  onOpen: (medal: MedalStatus) => void;
}

/**
 * A medal in the Trophy Room grid: the art (which shows its rarity), the title
 * and the target, plus a bar while it is still locked. Tapping it opens the
 * detail sheet with the rest: rarity, date, exact numbers.
 */
const MedalCard: React.FC<Props> = ({ medal, onOpen }) => {
  const { t } = useTranslation();
  const showProgress = !medal.unlocked && medal.progress !== null && medal.current !== null;
  const percent = showProgress ? Math.round(medal.progress! * 100) : 0;

  return (
    <button
      type="button"
      className="lu-medal-card"
      data-testid={`medal-${medal.id}`}
      data-unlocked={medal.unlocked}
      onClick={() => onOpen(medal)}
    >
      <MedalArt category={medal.category} rarity={medal.rarity} locked={!medal.unlocked} />
      <span className="text-[0.86rem] leading-tight font-semibold">{medalTitle(t, medal)}</span>
      <bdi className="text-[0.77rem] font-normal text-muted">{medalTarget(t, medal)}</bdi>
      {/* The art greys out a locked medal; this says it in words. */}
      <span className="sr-only">{t(medal.unlocked ? 'medals.unlocked' : 'medals.locked')}</span>
      {showProgress && (
        <span
          className="lu-medal-progress mt-1"
          role="progressbar"
          aria-label={t('medals.detail.progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={formatPercent(percent)}
        >
          <span className="rtl:ms-auto" style={{ inlineSize: `${medal.progress! * 100}%` }} />
        </span>
      )}
    </button>
  );
};

export default memo(MedalCard);
