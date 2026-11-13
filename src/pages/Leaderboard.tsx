import { Preferences } from '@capacitor/preferences';
import { IonIcon } from '@ionic/react';
import {
  barbellOutline,
  eyeOffOutline,
  flameOutline,
  podiumOutline,
  trendingUpOutline,
  trophyOutline,
} from 'ionicons/icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveSettings } from '../api/settings';
import { LEADERBOARD_BOARDS, type LeaderboardBoard, type LeaderboardDto, type LeaderboardRow } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon from '../components/PixelIcon';
import { focusSibling, rovingTarget } from '../components/roving';
import PixelToast from '../components/PixelToast';
import TabPage from '../components/TabPage';
import { formatNumber, formatRank, formatSigned } from '../i18n/format';
import './leaderboard/Leaderboard.css';

const BOARD_KEY = 'lu.board';

const BOARD_ICONS: Record<LeaderboardBoard, string> = {
  score: trophyOutline,
  progress: trendingUpOutline,
  muscle: barbellOutline,
  fatLoss: flameOutline,
};

const isBoard = (v: unknown): v is LeaderboardBoard => LEADERBOARD_BOARDS.includes(v as LeaderboardBoard);

interface RowProps {
  row: LeaderboardRow;
  value: string;
  you: string;
  rowRef?: React.Ref<HTMLLIElement>;
}

/** Memoized so a long board re-renders only the rows that changed. */
const Row = memo(function Row({ row, value, you, rowRef }: RowProps) {
  const medal = row.rank <= 3 ? ` lu-medal-${row.rank}` : '';
  return (
    <li ref={rowRef} className={`lu-lb-row${row.isMe ? ' is-me' : ''}`} data-testid={row.isMe ? 'my-row' : 'row'}>
      <span className={`lu-lb-rank${medal}`}>{formatNumber(row.rank)}</span>
      <span className="lu-lb-name">
        <span className="lu-lb-name-text">{row.name}</span>
        {row.isMe && <span className="lu-chip lu-chip-primary">{you}</span>}
      </span>
      <span className="lu-lb-value">{value}</span>
    </li>
  );
});

/** Leaderboard tab: four boards of members who chose to share their results. */
const Leaderboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [board, setBoard] = useState<LeaderboardBoard>('score');
  const [joining, setJoining] = useState(false);
  const [joinFailed, setJoinFailed] = useState(false);
  const clearJoinFailed = useCallback(() => setJoinFailed(false), []);
  const data = useApi<LeaderboardDto>(`/leaderboard?board=${board}`);
  const myRow = useRef<HTMLLIElement>(null);
  useRefreshOnEnter(data.reload);

  // Remember the last board the member looked at.
  useEffect(() => {
    void Preferences.get({ key: BOARD_KEY }).then(({ value }) => isBoard(value) && setBoard(value));
  }, []);

  const choose = (b: LeaderboardBoard) => {
    setBoard(b);
    void Preferences.set({ key: BOARD_KEY, value: b });
  };

  const d = data.status === 'ready' && data.data.board === board ? data.data : null;
  const me = d?.rows.find((r) => r.isMe) ?? null;

  // Bring the member's own row into view once the board is loaded.
  const myId = me?.memberId ?? null;
  useEffect(() => {
    if (myId !== null) myRow.current?.scrollIntoView?.({ block: 'center' });
  }, [myId, board]);

  const format = (v: number) => {
    switch (board) {
      case 'score':
        return formatNumber(v);
      case 'progress':
        return formatSigned(v, t('units.pts'));
      case 'muscle':
        return formatSigned(v, t('units.kg'), { digits: 1 });
      case 'fatLoss':
        // The API counts fat lost as a positive number; show it as the drop it is.
        return formatSigned(-v, '%', { digits: 1 });
    }
  };

  const join = async () => {
    setJoining(true);
    try {
      await saveSettings({ fitScoreOnLeaderboard: true });
      await data.reload();
    } catch {
      setJoinFailed(true);
    } finally {
      setJoining(false);
    }
  };

  return (
    <TabPage
      testId="page-leaderboard"
      title={t('tabs.leaderboard')}
      subtitle={t('leaderboard.subtitle')}
      onRefresh={data.reload}
    >
      {d && !d.optedIn && (
        <div className="lu-px-card lu-lb-banner" data-testid="join-banner">
          <IonIcon icon={eyeOffOutline} aria-hidden="true" />
          <p>{t('leaderboard.hidden')}</p>
          <CtaButton onClick={() => void join()} disabled={joining} aria-busy={joining}>
            {t('leaderboard.join')}
          </CtaButton>
        </div>
      )}

      {me && (
        <section className="lu-px-card lu-lb-me" data-testid="my-rank">
          <div>
            <span className="lu-card-kicker">{t('leaderboard.yourRank')}</span>
            <strong className="lu-lb-me-rank lu-display">{formatRank(me.rank)}</strong>
            <span className="lu-lb-me-of">{t('leaderboard.of', { total: formatNumber(d!.rows.length) })}</span>
          </div>
          <span className="lu-lb-me-trophy" aria-hidden="true">
            <PixelIcon name="trophy" />
          </span>
        </section>
      )}

      <div className="lu-segment lu-lb-boards" role="tablist" aria-label={t('tabs.leaderboard')}>
        {LEADERBOARD_BOARDS.map((b, i) => (
          <button
            key={b}
            type="button"
            role="tab"
            aria-selected={board === b}
            tabIndex={board === b ? 0 : -1}
            data-testid={`board-${b}`}
            onClick={() => choose(b)}
            onKeyDown={(e) => {
              const to = rovingTarget(e, i, LEADERBOARD_BOARDS.length, i18n.dir() === 'rtl');
              if (to === null) return;
              choose(LEADERBOARD_BOARDS[to]);
              focusSibling(e, to);
            }}
          >
            <IonIcon icon={BOARD_ICONS[b]} aria-hidden="true" />
            {t(`leaderboard.board.${b}`)}
          </button>
        ))}
      </div>

      {d && d.optedIn && !me && (
        <p className="lu-lb-note" data-testid="no-scan-note">
          {t('leaderboard.noScan')}
        </p>
      )}

      {data.status === 'loading' && (
        <div aria-busy="true">
          <div className="lu-skeleton-card" />
        </div>
      )}

      {data.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('leaderboard.error')}</p>
          <CtaButton onClick={() => void data.retry()}>{t('common.retry')}</CtaButton>
        </div>
      )}

      {d && d.rows.length === 0 && (
        <div className="lu-px-card lu-state" data-testid="board-empty">
          <IonIcon icon={podiumOutline} aria-hidden="true" />
          <p>{t('leaderboard.emptyBoard')}</p>
        </div>
      )}

      {d && d.rows.length > 0 && (
        <div className="lu-lb-table">
          <div className="lu-lb-head" aria-hidden="true">
            <span>{t('leaderboard.rank')}</span>
            <span>{t('leaderboard.member')}</span>
            <span>{t(`leaderboard.value.${board}`)}</span>
          </div>
          <ol className="lu-lb-list" aria-label={t(`leaderboard.board.${board}`)}>
            {d.rows.map((r) => (
              <Row
                key={r.memberId}
                row={r}
                value={format(r.value)}
                you={t('leaderboard.you')}
                rowRef={r.isMe ? myRow : undefined}
              />
            ))}
          </ol>
        </div>
      )}

      <PixelToast message={joinFailed ? t('leaderboard.joinFailed') : null} onDone={clearJoinFailed} />
    </TabPage>
  );
};

export default Leaderboard;
