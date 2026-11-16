import { IonContent, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from '@ionic/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import PixelIcon from './PixelIcon';

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

/** A tab page in the pixel style: big display title, notch-safe body that clears the tab bar. */
const TabPage: React.FC<TabPageProps> = ({
  testId,
  title,
  subtitle,
  onRefresh,
  actions,
  titleIcon,
  backTo,
  fill,
  children,
}) => {
  const { t } = useTranslation();
  const router = useIonRouter();
  return (
    <IonPage data-testid={testId}>
      <IonContent>
        {onRefresh && (
          <IonRefresher slot="fixed" onIonRefresh={(e) => void onRefresh().finally(() => e.detail.complete())}>
            <IonRefresherContent />
          </IonRefresher>
        )}
        <div className={`lu-page-body lu-tab-body ${fill ? 'flex flex-col' : ''}`} data-testid="page-body">
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
                <PixelIcon name="arrowBack" className="rtl:-scale-x-100" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="lu-display m-0 flex items-center gap-2.5 text-[clamp(2rem,9vw,3rem)] leading-[1.05] wrap-break-word text-ink">
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
};

export default TabPage;
