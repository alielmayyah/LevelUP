# Gesture standards

Every gesture has a purpose, consistent behavior, immediate feedback, and an accessible alternative. Don't add a gesture because it is possible.

## Gestures in LevelUP

| Gesture | Where | Feedback | Accessible alternative |
|---|---|---|---|
| Tap | Everywhere | Pixel pressed state (down 2–3 px, shadow shrinks) | Keyboard Enter/Space |
| Pull to refresh | Home, Progress, Goals, Leaderboard, Profile | `IonRefresherContent` spinner | Data also refreshes on tab re-entry, app resume, and reconnect; Retry on errors |
| Swipe down | Notifications sheet | Sheet follows the finger, snaps | Close button; Escape; Android back |
| Swipe back (iOS) | Ionic stack pages (none nested today) | Ionic's interactive transition | Tab bar / Android back |
| Tap a chart point | Progress charts | Value tooltip | Tab to the chart, arrow keys between scans; text summary |
| Re-tap active tab | Tab bar | Content scrolls to top | Home key / scroll |
| Swipe left/right | Tab root pages (mirrored in Arabic) | The next or previous tab opens, pill slides | Tab bar |
| Android back | Any tab but Home | Goes to Home (on Home, leaves the app) | Tab bar |
| Arrow keys | Segmented choices, chart | Selection moves | (is the alternative) |

## Deliberately not used

| Gesture | Why not |
|---|---|
| Long press | No action needs it; hidden actions are undiscoverable |
| Swipe to reveal actions | No list row has a contextual action yet; if one is added, also expose it as a visible button |
| Pull to refresh in the notifications sheet | The sheet's own pull-down dismisses it; it refetches on every open instead |

## Rules

- Tap actions fire on `click` (after touch end), never on `touchstart`, so a scroll that starts on a button doesn't trigger it.
- Guard double taps: a button that starts a request is disabled (or ignores clicks) until it finishes (`aria-busy` while busy). Toggles ignore taps while their save is in flight.
- Never preventDefault on `touchmove` for the whole page; it kills scroll and the refresher.
- Horizontal scrollers (if ever added) get `touch-action: pan-x` and must not sit at a screen edge (iOS back-swipe zone, 20 px).
- Respect `prefers-reduced-motion` for gesture-driven animation; the gesture still works, the flourish goes.
