# Sprint 1 Backlog: Frontend MVP (mock data)

This is the Jira-ready backlog for Sprint 1. Each story below becomes one Jira issue. The build steps for each story are in the [Sprint 1 plan](../superpowers/plans/2026-11-13-sprint-1-frontend-mvp.md). This file says what "done" looks like to a user.

**Sprint goal:** a member can open the app, sign in with a Fit ID, and use all five tabs in English or Arabic, in light or dark mode, on any screen size. All data comes from the built-in mock server. There is no backend yet; it will be built in the separate `levelup-backend` repo.

**Epic:** Sprint 1 — Frontend MVP (mock data)

**Total:** 20 stories, 65 points.

## How to read a story

- **Story:** who wants what, and why.
- **Acceptance criteria (AC):** numbered checks. A story is accepted only when every one passes.
- **UI/UX examples:** the exact copy in both languages, a sketch of the layout, and what each state looks like.
- **Plan task:** the task in the Sprint 1 plan that builds it.

## Definition of Done (applies to every story)

Add this checklist to every Jira issue. A story is not done until all of these pass, on top of its own AC.

1. Every visible string comes from `en.json` and `ar.json`. No text is hard-coded.
2. In Arabic the screen is right-to-left: text aligns right, back arrows and chevrons flip, and numbers stay readable (`+0.8 kg` never scrambles).
3. The screen looks correct in light and dark mode. No color is hard-coded.
4. No horizontal scroll at 320 px. The layout works at 390 px, 768 px, and 1280 px, in portrait and landscape.
5. Nothing sits under the notch or the home indicator.
6. Every tap target is at least 44×44 px, and every icon-only button has a screen-reader label.
7. Loading shows skeleton placeholders. Errors show a message with a Retry button. Empty data shows an empty state, never a blank card, `NaN`, or `undefined`.
8. Unit tests pass, and a Playwright test covers the flow in `en` and `ar`, light and dark.
9. The bundle stays within budget: initial JS ≤ 200 KB gzip, each tab chunk ≤ 80 KB gzip.
10. Commits follow the `git-workflow` skill, with no AI attribution.

## Mock members used in the examples

| Fit ID | Name | Use it to test |
|---|---|---|
| `100001` | Sam Khalil | The full experience: 6 scans, goals, notifications, opted in to the leaderboard |
| `100002` | Lina Haddad | A brand-new member: no scans, no goals, not on the leaderboard |
| `100003` | Omar Aziz | One scan only, FitScore hidden, membership ending in 10 days |

Suggested values for Sam, so screenshots and examples match: FitScore 72 (Strong), up 3 since the last scan. Rank #4 of 13 on Top Score. Mission "Lose 5 kg of body fat", 3.0 of 5.0 kg done. This month: body fat −1.2%, muscle +0.8 kg.

The Arabic copy below is a first draft. A native speaker should review it before release.

---

## Foundation

### S1-01 Ionic app scaffold

**Type:** Task · **Points:** 3 · **Plan task:** 1

**Story:** As a developer, I want a working project skeleton, so that every later story has a place to live and a way to be tested.

**Acceptance criteria**
1. The Ionic app lives at the root of the `LevelUP` repo, and `npm install` there installs everything, with no errors.
2. `npm run dev` serves the app at `http://localhost:5173`.
3. `npm test` runs the unit tests and passes.
4. `npm run test:e2e` runs Playwright on all 5 device projects (iphone, android, small, tablet, desktop) and passes.
5. Loading `/` returns the app with no console errors.
6. The repo has `master`, `dev`, and `feature/sprint-1-frontend-mvp` branches.

**UI/UX examples**
- Nothing user-visible yet. The page can be blank, but it must load without errors.

---

### S1-02 Languages, themes, and safe-area shell

**Type:** Story · **Points:** 5 · **Plan task:** 2

**Story:** As a member, I want the app in my language and my preferred theme, so that it feels natural to use.

**Acceptance criteria**
1. On first launch, the app uses Arabic if the device language is Arabic. Otherwise it uses English.
2. Switching to Arabic sets the whole page to right-to-left immediately, without a reload.
3. Switching to English sets it back to left-to-right.
4. The theme can be System, Light, or Dark. System is the default and follows the device, including when the device changes while the app is open.
5. Language and theme choices survive closing and reopening the app.
6. `en.json` and `ar.json` have exactly the same keys. A missing key fails the tests.
7. Signed numbers show as `+0.8 kg`, `−1.2%` (with a real minus sign), or `—` when there is no value, in both languages.
8. Numbers use Latin digits (0–9) in both languages.
9. On a notched phone, the page header starts below the notch, and the last item in any list can scroll clear of the tab bar.

