# Mobile interaction testing

Use the existing Playwright setup (`e2e-testing` skill): projects `iphone` (WebKit), `android` (Chromium), `small` (320 px), `tablet`, `desktop`, in `en`/`ar` and `light`/`dark`.

## What each check proves

| Check | How | Proves | Doesn't prove |
|---|---|---|---|
| Tab switching keeps state | Scroll a tab, switch away and back, assert `scrollTop` | Ionic keeps the page | — |
| Re-tap active tab | Scroll, tap its tab again, assert near top | The handler | — |
| Pull to refresh | Call `IonRefresher`'s refresh via the `ionRefresh` event or drag with `page.mouse` in Chromium | Handler + `complete()` | Native rubber-band feel |
| Hardware back | `document.dispatchEvent(new CustomEvent('ionBackButton', { detail: { register: (p, h) => h() } }))` | Our handlers close overlays | That Android delivers the event (needs `@capacitor/app` on a device) |
| Swipe-down sheet | Close button / Escape in tests | Dismissal paths | Native drag physics |
| Keyboard | `inputmode`, `enterkeyhint`, Enter submits | Correct keyboard requested | Real keyboard overlap |
| Resume / reconnect | Dispatch `visibilitychange` (with `document.hidden` stubbed) and `online` | Refresh logic | OS backgrounding |
| Double tap | `dblclick` on a submit or toggle; assert one request | Duplicate guard | — |
| Safe areas | Set `--ion-safe-area-*` and measure | Layout respects insets | The real notch |
| Targets | Bounding boxes ≥ 44×44 | Size | — |
| Overflow | `scrollWidth <= innerWidth` at 320 px, both languages | No sideways scroll | — |
| Accessibility | `e2e/a11y.spec.ts` (axe + focus-not-obscured) | WCAG 2.2 AA automated checks | Screen-reader experience |

## Real devices

Before release, on one iPhone and one Android phone (Capacitor build): swipe-back, hardware back with an overlay open and at the root, keyboard over the login button, pull-to-refresh feel, background → resume after 10 minutes, airplane mode → reconnect. Browser tests can't prove these. Report them as unverified until done.

## Reporting

Never say a native gesture works because a desktop browser test passed. Say what ran, where, and what remains for a device.
