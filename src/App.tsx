import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
import { Redirect, Route } from 'react-router-dom';

import PageShell from './components/PageShell';
import './i18n';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/display.css';

/* Dark palette is toggled with the ion-palette-dark class on <html> */
import '@ionic/react/css/palettes/dark.class.css';

/* LevelUP tokens (must load after Ionic's palettes) */
import './theme/tokens.css';

setupIonicReact();

/** Placeholder until the Home tab lands in #4–#9. */
const Home: React.FC = () => {
  const { t } = useTranslation();
  return <PageShell title={t('tabs.home')} testId="page-home" />;
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home" component={Home} />
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