**UI/UX examples**

| Token | Light mode | Dark mode |
|---|---|---|
| Page background | Near-white | Near-black |
| Card surface | White | Dark gray, slightly lighter than the page |
| Main text | Near-black | Near-white |
| Muted text | Mid gray | Light gray |
| Positive change | Green | Lighter green |
| Negative change | Red | Lighter red |

Signed numbers in a sentence, in both directions:

```
English:   Muscle gained   +0.8 kg
Arabic:    +0.8 kg   العضلات المكتسبة
```

The number, sign, and unit keep the same order in both.

---

### S1-03 API data types and mock server

**Type:** Task · **Points:** 5 · **Plan task:** 3

**Story:** As a developer, I want realistic fake data behind the same interface the real API will use, so that screens can be built now and switched to the real backend later with no changes.

**Acceptance criteria**
1. With `VITE_USE_MOCKS=true`, the app makes no network requests to any server.
2. Signing in with `100001`, `100002`, or `100003` works. Any other ID is rejected.
3. The sixth sign-in attempt within 60 seconds is refused with a "too many tries" result.
4. Any data request without a signed-in member is refused, and the app returns to the login screen.
5. Lina (`100002`) gets empty values for FitScore, mission, and monthly wins. No response contains `NaN`.
6. When a member opts out of the leaderboard, they disappear from all four boards on the next request.
7. Marking all notifications read sets the unread count to 0.
8. Dates in the mock data are relative to today, so "this month" and "ends in 10 days" are always true.
9. No screen or component imports from the mock folder directly. A lint rule fails the build if one does.
10. Each mock response takes about 300 ms, so loading states are visible.

**UI/UX examples**
- Not visible on its own. Its effect is that every screen shows a loading skeleton for a moment before the data appears.

---

## Platform

### #15 White-label branding

**Type:** Story · **Points:** 3 · **Plan task:** 4

**Story:** As a gym owner, I want the app to carry my gym's name, logo, and colors, so that members see it as our app.

**Acceptance criteria**
1. Changing the gym name, logo path, and brand colors in `brand.config.ts` rebrands the whole app. No other file needs to change.
2. The gym name appears as the browser or app title.
3. The primary color drives buttons, the active tab, progress rings, and chart lines.
4. Brand colors work in both light and dark mode. Text on a primary-colored button stays readable in both.
5. No component file contains a color value. The color check script passes.

**UI/UX examples**

| Config value | Where a member sees it |
|---|---|
| `gymName: "Iron Gym"` | Splash screen under the logo, the app title, the Profile header |
| `logo` | Splash screen (large), Login screen (small) |
| `colors.primary` | "Sign in" button, active tab pill, mission progress ring |
| `colors.accent` | FitScore tier badge, "Renews soon" badge |

Check: set primary to red in the config. Every button, the tab pill, and the progress ring turn red. Nothing stays the old color.

---

### #16 Bottom tab navigation

**Type:** Story · **Points:** 3 · **Plan task:** 4

**Story:** As a member, I want to move between the main sections with one tap, so that everything is easy to reach.

**Acceptance criteria**
1. The bar has exactly 5 tabs in this order: Home, Progress, Goals, Leaderboard, Profile.
2. The bar floats above the page with rounded corners, and page content scrolls behind it.
3. A pill highlights the active tab and slides to the new tab in about 250 ms when you switch.
4. In Arabic, the tab order is mirrored (Home is on the right), and the pill slides in the mirrored direction.
5. On a phone with a home indicator, the bar sits fully above it.
6. Below 360 px wide, only icons show. Screen readers still announce each tab's name.
7. On screens wider than 480 px, the bar stays centered at a maximum width of 480 px.
8. Opening any tab URL while signed out sends you to the login screen.
9. With "reduce motion" turned on in the device settings, the pill jumps instead of sliding.

**UI/UX examples**

```
English (left to right)
╭────────────────────────────────────────────────╮
│ (⌂ Home)   ↗ Progress   ◎ Goals   ≡ Board   ☺ Me │
╰────────────────────────────────────────────────╯
   ▲ active pill

Arabic (right to left)
╭────────────────────────────────────────────────╮
│ ☺ حسابي   ≡ المتصدرون   ◎ الأهداف   ↗ التقدّم   (⌂ الرئيسية) │
╰────────────────────────────────────────────────╯
                                          ▲ active pill
```

| Tab | English | Arabic |
|---|---|---|
| 1 | Home | الرئيسية |
| 2 | Progress | التقدّم |
| 3 | Goals | الأهداف |
| 4 | Leaderboard | المتصدرون |
| 5 | Profile | حسابي |

---

## Onboarding

### #1 Splash screen

