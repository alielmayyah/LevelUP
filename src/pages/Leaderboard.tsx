import { Preferences } from '@capacitor/preferences';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveSettings } from '../api/settings';
import {
  AGE_GROUPS,
  LEADERBOARD_BOARDS,
  type AgeGroup,
  type LeaderboardBoard,
  type LeaderboardDto,
  type LeaderboardRow,
  type Sex,
} from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import Avatar from '../avatar/Avatar';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import '../avatar/avatar.scss';
import { focusSibling, rovingTarget } from '../components/roving';
import PixelToast from '../components/PixelToast';
import TabPage from '../components/TabPage';
import { formatCount, formatNumber, formatRank } from '../i18n/format';
import './leaderboard/Leaderboard.scss';
import MetricIcon from './leaderboard/MetricIcon';
import Pager from '../components/Pager';
import Podium from './leaderboard/Podium';
import { rowAvatar } from './leaderboard/rowAvatar';

/** Rank, name, value: the header and every row share these columns. */
const COLUMNS = 'grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2.5';

const BOARD_KEY = 'lu.board';
const AGE_KEY = 'lu.ageGroup';

/** Rows per page below the podium. The pager shows only when a board has more. */
const PAGE_SIZE = 10;

const BOARD_ICONS: Record<LeaderboardBoard, PixelIconName> = {
  score: 'trophy',
  muscle: 'muscle',
  bodyFat: 'bodyFat',
};

const isBoard = (v: unknown): v is LeaderboardBoard => LEADERBOARD_BOARDS.includes(v as LeaderboardBoard);
const isAgeGroup = (v: unknown): v is AgeGroup => AGE_GROUPS.includes(v as AgeGroup);

interface AgeFilterProps {
  value: AgeGroup;
  mine: AgeGroup | null;
  onChange: (age: AgeGroup) => void;
}

/**
 * A funnel button beside the board tabs. It opens a small menu of age brackets
 * (a radio group: arrow keys move, Enter or a tap picks and closes). Escape or a
 * tap outside closes it. A dot on the button shows a bracket is applied.
 */
