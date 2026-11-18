import { IonRouterOutlet, IonTabs } from '@ionic/react';
import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';

import TabBar from './TabBar';
import { tabIndex } from './tabConfig';
import { useTabBack, useTabSwipe } from './tabGestures';

/** Each tab page is its own chunk, loaded the first time the tab opens. */
const withSuspense = (Page: LazyExoticComponent<ComponentType>) => {
  const Lazy: React.FC = () => (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
  return Lazy;
};

const LOADERS = {
  home: () => import('../pages/Dashboard'),
  scans: () => import('../pages/Scans'),
  scanReport: () => import('../pages/ScanReport'),
  progress: () => import('../pages/Progress'),
  compare: () => import('../pages/Compare'),
  goals: () => import('../pages/Goals'),
  newGoal: () => import('../pages/NewGoal'),
  character: () => import('../pages/Character'),
  profile: () => import('../pages/Profile'),
  settings: () => import('../pages/Settings'),
};

const Home = withSuspense(lazy(LOADERS.home));
const Scans = withSuspense(lazy(LOADERS.scans));
const ScanReport = withSuspense(lazy(LOADERS.scanReport));
const Progress = withSuspense(lazy(LOADERS.progress));
const Compare = withSuspense(lazy(LOADERS.compare));
const Goals = withSuspense(lazy(LOADERS.goals));
const NewGoal = withSuspense(lazy(LOADERS.newGoal));
const Character = withSuspense(lazy(LOADERS.character));
const Profile = withSuspense(lazy(LOADERS.profile));
const Settings = withSuspense(lazy(LOADERS.settings));
const Medals = withSuspense(lazy(() => import('../pages/Medals')));

/**
 * Once the first tab has rendered and the browser is idle, fetch every other
 * tab's chunk in the background, so the first visit to a tab doesn't wait on
 * a download. The initial bundle is unchanged.
 */
function usePrefetchTabs(): void {
  useEffect(() => {
    const prefetch = () => Object.values(LOADERS).forEach((load) => void load().catch(() => undefined));
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 800);
    return () => clearTimeout(id);
  }, []);
}

const Tabs: React.FC = () => {
  const { pathname } = useLocation();
  usePrefetchTabs();
  useTabSwipe();
  useTabBack();
  // An unknown tab address (old link, typo) lands on Home instead of an empty page.
  // Checked here, not as a catch-all <Route>: Ionic's outlet would prefer a
  // pattern like /tabs/:any over the exact tab routes.
  if (pathname !== '/tabs' && tabIndex(pathname) < 0) return <Redirect to="/tabs/home" />;
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/scans" component={Scans} />
        {/* The old Progress page stays as the full details view until the redesign covers all of it. */}
        <Route exact path="/tabs/scans/details" component={Progress} />
        <Route exact path="/tabs/scans/:id(\d+)" component={ScanReport} />
        <Route exact path="/tabs/compare" component={Compare} />
        <Route exact path="/tabs/account/goals" component={Goals} />
        <Route exact path="/tabs/account/goals/new" component={NewGoal} />
        <Route exact path="/tabs/account" component={Profile} />
        <Route exact path="/tabs/account/settings" component={Settings} />
        <Route exact path="/tabs/account/character" component={Character} />
        <Route exact path="/tabs/account/medals" component={Medals} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>
      <TabBar />
    </IonTabs>
  );
};

export default Tabs;