**Type:** Story · **Points:** 3 · **Plan task:** 5

**Story:** As a member, I want a welcoming first screen, so that opening the app feels like the start of something.

**Acceptance criteria**
1. The screen shows the gym logo inside a softly pulsing glow ring, over a slowly drifting starfield.
2. Under the logo are the gym name, the tagline, and "Tap to Begin".
3. Tapping anywhere on the screen moves on: to Login if signed out, or straight to Home if already signed in.
4. Tapping plays the tap sound, unless sound is muted.
5. The sound toggle is in the top corner (top-right in English, top-left in Arabic).
6. With "reduce motion" on, the starfield and the ring stay still.
7. On a notched phone, the starfield fills the whole screen including behind the notch, but the logo, text, and sound toggle stay inside the safe area.
8. In landscape on a small phone (667×375), "Tap to Begin" is visible without scrolling.
9. The logo image is 100 KB or smaller.

**UI/UX examples**

```
┌──────────────────────────┐
│ ·    ·        ·     🔊  │  ← sound toggle, inside safe area
│    ·       ·       ·     │
│        ╭───────╮         │
│   ·    │ LOGO  │  ·      │  ← glow ring pulses
│        ╰───────╯         │
│         Iron Gym         │
│ Track. Improve. Transform. │
│                          │
│  ·    Tap to Begin    ·  │  ← gently fades in and out
└──────────────────────────┘
```

| Text | English | Arabic |
|---|---|---|
| Tagline | Track. Improve. Transform. | تابع. تطوّر. تحوّل. |
| Call to action | Tap to Begin | اضغط للبدء |

---

### #2 Fit ID login

**Type:** Story · **Points:** 3 · **Plan task:** 5

**Story:** As a member, I want to sign in with the ID the front desk gave me, so that I don't need to remember a password.

**Acceptance criteria**
1. The screen has one field labeled "Fit ID" and one "Sign in" button. There is no password field.
2. The field opens the numeric keypad on phones and accepts digits only. Typing `12ab` leaves `12`.
3. The field accepts at most 8 digits.
4. The "Sign in" button is disabled until 6 to 8 digits are entered.
5. A valid ID signs the member in and opens the Home tab.
6. An unknown ID shows the "not found" message under the field. The field keeps its value so the member can correct it.
7. After too many attempts, the "too many tries" message shows instead.
8. While the request is running, the button shows a spinner and can't be pressed twice.
9. A successful sign-in plays the success sound, unless sound is muted.
10. Closing and reopening the app keeps the member signed in.
11. The Fit ID field is always left-to-right, even in Arabic, because it is a number.

**UI/UX examples**

