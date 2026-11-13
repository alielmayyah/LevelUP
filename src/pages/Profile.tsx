import { useTranslation } from 'react-i18next';

import PageShell from '../components/PageShell';

/** Placeholder until the Profile page is built. */
const Profile: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.profile')} testId="page-profile" />;
};

export default Profile;
