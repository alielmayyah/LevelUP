---
name: ionic-mobile-experience
description: Use when building or changing anything a member touches, swipes, scrolls, or navigates in LevelUP — a new page, the tab bar, navigation or routes, a modal/sheet/dialog/menu, pull-to-refresh, a gesture, scrolling or keyboard behavior, Android back, app resume — or when auditing or fixing mobile, touch, or responsive behavior.
---

# LevelUP Mobile Experience (Ionic React)

LevelUP must feel like a native Android and iOS app, not a responsive website. This skill covers navigation, gestures, touch feedback, scrolling, the keyboard, safe areas, overlays, hardware back, and app lifecycle.

It builds on, and does not repeat:
- `ui-standards`: languages, themes, pixel style, accessibility rules, animation tools, budgets.
- `e2e-testing`: Playwright layout, device projects, fixtures.
- `playwright-browser-check`: looking at screens by eye.
- `git-workflow`: branches, commits, no AI attribution.

## When to load it

Load this skill before: creating a page; changing routes, the tab bar, or any navigation; adding a modal, sheet, dialog, menu, or toast; adding pull-to-refresh or any gesture; changing scrolling, keyboard, or safe-area behavior; touching app start, resume, or sign-in/out; or running a mobile audit.

## How the app is built (read before changing it)

| Concern | Where | Notes |
|---|---|---|
| Routing | `src/App.tsx` (`IonReactRouter` > `IonRouterOutlet`) | `/splash`, `/login`, `/tabs/*`; unknown paths redirect |
| Tabs | `src/components/Tabs.tsx` (`IonTabs`), `TabBar.tsx` | Each tab page is `React.lazy`; Ionic keeps visited tabs mounted, so their state and scroll survive switching |
| Auth gate | `src/auth/RequireAuth.tsx`, `src/auth/token.ts` | Listens for sign-in/out; a 401 signs out (`onUnauthorized` in `App.tsx`) |
| Page shell | `src/components/TabPage.tsx` | `IonPage` > `IonContent` > `IonRefresher` + notch-safe body |
| Data | `src/api/useApi.ts` | `useApi` (fetch, `reload`, `retry`, `setData`) and `useRefreshOnEnter` (refresh on tab re-entry, app resume, reconnect) |
| Overlays | `PixelDialog` (confirm), `PixelToast`, `IonModal` (notifications sheet) | See the overlay rule below |
| Hardware back | Ionic's `ionBackButton` event (needs `@capacitor/app` on device) | `PixelDialog` registers to close itself |

## Mandatory workflow

1. **Map** the screen: every entry point to it, every way out (tab, back, link, overlay close), every interactive element, every gesture.
2. **Check conflicts** before adding a gesture: see `references/gesture-conflicts.md`.
3. **Build with Ionic first** (`references/ionic-components.md`). Do not hand-roll what Ionic does (page transitions, refresher, modals, back handling).
4. **Give every gesture a visible alternative** (a button, a link, a key). No essential action may depend on a gesture alone.
5. **Give every control feedback**: pressed, focused, disabled, busy. No duplicate submits on double tap.
6. **Test** with the checklist in `references/mobile-testing.md`, and add e2e assertions for anything you fixed.
7. **Report** native-only behavior (real swipe-back, real hardware back, real keyboard) as unverified unless it ran on a device.

## Standards (summary — details in references)

- **Navigation** (`references/navigation-standards.md`): one route per screen; `history.replace` after sign-in/out so Back can't return to the wrong side of the gate; unknown routes never render blank; the active tab is always visible; re-tapping the active tab scrolls it to the top.
- **No dead ends** (`references/navigation-standards.md`): iPhones have no back button, so every screen shows a tappable way out — the tab bar, a top-start Back button on stack and full-screen pages, a ✕ or Cancel on every sheet and dialog, Retry on errors. Swipe and Escape are extras, never the only exit.
- **Pull to refresh**: every data tab uses `TabPage`'s `onRefresh` (Home has its own `IonRefresher`). Always call `e.detail.complete()` in `finally`. Not inside the notifications sheet: its pull-down already dismisses the sheet, and the sheet refetches on every open.
- **Gestures** (`references/gesture-standards.md`): Ionic swipe-back on stack pages, swipe-down on sheets, and swipe between tabs on tab root pages (`src/components/tabGestures.ts`; it skips screen edges, controls, charts, and sideways scrollers). Android back on a tab goes Home, then leaves the app.
- **Touch**: every control has a pixel pressed state (moves down 2–3 px, its hard shadow shrinks); `-webkit-tap-highlight-color: transparent` only where a pressed state replaces it; `user-select: none` on controls, never on readable content; targets ≥ 44×44 px.
- **Overlays**: `IonModal` for sheets; `PixelDialog` for confirmations; `PixelToast` for short messages. Do not add `IonAlert`, `IonToast`, `IonActionSheet`, or `IonPopover`: `@ionic/react` is one module, so any overlay used anywhere lands in the initial bundle (it pushed it past 200 KB once). Every overlay closes with its close button, Escape, a backdrop tap (unless destructive), and Android back.
- **Keyboard**: the right `inputMode`/`type`/`autocomplete`/`enterKeyHint` on every field; Enter submits; the submit button stays reachable with the keyboard open (Ionic's scroll assist inside `IonContent`).
- **Lifecycle**: data refreshes when a tab is re-entered, when the app comes back to the foreground, and when the network returns — only for the visible tab.
- **Motion**: a CSS transition for the tab pill; GSAP for scripted sequences, loaded with `import()` outside the initial bundle; respect `prefers-reduced-motion` (see `ui-standards` → Animation).

## Audit

Run `checklists/mobile-interaction-audit.md` top to bottom. Classify findings: **Critical** (broken navigation, inaccessible function, crash), **High** (broken gesture, unusable touch, blocked content), **Medium** (inconsistent interaction, weak feedback), **Low** (polish). Fix only when asked, then rerun the affected checks and the full suite.

## Example invocations

- "Use ionic-mobile-experience to add pull-to-refresh to the new Scans page."
- "Use ionic-mobile-experience to add a goal-details sheet."
- "Use ionic-mobile-experience to audit the app's mobile interactions and fix what you find."

## References

- `references/ionic-components.md` — which Ionic building block to use, and the project's exceptions
- `references/navigation-standards.md` — routes, tabs, back, deep links, sign-in/out
- `references/gesture-standards.md` — every gesture in the app, its purpose, feedback, and alternative
- `references/gesture-conflicts.md` — known conflicts and how they were resolved
- `references/mobile-testing.md` — what to test, how, and what browser tests can't prove
- `checklists/mobile-interaction-audit.md` — the audit procedure
