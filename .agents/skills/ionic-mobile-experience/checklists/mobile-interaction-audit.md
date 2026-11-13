# Mobile interaction audit

Work top to bottom. Record each finding as `ID · severity · screen · what's wrong · evidence (file:line or test)`. Distinguish confirmed defects (reproduced) from likely ones (code reading only).

## 1. Inventory
- [ ] List routes (`App.tsx`, `Tabs.tsx`), overlays, and every interactive element per screen.
- [ ] List every gesture (search `IonRefresher`, `IonModal`, `createGesture`, `onTouch`, `onPointer`).

## 2. Navigation
- [ ] Splash → login → tabs, and splash → tabs when signed in. Back after each lands somewhere sensible.
- [ ] Every tab reachable; active tab identifiable; state and scroll kept when switching.
- [ ] Re-tapping the active tab scrolls to top.
- [ ] Every in-page link (cards, prompts) goes where it says.
- [ ] Deep link + reload on every `/tabs/*` URL.
- [ ] Unknown URLs redirect (no blank screen).
- [ ] Sign out → login; tabs locked; Back doesn't reveal data. A 401 does the same.

## 3. Overlays
- [ ] Each overlay: close button, Escape, backdrop (unless destructive), hardware back (`ionBackButton`).
- [ ] Focus moves into the overlay and back to the trigger on close; it has an accessible name.
- [ ] Opening an overlay doesn't change the URL.

## 4. Gestures and touch
- [ ] Pull to refresh on every data tab; `complete()` always runs (also on error); no double requests.
- [ ] No gesture conflicts (`gesture-conflicts.md`).
- [ ] Every control has pressed, focus, disabled, and busy states; tap highlight replaced, not just removed.
- [ ] Double taps don't duplicate submits or toggles.
- [ ] Controls aren't text-selectable on long press; content is.
- [ ] Targets ≥ 44×44 px.

## 5. Keyboard and forms
- [ ] Each field: right `inputMode`, `type`, `autoComplete`, `enterKeyHint`; Enter submits.
- [ ] Submit stays reachable with the keyboard open (scroll assist; landscape).

## 6. Scrolling and safe areas
- [ ] One scroll container per page; no nested-scroll traps; no sideways scroll at 320 px.
- [ ] Last item clears the tab bar; focused controls never sit under it (`e2e/a11y.spec.ts`).
- [ ] Notch, home indicator, and landscape side insets respected.

## 7. Lifecycle and network
- [ ] Visible tab refreshes on app resume and on reconnect; hidden tabs don't.
- [ ] Failed requests show Retry; nothing stays in a loading state forever.

## 8. Accessibility and motion
- [ ] `e2e/a11y.spec.ts` passes; every gesture has a non-gesture alternative.
- [ ] Reduced motion: no slides, count-ups, or rings animate; everything still works.
- [ ] RTL: directional icons, pill direction, chart direction, arrow keys reversed.

## 9. Run and report
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:e2e`, `npm run build` (budgets).
- [ ] Prioritized report: Critical, High, Medium, Low. Device-only items listed as unverified.
- [ ] When fixing: fix, add a test for each, rerun the affected specs, then the full suite.
