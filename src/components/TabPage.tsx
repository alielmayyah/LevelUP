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
        <div className="mb-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="lu-display m-0 text-[clamp(2.25rem,10vw,3rem)] leading-[1.05] wrap-anywhere text-ink">
              {title}
            </h1>
            {subtitle && <p className="mx-0 mt-1.5 mb-0 text-[0.9rem] text-muted">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </IonContent>
  </IonPage>
);

export default TabPage;
