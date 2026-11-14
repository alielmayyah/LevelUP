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
  /** Decorative pixel art drawn behind the header, at its inline end (aria-hidden). */
  art?: ReactNode;
  /** A small icon before the title. */
  titleIcon?: ReactNode;
  children: ReactNode;
}

/** A tab page in the pixel style: big display title, notch-safe body that clears the tab bar. */
const TabPage: React.FC<TabPageProps> = ({ testId, title, subtitle, onRefresh, actions, art, titleIcon, children }) => (
  <IonPage data-testid={testId}>
    <IonContent>
      {onRefresh && (
        <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
      )}
      <div className="lu-page-body lu-tab-body" data-testid="page-body">
        <div className={`relative mb-4 flex items-start gap-3 ${art ? 'isolate min-h-[clamp(96px,26vw,140px)]' : ''}`}>
          {art && (
            <div
              className="pointer-events-none absolute inset-y-0 -end-(--lu-gutter) -z-1 w-[min(68%,420px)]"
              aria-hidden="true"
            >
              {art}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="lu-display m-0 flex items-center gap-2.5 text-[clamp(2.25rem,10vw,3rem)] leading-[1.05] wrap-anywhere text-ink">
              {titleIcon}
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
