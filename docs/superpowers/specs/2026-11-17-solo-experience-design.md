# LevelUP Solo Experience: Design

Date: 2026-11-17
Status: Draft, waiting for approval

## Why

Today LevelUP shows InBody scans entered by gym staff and ranks members against each other. A member only gets something new when they take a scan, which happens about once a month, and some members never take one. So people open the app once a month at most.

The fix is a **solo experience**: one person, playing against themselves, every day. It works without a gym, a coach, or a scan. Later, coaches (marketplace) and gyms (InBody deals) plug into it, and that is where the money comes from. The solo game is the base they all stand on.

The app keeps using **mock data** for now. The real backend comes later and serves the same endpoints.

## Goals

- Give a member a reason to open the app every day, in under 30 seconds.
- Work for someone with no gym, no coach, no scan, and no interest in competing.
- Feel fair: you are measured against your own plan, never against other people.
- Define every endpoint and DTO now, so the backend later copies the contract and the game rules without screen changes.

## Non-goals (this phase)

- Backend, real sign-up, or cloud sync.
- Coach features, the marketplace, payments.
- Gym leaderboards, community, staff-entered scans as a requirement.
- Food and calorie logging.
- A full workout logger (exercise library, sets per workout, programs).
- Push notifications from a server.

## Anti-goals (would make this a failure even if it works)

- Logging feels like homework: more than about 3 taps a day for the basics.
- A missed rest day "breaks" something. Daily streaks are out.
- The member loses progress: XP or medals going down, or data vanishing on restart.
- The gym features get deleted. They are hidden, so they can come back.

## Approaches considered

How deep should workout tracking go?

| Option | What the member does | Cost | Trade-off |
| --- | --- | --- | --- |
| **A. Check-in** | Taps "I trained today" and picks a type: push, pull, legs, full body, cardio, other | Small | Fixes daily opening fastest. Says nothing about strength. |
| **B. Lift log** | Logs sets x reps x weight for exercises, and PRs are detected | 2-3x A | What keeps gym-goers. Needs an exercise library and a fast logging screen. |
| **C. Programs** | B plus ready programs to follow | Largest | Content work on top of B. |

