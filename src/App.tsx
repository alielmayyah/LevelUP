import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';

import { onUnauthorized } from './api/client';
import RequireAuth from './auth/RequireAuth';
import { clearToken } from './auth/token';
import Tabs from './components/Tabs';
import './i18n';
import MotionProvider from './motion/MotionProvider';
import Login from './pages/Login';
import Splash from './pages/Splash';

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

/* Pixel-style display type and building blocks shared by every tab. The font only downloads when text uses it. */
import '@fontsource/jersey-10/latin-400.css';
/* Arabic text in three real weights, so regular text is not drawn from the bold file. */
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import './theme/layout.css';
import './theme/pixel.css';

setupIonicReact();

// A rejected session (401 on a data route) signs the member out; RequireAuth then sends them to Login.
onUnauthorized(() => void clearToken());

/**
 * Any address the app doesn't know goes to the start instead of a blank screen.
 * It sits beside the outlet, not inside it as a catch-all <Route>: Ionic's
 * outlet would also match a catch-all against real pages and stack a second copy.
 */
const KNOWN = /^\/(splash|login|tabs(\/.*)?)?$/;
const UnknownAddress: React.FC = () => {
  const { pathname } = useLocation();
  return KNOWN.test(pathname) ? null : <Redirect to="/splash" />;
};

const TabsWhenSignedIn: React.FC = () => (
  <RequireAuth>
    <Tabs />
  </RequireAuth>
);

const App: React.FC = () => (
  <IonApp>
    <MotionProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/splash" component={Splash} />
          <Route exact path="/login" component={Login} />
          <Route path="/tabs" component={TabsWhenSignedIn} />
          <Route exact path="/">
            <Redirect to="/splash" />
          </Route>
        </IonRouterOutlet>
        <UnknownAddress />
      </IonReactRouter>
    </MotionProvider>
  </IonApp>
);

export default App;
