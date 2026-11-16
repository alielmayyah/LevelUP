import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import type { LeaderboardBoard, MemberProfileDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { memberAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import CtaButton from '../components/CtaButton';
import PixelIcon from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatCount, formatNumber, formatRank } from '../i18n/format';
import MetricIcon from './leaderboard/MetricIcon';
import MedalArt from './medals/MedalArt';
import { medalShowcase } from './medals/rules';
import './medals/Medals.scss';

/** Each board's tile takes its metric's hue, like the leaderboard. */
const BOARD_TONE: Record<LeaderboardBoard, string> = {
  score: 'border-gold/45 bg-gold/8',
  muscle: 'border-muscle/45 bg-muscle/8',
  bodyFat: 'border-fat/45 bg-fat/8',
};

const TAG = 'flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-[0.85rem]';
const CARD_TITLE = 'lu-display m-0 flex items-center gap-2 text-[1.6rem] leading-none text-ink ar:text-[1.3rem]';

/**
 * Another member's stats, opened from the community gym: their character,
 * age and height, where they stand on each board, and a compact medal grid.
 */
const MemberProfile: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const card = useApi<MemberProfileDto>(`/members/${Number(id)}`);
  const { data: member, reload } = card;
  useRefreshOnEnter(reload);
  const showcase = member && medalShowcase(member.medals);

  return (
    <TabPage
      testId="page-member"
      title={t('member.title')}
      titleIcon={<PixelIcon className="lu-title-icon flex-none text-[0.75em]" name="person" />}
      backTo="/tabs/community"
      onRefresh={reload}
    >
      {card.status === 'loading' && <div className="lu-skeleton-card" aria-busy="true" />}
      {card.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('member.failed')}</p>
          <CtaButton onClick={() => void card.retry()}>{t('common.retry')}</CtaButton>
        </div>
      )}
      {member && showcase && (
        <div className="mx-auto grid w-full max-w-[620px] gap-3.5">
          {/* Who: character, name, and two small tags. */}
          <section className="lu-px-card flex items-center gap-4" aria-labelledby="member-name">
            <div className="lu-avatar-frame grid h-36 w-[clamp(5rem,25vw,7rem)] shrink-0 place-items-center overflow-hidden rounded-[12px]">
              <Avatar
                config={memberAvatar(member)}
                crop="full"
                className="block h-[90%] w-full"
                testId="member-avatar"
              />
            </div>
            <div className="min-w-0">
              <h2
                id="member-name"
                className="lu-display m-0 text-[2rem] leading-[1.1] wrap-anywhere"
                data-testid="member-name"
              >
                <bdi>{member.name}</bdi>
              </h2>
              <dl className="mx-0 mt-2.5 mb-0 flex flex-wrap gap-1.5">
                <div className={TAG}>
                  <dt className="flex">
                    <PixelIcon className="flex-none text-[1.05rem] text-primary" name="calendar" />
                    <span className="sr-only">{t('profile.age')}</span>
                  </dt>
                  <dd className="m-0 font-extrabold whitespace-nowrap text-ink" data-testid="member-age">
                    {member.age !== null ? t('profile.ageValue', { value: formatNumber(member.age) }) : '—'}
                  </dd>
                </div>
                <div className={TAG}>
                  <dt className="flex">
                    <PixelIcon className="flex-none text-[1.05rem] text-accent" name="ruler" />
                    <span className="sr-only">{t('profile.height')}</span>
                  </dt>
                  <dd className="m-0 font-extrabold whitespace-nowrap text-ink" data-testid="member-height">
                    {member.heightCm
                      ? t('profile.heightValue', { value: formatNumber(member.heightCm), unit: t('units.cm') })
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Rank on each board, out of everyone on it right now. */}
          <section className="lu-px-card grid gap-3" aria-labelledby="member-ranks">
            <h2 id="member-ranks" className={CARD_TITLE}>
              <PixelIcon className="flex-none text-[0.8em] text-primary" name="podium" />
              {t('member.ranks')}
            </h2>
            <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
              {member.rankings.map(({ board, rank, total }) => (
                <li
                  key={board}
                  className={`grid content-start justify-items-center gap-1.5 rounded-lg border-2 px-1.5 pt-3 pb-2.5 text-center ${BOARD_TONE[board]}`}
                  data-testid={`member-rank-${board}`}
                >
                  <MetricIcon board={board} className="text-[1.75rem]" />
                  <span className="grid justify-items-center gap-0.5">
                    <span className="lu-display text-[1.9rem] leading-none text-ink">
                      {rank ? formatRank(rank) : '—'}
                    </span>
                    <span className="text-[0.7rem] leading-none font-bold text-muted">
                      {t('member.ofTotal', { total: formatCount(total) })}
                    </span>
                  </span>
                  {/* Two lines at most, so the three tiles line up. */}
                  <span className="grid min-h-[2.2em] place-items-center text-[0.75rem] leading-[1.1] font-extrabold text-balance text-ink">
                    {t(`leaderboard.board.${board}`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Medals: just the art, the best one earned in each category, locked ones dimmed. */}
          <section className="lu-px-card grid gap-3" aria-labelledby="member-medals">
            <div className="flex items-center justify-between gap-2">
              <h2 id="member-medals" className={CARD_TITLE}>
                <MetricIcon board="score" className="text-[0.8em]" />
                {t('medals.link')}
              </h2>
              <span className="lu-chip lu-chip-primary" data-testid="member-medal-count">
                {t('member.medalCount', {
                  unlocked: formatNumber(showcase.unlocked),
                  total: formatNumber(showcase.slots.length),
                })}
              </span>
            </div>
            <ul className="m-0 grid list-none grid-cols-5 gap-x-1 gap-y-3 p-0" data-testid="member-medal-grid">
              {showcase.slots.map(({ medal }) => (
                <li
                  key={medal.category}
                  className="grid justify-items-center gap-1 text-center"
                  data-unlocked={medal.unlocked}
                >
                  <MedalArt
                    category={medal.category}
                    rarity={medal.rarity}
                    locked={!medal.unlocked}
                    className="max-w-[3.5rem]"
                  />
                  <span
                    className={`text-[0.68rem] leading-tight font-bold text-balance ${medal.unlocked ? 'text-ink' : 'text-muted'}`}
                  >
                    {t(`medals.category.${medal.category}`)}
                    {!medal.unlocked && <span className="sr-only"> · {t('medals.locked')}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* A row like Settings' Sign out: the whole card is the link. */}
          <Link
            to="/tabs/community/leaderboard"
            className="lu-px-card flex min-h-[56px] items-center justify-between gap-3 px-4 py-2 font-bold text-ink no-underline"
            data-testid="member-boards-link"
          >
            <span className="flex items-center gap-2.5">
              <MetricIcon board="score" className="text-[1.3rem]" />
              {t('member.seeBoards')}
            </span>
            <PixelIcon className="text-muted rtl:-scale-x-100" name="chevronForward" />
          </Link>
        </div>
      )}
    </TabPage>
  );
};

export default MemberProfile;
