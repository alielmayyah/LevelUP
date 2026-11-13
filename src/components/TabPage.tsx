import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import type { ReactNode } from 'react';

interface TabPageProps {
  testId: string;
  title: string;
  subtitle?: string;
  /** Pull to refresh. Resolve when the data is back. */
  onRefresh?: () => Promise<unknown>;
  /** Shown at the inline end of the header (icon buttons). */
  actions?: ReactNode;
  children: ReactNode;
}

/** A tab page in the pixel style: big display title, notch-safe body that clears the tab bar. */
const TabPage: React.FC<TabPageProps> = ({ testId, title, subtitle, onRefresh, actions, children }) => (
  <IonPage data-testid={testId}>
    <IonContent>
      {onRefresh && (
        <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
      )}
      <div className="lu-page-body lu-tab-body" data-testid="page-body">
        <div className="lu-tab-header">
          <div>
            <h1 className="lu-tab-title lu-display">{title}</h1>
            {subtitle && <p className="lu-tab-subtitle">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </IonContent>
  </IonPage>
);

export default TabPage;
