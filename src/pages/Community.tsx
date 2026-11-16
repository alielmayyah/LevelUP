import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { onAvatarSaved } from '../api/avatar';
import type { LeaderboardDto, ProfileDto, Sex } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { memberAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import Pager from '../components/Pager';
import PixelIcon from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatCount, formatRank } from '../i18n/format';
import { rowAvatar } from './leaderboard/rowAvatar';
import gymRoom from './community/gym-room.webp';
import './community/Community.scss';

// The racks leave less room at the back. Further forward, the rows widen into the open floor.
const FLOOR_ROWS = [
  [43.5, [31, 50, 69]],
  [54, [31, 50, 69]],
  [64.5, [26, 42, 58, 74]],
  [75, [26, 42, 58, 74]],
  [85.5, [14, 32, 50, 68, 86]],
  [96, [14, 32, 68, 86]],
] as const;
const PLACES = FLOOR_ROWS.flatMap(([depth, positions]) =>
  positions.map((x) => ({ insetInlineStart: `${x}%`, insetBlockStart: `${depth}%` })),
);
// Filler gym-goers for empty spots, in the viewer's division: men see men, women see women.
const guestsFor = (sex: Sex) => PLACES.map((_, index) => memberAvatar({ memberId: -1 - index, sex, avatar: null }));
const GUESTS: Record<Sex, ReturnType<typeof guestsFor>> = { MALE: guestsFor('MALE'), FEMALE: guestsFor('FEMALE') };
const FRAME_COLORS = ['order-2 border-gold', 'order-1 border-silver', 'order-3 border-bronze'];

