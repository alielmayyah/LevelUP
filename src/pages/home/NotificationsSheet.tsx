import { IonModal } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../api/client';
import type { NotificationDto } from '../../api/types';
import { useApi } from '../../api/useApi';
import Icon from '../../components/Icon';
import { formatCount } from '../../i18n/format';
import { useReveal } from '../../motion/gsapMotion';
import { formatTimeAgo } from './homeText';
// The sheet's tints live with Home's custom styles.
import './Dashboard.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tells Home how many are still unread, so the bell's dot stays in step. */
  onUnreadChange: (unread: number) => void;
  /** A new-result notification opens the reveal. */
  onScanResult?: () => void;
}

const LIST = 'm-0 grid list-none gap-2.5 p-0';
const PAD = 'px-[calc(18px+var(--ion-safe-area-left,0px))]';

const unreadOf = (list: NotificationDto[]) => list.filter((n) => n.readAt === null).length;

/** The list behind the bell. Opens as a sheet that swipes down to close. */
const NotificationsSheet: React.FC<Props> = ({ open, onClose, onUnreadChange, onScanResult }) => {
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
      {open && <NotificationList onClose={onClose} onUnreadChange={onUnreadChange} onScanResult={onScanResult} />}
    </IonModal>
  );
};

const NotificationList: React.FC<Omit<Props, 'open'>> = ({ onClose, onUnreadChange, onScanResult }) => {
  const { t } = useTranslation();
  const list = useApi<NotificationDto[]>('/me/notifications');
  const items = list.status === 'ready' ? list.data : null;
  // Each time the sheet opens, the rows slide in one after another.
  const scroller = useRef<HTMLDivElement>(null);
  useReveal(scroller, list.status);

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
    <section
      className="lu-notif flex h-full flex-col text-ink"
      data-testid="notifications"
      aria-labelledby="notif-title"
    >
      <div className={`flex items-center gap-3 pt-6 pb-3 ${PAD}`}>
        <span
          className="lu-notif-badge grid size-12 flex-none place-items-center rounded-2xl text-[1.4rem]"
          aria-hidden="true"
        >
          <Icon name="bell" />
        </span>
        <h2 id="notif-title" className="lu-display m-0 flex-1 text-[1.9rem] leading-none">
          {t('home.notifications.title')}
        </h2>
        <button type="button" className="lu-icon-button" aria-label={t('home.notifications.close')} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      {items && items.length > 0 && (
        <div className={`flex items-center justify-between gap-2 pt-0 pb-3 ${PAD}`}>
          <span
            className={`lu-notif-count inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-semibold ${unread === 0 ? 'is-clear' : ''}`}
            data-testid="unread-count"
          >
            <Icon className="text-[1.05rem]" name={unread === 0 ? 'checkDouble' : 'bell'} />
            {unread === 0
              ? t('home.notifications.empty')
              : t('home.notifications.unreadCount', { n: formatCount(unread) })}
          </span>
          <button
            type="button"
            className="lu-notif-markall inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 font-inherit text-[0.85rem] font-semibold"
            onClick={markAll}
            disabled={unread === 0}
          >
            <Icon className="text-[1.1rem]" name="checkDouble" />
            {t('home.notifications.markAll')}
          </button>
        </div>
      )}

      {list.status === 'loading' && (
        <ul className={`${LIST} ${PAD}`} aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="lu-card flex items-center gap-3 rounded-[20px] p-3">
              <span className="lu-skeleton size-11 flex-none rounded-full" />
              <span className="grid flex-1">
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
          <span className="lu-notif-badge grid size-16 place-items-center rounded-3xl text-[1.8rem]" aria-hidden="true">
            <Icon name="bellOff" />
          </span>
          <p>{t('home.notifications.empty')}</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className={`overflow-y-auto pt-0 pb-[calc(20px+var(--ion-safe-area-bottom,0px))] ${PAD}`} ref={scroller}>
          {groups.map(([group, rows]) =>
            rows.length === 0 ? null : (
              <section key={group} className="not-first:mt-2" aria-labelledby={`notif-${group}`}>
                <h3
                  id={`notif-${group}`}
                  className="mx-0 mt-3 mb-2.5 font-display text-[0.95rem] font-semibold text-muted"
                >
                  {t(`home.notifications.${group}`)}
                </h3>
                <ul className={LIST} data-stagger>
                  {rows.map((n) => {
                    const isUnread = n.readAt === null;
                    const mission = n.type === 'MISSION_COMPLETE';
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`lu-notif-item flex w-full cursor-pointer items-center gap-3 rounded-[20px] p-3.5 text-start font-inherit text-ink ${isUnread ? 'is-unread' : ''}`}
                          data-testid="notification"
                          onClick={() => {
                            markRead(n);
                            if (n.type === 'SCAN_RESULT' && onScanResult) {
                              // The sheet closes now, before its own effect can report the new count.
                              if (items) onUnreadChange(unreadOf(items) - (n.readAt === null ? 1 : 0));
                              onScanResult();
                            }
                          }}
                        >
                          <span
                            className={`lu-disc size-11 text-[1.25rem] ${mission ? 'lu-disc-gold' : 'lu-disc-weight'}`}
                            aria-hidden="true"
                          >
                            {mission ? <Icon name="trophy" /> : <Icon name="scan" />}
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className={`font-display ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                              {t(n.title.key, n.title.params ?? {})}
                            </span>
                            <span className="text-[0.9rem] leading-snug text-muted">
                              {t(n.body.key, n.body.params ?? {})}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[0.8125rem] font-normal text-muted">
                              <Icon className="text-[0.9rem]" name="clock" />
                              {formatTimeAgo(n.createdAt)}
                            </span>
                          </span>
                          {isUnread ? (
                            <>
                              <span className="lu-notif-dot size-3 flex-none rounded-full" aria-hidden="true" />
                              <span className="sr-only">{t('home.notifications.unread')}</span>
                            </>
                          ) : (
                            <Icon
                              className="lu-notif-read flex-none text-[1.1rem] text-muted"
                              name="checkDouble"
                              label={t('home.notifications.read')}
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
