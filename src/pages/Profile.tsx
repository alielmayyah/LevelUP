import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { onAvatarSaved } from '../api/avatar';
import type { ProfileDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { memberAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import { ageOn } from '../body/age';
import CtaButton from '../components/CtaButton';
import Icon from '../components/Icon';
import TabPage from '../components/TabPage';
import { formatNumber } from '../i18n/format';
import MedalShowcase from './medals/MedalShowcase';
import { useMedalData } from './medals/useMedalData';
import './medals/Medals.scss';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const profile = useApi<ProfileDto>('/me');
  const { data: member, reload: refreshProfile, setData } = profile;
  const medals = useMedalData(member);
  const { categories, reload: refreshMedals } = medals;
  const refresh = useCallback(() => Promise.all([refreshProfile(), refreshMedals()]), [refreshProfile, refreshMedals]);
  useRefreshOnEnter(refresh);

  useEffect(
    () =>
      onAvatarSaved((memberId, avatar) =>
        setData((current) => (current.memberId === memberId ? { ...current, avatar } : current)),
      ),
    [setData],
  );

  const age = member?.birthDate ? ageOn(new Date(member.birthDate), new Date()) : NaN;
  const height = member?.heightCm;

  return (
    <TabPage
      testId="page-profile"
      title={t('tabs.profile')}
      titleIcon={<Icon className="lu-title-icon flex-none text-[0.75em]" name="person" />}
      onRefresh={refresh}
      actions={
        <Link
          className="lu-link-button inline-flex shrink-0 items-center gap-1.5 no-underline"
          to="/tabs/profile/settings"
        >
          <Icon name="settings" />
          {t('profile.settings')}
        </Link>
      }
    >
      {profile.status === 'loading' && <div className="lu-skeleton-card" aria-busy="true" />}
      {profile.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('profile.error')}</p>
          <CtaButton onClick={() => void profile.retry()}>{t('common.retry')}</CtaButton>
        </div>
      )}
      {member && (
        <div className="grid gap-4 wide:grid-cols-[1fr_1fr] wide:items-start">
          <section className="lu-card lu-hero grid gap-4 p-5" aria-labelledby="profile-name">
            <div className="flex items-center gap-4">
              <div className="lu-avatar-frame grid size-[clamp(4.75rem,22vw,6rem)] shrink-0 place-items-center overflow-hidden rounded-[22px]">
                <Avatar
                  config={memberAvatar(member)}
                  sex={member.sex}
                  className="block size-full"
                  testId="profile-avatar"
                />
              </div>
              <div className="min-w-0">
                <h2
                  className="lu-display m-0 text-[clamp(1.4rem,6.5vw,1.75rem)] leading-[1.1] wrap-anywhere text-hero"
                  id="profile-name"
                  data-testid="profile-name"
                >
                  <bdi>
                    {member.firstName} {member.lastName}
                  </bdi>
                </h2>
                <p className="mx-0 mt-1.5 mb-0 flex items-center gap-1.5 text-[0.85rem] font-normal text-hero-muted">
                  <Icon className="flex-none" name="idCard" />
                  {t('profile.fitId', { id: member.fitId })}
                </p>
                {/* Age and height: small tags under the name. */}
                <dl className="mx-0 mt-2.5 mb-0 flex flex-wrap gap-1.5">
                  <div className="lu-hero-chip flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.85rem]">
                    <dt className="flex">
                      <Icon className="flex-none text-[1.05rem] text-hero-up" name="calendar" />
                      <span className="sr-only">{t('profile.age')}</span>
                    </dt>
                    <dd className="m-0 font-semibold whitespace-nowrap text-hero" data-testid="profile-age">
                      {Number.isFinite(age) && age >= 0
                        ? t('profile.ageValue', { value: formatNumber(age) })
                        : t('profile.unknown')}
                    </dd>
                  </div>
                  <div className="lu-hero-chip flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.85rem]">
                    <dt className="flex">
                      <Icon className="flex-none text-[1.05rem] text-hero-up" name="ruler" />
                      <span className="sr-only">{t('profile.height')}</span>
                    </dt>
                    <dd className="m-0 font-semibold whitespace-nowrap text-hero" data-testid="profile-height">
                      {typeof height === 'number' && Number.isFinite(height) && height > 0
                        ? t('profile.heightValue', { value: formatNumber(height), unit: t('units.cm') })
                        : t('profile.unknown')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <Link
              to="/tabs/profile/character"
              className="lu-hero-button inline-flex min-h-12 items-center justify-center gap-2 px-5 text-[0.95rem] no-underline transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
              data-testid="customize-character"
            >
              <Icon name="smile" />
              {t('profile.customize')}
            </Link>
          </section>

          <MedalShowcase categories={categories} failed={medals.failed} retry={medals.retry} />
        </div>
      )}
    </TabPage>
  );
};

export default Profile;
