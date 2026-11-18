import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { gym } from '../../brand.config';
import Icon from '../../components/Icon';
import { formatNumber } from '../../i18n/format';
import { formatToday } from './homeText';

const initialsOf = (first: string, last?: string) =>
  [first, last]
    .filter(Boolean)
    .map((n) => [...(n as string).trim()][0] ?? '')
    .join('')
    .toUpperCase();

/**
 * Home's header: the member's initials (no avatar art), the greeting as the
 * page heading, today's date, the gym's logo when it has one, and the bell.
 */
export function AppHeader({
  firstName,
  lastName,
  today,
  unread,
  onBell,
}: {
  firstName: string | null;
  lastName?: string;
  today: Date;
  unread: number;
  onBell: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex items-center gap-3">
      {firstName ? (
        <Link
          to="/tabs/account"
          className="lu-press lu-focus grid size-12 flex-none place-items-center rounded-full bg-brand-tint text-label font-semibold text-brand-soft no-underline"
          data-testid="home-initials"
        >
          <span aria-hidden="true">{initialsOf(firstName, lastName)}</span>
          <span className="sr-only">{t('journey.openAccount')}</span>
        </Link>
      ) : (
        <span className="lu-skeleton-card block size-12 min-h-0 flex-none rounded-full" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="m-0 text-label font-normal text-muted" data-testid="today">
          {formatToday(today)}
        </p>
        <h1 className="m-0 text-title wrap-anywhere text-ink" data-testid="greeting">
          {firstName ? (
            t('home.hello', { name: firstName })
          ) : (
            <>
              <span className="lu-skeleton h-[1em] w-[70%]" aria-hidden="true" />
              <span className="sr-only">{t('common.loading')}</span>
            </>
          )}
        </h1>
      </div>
      {gym.logo && (
        <img src={gym.logo} alt="" className="h-9 w-auto max-w-20 flex-none object-contain" data-testid="gym-badge" />
      )}
      <button
        type="button"
        className="lu-icon-button"
        data-testid="bell"
        aria-label={unread > 0 ? t('home.notifications.bellUnread', { n: unread }) : t('home.notifications.bell')}
        onClick={onBell}
      >
        <Icon name="bell" />
        {unread > 0 && (
          <span
            className="absolute -end-[7px] -top-[7px] box-border grid h-[22px] min-w-[22px] place-items-center rounded-full bg-brand-strong px-[5px] text-caption leading-none text-on-brand"
            data-testid="bell-dot"
            aria-hidden="true"
          >
            {unread > 9 ? `${formatNumber(9)}+` : formatNumber(unread)}
          </span>
        )}
      </button>
    </div>
  );
}

export default AppHeader;
