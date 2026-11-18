import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Icon, { type IconName } from '../../components/Icon';

interface Action {
  key: 'scan' | 'goal' | 'medals';
  to: string;
  icon: IconName;
  /** Sets the badge hue (Dashboard.scss). */
  tone: string;
}

const ACTIONS: Action[] = [
  { key: 'scan', to: '/tabs/progress', icon: 'chart', tone: 'lu-quick-scan' },
  { key: 'goal', to: '/tabs/goals/new', icon: 'target', tone: 'lu-quick-goal' },
  { key: 'medals', to: '/tabs/profile/medals', icon: 'trophy', tone: 'lu-quick-medals' },
];

/** Three one-tap shortcuts under the hero, so Home always offers a next step. */
const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('home.quick.title')} data-testid="quick-actions">
      <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0">
        {ACTIONS.map((a) => (
          <li key={a.key} className="grid">
            <Link
              to={a.to}
              className={`lu-card lu-quick ${a.tone} grid min-h-[92px] content-center justify-items-center gap-2 px-1.5 py-3 text-center no-underline`}
              data-testid={`quick-${a.key}`}
            >
              <span className="lu-quick-badge grid size-10 place-items-center rounded-full text-[1.2rem]">
                <Icon name={a.icon} />
              </span>
              <span className="text-[0.8125rem] leading-tight font-semibold text-ink">{t(`home.quick.${a.key}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default QuickActions;