```
┌──────────────────────────┐
│                      🔊  │
│         [logo]           │
│     Welcome to Iron Gym  │
│                          │
│  Fit ID                  │
│  ┌────────────────────┐  │
│  │ 100001             │  │
│  └────────────────────┘  │
│  Ask the front desk if   │  ← helper text
│  you don't have one.     │
│                          │
│  ┌────────────────────┐  │
│  │      Sign in       │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

| State | English | Arabic |
|---|---|---|
| Field label | Fit ID | رقم العضوية |
| Helper text | Ask the front desk if you don't have one. | اسأل مكتب الاستقبال إن لم يكن لديك رقم. |
| Button | Sign in | تسجيل الدخول |
| Unknown ID | We couldn't find that Fit ID. Check with the front desk. | لم نعثر على رقم العضوية هذا. راجع مكتب الاستقبال. |
| Too many tries | Too many tries. Wait a minute and try again. | محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً. |

Try it: `100001` signs in. `999999` shows "not found". Six quick wrong tries show "too many tries".

---

### #3 Sound toggle

**Type:** Story · **Points:** 2 · **Plan task:** 5

**Story:** As a member, I want to mute the app's sounds, so that I can use it quietly at the gym.

**Acceptance criteria**
1. A speaker icon button appears on the Splash and Login screens, and as a switch in Profile → Settings.
2. Sound is on by default.
3. Tapping the button mutes or unmutes. The icon changes between a speaker and a crossed-out speaker.
4. When muted, no sound plays anywhere in the app.
5. The choice is saved on the device and survives a restart.
6. Changing it in one place updates the other places straight away.
7. Screen readers announce "Mute sound" when sound is on and "Unmute sound" when it is off.
8. Each sound file is 20 KB or smaller.

**UI/UX examples**

| State | Icon | Screen-reader label (English) | Arabic |
|---|---|---|---|
| Sound on | 🔊 | Mute sound | كتم الصوت |
| Sound off | 🔇 | Unmute sound | تشغيل الصوت |

Sounds play on: tapping the splash screen (tap) and a successful sign-in (success).

---

## Dashboard (Home tab)

Layout of the whole Home tab, for reference:

```
┌──────────────────────────┐
│ Good morning, Sam     🔔•│  ← #4 greeting, #9 bell
│ "Small steps every day." │
│ ┌──────────────────────┐ │
│ │ FitScore     Private │ │  ← #6
│ │   72   Strong    ▲+3 │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ #4 in the gym · Top 31% │  ← #5
│ │ 2 points to climb to #3 │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ◔ 60%  Lose 5 kg fat │ │  ← #7
│ │ 3.0 of 5.0 kg · Dec 18 │
│ └──────────────────────┘ │
│ ┌─────────┐ ┌─────────┐  │
│ │ −1.2%   │ │ +0.8 kg │  │  ← #8
│ │ Body fat│ │ Muscle  │  │
│ └─────────┘ └─────────┘  │
│   ╭──── tab bar ────╮    │
└──────────────────────────┘
```

On screens 768 px and wider, the cards sit in two columns. Pulling down refreshes the data. The whole tab loads with one data request.

### #4 Personalized greeting

**Type:** Story · **Points:** 2 · **Plan task:** 6

**Story:** As a member, I want to be greeted by name with a bit of motivation, so that the app feels personal.

**Acceptance criteria**
1. The greeting uses the member's first name and depends on the time of day on their device (see the table).
2. Under the greeting is a motivational quote.
3. The quote stays the same all day and changes the next day.
4. There are at least 14 quotes, each in English and Arabic.
5. A long name or long quote wraps onto more lines. It never pushes the bell off screen or gets cut off.

**UI/UX examples**

| Device time | English | Arabic |
|---|---|---|
| 05:00–11:59 | Good morning, Sam | صباح الخير يا سام |
| 12:00–16:59 | Good afternoon, Sam | طاب يومك يا سام |
| 17:00–21:59 | Good evening, Sam | مساء الخير يا سام |
| 22:00–04:59 | Late session, Sam? Respect. | تمرين في وقت متأخر يا سام؟ كل الاحترام. |

Example quotes: "Small steps every day." / "خطوات صغيرة كل يوم." and "You showed up. That's the hard part." / "حضرت اليوم، وهذا أصعب جزء."

---

### #5 Leaderboard summary card

**Type:** Story · **Points:** 2 · **Plan task:** 6

**Story:** As a member, I want to see where I stand in the gym at a glance, so that I'm motivated to climb.

**Acceptance criteria**
1. For a member on the leaderboard, the card shows their rank on the Top Score board, their top percentage, how many members are behind them, and how many points they need to climb one place.
2. At rank 1, the "points to climb" line is replaced with the "You're #1" line.
3. For a member who hasn't opted in, the card shows the join prompt instead. Tapping it opens Profile → Settings.
4. For a member who has opted in but has no scan yet, the card says they'll be ranked after their first scan.
5. Tapping the card (in the ranked state) opens the Leaderboard tab.
6. The rank (`#4`) reads correctly in Arabic and is not reversed.

**UI/UX examples**

| State | English | Arabic |
|---|---|---|
| Ranked (Sam) | #4 in the gym · Top 31% | #4 في النادي · ضمن أفضل 31% |
| Members behind | 9 members behind you | 9 أعضاء خلفك |
| Nudge | 2 FitScore points to climb to #3 | نقطتان للصعود إلى المركز #3 |
| Rank 1 | You're #1, defend it! | أنت في المركز الأول، حافظ عليه! |
| Not opted in (Lina) | Join the FitScore leaderboard | انضم إلى لوحة المتصدرين |
| Opted in, no scan | You'll be ranked after your first scan. | سيظهر ترتيبك بعد أول فحص. |

---

### #6 FitScore card

**Type:** Story · **Points:** 3 · **Plan task:** 6

**Story:** As a member, I want one clear number for my body composition, so that I can tell if I'm improving without reading a full report.

**Acceptance criteria**
1. The card shows the score (0–100) as the largest number on the screen, the tier name, and the change since the last scan.
2. The tier matches the score: Elite 85+, Strong 70–84, On Track 55–69, Building 40–54, Needs Improvement below 40.
3. An increase shows ▲ with a plus sign in the positive color. A decrease shows ▼ with a minus sign in the negative color. No change, or only one scan, shows `—`.
4. The ▲ and ▼ arrows are not mirrored in Arabic.
5. The card has a small "Private" label with a lock icon.
6. A member with no scans (Lina) sees the empty state instead of a score.
7. A member who turned off "Show FitScore" (Omar) doesn't see the card at all. The other cards move up to fill the space.
8. The score size scales with the screen and never overflows the card at 320 px.

**UI/UX examples**

