import { Preferences } from '@capacitor/preferences';
import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

import type { DashboardDto, JourneyDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import { adviceText } from '../body/planText';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import { Button, FeedCard, StateCard } from '../components/ui';
import { formatNumber } from '../i18n/format';
import AppHeader from './home/AppHeader';
import NotificationsSheet from './home/NotificationsSheet';
import Reveal from './home/Reveal';
import { earnsReveal } from './home/revealRules';
import ChangeRow from './journey/ChangeRow';
import { formatDay, formatFromNow } from './journey/dates';
import LevelEmblem from './journey/LevelEmblem';
import Road from './journey/Road';
import WeightSplit from './journey/WeightSplit';

/** The latest scan the member has seen on Home, so a new one can play the reveal once. */
const SEEN_KEY = 'lu.seenScan';

/** A chevron row: the quiet action at the bottom of a feed card. */
const CardLink: React.FC<{ to: string; testId: string; children: React.ReactNode }> = ({ to, testId, children }) => (
  <Link
    to={to}
    className="lu-press lu-focus flex min-h-11 w-full items-center justify-between gap-2 rounded-[12px] text-label text-brand-soft no-underline"
    data-testid={testId}
  >
    {children}
    <Icon name="chevronForward" className="rtl:-scale-x-100" />
  </Link>
);

/** Level, verdict and the road: where the member is, why, and how they got here. */
const Hero: React.FC<{ journey: JourneyDto }> = ({ journey }) => {
  const { t } = useTranslation();
  const kg = t('units.kg');
  return (
    <section
      aria-labelledby="journey-title"
      className="grid gap-4 rounded-[20px] border border-line bg-surface-1 p-4 md:col-span-2 md:p-5"
      data-testid="journey-hero"
    >
      <div className="flex items-center gap-4">
        <LevelEmblem level={journey.level} />
        <div className="grid min-w-0 gap-1.5">
          <h2 id="journey-title" className="m-0 text-label text-muted">
            {t('journey.sinceFirst')}
          </h2>
          <p className="m-0 text-verdict text-ink" data-testid="verdict" data-verdict={journey.verdict}>
            {t(`journey.verdict.${journey.verdict}`)}
          </p>
        </div>
      </div>
      <Road stops={journey.stops} nextDue={journey.nextScanDue} />
      {journey.nextLevel && (
        <p className="m-0 flex items-start gap-2 text-label text-muted" data-testid="next-level">
          <Icon name="flag" className="mt-0.5 flex-none text-brand-soft" />
          <span>
            {t('journey.nextLevel', {
              muscle: `${formatNumber(journey.nextLevel.muscleKg, 1)}\u00a0${kg}`,
              fat: `${formatNumber(journey.nextLevel.fatKg, 1)}\u00a0${kg}`,
            })}
          </span>
        </p>
      )}
    </section>
  );
};

/**
 * Home: a short story about the member's body, told top to bottom in cards
 * (ui-standards → Screens). Everything comes from one request, /me/dashboard;
 * the API decides the level, the verdict and what counts as a real change.
 */
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dashboard = useApi<DashboardDto>('/me/dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  // Refreshed with the data, so an app left open overnight greets the new day.
  const [today, setToday] = useState(() => new Date());

  const { setData, reload } = dashboard;
  useRefreshOnEnter(reload);
  const syncUnread = useCallback(
    (unread: number) => setData((d) => (d.unreadNotifications === unread ? d : { ...d, unreadNotifications: unread })),
    [setData],
  );

  const d = dashboard.status === 'ready' ? dashboard.data : null;
  const j = d?.journey ?? null;
  const hasScans = !!j && j.level > 0 && !!j.latest;

  // A scan the member hasn't seen yet plays the reveal once (or a quiet toast for a flat scan).
  // The first time the app opens, the latest scan simply counts as seen.
  const [revealOpen, setRevealOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const latestId = j?.stops[j.stops.length - 1]?.id ?? null;
  useEffect(() => {
    if (!j || latestId === null) return;
    let live = true;
    void (async () => {
      const { value } = await Preferences.get({ key: SEEN_KEY });
      if (!live || value === String(latestId)) return;
      await Preferences.set({ key: SEEN_KEY, value: String(latestId) });
      if (value === null) return;
      if (earnsReveal(j)) setRevealOpen(true);
      else setToast(t('reveal.onTheWay'));
    })();
    return () => {
      live = false;
    };
  }, [j, latestId, t]);

  return (
    <IonPage data-testid="page-home">
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={(e) => {
            setToday(new Date());
            void dashboard.reload().finally(() => e.detail.complete());
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        <div className="lu-page-body lu-tab-body" data-testid="page-body">
          <AppHeader
            firstName={d?.member.firstName ?? null}
            today={today}
            unread={d?.unreadNotifications ?? 0}
            onBell={() => setNotifOpen(true)}
          />

          {dashboard.status === 'loading' && (
            <div className="grid gap-3" aria-busy="true" data-testid="home-loading">
              <div className="lu-skeleton-card min-h-[220px] rounded-[20px]" />
              <div className="lu-skeleton-card min-h-[160px] rounded-[20px]" />
            </div>
          )}

          {dashboard.status === 'error' && (
            <StateCard
              icon="warning"
              tone="attention"
              title={t('journey.errorTitle')}
              message={t('home.error')}
              action={
                <Button variant="secondary" icon="refresh" onClick={() => void dashboard.retry()}>
                  {t('common.retry')}
                </Button>
              }
              testId="home-error"
            />
          )}

          {d && !hasScans && (
            <StateCard
              icon="scan"
              tone="brand"
              title={t('journey.empty.title')}
              message={t('journey.empty.message')}
              testId="home-empty"
            />
          )}

          {d && j && hasScans && j.latest && (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4" data-testid="home-feed">
              <Hero journey={j} />

              <FeedCard
                icon="scale"
                iconTone="lean"
                title={t('journey.body.title')}
                subtitle={[formatDay(j.latest.takenAt), j.latest.place, j.latest.machine].filter(Boolean).join(' · ')}
                testId="home-body"
                action={
                  <Button
                    icon="arrowForward"
                    onClick={() => history.push(`/tabs/scans/${j.stops[j.stops.length - 1].id}`)}
                    data-testid="home-report"
                  >
                    {t('journey.body.report')}
                  </Button>
                }
              >
                <WeightSplit
                  weightKg={j.latest.weightKg}
                  fatKg={j.latest.fatKg}
                  fatFreeMassKg={j.latest.fatFreeMassKg}
                />
                {j.sinceFirst && (
                  <div className="grid gap-3 border-t border-line pt-3">
                    <ChangeRow metric="muscleKg" change={j.sinceFirst.muscleKg} />
                    <ChangeRow metric="fatKg" change={j.sinceFirst.fatKg} />
                  </div>
                )}
              </FeedCard>

              {j.milestone && (
                <FeedCard
                  icon={j.milestone.key === 'levelUp' ? 'trophy' : 'flag'}
                  iconTone="brand"
                  title={t(`journey.milestone.${j.milestone.key}.title`, { level: j.milestone.level })}
                  subtitle={t(`journey.milestone.${j.milestone.key}.body`)}
                  testId="home-milestone"
                />
              )}

              {j.nextScanDue && (
                <FeedCard
                  icon="calendar"
                  iconTone="brand"
                  title={t('journey.next.title')}
                  subtitle={`${formatDay(j.nextScanDue)} · ${formatFromNow(j.nextScanDue, today)}`}
                  testId="home-next"
                >
                  <div className="grid gap-2">
                    <p className="m-0 text-label text-muted">{t('journey.next.conditions')}</p>
                    <ul className="m-0 grid list-none gap-2 p-0">
                      {(
                        [
                          ['clock', 'eat'],
                          ['dumbbell', 'train'],
                          ['history', 'time'],
                        ] as const
                      ).map(([icon, key]) => (
                        <li key={key} className="flex items-center gap-2 text-body text-ink">
                          <Icon name={icon} className="flex-none text-brand-soft" />
                          {t(`journey.next.${key}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FeedCard>
              )}

              {d.plan[0] && (
                <FeedCard
                  icon="target"
                  iconTone={d.plan[0].level === 'keep' ? 'good' : d.plan[0].level === 'act' ? 'attention' : 'brand'}
                  title={t('journey.plan.title')}
                  testId="home-plan"
                  action={
                    <CardLink to="/tabs/scans/details" testId="home-plan-open">
                      {t('journey.plan.action')}
                    </CardLink>
                  }
                >
                  <div className="grid gap-1">
                    <strong className="text-body font-semibold text-ink">{adviceText(t, d.plan[0]).title}</strong>
                    <span className="text-label font-normal text-muted">{adviceText(t, d.plan[0]).why}</span>
                  </div>
                </FeedCard>
              )}

              <FeedCard
                icon="target"
                iconTone="brand"
                title={t('journey.goal.title')}
                subtitle={d.mission ? d.mission.title : t('journey.goal.none')}
                testId="home-goal"
                action={
                  d.mission ? (
                    <CardLink to="/tabs/account/goals" testId="home-goal-all">
                      {t('journey.goal.all')}
                    </CardLink>
                  ) : (
                    <CardLink to="/tabs/account/goals/new" testId="home-goal-set">
                      {t('journey.goal.set')}
                    </CardLink>
                  )
                }
              >
                {d.mission && (
                  <div className="grid gap-2">
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-surface-3"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={d.mission.percent}
                      aria-label={d.mission.title}
                    >
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ inlineSize: `${d.mission.percent}%` }}
                      />
                    </div>
                    <span className="text-label text-muted" data-testid="home-goal-percent">
                      {t('journey.goal.done', { percent: formatNumber(d.mission.percent) })}
                    </span>
                  </div>
                )}
              </FeedCard>
            </div>
          )}
        </div>

        <NotificationsSheet
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          onUnreadChange={syncUnread}
          onScanResult={() => {
            setNotifOpen(false);
            if (hasScans) setRevealOpen(true);
          }}
        />
        {j && hasScans && <Reveal journey={j} open={revealOpen} onClose={() => setRevealOpen(false)} />}
        <Toast message={toast} onDone={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
