import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DashboardDto } from '../api/types';
import { useApi, useRefreshOnEnter } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon from '../components/PixelIcon';
import { formatNumber } from '../i18n/format';
import FitScoreCard from './home/FitScoreCard';
import { formatToday, greetingPart } from './home/homeText';
import MissionCard from './home/MissionCard';
import NotificationsSheet from './home/NotificationsSheet';
import RankCard from './home/RankCard';
import StatTiles from './home/StatTiles';
import './home/Dashboard.css';

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
  const part = greetingPart(today.getHours());
  const night = part === 'evening' || part === 'late';

  return (
    <IonPage data-testid="page-home">
      <IonContent className="lu-home">
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
          <div className="lu-home-hero">
            <div className="lu-home-header">
              <div className="lu-home-hello">
                <p className="lu-home-date" data-testid="today">
                  {formatToday(today)}
                </p>
                <h1 className="lu-home-greeting lu-display" data-testid="greeting">
                  {d ? (
                    <>
                      {t(`home.greeting.${part}`, { name: d.member.firstName })}
                      <span className="lu-home-orb">
                        <PixelIcon name={night ? 'moon' : 'sun'} />
                      </span>
                    </>
                  ) : (
                    <span className="lu-skeleton lu-skeleton-title" />
                  )}
                </h1>
              </div>
              <button
                type="button"
                className="lu-icon-button lu-bell"
                data-testid="bell"
                aria-label={
                  unread > 0 ? t('home.notifications.bellUnread', { n: unread }) : t('home.notifications.bell')
                }
                onClick={() => setNotifOpen(true)}
              >
                <IonIcon icon={notificationsOutline} aria-hidden="true" />
                {unread > 0 && (
                  <span className="lu-bell-badge" data-testid="bell-dot" aria-hidden="true">
                    {unread > 9 ? `${formatNumber(9)}+` : formatNumber(unread)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {dashboard.status === 'loading' && (
            <div className="lu-home-grid" aria-busy="true" data-testid="home-loading">
              <div className="lu-skeleton-card lu-skeleton-tall" />
              <div className="lu-skeleton-card" />
              <div className="lu-skeleton-card" />
              <div className="lu-tiles lu-home-span">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="lu-skeleton-card lu-skeleton-tile" />
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
            <div className="lu-home-grid">
              {d.member.showFitScore && <FitScoreCard fitScore={d.fitScore} />}
              <RankCard leaderboard={d.leaderboard} />
              <MissionCard mission={d.mission} />
              <div className="lu-home-span">
                <StatTiles wins={d.monthlyWins} memberSince={d.member.memberSince} today={today} />
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
