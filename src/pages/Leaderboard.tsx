import { useTranslation } from 'react-i18next';

import PageShell from '../components/PageShell';

/** Placeholder until the Leaderboard page is built. */
const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.leaderboard')} testId="page-leaderboard" />;
};

export default Leaderboard;
