import { Preferences } from '@capacitor/preferences';
import { IonIcon } from '@ionic/react';
import { barbellOutline, eyeOffOutline, flameOutline, podiumOutline, trophyOutline } from 'ionicons/icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveSettings } from '../api/settings';
import { LEADERBOARD_BOARDS, type LeaderboardBoard, type LeaderboardDto, type LeaderboardRow } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import Avatar from '../avatar/Avatar';
import '../avatar/avatar.scss';
import { focusSibling, rovingTarget } from '../components/roving';
import PixelToast from '../components/PixelToast';
import TabPage from '../components/TabPage';
import { formatNumber, formatRank } from '../i18n/format';
import './leaderboard/Leaderboard.scss';
import MetricIcon from './leaderboard/MetricIcon';
import Pager from './leaderboard/Pager';
import Podium from './leaderboard/Podium';
import { rowAvatar } from './leaderboard/rowAvatar';

/** Rank, name, value: the header and every row share these columns. */
const COLUMNS = 'grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2.5';

const BOARD_KEY = 'lu.board';

/** Rows per page below the podium. The pager shows only when a board has more. */
const PAGE_SIZE = 10;

const BOARD_ICONS: Record<LeaderboardBoard, string> = {
  score: trophyOutline,
  muscle: barbellOutline,
  bodyFat: flameOutline,
};

const isBoard = (v: unknown): v is LeaderboardBoard => LEADERBOARD_BOARDS.includes(v as LeaderboardBoard);

interface RowProps {
  row: LeaderboardRow;
  board: LeaderboardBoard;
  value: string;
  you: string;
  rowRef?: React.Ref<HTMLLIElement>;
}

