# Ionic building blocks in LevelUP

Use Ionic for structure, navigation, scrolling, and gestures. It already handles safe areas, scroll momentum, page transitions, swipe-back, sheet dragging, and hardware back.

| Need | Use | Project notes |
|---|---|---|
| App root | `IonApp` | `src/App.tsx`; `setupIonicReact()` once |
| Router | `IonReactRouter` + `IonRouterOutlet` | react-router v5 under the hood; `useHistory().replace` for auth hops |
| A screen | `IonPage` | Every routed component's root. Tab pages use `TabPage` |
| Scrolling body | `IonContent` | The only scroll container on a page. Never wrap a page in your own `overflow: auto` div |
| Header | Own header inside `IonContent` (`TabPage`, Home) | The design draws titles in the body; the body pads the top safe area itself (`.lu-tab-body`) |
| Tabs | `IonTabs` + `IonRouterOutlet` + custom `TabBar` | `TabBar` wraps `IonTabBar` in a `<nav>`; do not put `aria-label` on `IonTabButton` (see `ui-standards` → Accessibility) |
| Pull to refresh | `IonRefresher` + `IonRefresherContent` | `slot="fixed"`, first child of `IonContent`; `complete()` in `finally` |
| Bottom sheet | `IonModal` with `breakpoints` / `initialBreakpoint` | Notifications. Name the inner dialog (see `NotificationsSheet.tsx`) |
| Confirm dialog | `Dialog` (native `<dialog>`) | Not `IonAlert` — bundle cost. Closes on Escape, backdrop, Android back |
| Short message | `Toast` | Not `IonToast` — bundle cost |
| Choice list / menu | A `Dialog`-style sheet or inline `.lu-choice` | Not `IonActionSheet` / `IonPopover` — bundle cost |
| Long list | Plain list + `content-visibility: auto` rows | `IonInfiniteScroll` only once an API pages its results |
| Side menu | None today | If added: `IonMenu` with `menuId`, `IonMenuToggle` around items so it closes on select |
| Page lifecycle | `useIonViewWillEnter` / `DidEnter` / `WillLeave` | Ionic keeps tab pages mounted, so `useEffect` runs once; use these for "every time the tab shows" |
| Custom gesture | `createGesture` from `@ionic/react` | Only after reading `gesture-conflicts.md`; destroy it in the effect cleanup |
| Hardware back | `document` `ionBackButton` event: `e.detail.register(priority, handler)` | Overlays use priority 100+. On device this needs `@capacitor/app` |

## Rules

- Never add a second scroll container inside `IonContent` unless it scrolls horizontally on purpose, and then mark it so the refresher and back-swipe ignore it (see `gesture-conflicts.md`).
- Never call `window.location` for internal navigation (a full reload loses state). Use the router.
- Never block the main thread during a gesture: no layout reads inside `touchmove` handlers; batch with `requestAnimationFrame`.
- Clean up every listener, gesture, and GSAP tween in the effect's cleanup.
- New dependencies need a reason a few lines of Ionic or CSS can't cover.
