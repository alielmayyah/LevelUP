import { useTranslation } from 'react-i18next';

import PageShell from '../components/PageShell';

/** Placeholder until the Dashboard page is built. */
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.home')} testId="page-home" />;
};

export default Dashboard;