/** Memoized so a long board re-renders only the rows that changed. */
const Row = memo(function Row({ row, board, value, you, rowRef }: RowProps) {
  const medal = row.rank <= 3 ? `lu-medal-${row.rank}` : '';
  return (
    <li
      ref={rowRef}
      // Off-screen rows skip layout and paint (content-visibility), so 100+ rows still scroll smoothly.
      className={`lu-lb-row ${COLUMNS} min-h-[52px] rounded-[10px] px-3 py-1.5 [contain-intrinsic-size:auto_52px] [content-visibility:auto] ${row.isMe ? 'is-me' : ''}`}
      data-testid={row.isMe ? 'my-row' : 'row'}
    >
      <span className={`lu-lb-rank grid size-[30px] place-items-center rounded-md text-[0.85rem] font-black ${medal}`}>
        {formatNumber(row.rank)}
      </span>
      <span className="flex min-w-0 items-center gap-2 font-extrabold">
        <span className="lu-avatar-frame block size-9 flex-none overflow-hidden rounded-[8px]">
          <Avatar config={rowAvatar(row)} className="block size-full" />
        </span>
        <span className="truncate" dir="auto">
          {row.name}
        </span>
        {row.isMe && <span className="lu-chip lu-chip-primary">{you}</span>}
      </span>
      <span className="flex items-center gap-1.5">
        <MetricIcon board={board} className="text-[16px]" />
        <span className="font-display text-[1.45rem] font-normal whitespace-nowrap text-primary dark:text-secondary">
          {value}
        </span>
      </span>
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

  // While the next board loads, the last one stays on screen (dimmed) instead of blanking.
  const d = data.status === 'ready' ? data.data : null;
  const stale = !!d && d.board !== board;

  // Pages of the list below the podium. Each board opens on the page with the member's own row.
  const rest = d ? d.rows.slice(3) : [];
  const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const myIndex = rest.findIndex((r) => r.isMe);
  const [pick, setPick] = useState<{ board: LeaderboardBoard; page: number } | null>(null);
  const page = Math.min(
    pick && d && pick.board === d.board ? pick.page : myIndex >= 0 ? Math.floor(myIndex / PAGE_SIZE) : 0,
    pages - 1,
  );
  const shown = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const me = d?.rows.find((r) => r.isMe) ?? null;

  // Bring the member's own row into view once the board is loaded, without scrolling if it already is.
  const myId = me?.memberId ?? null;
  useEffect(() => {
    if (myId !== null) myRow.current?.scrollIntoView?.({ block: 'nearest' });
  }, [myId, board]);

  const format = (v: number, on: LeaderboardBoard) => {
    switch (on) {
      case 'score':
        return formatNumber(v);
      case 'muscle':
        return `${formatNumber(v, 1)} ${t('units.kg')}`;
      case 'bodyFat':
        return `${formatNumber(v, 1)}%`;
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
      subtitle={d ? t(`leaderboard.division.${d.division}`) : t('leaderboard.subtitle')}
      onRefresh={data.reload}
      actions={
        me && !stale ? (
          <div
            className="lu-lb-me flex flex-none items-center gap-2 rounded-[10px] border-2 py-1 ps-1 pe-2.5"
            data-testid="my-rank"
            role="group"
            aria-label={t('leaderboard.yourRank')}
          >
            <span className="lu-avatar-frame block size-10 flex-none overflow-hidden rounded-[8px]">
              <Avatar config={rowAvatar(me)} className="block size-full" />
            </span>
            <span className="grid leading-none">
              <strong className="lu-display text-[1.6rem] text-ink">{formatRank(me.rank)}</strong>
              <span className="text-[0.7rem] font-bold text-muted">
                {t('leaderboard.of', { total: formatNumber(d!.rows.length) })}
              </span>
            </span>
          </div>
        ) : undefined
      }
    >
      {d && !d.optedIn && (
        <div className="lu-px-card mb-4 grid justify-items-center gap-2.5 text-center" data-testid="join-banner">
          <IonIcon className="text-[28px] text-muted" icon={eyeOffOutline} aria-hidden="true" />
          <p className="m-0 font-bold">{t('leaderboard.hidden')}</p>
          <CtaButton className="w-[min(100%,240px)]" onClick={() => void join()} disabled={joining} aria-busy={joining}>
            {t('leaderboard.join')}
          </CtaButton>
        </div>
      )}

      <div
        className="lu-segment lu-board-tabs grid-flow-row grid-cols-3"
        role="tablist"
        aria-label={t('tabs.leaderboard')}
      >
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
        <p
          className="mx-0 mt-0 mb-3 rounded-lg border-2 border-dashed border-line px-3 py-2.5 font-bold text-muted"
          data-testid="no-scan-note"
        >
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

      {d && (
        <div
          key={d.board}
          className={`lu-board-swap transition-opacity duration-150 ${stale ? 'opacity-50' : ''}`}
          aria-busy={stale}
        >
          {d && d.rows.length === 0 && (
            <div className="lu-px-card lu-state" data-testid="board-empty">
              <IonIcon icon={podiumOutline} aria-hidden="true" />
              <p>{t('leaderboard.emptyBoard')}</p>
            </div>
          )}

          {d && d.rows.length > 0 && (
            <Podium
              rows={d.rows.slice(0, 3)}
              board={d.board}
              format={(v) => format(v, d.board)}
              you={t('leaderboard.you')}
              myRef={myRow}
            />
          )}

          {d && d.rows.length > 3 && (
            <div>
              <div
                className={`${COLUMNS} px-3 pt-0 pb-1.5 text-[0.75rem] font-extrabold text-muted`}
                aria-hidden="true"
              >
                <span>{t('leaderboard.rank')}</span>
                <span>{t('leaderboard.member')}</span>
                <span className="text-end">{t(`leaderboard.value.${d.board}`)}</span>
              </div>
              <ol
                className="m-0 grid list-none gap-2 p-0"
                start={4 + page * PAGE_SIZE}
                aria-label={t(`leaderboard.board.${d.board}`)}
              >
                {shown.map((r) => (
                  <Row
                    key={r.memberId}
                    row={r}
                    board={d.board}
                    value={format(r.value, d.board)}
                    you={t('leaderboard.you')}
                    rowRef={r.isMe ? myRow : undefined}
                  />
                ))}
              </ol>
              {pages > 1 && <Pager page={page} pages={pages} onPage={(p) => setPick({ board: d.board, page: p })} />}
            </div>
          )}
        </div>
      )}

      <PixelToast message={joinFailed ? t('leaderboard.joinFailed') : null} onDone={clearJoinFailed} />
    </TabPage>
  );
};

export default Leaderboard;