const Community: React.FC = () => {
  const { t } = useTranslation();
  const { data: member, reload: refreshMember, setData: setMember } = useApi<ProfileDto>('/me');
  const board = useApi<LeaderboardDto>('/leaderboard?board=score&age=all');
  const { data: roster, reload: refreshRoster } = board;
  const refresh = useCallback(() => Promise.all([refreshMember(), refreshRoster()]), [refreshMember, refreshRoster]);
  useRefreshOnEnter(refresh);

  useEffect(
    () =>
      onAvatarSaved((memberId, avatar) =>
        setMember((current) => (current.memberId === memberId ? { ...current, avatar } : current)),
      ),
    [setMember],
  );

  const [requestedRoom, setRoom] = useState(0);
  const [selectedMember, selectMember] = useState<number | null>(null);
  const ranked = useMemo(
    () => roster?.rows.map((row) => ({ row, avatar: rowAvatar(row, roster.division) })) ?? [],
    [roster],
  );
  // Only members shared by the leaderboard get interactive spots on the floor.
  const others = useMemo(
    () => ranked.filter(({ row }) => !row.isMe).sort((a, b) => a.row.memberId - b.row.memberId),
    [ranked],
  );
  const podium = ranked.slice(0, 3);
  const selfAvatar = useMemo(() => member && memberAvatar(member), [member]);
  const rooms = Math.max(1, Math.ceil(others.length / PLACES.length));
  const room = Math.min(rooms - 1, requestedRoom);
  const visible = others.slice(room * PLACES.length, (room + 1) * PLACES.length);
  const selected = visible.find(({ row }) => row.memberId === selectedMember);
  const failed = board.status === 'error';

  return (
    <TabPage
      testId="page-community"
      title={t('tabs.community')}
      titleIcon={<PixelIcon className="lu-title-icon flex-none text-[0.75em]" name="community" />}
      onRefresh={refresh}
      fill
    >
      <section
        className="mx-auto flex w-full max-w-[clamp(360px,56svh,580px)] flex-1 flex-col gap-2"
        aria-label={t('community.gym')}
      >
        <div className="lu-community-room relative isolate min-h-[28rem] flex-1" data-testid="community-gym">
          <div
            className="lu-community-floor absolute inset-x-0 bottom-0"
            aria-hidden="true"
            data-testid="community-floor"
          />
          <img className="lu-community-art absolute inset-0 size-full" src={gymRoom} alt="" />
          <div className="lu-wall-board-slot">
            <div className="lu-wall-board" data-testid="community-wall-board">
              <span className="flex min-w-0 items-center justify-center gap-1 text-gold" aria-hidden="true">
                <PixelIcon name="trophy" className="shrink-0" />
                <span className="text-splash-text">{t('community.leaderboards')}</span>
                <PixelIcon name="chevronForward" className="shrink-0 rtl:-scale-x-100" />
              </span>
              {podium.length > 0 && (
                <span className="flex min-h-0 justify-center gap-1.5" aria-hidden="true">
                  {podium.map(({ row, avatar }, index) => (
                    <span
                      key={row.memberId}
                      title={row.name}
                      className={`lu-wall-portrait relative aspect-square min-w-0 border-2 ${FRAME_COLORS[index]}`}
                      data-testid="community-board-portrait"
                    >
                      <Avatar config={row.isMe && selfAvatar ? selfAvatar : avatar} className="block size-full" />
                      <span className="lu-wall-rank absolute end-0 bottom-0">{formatCount(row.rank)}</span>
                    </span>
                  ))}
                </span>
              )}
              <Link
                to="/tabs/community/leaderboard"
                className="lu-wall-board-link absolute inset-0"
                aria-label={t('community.leaderboards')}
              />
            </div>
          </div>
          {roster &&
            PLACES.map((position, index) => {
              const person = visible[index];
              if (!person) {
                return (
                  <span
                    key={`guest-${index}`}
                    className="lu-community-person pointer-events-none opacity-70"
                    style={position}
                    aria-hidden="true"
                    data-testid="community-guest"
                  >
                    <Avatar config={GUESTS[roster.division][index]} crop="full" className="block size-full" />
                  </span>
                );
              }

              const { row, avatar } = person;
              const isSelected = row.memberId === selectedMember;
              return (
                <button
                  key={row.memberId}
                  type="button"
                  className="lu-community-person"
                  style={position}
                  onClick={() => selectMember(isSelected ? null : row.memberId)}
                  aria-pressed={isSelected}
                  aria-label={row.name}
                  data-testid="community-member"
                >
                  <Avatar config={avatar} crop="full" className="block size-full" />
                  {isSelected && (
                    <span className="lu-community-tag lu-community-name" aria-hidden="true" dir="auto">
                      {row.name}
                    </span>
                  )}
                </button>
              );
            })}
          {selected && (
            <div className="lu-community-card" role="group" aria-label={selected.row.name} data-testid="community-card">
              <span className="lu-avatar-frame grid size-11 flex-none place-items-center overflow-hidden rounded-md">
                <Avatar config={selected.avatar} className="block size-full" />
              </span>
              <span className="grid min-w-0 flex-1 leading-tight">
                <bdi className="truncate font-extrabold">{selected.row.name}</bdi>
                {/* A little about them: their rank and FitScore on the gym board. */}
                <span
                  className="lu-community-card-info flex items-center gap-1 text-[0.75rem] font-bold whitespace-nowrap"
                  data-testid="community-card-info"
                >
                  <span aria-hidden="true">{formatRank(selected.row.rank)}</span>
                  <PixelIcon name="trophy" className="ms-1 flex-none text-gold" />
                  <span aria-hidden="true">{formatCount(selected.row.value)}</span>
                  <span className="sr-only">
                    {t('community.cardInfo', {
                      rank: formatCount(selected.row.rank),
                      score: formatCount(selected.row.value),
                    })}
                  </span>
                </span>
              </span>
              <Link
                to={`/tabs/community/member/${selected.row.memberId}`}
                className="lu-community-visit"
                data-testid="community-visit"
              >
                <PixelIcon name="person" className="flex-none" />
                {t('community.profile')}
              </Link>
              <button
                type="button"
                className="lu-community-close"
                onClick={() => selectMember(null)}
                aria-label={t('community.close')}
              >
                <PixelIcon name="close" />
              </button>
            </div>
          )}
          {selfAvatar && (
            <div className="lu-community-person lu-community-self pointer-events-none" data-testid="community-self">
              <Avatar config={selfAvatar} crop="full" className="block size-full" />
              <span className="lu-community-tag">{t('leaderboard.you')}</span>
            </div>
          )}
        </div>

        {selected && (
          <p className="sr-only" role="status">
            <bdi>{selected.row.name}</bdi>
          </p>
        )}
        {board.status === 'loading' && <div className="lu-skeleton-card" aria-busy="true" />}
        {failed && (
          <div className="lu-state" role="alert">
            <p>{t('community.failed')}</p>
            <button type="button" className="lu-link-button" onClick={() => void board.retry()}>
              {t('common.retry')}
            </button>
          </div>
        )}
        {roster && !others.length && <p className="m-0 py-1 text-center text-muted">{t('community.empty')}</p>}
        {rooms > 1 && (
          <Pager
            page={room}
            pages={rooms}
            label={t('community.rooms')}
            onPage={(index) => {
              selectMember(null);
              setRoom(index);
            }}
          />
        )}
      </section>
    </TabPage>
  );
};

export default Community;
