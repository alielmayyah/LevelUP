import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import type { ReactNode } from 'react';

import './PageShell.css';

interface PageShellProps {
  title: string;
  children?: ReactNode;
  testId?: string;
}

/** A tab page: a notch-safe header and a body that scrolls clear of the tab bar. */
const PageShell: React.FC<PageShellProps> = ({ title, children, testId }) => (
  <IonPage data-testid={testId}>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <div className="lu-page-body" data-testid="page-body">
        {children}
      </div>
    </IonContent>
  </IonPage>
);

export default PageShell;
