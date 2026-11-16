import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import type { LeaderboardSummary } from '../../api/types';
import PixelIcon from '../../components/PixelIcon';
import { formatCount, formatPercent, formatRank } from '../../i18n/format';

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
    <h2 id={headingId} className="sr-only">
      {t('home.rank.title')}
    </h2>
  );

  if (!leaderboard.optedIn || !s) {
    const joinable = !leaderboard.optedIn;
    const body = (
      <>
        <span className="lu-icon-tile" aria-hidden="true">
          <PixelIcon name="podium" />
        </span>
        <span className="grid min-w-0 gap-0.5 text-[0.85rem] text-muted">
          <strong className="text-[1rem] text-ink">{t(joinable ? 'home.rank.join' : 'home.rank.title')}</strong>
          <span>{t(joinable ? 'home.rank.joinHint' : 'home.rank.noScan')}</span>
        </span>
      </>
    );
    return (
      <section className="grid" aria-labelledby={headingId}>
        {heading}
        {joinable ? (
          <button
            type="button"
            className="lu-px-card flex items-center gap-3"
            data-testid="rank-card"
            onClick={() => history.push('/tabs/community/leaderboard')}
          >
            {body}
            <PixelIcon className="lu-chevron" name="chevronForward" />
          </button>
        ) : (
          <div className="lu-px-card flex items-center gap-3" data-testid="rank-card">
            {body}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="grid" aria-labelledby={headingId}>
      {heading}
      <button
        type="button"
        className="lu-px-card flex items-center gap-3"
        data-testid="rank-card"
        onClick={() => history.push('/tabs/community/leaderboard')}
      >
        <span className="lu-icon-tile lu-icon-tile-gold" aria-hidden="true">
          <PixelIcon name="trophy" />
        </span>
        <span className="grid min-w-0 gap-0.5 text-[0.85rem] text-muted">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <strong
              id={`${ids}-num`}
              className="font-display text-[1.75rem] leading-[1.1] font-normal text-ink ar:font-bold"
              data-testid="rank-number"
            >
              {t('home.rank.ofTotal', { rank: formatRank(s.rank), total: formatCount(s.totalMembers) })}
            </strong>
            <span id={`${ids}-top`} className="lu-chip lu-chip-primary">
              {t('home.rank.top', { percent: formatPercent(s.topPercent) })}
            </span>
          </span>
          <span id={`${ids}-more`} className="grid gap-0.5">
            <span>{t('home.rank.behind', { count: s.membersBehind })}</span>
            <span className="font-bold text-ink">
              {s.pointsToNextRank === null
                ? t('home.rank.first')
                : t('home.rank.toClimb', { count: s.pointsToNextRank, rank: formatRank(s.rank - 1) })}
            </span>
          </span>
        </span>
        <PixelIcon className="lu-chevron" name="chevronForward" />
      </button>
    </section>
  );
};

export default RankCard;