**Picked: A now, plus a narrow slice of B.** The app already models seven lifts (`LiftExercise`) and strength medals built on them. This phase lets the member log a record for those seven lifts only, which unlocks the strength medals with no new exercise library. A full B is the next phase. *(Claude's call, from the earlier recommendation "A now, B next". Confirm or change.)*

## The experience

### Tabs

Solo mode shows four tabs: **Today, Progress, Goals, Profile**. Community and Leaderboard are hidden by a feature flag (below), not deleted.

### First run: solo setup

After sign-in (the mock Fit ID login stays for this phase), a member with no solo profile sees a short setup, one question per screen:

1. Main goal: lose fat, build muscle, get fitter, stay healthy.
2. Weekly training target: 2-6 days (default 3).
3. Daily water target: in glasses or liters (default 8 glasses / 2 L).
4. Habits: pick up to 5 from a list (creatine, vitamins, 8h sleep, 10k steps, stretch, protein, no sugar) or add a custom one.
5. Avatar: the existing Character editor.

Every answer can be changed later in Settings.

### Today (new Home)

Top to bottom:

- Greeting, date, avatar, level badge and XP bar.
- **Weekly ring:** "2 of 3 training days this week". Fills on each training check-in.
- **Trained today?** One button. Tapping it opens a picker of the workout type, then confirms. Tapping again on the same day edits the type or undoes it.
- **Water:** a row of glasses. Tap to fill one, long-press to empty one. Shows the target.
- **Habits:** one chip per habit. Tap to tick or untick.
- **Next medal:** the closest medal to unlocking, with progress.
- If the member has an active goal, the existing Mission card.

Ticks are allowed for **today and yesterday only** (people forget at night). Older days are read-only.

### Week

The week starts on **Saturday** (Egypt's working week). *(Claude's call.)* A week is "hit" when training days are equal to or more than the target. Changing the target mid-week applies from the next week.

### XP and levels

XP only goes up. All rules live in one pure module, so the backend can copy it.

| Action | XP | Limit |
| --- | --- | --- |
| Training check-in | 50 | Once a day |
| Weekly target hit | 200 bonus | Once a week |
| Water target reached | 20 | Once a day |
| Habit ticked | 10 each | Up to 5 a day |
| New lift record (PR) | 100 | Per exercise and measurement, when it beats the previous best |
| Goal completed | 500 | Per goal |
| All of today done (training, water and all habits) | 30 bonus | Once a day |

Unticking something removes the XP it gave that day. That isn't XP "going down": the action never happened.

**Levels:** reaching level L needs `50 x L x (L - 1)` total XP. Level 2 = 100, level 5 = 1,000, level 10 = 4,500, level 20 = 19,000. A member doing everything for a week earns about 700-800 XP, so level 10 takes about 6 weeks. *(Starting values, Claude's call: tune after playing with them.)*

**Tiers** by level for the badge: Rookie 1-4, Regular 5-9, Athlete 10-19, Beast 20-34, Legend 35+.

### Medals

The existing medal system stays, and gets new categories:

- **Consistency:** consecutive weeks hit. Bronze 2, silver 4, gold 8, epic 16, legendary 26.
- **Hydration:** total days the water target was reached. 7 / 30 / 60 / 120 / 250.
- **Habits:** total habit ticks. 25 / 100 / 250 / 500 / 1,000.
- **Strength** (existing): now unlocked by **self-logged** lifts in solo mode. Today these medals need a coach-verified lift. In solo mode a self-logged lift counts toward the member's **own** medals. Anything public later (leaderboards, gym boards) still uses verified lifts only.
- **Body composition** (existing): stays. It shows "needs a scan" for members without scans.

Unlocking uses the existing `UnlockCelebration`.

### Avatar unlocks

Some avatar items are locked until a level, for example new outfits at levels 3, 5, 8, 12, 16 and 20. Locked items show in the editor with a lock and the level needed. Which items get locked comes from the existing catalog. *(Exact items: builder's call, with the user's review.)*

### Goals

The existing self-set goals (`POST /me/goals`, NewGoal page) stay. New goal types that need no scan: "Train N times this month", "Hit my weekly target N weeks in a row", "Lift X kg on bench, squat or deadlift". Scan-based goal types stay available but show "needs a scan" when there is none.

### Progress

Adds a **Training** section above the scan sections: a calendar heatmap of training days, weeks hit, and a level and XP history line. Scan sections stay as they are and show their empty state with no scans.

### Profile and Settings

Profile shows level, total XP, medal count and weeks hit. Settings adds: weekly target, water target and unit, habits (add, remove, rename, reorder), and **reset solo progress** (with confirmation).

## Gym features flag

A new `features` block in `src/brand.config.ts`:

```ts
export const features = {
  /** Community tab, leaderboards, rank card, gym-only copy. Off in solo mode. */
  gym: false,
};
```

- `gym: false` hides the Community tab, `/tabs/leaderboard` routes, the RankCard on Home, and the leaderboard opt-in in Settings.
- Scans, FitScore and body-composition medals still show if the member has scans. They're not gym-only UI, just empty without data.
- Tests cover both values of the flag.

## API contract (mocked now, real later)

All routes need the existing `mock.<fitId>` token. Dates are local calendar dates as `YYYY-MM-DD`, in the device's timezone. Until the backend exists, the new DTOs are written by hand in `src/api/types.ts`. Once the backend publishes them in `openapi.json`, they move to the generated `schema.d.ts` and `types.ts` re-exports them, as the other DTOs do.

| Route | Purpose |
| --- | --- |
| `GET /me/solo` | Solo profile: main goal, weekly target, water target and unit, habits. 404 until setup is done. |
| `PUT /me/solo` | Create or update the solo profile (setup and Settings). |
| `GET /me/today?date=` | Everything the Today screen needs: the day's log, the week's progress, XP and level, the next medal. |
| `PUT /me/days/:date` | Set the whole log for one day (training type or none, glasses, habit IDs ticked). Only today or yesterday; other dates return 409. Returns the updated `TodayDto` plus `xpGained` and `unlocked` medals. |
| `GET /me/days?from=&to=` | Day logs for a range (Progress heatmap). |
| `GET /me/xp` | Total XP, level, tier, XP into level, XP to next, plus a list of recent XP events. |
| `POST /me/lifts` | Log a lift record (exercise, measurement, weight, reps or duration). Saved as `verified: false`. Returns the record and any PR or medal unlocked. |
| `GET /me/lifts` | Exists. Now also returns self-logged records. |
| `GET /me/medals` | Medal status for all categories, including the new ones. |

`PUT` a whole day, not separate "add a glass" calls. One write per tap, it's idempotent, and it avoids double counting when a tap is retried.

### Example DTOs

```ts
type TrainingType = 'PUSH' | 'PULL' | 'LEGS' | 'FULL_BODY' | 'CARDIO' | 'OTHER';

interface SoloProfileDto {
  mainGoal: 'LOSE_FAT' | 'BUILD_MUSCLE' | 'GET_FITTER' | 'STAY_HEALTHY';
  weeklyTarget: number; // 2..6
  water: { target: number; unit: 'GLASS' | 'LITER' };
  habits: { id: string; key: string | null; label: string | null; order: number }[]; // key = preset (i18n), label = custom text
}

interface DayLogDto {
  date: string; // YYYY-MM-DD
  training: TrainingType | null;
  water: number;
  habitsDone: string[]; // habit ids
}

interface TodayDto {
  day: DayLogDto;
  editable: boolean;
  week: { start: string; daysTrained: number; target: number; hit: boolean; weeksInARow: number };
  xp: { total: number; level: number; tier: string; intoLevel: number; toNext: number };
  nextMedal: MedalStatus | null;
}
```

## Mock implementation

- **Storage:** each member's solo data is saved in Preferences, following the existing pattern (`lu.mock.goals.<fitId>`):
  - `lu.mock.solo.<fitId>`: the profile.
  - `lu.mock.days.<fitId>`: day logs keyed by date.
  - `lu.mock.lifts.<fitId>`: self-logged lifts.
  - Everything survives a restart.
- **Derived, not stored:** XP, level, weeks hit, streaks and medals are **recalculated from the day logs, lifts and goals** every time. Nothing derived is saved, so a rule change never leaves stale numbers. The data is small (one row per day), so this is cheap.
- **One rules module:** `src/api/mock/solo.ts` (pure functions, no I/O), next to `domain.ts`. The backend ports this file. It's fully unit-tested with fixed dates.
- **Fixtures:** Mohamed (101) gets about 8 weeks of history (mostly hitting 4 of 4, a missed week, habits and water), level around 8, and several medals. Lina (102) and Sara (140) stay brand-new for testing first run.
- `resetMockServer(date)` keeps pinning "today" for tests.

## Rules that must hold

- XP and medals depend only on the stored logs: same logs, same result.
- Only today and yesterday can be edited, both in the mock (409) and in the UI (read-only).
- A week is judged by days trained, never by consecutive days.
- Self-logged lifts never show as `verified`.
- All copy is in Egyptian Arabic and English, works in light and dark themes and on phone and tablet widths, and primary actions use `CtaButton` (project rules).

## Phases

1. **Contract and rules:** DTOs, `solo.ts` with tests, mock routes, Preferences storage, fixtures.
2. **Setup and Today:** first-run setup, the Today screen, the weekly ring, XP bar, edit-yesterday.
3. **Rewards:** new medal categories, level-up celebration, avatar unlocks.
4. **Progress, Goals, Settings:** training heatmap, new goal types, solo settings, reset.
5. **Lift logging:** log a record for the seven lifts, PR detection, strength medals from self-logged lifts.
6. **Gym flag:** hide Community and leaderboard pieces, with tests for both flag values.

Each phase ends with the app working and tests passing, and gets committed on `dev`.

## Left to the builder

- Exact avatar items behind each level.
- Visual design of the weekly ring, water glasses and heatmap, within the existing theme tokens and pixel style.
- Celebration animation details (GSAP is already in the project).
- The habit preset icons.

## Open questions for later (not blocking this phase)

- Real sign-up for solo users without a gym (phone number? Google?) arrives with the backend. Fit ID stays in the mock.
- Local reminders (Capacitor Local Notifications, no server needed): add in this phase or the next?
- Backup and export before the backend exists, since uninstalling the app wipes Preferences.
