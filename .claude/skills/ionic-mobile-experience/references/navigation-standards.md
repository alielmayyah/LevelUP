# Navigation standards

## Map of the app

```
/            → redirect /splash
/splash      → tap → /login (signed out) or /tabs/home (signed in)      [replace]
/login       → sign in → /tabs/home                                      [replace]
             → already signed in → /tabs/home                            [replace]
/tabs/*      → RequireAuth; signed out → /login
  home · progress · goals · leaderboard · profile
  home → bell → notifications sheet (IonModal)
  home → rank card → leaderboard;  mission card → goals;  join prompt → profile
  profile → sign out → PixelDialog → /login                              [replace]
anything else → redirect (never a blank page)
```

## Rules

- **Replace, don't push, across the auth gate.** After sign-in, sign-out, and the splash hop, use `history.replace`. Back must never land on the splash or on a tab after signing out (and if it does, `RequireAuth` sends the member to `/login`).
- **Tabs are siblings, not a stack.** Switching tabs keeps each tab's state and scroll (Ionic keeps them mounted). Don't reset a tab on leave.
- **Re-tapping the active tab scrolls that tab to the top** (iOS and Android convention). `TabBar` does this.
- **The active tab is always identifiable**: the pill sits under it and its label is the white one; the inactive labels are ≥ 6:1 against the bar.
- **Unknown routes redirect.** `/tabs/<unknown>` → `/tabs/home` (checked in `Tabs.tsx`); any other unknown path → `/splash` (`UnknownAddress` in `App.tsx`).
  - **Never put a catch-all `<Route>` (no `path`, or `path="/tabs/:x"`) inside `IonRouterOutlet`.** Ionic's outlet doesn't pick the first match like react-router's `Switch`: it preferred `/tabs/:x` over `/tabs/progress`, and a path-less route stacked a second copy of the splash. Check the address outside the outlet instead, as these two components do.
- **In e2e, a page mid-transition is still in the DOM** (hidden with `.ion-page-hidden`, reporting `scrollTop` 0). Wait for `not.toHaveClass(/ion-page-hidden/)` or filter `{ visible: true }` before measuring.
- **Deep links and refresh** on any `/tabs/*` URL load that tab directly (tested by every e2e spec that does `page.goto('/tabs/…')`).
- **Overlays don't change the URL.** Opening the notifications sheet or a dialog must not push history, so Back closes the overlay (hardware back) or leaves the page (browser), never half of each.
- **No dead ends.** Every screen has a way out: the tab bar, a close button, or a Back path. Error states have Retry.

## Android hardware back

Ionic turns the native back press into an `ionBackButton` event with priorities:

| Priority | Who | Does |
|---|---|---|
| 100+ | Open overlay (`IonModal`, `PixelDialog`) | Closes the overlay |
| 0 | Ionic router | Goes back in the outlet's stack |
| -1 | Ionic | Exits the app at the root (Capacitor) |

On a device this requires `@capacitor/app`. In a browser there is no hardware back; e2e tests dispatch the `ionBackButton` event to exercise the handlers (see `mobile-testing.md`) — that proves the handler, not the native wiring.

## Sign-out and session expiry

- Sign out → confirm → `clearToken()` → `history.replace('/login')`. `RequireAuth` re-checks on the auth-change event, so tabs lock even though Ionic keeps them mounted.
- A 401 on any data request signs the member out the same way.
