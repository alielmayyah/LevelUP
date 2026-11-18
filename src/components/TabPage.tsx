import { IonContent, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from '@ionic/react';
import { useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useReveal } from '../motion/gsapMotion';
import Icon from './Icon';

interface TabPageProps {
  testId: string;
  title: string;
  subtitle?: string;
  /** Pull to refresh. Resolve when the data is back. */
  onRefresh?: () => Promise<unknown>;
  /** Shown at the inline end of the header (icon buttons). */
  actions?: ReactNode;
  /** A small icon before the title. */
  titleIcon?: ReactNode;
  /** Parent route to use when the page was opened by a deep link. */
  backTo?: string;
  /** Stretch the content to the bottom of the screen (its last child grows), instead of stopping where it ends. */
  fill?: boolean;
  children: ReactNode;
}

/**
 * A tab page: a big Alexandria title, muted subtitle, and a notch-safe body
 * that clears the tab bar. Its sections rise in one after another the first
 * time they appear (GSAP, skipped under reduced motion).
 */
const TabPage: React.FC<TabPageProps> = ({ testId, title, subtitle, onRefresh, actions, backTo, fill, children }) => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const body = useRef<HTMLDivElement>(null);
  // Children change when data arrives; only sections not seen before play the entrance.
  useReveal(body, children);
  return (
    <IonPage data-testid={testId}>
      <IonContent>
        {onRefresh && (
          <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
            <IonRefresherContent />
          </IonRefresher>
        )}
        <div className={`lu-page-body lu-tab-body ${fill ? 'flex flex-col' : ''}`} data-testid="page-body" ref={body}>
          <div className="mb-4 flex items-start gap-3">
            {backTo && (
              <button
                type="button"
                className="lu-icon-button shrink-0"
                aria-label={t('common.back')}
                onClick={() => {
                  if (router.canGoBack()) router.goBack();
                  else router.push(backTo, 'back', 'replace');
                }}
              >
                <Icon name="arrowBack" className="rtl:-scale-x-100" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              {/* No icon before the title: the tab bar already shows it. */}
              <h1 className="lu-display m-0 text-[clamp(1.75rem,7.5vw,2.375rem)] leading-[1.08] wrap-break-word text-ink">
                {title}
              </h1>
              {subtitle && <p className="mx-0 mt-1 mb-0 text-[0.875rem] text-muted">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TabPage;