```
┌──────────────────────────┐
│ FitScore        🔒 Private │
│                          │
│   72      Strong         │
│           ▲ +3 since last scan │
└──────────────────────────┘
```

| Element | English | Arabic |
|---|---|---|
| Title | FitScore | FitScore |
| Label | Private | خاص |
| Change | ▲ +3 since last scan | ▲ +3 منذ آخر فحص |
| Empty state | Your FitScore appears after your first scan. | ستظهر نتيجتك بعد أول فحص. |

| Tier | Score | Arabic |
|---|---|---|
| Elite | 85–100 | نخبة |
| Strong | 70–84 | قوي |
| On Track | 55–69 | على المسار |
| Building | 40–54 | في طور البناء |
| Needs Improvement | 0–39 | يحتاج إلى تحسين |

---

### #7 Current mission card

**Type:** Story · **Points:** 3 · **Plan task:** 6

**Story:** As a member, I want to see my active goal and how close I am, so that I stay focused on it.

**Acceptance criteria**
1. The card shows the goal title, a progress ring with the percentage, kilograms done out of the total, the estimated completion date, and the coach's note.
2. The ring fills clockwise in English and counter-clockwise in Arabic, and animates from 0 when the card first appears.
3. The percentage never shows below 0% or above 100%.
4. If there isn't enough progress to estimate a date, the card shows the "keep going" line instead of a date.
5. If there is no coach note, that line is left out, with no empty gap.
6. A member with no active goal (Lina) sees the empty state.
7. Dates are written in the app's language (for example "Dec 18" / "18 ديسمبر").
8. Tapping the card opens the Goals tab.

**UI/UX examples**

```
┌──────────────────────────┐
│ Current mission          │
│  ╭───╮  Lose 5 kg of body fat │
│  │60%│  3.0 of 5.0 kg    │
│  ╰───╯  On track for Dec 18 │
│ 💬 "Great pace. Keep protein high." │
│    Coach Maya            │
└──────────────────────────┘
```

| Element | English | Arabic |
|---|---|---|
| Title | Current mission | المهمة الحالية |
| Progress | 3.0 of 5.0 kg | 3.0 من 5.0 كجم |
| Estimate | On track for Dec 18 | الموعد المتوقع 18 ديسمبر |
| No estimate | Keep going to see your ETA | واصل التقدّم لمعرفة الموعد المتوقع |
| Empty state | No active mission. Your coach will set one soon. | لا توجد مهمة حالية. سيحدد مدربك واحدة قريباً. |

---

### #8 Monthly wins

**Type:** Story · **Points:** 2 · **Plan task:** 6

**Story:** As a member, I want to see what I achieved this month, so that I notice my progress.

**Acceptance criteria**
1. There are exactly 2 tiles: body fat change and muscle gained this month.
2. Each tile shows a signed value with its unit and a label.
3. A good change is in the positive color: body fat going down, muscle going up. A bad change is in the negative color.
4. When there isn't enough data for a value, the tile shows `—` in the muted color. It never shows `0`, `NaN`, or an empty tile.
5. The two tiles sit side by side at every width from 320 px up.
6. The section title names the current month in the app's language.

**UI/UX examples**

```
November wins
┌───────────┐ ┌───────────┐
│  −1.2%    │ │  +0.8 kg  │   ← both green (both are good news)
│ Body fat  │ │  Muscle   │
└───────────┘ └───────────┘
```

| Element | English | Arabic |
|---|---|---|
| Title | November wins | إنجازات نوفمبر |
| Tile 1 | Body fat | دهون الجسم |
| Tile 2 | Muscle | العضلات |
| No data | — | — |

Color check: body fat `+0.5%` is red (fat went up). Muscle `−0.3 kg` is red (muscle went down).

---

### #9 Notifications

**Type:** Story · **Points:** 3 · **Plan tasks:** 6 (bell), 9 (list)

**Story:** As a member, I want to know when something new happens, so that I don't miss my results.

**Acceptance criteria**
1. A bell icon sits in the Home header, on the side opposite the greeting.
2. A dot shows on the bell when there are unread notifications, and no dot when there are none.
3. Tapping the bell opens a list, newest first.
4. Unread items are bold with a dot. Read items are regular weight.
5. Tapping an unread item marks it read.
6. "Mark all read" marks every item read and clears the bell's dot.
7. Each item shows a title, a short body, and how long ago it arrived ("2 hours ago").
8. With no notifications at all, the list shows the empty state.
9. The list closes with a close button, by swiping down, or with the back button on Android.
10. Screen readers announce the bell as "Notifications, 2 unread".

**UI/UX examples**