function AgeFilter({ value, mine, onChange }: AgeFilterProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // Focus the checked option when the menu opens.
    panel.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, close]);

  const label = t('leaderboard.age.label');
  return (
    <div ref={root} className="relative flex-none">
      <button
        ref={button}
        type="button"
        className="lu-icon-button lu-filter-button"
        aria-label={value === 'all' ? label : `${label}: ${t(`leaderboard.age.${value}`)}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="age-filter-menu"
        data-testid="age-filter-button"
        data-active={value !== 'all'}
        onClick={() => setOpen((o) => !o)}
      >
        <PixelIcon name="filter" />
      </button>
      {open && (
        <div
          ref={panel}
          id="age-filter-menu"
          className="lu-px-card lu-filter-menu"
          role="radiogroup"
          aria-label={label}
          data-testid="age-filter"
        >
          <p className="m-0 px-2 pt-1 pb-1.5 text-[0.75rem] font-extrabold text-muted" aria-hidden="true">
            {label}
          </p>
          {AGE_GROUPS.map((age, i) => (
            <button
              key={age}
              type="button"
              role="radio"
              aria-checked={value === age}
              tabIndex={value === age ? 0 : -1}
              data-testid={`age-${age}`}
              onClick={() => {
                onChange(age);
                close(true);
              }}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, AGE_GROUPS.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(AGE_GROUPS[to]);
                // Options sit after the heading, so skip it when moving focus.
                panel.current?.querySelectorAll<HTMLElement>('[role="radio"]')[to]?.focus();
              }}
            >
              <span className="lu-filter-check" aria-hidden="true">
                {value === age && <PixelIcon name="check" />}
              </span>
              <bdi className="flex-1">{t(`leaderboard.age.${age}`)}</bdi>
              {age === mine && (
                <span
                  className="lu-age-mine"
                  aria-label={t('leaderboard.age.yours')}
                  title={t('leaderboard.age.yours')}
                >
                  <PixelIcon name="person" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  row: LeaderboardRow;
  division: Sex;
  board: LeaderboardBoard;
  value: string;
  you: string;
  rowRef?: React.Ref<HTMLLIElement>;
}

/** Memoized so a long board re-renders only the rows that changed. */
const Row = memo(function Row({ row, division, board, value, you, rowRef }: RowProps) {
  const medal = row.rank <= 3 ? `lu-medal-${row.rank}` : '';
  return (
    <li
      ref={rowRef}
      // Off-screen rows skip layout and paint (content-visibility), so 100+ rows still scroll smoothly.
      className={`lu-lb-row ${COLUMNS} min-h-[52px] rounded-[10px] px-3 py-1.5 [contain-intrinsic-size:auto_52px] [content-visibility:auto] ${row.isMe ? 'is-me' : ''}`}
      data-testid={row.isMe ? 'my-row' : 'row'}
    >
      <span className={`lu-lb-rank grid size-[30px] place-items-center rounded-md text-[0.85rem] font-black ${medal}`}>
        {formatCount(row.rank)}
      </span>
      <span className="flex min-w-0 items-center gap-2 font-extrabold">
        <span className="lu-avatar-frame block size-9 flex-none overflow-hidden rounded-[8px]">
          <Avatar config={rowAvatar(row, division)} className="block size-full" />
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
  const [age, setAge] = useState<AgeGroup>('all');
  const [joining, setJoining] = useState(false);
  const [joinFailed, setJoinFailed] = useState(false);
  const clearJoinFailed = useCallback(() => setJoinFailed(false), []);
  const data = useApi<LeaderboardDto>(`/leaderboard?board=${board}&age=${age}`);
  const myRow = useRef<HTMLLIElement>(null);
  useRefreshOnEnter(data.reload);

  // Remember the last board and age group the member looked at.
  useEffect(() => {
    void Preferences.get({ key: BOARD_KEY }).then(({ value }) => isBoard(value) && setBoard(value));
    void Preferences.get({ key: AGE_KEY }).then(({ value }) => isAgeGroup(value) && setAge(value));
  }, []);

  const chooseAge = (a: AgeGroup) => {
    setAge(a);
    void Preferences.set({ key: AGE_KEY, value: a });
  };

  const choose = (b: LeaderboardBoard) => {
    setBoard(b);
    void Preferences.set({ key: BOARD_KEY, value: b });
  };

  // While the next board loads, the last one stays on screen (dimmed) instead of blanking.
  const d = data.status === 'ready' ? data.data : null;
  const stale = !!d && (d.board !== board || (d.ageGroup ?? 'all') !== age);
  const view = d ? `${d.board}:${d.ageGroup ?? 'all'}` : '';

  // Pages of the list below the podium. Each board opens on the page with the member's own row.
  const rest = d ? d.rows.slice(3) : [];
  const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const myIndex = rest.findIndex((r) => r.isMe);
  const [pick, setPick] = useState<{ view: string; page: number } | null>(null);
  const page = Math.min(
    pick && d && pick.view === view ? pick.page : myIndex >= 0 ? Math.floor(myIndex / PAGE_SIZE) : 0,
    pages - 1,
  );
  const shown = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const me = d?.rows.find((r) => r.isMe) ?? null;

  // Bring the member's own row into view once the board is loaded, without scrolling if it already is.
  const myId = me?.memberId ?? null;
  useEffect(() => {
    if (myId !== null) myRow.current?.scrollIntoView?.({ block: 'nearest' });
  }, [myId, board, age]);

  // Where the member's own row is: on screen, above it, or below it (or on another page).
  // While it's off screen, a bar docked above the tab bar says where they stand.
  const [myRowPlace, setMyRowPlace] = useState<'visible' | 'above' | 'below'>('visible');
  const myPage = myIndex >= 0 ? Math.floor(myIndex / PAGE_SIZE) : -1;
  useEffect(() => {
    const el = myRow.current;
    if (!el) {
      // Not rendered: the row is on another page of the list.
      setMyRowPlace(myPage > page ? 'below' : 'above');
      return;
    }
    if (typeof IntersectionObserver === 'undefined') return;
    // The bottom margin keeps a row hidden behind the tab bar counted as off screen.
    const io = new IntersectionObserver(
      ([entry]) =>
        setMyRowPlace(entry.isIntersecting ? 'visible' : entry.boundingClientRect.top < 0 ? 'above' : 'below'),
      { rootMargin: '0px 0px -140px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [myId, view, page, myPage, stale]);

  const jumpToMe = () => {
    if (d && myPage >= 0 && myPage !== page) setPick({ view, page: myPage });
    const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // After the page swap renders, center the row.
    requestAnimationFrame(() =>
      myRow.current?.scrollIntoView?.({ block: 'center', behavior: smooth ? 'smooth' : 'auto' }),
    );
  };

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
      backTo="/tabs/community"
      title={t('tabs.leaderboard')}
      titleIcon={<PixelIcon className="lu-title-icon flex-none text-[0.75em]" name="trophy" />}
      subtitle={d ? t(`leaderboard.division.${d.division}`) : t('leaderboard.subtitle')}
      onRefresh={data.reload}
      actions={
        me && d && !stale ? (
          <div
            className="lu-lb-me flex flex-none items-center gap-2 rounded-[10px] border-2 px-2.5 py-1 min-[420px]:ps-1"
            data-testid="my-rank"
            role="group"
            aria-label={t('leaderboard.yourRank')}
          >
            {/* The face only where there is room: on a phone the title needs the width. */}
            <span className="lu-avatar-frame hidden size-10 flex-none overflow-hidden rounded-[8px] min-[420px]:block">
              <Avatar config={rowAvatar(me, d.division)} className="block size-full" />
            </span>
            <span className="grid leading-none">
              <strong className="lu-display text-[1.6rem] text-ink">{formatRank(me.rank)}</strong>
              <span className="text-[0.7rem] font-bold text-muted">
                {t('leaderboard.of', { total: formatCount(d.rows.length) })}
              </span>
            </span>
          </div>
        ) : undefined
      }
    >
      {d && !d.optedIn && (
        <div className="lu-px-card mb-4 grid justify-items-center gap-2.5 text-center" data-testid="join-banner">
          <PixelIcon className="text-[28px] text-muted" name="eyeOff" />
          <p className="m-0 font-bold">{t('leaderboard.hidden')}</p>
          <CtaButton className="w-[min(100%,240px)]" onClick={() => void join()} disabled={joining} aria-busy={joining}>
            {t('leaderboard.join')}
          </CtaButton>
        </div>
      )}

      <div className="flex items-stretch gap-2">
        <div
          className="lu-segment lu-board-tabs mb-0 min-w-0 flex-1 grid-flow-row grid-cols-3"
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
              <PixelIcon name={BOARD_ICONS[b]} />
              {t(`leaderboard.board.${b}`)}
            </button>
          ))}
        </div>
        <AgeFilter value={age} mine={d?.myAgeGroup ?? null} onChange={chooseAge} />
      </div>

      {age !== 'all' && (
        <div className="mt-2.5 flex">
          <button
            type="button"
            className="lu-chip lu-chip-primary min-h-[32px] cursor-pointer gap-1.5 px-2.5"
            data-testid="age-chip"
            aria-label={t('leaderboard.age.clear', { group: t(`leaderboard.age.${age}`) })}
            onClick={() => chooseAge('all')}
          >
            <PixelIcon name="filter" />
            <bdi>{t(`leaderboard.age.${age}`)}</bdi>
            <PixelIcon name="close" />
          </button>
        </div>
      )}
      <div className="mb-4" />

      {d && !stale && d.optedIn && !me && d.ageGroup !== 'all' && d.myAgeGroup !== d.ageGroup && (
        <p
          className="mx-0 mt-0 mb-3 rounded-lg border-2 border-dashed border-line px-3 py-2.5 font-bold text-muted"
          data-testid="other-age-note"
        >
          {t('leaderboard.age.otherGroup')}
        </p>
      )}

      {d && d.optedIn && !me && (d.ageGroup === 'all' || d.myAgeGroup === d.ageGroup) && (
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
          key={view}
          className={`lu-board-swap transition-opacity duration-150 ${stale ? 'opacity-50' : ''}`}
          aria-busy={stale}
        >
          {d && d.rows.length === 0 && (
            <div className="lu-px-card lu-state" data-testid="board-empty">
              <PixelIcon name="podium" />
              <p>{t(d.ageGroup && d.ageGroup !== 'all' ? 'leaderboard.age.empty' : 'leaderboard.emptyBoard')}</p>
            </div>
          )}

          {d && d.rows.length > 0 && (
            <Podium
              rows={d.rows.slice(0, 3)}
              division={d.division}
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
                    division={d.division}
                    board={d.board}
                    value={format(r.value, d.board)}
                    you={t('leaderboard.you')}
                    rowRef={r.isMe ? myRow : undefined}
                  />
                ))}
              </ol>
              {pages > 1 && <Pager page={page} pages={pages} onPage={(p) => setPick({ view, page: p })} />}
            </div>
          )}
        </div>
      )}

      {me && d && !stale && myRowPlace !== 'visible' && (
        <>
          {/* Room at the end of the list so the dock never covers the last row. */}
          <div className="h-[72px]" aria-hidden="true" />
          <button type="button" className={`lu-me-dock ${COLUMNS}`} data-testid="my-rank-dock" onClick={jumpToMe}>
            <span className="sr-only">{t('leaderboard.jumpToMe')}</span>
            <span className="lu-lb-rank grid size-[30px] place-items-center rounded-md text-[0.85rem] font-black">
              {formatCount(me.rank)}
            </span>
            <span className="flex min-w-0 items-center gap-2 font-extrabold">
              <span className="lu-avatar-frame block size-9 flex-none overflow-hidden rounded-[8px]">
                <Avatar config={rowAvatar(me, d.division)} className="block size-full" />
              </span>
              <span className="truncate" dir="auto">
                {me.name}
              </span>
              <span className="lu-chip lu-chip-primary">{t('leaderboard.you')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-display text-[1.35rem] whitespace-nowrap text-primary dark:text-secondary">
                {format(me.value, d.board)}
              </span>
              <PixelIcon
                name="chevronDown"
                className={`text-[14px] text-muted ${myRowPlace === 'above' ? '-scale-y-100' : ''}`}
              />
            </span>
          </button>
        </>
      )}

      <PixelToast message={joinFailed ? t('leaderboard.joinFailed') : null} onDone={clearJoinFailed} />
    </TabPage>
  );
};

export default Leaderboard;
