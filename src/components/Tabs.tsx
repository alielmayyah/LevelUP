import { IonRouterOutlet, IonTabs } from '@ionic/react';
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';

import TabBar from './TabBar';
import { tabIndex } from './tabConfig';

/** Each tab page is its own chunk, loaded the first time the tab opens. */
const withSuspense = (Page: LazyExoticComponent<ComponentType>) => {
  const Lazy: React.FC = () => (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
  return Lazy;
};

const Home = withSuspense(lazy(() => import('../pages/Dashboard')));
const Progress = withSuspense(lazy(() => import('../pages/Progress')));
const Goals = withSuspense(lazy(() => import('../pages/Goals')));
const Character = withSuspense(lazy(() => import('../pages/Character')));
const Leaderboard = withSuspense(lazy(() => import('../pages/Leaderboard')));
const Profile = withSuspense(lazy(() => import('../pages/Profile')));

const Tabs: React.FC = () => {
  const { pathname } = useLocation();
  // An unknown tab address (old link, typo) lands on Home instead of an empty page.
  // Checked here, not as a catch-all <Route>: Ionic's outlet would prefer a
  // pattern like /tabs/:any over the exact tab routes.
  if (pathname !== '/tabs' && tabIndex(pathname) < 0) return <Redirect to="/tabs/home" />;
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/progress" component={Progress} />
        <Route exact path="/tabs/goals" component={Goals} />
        <Route exact path="/tabs/leaderboard" component={Leaderboard} />
        <Route exact path="/tabs/profile" component={Profile} />
        <Route exact path="/tabs/profile/character" component={Character} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>
      <TabBar />
    </IonTabs>
  );
};

export default Tabs;
