import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import RequireAuth from './auth/RequireAuth';
import { brand } from './brand.config';
import PageShell from './components/PageShell';
import Tabs from './components/Tabs';
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

/** Placeholders until #1 (splash) and #2 (login) land in plan Task 5. */
const Splash: React.FC = () => <PageShell title={brand.name} testId="page-splash" />;
const Login: React.FC = () => <PageShell title={brand.name} testId="page-login" />;

const TabsWhenSignedIn: React.FC = () => (
  <RequireAuth>
    <Tabs />
  </RequireAuth>
);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/splash" component={Splash} />
        <Route exact path="/login" component={Login} />
        <Route path="/tabs" component={TabsWhenSignedIn} />
        <Route exact path="/">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
