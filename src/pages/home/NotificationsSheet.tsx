import { IonIcon, IonModal } from '@ionic/react';
import {
  checkmarkDoneOutline,
  checkmarkOutline,
  close,
  notificationsOffOutline,
  notificationsOutline,
  scanOutline,
  timeOutline,
} from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../api/client';
import type { NotificationDto } from '../../api/types';
import { useApi } from '../../api/useApi';
import PixelIcon from '../../components/PixelIcon';
import { formatNumber } from '../../i18n/format';
import { formatTimeAgo } from './homeText';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tells Home how many are still unread, so the bell's dot stays in step. */
  onUnreadChange: (unread: number) => void;
}

const unreadOf = (list: NotificationDto[]) => list.filter((n) => n.readAt === null).length;

/** The list behind the bell. Opens as a sheet that swipes down to close. */
const NotificationsSheet: React.FC<Props> = ({ open, onClose, onUnreadChange }) => {
  const { t } = useTranslation();
  return (
    <IonModal
      // Name Ionic's inner role="dialog" directly (WCAG 4.1.2). An aria-label on the
      // modal element itself would also label the outer wrapper, outside any landmark.
      onWillPresent={(e) =>
        (e.target as HTMLElement).shadowRoot
          ?.querySelector('[role="dialog"]')
          ?.setAttribute('aria-label', t('home.notifications.title'))
      }
      isOpen={open}
      onDidDismiss={onClose}
      initialBreakpoint={0.75}
      breakpoints={[0, 0.75, 1]}
      className="lu-notif-modal"
    >
      {open && <NotificationList onClose={onClose} onUnreadChange={onUnreadChange} />}
    </IonModal>
  );
};

const NotificationList: React.FC<Omit<Props, 'open'>> = ({ onClose, onUnreadChange }) => {
  const { t } = useTranslation();
  const list = useApi<NotificationDto[]>('/me/notifications');
  const items = list.status === 'ready' ? list.data : null;

  useEffect(() => {
    if (items) onUnreadChange(unreadOf(items));
  }, [items, onUnreadChange]);

  const markRead = (n: NotificationDto) => {
    if (n.readAt !== null) return;
    const now = new Date().toISOString();
    list.setData((all) => all.map((x) => (x.id === n.id ? { ...x, readAt: now } : x)));
    void api(`/me/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => list.reload());
  };

  const markAll = () => {
    const now = new Date().toISOString();
    list.setData((all) => all.map((x) => ({ ...x, readAt: x.readAt ?? now })));
    void api('/me/notifications/read-all', { method: 'POST' }).catch(() => list.reload());
  };

  // "New" means unread when the sheet opened, or read since: a row doesn't jump
  // from New to Earlier the moment it is tapped.
  const [openedAt] = useState(() => new Date().toISOString());
  const isNew = (n: NotificationDto) => n.readAt === null || n.readAt >= openedAt;
  const unread = items ? unreadOf(items) : 0;
  const groups = items
    ? ([
        ['new', items.filter(isNew)],
        ['earlier', items.filter((n) => !isNew(n))],
      ] as const)
    : [];

  return (
    <section className="lu-notif" data-testid="notifications" aria-labelledby="notif-title">
      <div className="lu-notif-head">
        <h2 id="notif-title" className="lu-notif-title lu-display">
          {t('home.notifications.title')}
        </h2>
        <button type="button" className="lu-icon-button" aria-label={t('home.notifications.close')} onClick={onClose}>
          <IonIcon icon={close} aria-hidden="true" />
        </button>
      </div>

      {items && items.length > 0 && (
        <div className="lu-notif-bar">
          <span className={`lu-notif-count${unread === 0 ? ' is-clear' : ''}`} data-testid="unread-count">
            <IonIcon icon={unread === 0 ? checkmarkDoneOutline : notificationsOutline} aria-hidden="true" />
            {unread === 0
              ? t('home.notifications.empty')
              : t('home.notifications.unreadCount', { n: formatNumber(unread) })}
          </span>
          <button type="button" className="lu-link-button lu-notif-markall" onClick={markAll} disabled={unread === 0}>
            <IonIcon icon={checkmarkDoneOutline} aria-hidden="true" />
            {t('home.notifications.markAll')}
          </button>
        </div>
      )}

      {list.status === 'loading' && (
        <ul className="lu-notif-list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="lu-notif-skeleton">
              <span className="lu-skeleton lu-notif-skeleton-icon" />
              <span className="lu-notif-skeleton-text">
                <span className="lu-skeleton" style={{ inlineSize: '60%' }} />
                <span className="lu-skeleton" style={{ inlineSize: '85%' }} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {list.status === 'error' && (
        <div className="lu-state" role="alert">
          <p>{t('common.error')}</p>
          <button type="button" className="lu-link-button" onClick={() => void list.retry()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {items && items.length === 0 && (
        <div className="lu-state">
          <IonIcon icon={notificationsOffOutline} aria-hidden="true" />
          <p>{t('home.notifications.empty')}</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="lu-notif-scroll">
          {groups.map(([group, rows]) =>
            rows.length === 0 ? null : (
              <section key={group} className="lu-notif-group" aria-labelledby={`notif-${group}`}>
                <h3 id={`notif-${group}`} className="lu-notif-group-title">
                  {t(`home.notifications.${group}`)}
                </h3>
                <ul className="lu-notif-list">
                  {rows.map((n) => {
                    const isUnread = n.readAt === null;
                    const mission = n.type === 'MISSION_COMPLETE';
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`lu-notif-item${isUnread ? ' is-unread' : ''}`}
                          data-testid="notification"
                          onClick={() => markRead(n)}
                        >
                          <span className={`lu-notif-icon${mission ? ' is-mission' : ''}`} aria-hidden="true">
                            {mission ? <PixelIcon name="trophy" /> : <IonIcon icon={scanOutline} />}
                          </span>
                          <span className="lu-notif-text">
                            <span className="lu-notif-item-title">{t(n.title.key, n.title.params ?? {})}</span>
                            <span className="lu-notif-body">{t(n.body.key, n.body.params ?? {})}</span>
                            <span className="lu-notif-time">
                              <IonIcon icon={timeOutline} aria-hidden="true" />
                              {formatTimeAgo(n.createdAt)}
                            </span>
                          </span>
                          {isUnread ? (
                            <>
                              <span className="lu-notif-dot" aria-hidden="true" />
                              <span className="lu-visually-hidden">{t('home.notifications.unread')}</span>
                            </>
                          ) : (
                            <IonIcon
                              className="lu-notif-read"
                              icon={checkmarkOutline}
                              aria-label={t('home.notifications.read')}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default NotificationsSheet;