```
┌──────────────────────────┐
│ Notifications  Mark all read  ✕ │
├──────────────────────────┤
│ • New scan results are in       │  ← unread: bold + dot
│   Your FitScore is now 72.      │
│   2 hours ago                   │
├──────────────────────────┤
│   Mission complete!             │  ← read: regular
│   You hit "Gain 2 kg of muscle".│
│   3 days ago                    │
└──────────────────────────┘
```

| Element | English | Arabic |
|---|---|---|
| Title | Notifications | الإشعارات |
| Button | Mark all read | تحديد الكل كمقروء |
| Scan result | New scan results are in | نتائج فحصك الجديد جاهزة |
| Mission done | Mission complete! | اكتملت المهمة! |
| Empty state | You're all caught up. | لا توجد إشعارات جديدة. |
| Bell label | Notifications, 2 unread | الإشعارات، 2 غير مقروءة |

---

## Progress tab

### #10 Latest scan results

**Type:** Story · **Points:** 2 · **Plan task:** 7

**Story:** As a member, I want the full numbers from my last body scan, so that I can see the detail behind my score.

**Acceptance criteria**
1. A "Latest scan" section shows the scan date and all 9 measurements: weight, muscle, body fat, BMI, visceral fat, water, protein, minerals, and BMR.
2. Each row has a label, a value, and a unit.
3. Values use one decimal place, except BMR and visceral fat level, which are whole numbers.
4. A member with no scans (Lina) sees the empty state instead.
5. When "Show FitScore" is off, no FitScore value appears in this section.
6. At 320 px every row fits on one line, or wraps cleanly with the value still next to its label.

**UI/UX examples**

```
Latest scan · Nov 5, 2026
Weight ............ 82.4 kg
Muscle ............ 36.1 kg
Body fat .......... 18.6 %
BMI ............... 25.4
Visceral fat ...... 8
Water ............. 47.2 kg
Protein ........... 12.8 kg
Minerals .......... 4.3 kg
BMR ............... 1,780 kcal
```

| Label | Arabic | Unit |
|---|---|---|
| Weight | الوزن | kg / كجم |
| Muscle | العضلات | kg / كجم |
| Body Fat | دهون الجسم | % |
| BMI | مؤشر كتلة الجسم | none |
| Visceral Fat | الدهون الحشوية | level |
| Water | الماء | kg / كجم |
| Protein | البروتين | kg / كجم |
| Minerals | المعادن | kg / كجم |
| BMR | معدل الأيض الأساسي | kcal / سعرة |

Empty state: "No scans yet. Book one at the front desk." / "لا توجد فحوصات بعد. احجز فحصاً من مكتب الاستقبال."

---

### #11 Progress charts

**Type:** Story · **Points:** 5 · **Plan task:** 7

**Story:** As a member, I want to see how my body has changed over time, so that I can tell my training is working.

**Acceptance criteria**
1. The page shows a body composition chart with three lines: weight (kg), muscle (kg), and body fat (%).
2. Below it is a FitScore chart with a fixed scale from 0 to 100.
3. Each line has a legend entry. Tapping a legend entry hides or shows that line.
4. Tapping a point shows its exact value and date.
5. In Arabic, time runs right to left, and the body fat scale moves to the left side.
6. Chart colors change with the theme and stay readable in dark mode.
7. With only one scan (Omar), the charts are replaced by the "second scan" message.
8. With "Show FitScore" off (Omar), the FitScore chart is not shown at all.
9. The charts load after the rest of the page, with a skeleton in their place meanwhile, so the page opens fast.
10. Each chart has a text summary for screen readers (for example "Weight went from 85.0 to 82.4 kg over 6 scans").

**UI/UX examples**

```
Body composition
 kg                           %
 85 ●─╮                       22
      ╰─●──●─╮  weight
 36 ●──●──●──●──●──● muscle   18
    ╲___ body fat ___●
    Jun Jul Aug Sep Oct Nov
 ● Weight  ● Muscle  ● Body fat

FitScore
100
 72            ●──●
 60   ●──●──●
  0 ─────────────────
    Jun Jul Aug Sep Oct Nov
```

| Element | English | Arabic |
|---|---|---|
| Chart 1 title | Body composition | تكوين الجسم |
| Chart 2 title | FitScore over time | FitScore عبر الوقت |
| One scan only | Your trends appear after your second scan. | ستظهر اتجاهاتك بعد الفحص الثاني. |

---

## Goals tab

### #12 Goals page

**Type:** Story · **Points:** 3 · **Plan task:** 8

**Story:** As a member, I want to see all my goals in one place, so that I know what I'm working on, what I've achieved, and what's next.

