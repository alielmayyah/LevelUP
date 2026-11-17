# Solo Milestone 1, in Plain Words

The goal is to make LevelUP useful **every day**, not only on scan day.

- Technical plan: [plans/2026-11-17-solo-milestone-1.md](superpowers/plans/2026-11-17-solo-milestone-1.md)
- Full design: [specs/2026-11-17-solo-experience-design.md](superpowers/specs/2026-11-17-solo-experience-design.md)

## What you'll be able to do when it's done

1. Open the app and answer 5 quick questions:
   - What's your goal?
   - How many days a week do you train?
   - How much water a day?
   - Which habits? (creatine, vitamins, sleep, and so on)
   - What does your avatar look like?
2. See a **Today** screen with:
   - a button: "I trained today"
   - water glasses to tap
   - your habits to tick (like creatine)
   - a ring: "2 of 3 workouts this week"
   - your level and points
3. Every tap gives points. Points level you up.
4. Close the app, open it tomorrow, and everything is still there.

There's no server, gym or coach in this milestone: just you and the app.

## Who does what

| Who | Job |
| --- | --- |
| **You** | Wait for "ready", try it on your phone, and say what feels good or bad. |
| **Developer** | Build it, test it, fix bugs. |

## Before we start: new look

The pixel style is gone. First, every existing screen gets restyled to a **clean, modern look**: soft rounded cards, clean fonts and simple line icons, like Apple Fitness or Strava. Then the 6 steps below are built in that new style.

## The 6 steps

| # | Step | What it means | Can you see it? |
| --- | --- | --- | --- |
| 1 | Game rules | How points, levels and weeks are counted | No, it's behind the scenes |
| 2 | Fake server | Saves your taps on the phone so nothing is lost | No, it's behind the scenes |
| 3 | Demo history | Mohamed (Fit ID 101) gets 8 weeks of example history | Yes, log in as 101 |
| 4 | Setup screens | The 5 questions | Yes |
| 5 | Today screen | Train button, water, habits, ring, points | **Yes, try it here** |
| 6 | Final tests | Checked in Arabic, English, light and dark, on small and big screens | No, it's quality checks |

## How points work

| You do | You get |
| --- | --- |
| Train | 50 points (once a day) |
| Drink your full water target | 20 points |
| Tick a habit | 10 points each (up to 5 a day) |
| Do everything today | 30 bonus points |
| Hit your weekly training target | 200 bonus points |

- Points never go down. Unticking something only takes back what that tap gave.
- Rest days never break anything. You're judged by the **week**, not by every single day.
- You can fix **today and yesterday**, in case you forgot to log at night.

## What comes after this

1. Medals, level-up rewards, and avatar items that unlock
2. Progress charts, your own goals, settings
3. Logging your lifts (bench, squat, deadlift…)
4. Hiding the gym-only parts
5. Later: coaches, the marketplace, gyms, and the real server
