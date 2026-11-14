import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '../../i18n/format';

interface Props {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}

const BUTTON =
  'lu-pager-button grid size-11 cursor-pointer place-items-center border-0 bg-surface font-inherit text-[1.1rem] text-ink disabled:cursor-default disabled:text-muted disabled:opacity-50';

/** Previous / page x of y / next. Rendered only when a board has more than one page. */
const Pager: React.FC<Props> = ({ page, pages, onPage }) => {
  const { t } = useTranslation();
  return (
    <nav
      className="mt-3 flex items-center justify-center gap-3"
      aria-label={t('leaderboard.pages')}
      data-testid="pager"
    >
      <button
        type="button"
        className={BUTTON}
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        aria-label={t('leaderboard.prevPage')}
      >
        <IonIcon className="rtl:-scale-x-100" icon={chevronBack} aria-hidden="true" />
      </button>
      <span className="min-w-[7ch] text-center text-[0.85rem] font-extrabold text-muted" aria-live="polite">
        {t('leaderboard.pageOf', { page: formatNumber(page + 1), pages: formatNumber(pages) })}
      </span>
      <button
        type="button"
        className={BUTTON}
        onClick={() => onPage(page + 1)}
        disabled={page >= pages - 1}
        aria-label={t('leaderboard.nextPage')}
      >
        <IonIcon className="rtl:-scale-x-100" icon={chevronForward} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pager;