**Acceptance criteria**
1. A switch at the top has three options: Active, Completed, Upcoming. Active is selected first.
2. Each goal card shows its title, the start and target values, and the deadline.
3. Active goals also show a progress bar with a percentage.
4. Completed goals show a check mark and the date they were completed, instead of a progress bar.
5. Upcoming goals show "Starts after your current mission" and no progress bar.
6. The progress bar fills from left to right in English and from right to left in Arabic.
7. An option with no goals shows the empty state.
8. A deadline in the past on an active goal is marked "Overdue" in the negative color.
9. Switching options is instant, with no reload.

**UI/UX examples**

```
[ Active ]  Completed   Upcoming

┌──────────────────────────┐
│ Lose 5 kg of body fat    │
│ 20.0 → 15.0 kg           │
│ ████████████░░░░░░░ 60%  │
│ Due Dec 31, 2026         │
└──────────────────────────┘
```

| Element | English | Arabic |
|---|---|---|
| Options | Active / Completed / Upcoming | الحالية / المكتملة / القادمة |
| Deadline | Due Dec 31, 2026 | الموعد النهائي 31 ديسمبر 2026 |
| Completed | ✓ Completed Oct 12, 2026 | ✓ اكتمل في 12 أكتوبر 2026 |
| Upcoming | Starts after your current mission | يبدأ بعد مهمتك الحالية |
| Overdue | Overdue | متأخر |
| Empty state | Nothing here yet | لا يوجد شيء هنا بعد |

In Arabic, the range reads `20.0 ← 15.0 كجم`, with the arrow pointing from start to target in the reading direction.

---

## Leaderboard tab

### #13 Full gym leaderboard

**Type:** Story · **Points:** 5 · **Plan task:** 8

**Story:** As a member, I want to compare my results with others who chose to share theirs, so that I get some friendly competition.

**Acceptance criteria**
1. A switch at the top has four boards: Top Score, Top Progress, Most Muscle, Most Fat Lost. Top Score is selected first.
2. The app remembers the last board the member looked at.
3. Each row shows a rank, a name in the form "Sam K.", and a value formatted for that board (see the table).
4. The top three ranks get a gold, silver, and bronze marker.
5. The member's own row is highlighted, and the list scrolls so it is visible.
6. Only members who opted in appear. A member who hasn't opted in sees a banner at the top with a Join button.
7. Tapping Join adds the member to the boards straight away, and the banner disappears.
8. The three monthly boards list only members with a result this month. If nobody has one, the board shows the empty state.
9. A member who just joined but has no scan (Lina) doesn't appear on any board, and sees a line explaining why.
10. Long names are cut off with an ellipsis and never push the value off screen.
11. Scrolling stays smooth with 100 or more rows.

**UI/UX examples**

```
[Top Score] Top Progress  Most Muscle  Most Fat Lost

 🥇 1   Nour A.          88
 🥈 2   Karim S.         81
 🥉 3   Maya R.          74
┃   4   Sam K. (you)     72 ┃   ← highlighted
    5   Yara M.          69
```

| Board | English | Arabic | Value example |
|---|---|---|---|
| Top Score | Top Score | أعلى نتيجة | `72` |
| Top Progress | Top Progress | أكبر تقدّم | `+4 pts` / `+4 نقاط` |
| Most Muscle | Most Muscle | أكثر عضلات | `+0.8 kg` |
| Most Fat Lost | Most Fat Lost | أكثر خسارة دهون | `−1.2%` |

| State | English | Arabic |
|---|---|---|
| Not opted in | Your FitScore is hidden from the leaderboard. | نتيجتك مخفية عن لوحة المتصدرين. |
| Button | Join | انضم |
| Joined, no scan | You'll appear here after your first scan. | ستظهر هنا بعد أول فحص. |
| Empty board | No results yet this month | لا توجد نتائج هذا الشهر بعد |
| Your row | (you) | (أنت) |

---

## Profile tab

### #14 Member profile and settings

**Type:** Story · **Points:** 5 · **Plan task:** 9

**Story:** As a member, I want to see my details and control my settings, so that the app works the way I like and I decide what I share.

**Acceptance criteria**
1. The page shows three sections: Personal (name, Fit ID, age, height), Membership (plan, start and end dates), and Coach (name).
2. When the membership ends within 14 days (Omar), a "Renews soon" badge shows next to the end date.
3. A member with no coach sees "No coach assigned".
4. Settings has these rows: Language, Theme, Sound, Show FitScore, Show my FitScore on the leaderboard, and Sign out.
5. Changing Language switches the whole app and its direction immediately.
6. Changing Theme switches the whole app immediately.
7. Turning off "Show FitScore" hides the FitScore card on Home and the FitScore chart on Progress, without a reload.
8. Turning off the leaderboard setting removes the member from all boards straight away.
9. The two FitScore settings are independent. Changing one never changes the other.
10. If saving a setting fails, the switch goes back to where it was, and a short message says so.
11. Sign out asks for confirmation, then returns to the Login screen. After that, tab pages can't be opened without signing in again.
12. Each switch has a one-line explanation under its label.

