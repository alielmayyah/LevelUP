import { IonIcon } from '@ionic/react';
import { chevronForward, podiumOutline } from 'ionicons/icons';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { LeaderboardSummary } from '../../api/types';
import PixelIcon from '../../components/PixelIcon';
import { formatNumber, formatPercent, formatRank } from '../../i18n/format';

/**
 * Where the member stands on the Top Score board, or why they aren't ranked yet.
 * A hidden heading makes the card reachable by heading navigation. The button
 * keeps its full visible text as its name (WCAG 2.5.3, label in name).
 */
const RankCard: React.FC<{ leaderboard: LeaderboardSummary }> = ({ leaderboard }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const ids = useId();
  const headingId = `${ids}-h`;
  const s = leaderboard.standing;

  const heading = (
    <h2 id={headingId} className="lu-visually-hidden">
      {t('home.rank.title')}
    </h2>
  );

  if (!leaderboard.optedIn || !s) {
    const joinable = !leaderboard.optedIn;
    const body = (
      <>
        <span className="lu-icon-tile" aria-hidden="true">
          <IonIcon icon={podiumOutline} />
        </span>
        <span className="lu-rank-text">
          <strong>{t(joinable ? 'home.rank.join' : 'home.rank.title')}</strong>
          <span>{t(joinable ? 'home.rank.joinHint' : 'home.rank.noScan')}</span>
        </span>
      </>
    );
    return (
      <section className="lu-card-slot" aria-labelledby={headingId}>
        {heading}
        {joinable ? (
          <button
            type="button"
            className="lu-px-card lu-rank"
            data-testid="rank-card"
            onClick={() => history.push('/tabs/profile')}
          >
            {body}
            <IonIcon className="lu-chevron" icon={chevronForward} aria-hidden="true" />
          </button>
        ) : (
          <div className="lu-px-card lu-rank" data-testid="rank-card">
            {body}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="lu-card-slot" aria-labelledby={headingId}>
      {heading}
      <button
        type="button"
        className="lu-px-card lu-rank"
        data-testid="rank-card"
        onClick={() => history.push('/tabs/leaderboard')}
      >
        <span className="lu-icon-tile lu-icon-tile-gold" aria-hidden="true">
          <PixelIcon name="trophy" />
        </span>
        <span className="lu-rank-text">
          <span className="lu-rank-line">
            <strong id={`${ids}-num`} className="lu-rank-number" data-testid="rank-number">
              {t('home.rank.ofTotal', { rank: formatRank(s.rank), total: formatNumber(s.totalMembers) })}
            </strong>
            <span id={`${ids}-top`} className="lu-chip lu-chip-primary">
              {t('home.rank.top', { percent: formatPercent(s.topPercent) })}
            </span>
          </span>
          <span id={`${ids}-more`} className="lu-rank-more">
            <span>{t('home.rank.behind', { count: s.membersBehind })}</span>
            <span className="lu-rank-nudge">
              {s.pointsToNextRank === null
                ? t('home.rank.first')
                : t('home.rank.toClimb', { count: s.pointsToNextRank, rank: formatRank(s.rank - 1) })}
            </span>
          </span>
        </span>
        <IonIcon className="lu-chevron" icon={chevronForward} aria-hidden="true" />
      </button>
    </section>
  );
};

export default RankCard;
