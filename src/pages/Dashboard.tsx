import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { DashboardDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import Avatar from '../avatar/Avatar';
import { memberAvatar } from '../avatar/catalog';
import '../avatar/avatar.scss';
import CtaButton from '../components/CtaButton';
import { formatNumber } from '../i18n/format';
import FitScoreCard from './home/FitScoreCard';
import Icon from '../components/Icon';
import { formatToday } from './home/homeText';
import MissionCard from './home/MissionCard';
import NotificationsSheet from './home/NotificationsSheet';
import RankCard from './home/RankCard';
import StatTiles from './home/StatTiles';
import { HOME_GRID, HOME_SPAN, TILES } from './home/layout';
import './home/Dashboard.scss';

/** Home tab. Everything on it comes from one request: GET /me/dashboard. */
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dashboard = useApi<DashboardDto>('/me/dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  // Refreshed with the data, so an app left open overnight greets the new day.
  const [today, setToday] = useState(() => new Date());

  const { setData, reload } = dashboard;
  // Back from Profile with Show FitScore turned off: the card hides without a reload.
  useRefreshOnEnter(reload);
  const syncUnread = useCallback(
    (unread: number) => setData((d) => (d.unreadNotifications === unread ? d : { ...d, unreadNotifications: unread })),
    [setData],
  );

  const d = dashboard.status === 'ready' ? dashboard.data : null;
  const unread = d?.unreadNotifications ?? 0;

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
          <div className="mb-4">
            <div className="flex items-start gap-3">
              {d && (
                <Link
                  to="/tabs/profile"
                  className="lu-avatar-frame lu-home-pfp block size-14 flex-none overflow-hidden rounded-[12px]"
                  aria-label={t('home.openProfile')}
                  data-testid="home-avatar"
                >
                  <Avatar config={memberAvatar(d.member)} className="block size-full" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 mb-1 text-[0.875rem] font-bold text-muted" data-testid="today">
                  {formatToday(today)}
                </p>
                <h1
                  className="lu-display m-0 text-[clamp(2.25rem,10vw,3rem)] leading-none wrap-anywhere text-ink"
                  data-testid="greeting"
                >
                  {d ? t('home.hello', { name: d.member.firstName }) : <span className="lu-skeleton h-[1em] w-[70%]" />}
                </h1>
              </div>
              <button
                type="button"
                className="lu-icon-button"
                data-testid="bell"
                aria-label={
                  unread > 0 ? t('home.notifications.bellUnread', { n: unread }) : t('home.notifications.bell')
                }
                onClick={() => setNotifOpen(true)}
              >
                <Icon name="bell" />
                {unread > 0 && (
                  <span
                    className="absolute -end-[7px] -top-[7px] box-border grid h-[22px] min-w-[22px] place-items-center rounded-full border border-page bg-danger px-[5px] text-[0.72rem] leading-none font-bold text-surface dark:text-scrim"
                    data-testid="bell-dot"
                    aria-hidden="true"
                  >
                    {unread > 9 ? `${formatNumber(9)}+` : formatNumber(unread)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {dashboard.status === 'loading' && (
            <div className={HOME_GRID} aria-busy="true" data-testid="home-loading">
              <div className="lu-skeleton-card min-h-[150px]" />
              <div className="lu-skeleton-card" />
              <div className="lu-skeleton-card" />
              <div className={`${TILES} ${HOME_SPAN}`}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="lu-skeleton-card min-h-[84px]" />
                ))}
              </div>
            </div>
          )}

          {dashboard.status === 'error' && (
            <div className="lu-state" role="alert">
              <p>{t('home.error')}</p>
              <CtaButton onClick={() => void dashboard.retry()}>{t('common.retry')}</CtaButton>
            </div>
          )}

          {d && (
            <div className={HOME_GRID}>
              {d.member.showFitScore && <FitScoreCard fitScore={d.fitScore} />}
              <RankCard leaderboard={d.leaderboard} />
              <MissionCard mission={d.mission} />
              <div className={HOME_SPAN}>
                <StatTiles wins={d.monthlyWins} today={today} />
              </div>
            </div>
          )}
        </div>

        <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} onUnreadChange={syncUnread} />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