**UI/UX examples**

```
┌──────────────────────────┐
│  (SK)  Sam Khalil        │
│        Fit ID 100001     │
├─ Personal ───────────────┤
│ Age            29        │
│ Height         178 cm    │
├─ Membership ─────────────┤
│ Plan           Gold      │
│ Jan 5 – Dec 31, 2026     │
├─ Coach ──────────────────┤
│ Maya Rahman              │
├─ Settings ───────────────┤
│ Language        English ›│
│ Theme            System ›│
│ Sound                [●] │
│ Show FitScore        [●] │
│  Hide it from your own screens │
│ Show on leaderboard  [●] │
│  Let other members see your results │
│ Sign out                 │
└──────────────────────────┘
```

| Element | English | Arabic |
|---|---|---|
| Sections | Personal / Membership / Coach / Settings | البيانات الشخصية / العضوية / المدرب / الإعدادات |
| Badge | Renews soon | التجديد قريباً |
| No coach | No coach assigned | لم يُعيَّن مدرب |
| Language | Language: English / العربية | اللغة: English / العربية |
| Theme | Theme: System / Light / Dark | المظهر: النظام / فاتح / داكن |
| Show FitScore | Show FitScore | إظهار FitScore |
| Leaderboard | Show my FitScore on the leaderboard | إظهار نتيجتي في لوحة المتصدرين |
| Save failed | Couldn't save. Try again. | تعذّر الحفظ. حاول مجدداً. |
| Sign out | Sign out | تسجيل الخروج |
| Confirm | Sign out of Iron Gym? | هل تريد تسجيل الخروج من Iron Gym؟ |

---

## Wrap-up

### S1-04 End-to-end suite, visual check, and README

**Type:** Task · **Points:** 3 · **Plan task:** 10

**Story:** As the product owner, I want proof that the whole app works together, so that I can trust the sprint before the backend work starts.

**Acceptance criteria**
1. One automated journey passes on all 5 device sizes, in both languages and both themes: splash → sign in → visit all 5 tabs → sign out.
2. A second journey signs in as the new member (`100002`), visits every tab, and confirms each one shows an empty state, with no `NaN` or `undefined` anywhere on the page.
3. No screen scrolls sideways at 320 px in either language.
4. On the iPhone size, the tab bar sits above the home indicator on every tab.
5. Every tab has been looked at in Arabic + dark mode, on the notched iPhone size and at 320 px, and any problems found are fixed.
6. The measured bundle sizes are within budget and are written in the README.
7. The README explains how to install and run the app, the three mock Fit IDs, how to turn the mock data off, and how to rebrand for another gym.
8. A pull request into `dev` is open, with screenshots in light, dark, and Arabic.

**UI/UX examples**
- Sprint demo script: open the app → tap the splash → sign in as `100001` → show Home → switch to Arabic in Profile → switch to dark mode → walk through each tab → turn off Show FitScore and return to Home → sign out → sign in as `100002` to show the empty states.

---

## Story summary

| Key | Story | Points | Plan task |
|---|---|---|---|
| S1-01 | Ionic app scaffold | 3 | 1 |
| S1-02 | Languages, themes, and safe-area shell | 5 | 2 |
| S1-03 | API data types and mock server | 5 | 3 |
| #15 | White-label branding | 3 | 4 |
| #16 | Bottom tab navigation | 3 | 4 |
| #1 | Splash screen | 3 | 5 |
| #2 | Fit ID login | 3 | 5 |
| #3 | Sound toggle | 2 | 5 |
| #4 | Personalized greeting | 2 | 6 |
| #5 | Leaderboard summary card | 2 | 6 |
| #6 | FitScore card | 3 | 6 |
| #7 | Current mission card | 3 | 6 |
| #8 | Monthly wins | 2 | 6 |
| #9 | Notifications | 3 | 6, 9 |
| #10 | Latest scan results | 2 | 7 |
| #11 | Progress charts | 5 | 7 |
| #12 | Goals page | 3 | 8 |
| #13 | Full gym leaderboard | 5 | 8 |
| #14 | Member profile and settings | 5 | 9 |
| S1-04 | End-to-end suite, visual check, and README | 3 | 10 |
| | **Total** | **65** | |

Suggested order: S1-01 → S1-02 → S1-03 → #15 and #16 → #1 to #3 → #4 to #9 → #10 and #11 → #12 and #13 → #14 → S1-04.
