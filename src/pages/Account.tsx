import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { AssessmentDto, DashboardDto, ProfileDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import { ageOn } from '../body/age';
import Icon, { type IconName } from '../components/Icon';
import TabPage from '../components/TabPage';
import { Button, FeedCard, StateCard } from '../components/ui';
import { formatNumber } from '../i18n/format';

const initialsOf = (first: string, last: string) =>
  [first, last]
    .map((n) => [...n.trim()][0] ?? '')
    .join('')
    .toUpperCase();

/** One row in a grouped list: icon, label, chevron. */
const Row: React.FC<{ to: string; icon: IconName; label: string; testId: string }> = ({ to, icon, label, testId }) => (
  <li>
    <Link
      to={to}
      className="lu-press lu-focus flex min-h-14 items-center gap-3 rounded-[14px] px-1 text-ink no-underline"
      data-testid={testId}
    >
      <Icon name={icon} className="flex-none text-[1.25rem] text-brand-soft" />
      <span className="flex-1 text-body">{label}</span>
      <Icon name="chevronForward" className="flex-none text-muted rtl:-scale-x-100" />
    </Link>
  </li>
);

/** A milestone: earned in its color, the next one as a dashed outline that states its real-change rule. */
const Badge: React.FC<{ label: string; earned: boolean; icon: IconName; testId: string }> = ({
  label,
  earned,
  icon,
  testId,
}) => (
  <li
    className={`flex min-h-12 items-center gap-2.5 rounded-[14px] px-3 py-2 ${earned ? 'bg-brand-tint' : 'border border-dashed border-dash'}`}
    data-testid={testId}
    data-earned={earned}
  >
    <Icon name={icon} className={`flex-none text-[1.15rem] ${earned ? 'text-brand-soft' : 'text-muted'}`} />
    <span className={`text-label ${earned ? 'text-ink' : 'text-muted'}`}>{label}</span>
  </li>
);

/**
 * Account tab: who the member is, where they scan, what they've earned, and
 * the way to goals, their character and medals, and settings. Initials, not
 * an avatar, stand for the member here and on Home.
 */
const Account: React.FC = () => {
  const { t } = useTranslation();
  const me = useApi<ProfileDto>('/me');
  const dashboard = useApi<DashboardDto>('/me/dashboard');
  const list = useApi<AssessmentDto[]>('/me/assessments');
  const reload = () => Promise.all([me.reload(), dashboard.reload(), list.reload()]);
  useRefreshOnEnter(reload);

  const member = me.status === 'ready' ? me.data : null;
  const j = dashboard.status === 'ready' ? (dashboard.data.journey ?? null) : null;
  const scans = list.status === 'ready' ? list.data : null;
  const failed = me.status === 'error' || dashboard.status === 'error' || list.status === 'error';
  const kg = t('units.kg');

  // Each gym and machine the member has scanned at, with how many scans.
  const places = new Map<string, number>();
  for (const a of scans ?? []) {
    const p = a.origin?.place;
    if (!p) continue;
    const key = [p.name, p.branch, a.origin?.device ? `${a.origin.device.brand} ${a.origin.device.model}` : null]
      .filter(Boolean)
      .join(' · ');
    places.set(key, (places.get(key) ?? 0) + 1);
  }

  const age = member?.birthDate ? ageOn(new Date(member.birthDate), new Date()) : NaN;

  return (
    <TabPage testId="page-account" title={t('tabs.account')} subtitle={t('account.subtitle')} onRefresh={reload}>
      {!member && !failed && <div className="lu-skeleton-card min-h-[160px] rounded-[20px]" aria-busy="true" />}
      {failed && (
        <StateCard
          icon="warning"
          tone="attention"
          title={t('journey.errorTitle')}
          message={t('profile.error')}
          action={
            <Button
              variant="secondary"
              icon="refresh"
              onClick={() => void Promise.all([me.retry(), dashboard.retry(), list.retry()])}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {member && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <section
            aria-labelledby="account-name"
            className="flex items-center gap-4 rounded-[20px] border border-line bg-surface-1 p-4 md:p-5"
            data-testid="account-profile"
          >
            <span
              className="grid size-16 flex-none place-items-center rounded-full bg-brand-tint text-card-title text-brand-soft"
              aria-hidden="true"
            >
              {initialsOf(member.firstName, member.lastName)}
            </span>
            <div className="grid min-w-0 gap-1">
              <h2 id="account-name" className="m-0 text-card-title wrap-anywhere text-ink" data-testid="account-name">
                <bdi>
                  {member.firstName} {member.lastName}
                </bdi>
              </h2>
              <p className="m-0 flex items-center gap-1.5 text-label font-normal text-muted">
                <Icon name="idCard" className="flex-none" />
                {t('account.fitId', { id: member.fitId })}
              </p>
              <p className="m-0 flex flex-wrap gap-x-3 text-label font-normal text-muted">
                {Number.isFinite(age) && age >= 0 && (
                  <span data-testid="account-age">{t('account.age', { value: formatNumber(age) })}</span>
                )}
                {member.heightCm > 0 && (
                  <span data-testid="account-height">
                    {t('account.height', { value: formatNumber(member.heightCm) })}
                  </span>
                )}
              </p>
            </div>
          </section>

          <FeedCard icon="place" iconTone="brand" title={t('account.places')} testId="account-places">
            {places.size > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0">
                {[...places].map(([place, count]) => (
                  <li key={place} className="flex items-center justify-between gap-3 text-body text-ink">
                    <span className="min-w-0">{place}</span>
                    <span className="flex-none text-label text-muted">{t('journey.scanCount', { count })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-body text-muted">{t('account.noPlaces')}</p>
            )}
          </FeedCard>

          {j && j.level > 0 && (
            <FeedCard icon="trophy" iconTone="brand" title={t('account.badges')} testId="account-badges">
              <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                <Badge label={t('account.badgeFirst')} earned icon="flag" testId="badge-first" />
                {Array.from({ length: j.level - 1 }, (_, i) => i + 2).map((level) => (
                  <Badge
                    key={level}
                    label={t('account.badgeLevel', { level })}
                    earned
                    icon="trophy"
                    testId={`badge-level-${level}`}
                  />
                ))}
                {j.nextLevel && (
                  <Badge
                    label={t('account.badgeNext', {
                      level: j.level + 1,
                      muscle: `${formatNumber(j.nextLevel.muscleKg, 1)}\u00a0${kg}`,
                      fat: `${formatNumber(j.nextLevel.fatKg, 1)}\u00a0${kg}`,
                    })}
                    earned={false}
                    icon="lock"
                    testId="badge-next"
                  />
                )}
              </ul>
            </FeedCard>
          )}

          <FeedCard icon="settings" iconTone="neutral" title={t('account.more')} testId="account-more">
            <ul className="m-0 grid list-none gap-1 p-0">
              <Row to="/tabs/account/goals" icon="target" label={t('tabs.goals')} testId="account-goals" />
              <Row to="/tabs/account/profile" icon="smile" label={t('account.character')} testId="account-character" />
              <Row
                to="/tabs/account/settings"
                icon="settings"
                label={t('account.settings')}
                testId="account-settings"
              />
            </ul>
          </FeedCard>
        </div>
      )}
    </TabPage>
  );
};

export default Account;
