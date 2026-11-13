import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { pillTransform, tabIndex, TABS } from './tabConfig';
import './TabBar.css';

/**
 * Floating 5-tab bar. IonTabBar only renders IonTabButton children, so the
 * sliding pill sits beside it inside our own container.
 */
const TabBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const index = tabIndex(pathname);

  return (
    <div className="lu-tabbar" slot="bottom">
      <div
        className="lu-tab-pill"
        data-testid="tab-pill"
        aria-hidden="true"
        hidden={index < 0}
        style={{ transform: pillTransform(Math.max(index, 0), i18n.dir() === 'rtl') }}
      />
      <IonTabBar role="tablist" aria-label={t('tabs.navLabel')}>
        {TABS.map(({ tab, href, icon }) => {
          const label = t(`tabs.${tab}`);
          return (
            // Ionic puts role="tab" and this aria-label on the button's inner link.
            <IonTabButton key={tab} tab={tab} href={href} aria-label={label} data-testid={`tab-${tab}`}>
              <IonIcon icon={icon} aria-hidden="true" />
              <IonLabel>{label}</IonLabel>
            </IonTabButton>
          );
        })}
      </IonTabBar>
    </div>
  );
};

export default TabBar;
