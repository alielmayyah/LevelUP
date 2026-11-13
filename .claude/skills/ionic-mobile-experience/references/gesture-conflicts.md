# Gesture conflicts

Two gestures compete when they start the same way (same direction, same area). Resolve conflicts before shipping, and write the resolution here.

| Conflict | Resolution |
|---|---|
| Pull-to-refresh vs. sheet swipe-down (notifications) | No refresher inside the sheet. It refetches each time it opens. |
| iOS edge back-swipe vs. swipe-between-tabs | No tab swiping. |
| Pull-to-refresh vs. a vertical drag inside content | No vertical drag controls exist. If one is added, put it in its own `IonContent`-free area and disable the refresher while it is active (`refresher.disabled = true`). |
| Chart interaction vs. page scroll | Chart points react to tap and keyboard only; no drag, so vertical scrolling over a chart scrolls the page. |
| Tap on a card vs. scroll that starts on it | Actions fire on `click`, which the browser cancels when the finger moved. |
| Splash "tap anywhere" vs. its sound and language buttons | The buttons stop propagation, so they don't start the app. |
| Tab pill animation vs. rapid tab taps | `gsap.killTweensOf` before each new slide; the pill always ends on the latest tab. |

## Checklist for a new gesture

1. Which existing gestures start the same way in the same area? (Refresher: vertical pull at the top of `IonContent`. Sheet: vertical drag. iOS back: horizontal from the left/right edge.)
2. Can the new gesture be replaced by a tap? Prefer the tap.
3. If it stays: scope it with `createGesture({ el, threshold, direction })`, set `gesturePriority` above Ionic's when it must win, and destroy it in cleanup.
4. Add the visible alternative and an e2e test for both.
