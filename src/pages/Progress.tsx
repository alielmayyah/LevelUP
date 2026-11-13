import { useTranslation } from 'react-i18next';

import PageShell from '../components/PageShell';

/** Placeholder until the Progress page is built. */
const Progress: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.progress')} testId="page-progress" />;
};

export default Progress;
