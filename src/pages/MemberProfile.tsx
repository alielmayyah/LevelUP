import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import type { LeaderboardBoard, MemberProfileDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { memberAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import TabPage from '../components/TabPage';
import { formatCount, formatNumber, formatRank } from '../i18n/format';
import MedalArt from './medals/MedalArt';
import { medalShowcase } from './medals/rules';
import './medals/Medals.scss';

const BOARD_ICON: Record<LeaderboardBoard, PixelIconName> = {
  score: 'trophy',
  muscle: 'muscle',
  bodyFat: 'flame',
};

const TAG = 'flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 text-[0.85rem]';
const CARD_TITLE = 'm-0 flex items-center gap-2 text-[0.85rem] font-extrabold text-muted';

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
    <TabPage testId="page-member" title={t('member.title')} backTo="/tabs/community" onRefresh={reload}>
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
          <section className="lu-px-card grid gap-2" aria-labelledby="member-ranks">
            <h2 id="member-ranks" className={CARD_TITLE}>
              <PixelIcon name="podium" />
              {t('member.ranks')}
            </h2>
            <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
              {member.rankings.map(({ board, rank, total }) => (
                <li
                  key={board}
                  className="grid content-start justify-items-center gap-1 rounded-lg bg-surface-2 px-1 py-2.5 text-center"
                  data-testid={`member-rank-${board}`}
                >
                  <PixelIcon className="text-[1.4rem]" name={BOARD_ICON[board]} />
                  <span className="lu-display text-[1.6rem] leading-none text-ink">
                    {rank ? formatRank(rank) : '—'}
                  </span>
                  <span className="text-[0.7rem] font-bold text-muted">
                    {t('member.ofTotal', { total: formatCount(total) })}
                  </span>
                  <span className="text-[0.72rem] leading-tight font-extrabold text-ink">
                    {t(`leaderboard.board.${board}`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Medals: just the art, the best one earned in each category, locked ones dimmed. */}
          <section className="lu-px-card grid gap-2.5" aria-labelledby="member-medals">
            <div className="flex items-center justify-between gap-2">
              <h2 id="member-medals" className={CARD_TITLE}>
                <PixelIcon name="trophy" />
                {t('medals.link')}
              </h2>
              <span className="lu-chip lu-chip-primary" data-testid="member-medal-count">
                {t('member.medalCount', {
                  unlocked: formatNumber(showcase.unlocked),
                  total: formatNumber(showcase.slots.length),
                })}
              </span>
            </div>
            <ul className="m-0 grid list-none grid-cols-5 gap-x-1.5 gap-y-2.5 p-0" data-testid="member-medal-grid">
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
                    className="max-w-[3.25rem]"
                  />
                  <span
                    className={`text-[0.65rem] leading-tight font-bold ${medal.unlocked ? 'text-ink' : 'text-muted'}`}
                  >
                    {t(`medals.category.${medal.category}`)}
                    {!medal.unlocked && <span className="sr-only"> · {t('medals.locked')}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Link
            to="/tabs/community/leaderboard"
            className="lu-link-button inline-flex items-center justify-center gap-2 no-underline"
          >
            <PixelIcon name="trophy" />
            {t('member.seeBoards')}
          </Link>
        </div>
      )}
    </TabPage>
  );
};

export default MemberProfile;
