import { useTranslation } from 'react-i18next';

import PageShell from '../components/PageShell';

/** Placeholder until the Goals page is built. */
const Goals: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.goals')} testId="page-goals" />;
};

export default Goals;
