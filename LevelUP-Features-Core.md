# LevelUP — Core Feature List

LevelUP is a white-label gym member app that turns body composition assessments into a motivating journey. Tagline: _Track. Improve. Transform._

This is a reduced version of the full feature list. It excludes LevelUP Score (XP & Levels), Gym Streak, Gym Visit Tracking and workout counts, XP History, Achievements, Trophies, Challenges, and the Community Page.

## Status Legend

| Status      | Meaning                                   |
| ----------- | ----------------------------------------- |
| Planned     | Not started                               |
| In Progress | Being built                               |
| Done        | Built, tested, and working with real data |

## Features

| #   | Feature                      | Area       | Description                                                                                                                                                                                                                                           | Status  |
| --- | ---------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | Splash Screen                | Onboarding | Animated welcome screen with logo, glow ring, starfield, tagline, and "Tap to Begin"                                                                                                                                                                  | Planned |
| 2   | Fit ID Login                 | Onboarding | Sign in with a 6–8 digit numeric ID from the front desk, no password. Repeated attempts are rate-limited.                                                                                                                                             | Planned |
| 3   | Sound Toggle                 | Onboarding | Mute/unmute button for audio feedback, on the splash and login screens and in Settings. Saved on the device.                                                                                                                                          | Planned |
| 4   | Personalized Greeting        | Dashboard  | Time-of-day greeting by first name with today's date                                                                                                                                                                                                  | Planned |
| 5   | Leaderboard Summary          | Dashboard  | Your rank on the Top Score board, top %, members behind, and points needed to climb. Shows a "Join the leaderboard" prompt if you haven't opted in.                                                                                                   | Planned |
| 6   | FitScore                     | Dashboard  | Private 0–100 body composition score, calculated like the InBody Score (base 80, plus a point per kg of lean mass above standard, minus a point per kg of fat above standard), with change since last scan and tier (Elite 80+, Strong 70–79, On Track 60–69, Building 50–59, Needs Improvement under 50). Can be hidden in Settings.                                                                                          | Planned |
| 7   | Current Mission              | Dashboard  | Active goal with % done, kg progress, estimated completion, and coach note                                                                                                                                                                            | Planned |
| 8   | Monthly Wins                 | Dashboard  | Tiles for body fat change and muscle gained this month                                                                                                                                                                                                | Planned |
| 9   | Notifications                | Dashboard  | Bell icon with unread indicator. Opens a list with mark-as-read and mark-all-read. Sent for new scan results and completed missions.                                                                                                                  | Planned |
| 10  | Body Composition Assessments | Progress   | Scan records entered by staff: weight, muscle, fat, BMI, visceral fat, water, protein, minerals, BMR. Each scan sets the FitScore and updates goal progress.                                                                                          | Planned |
| 11  | Progress Page                | Progress   | Charts for body composition and FitScore over time, plus the latest scan's full results                                                                                                                                                               | Planned |
| 12  | Goals Page                   | Goals      | Active, Completed, and Upcoming goals set by the coach, with targets, deadlines, and progress. Reaching a target completes the goal and starts the next upcoming one.                                                                                 | Planned |
| 13  | Full Gym Leaderboard         | Community  | Opt-in boards from each member's latest scan: Top Score (highest FitScore), Most Muscle (most skeletal muscle in kg), and Lowest Body Fat (lowest body fat %). The top three stand on a podium with their characters. Men and women are ranked on separate boards, since body composition differs; each member sees their own division. Only members who opt in appear. | Planned |
| 14  | Member Profile               | Profile    | Personal details, membership (with a "Renews soon" badge), coach, and Settings: sound, show/hide FitScore, leaderboard opt-in, and sign out                                                                                                           | Planned |
| 15  | White-Label Branding         | Platform   | A single config file sets each gym's name, logo, and colors                                                                                                                                                                                           | Planned |
| 16  | Bottom Tab Navigation        | Platform   | Floating 5-tab bar (Home, Progress, Goals, Leaderboard, Profile) with an animated active indicator                                                                                                                                                    | Planned |
| 17  | Backend API                  | Platform   | NestJS + Prisma + PostgreSQL serving all app data, in the separate `levelup-backend` repo. Includes staff endpoints for members, scans, and goals.                                                                                                    | Planned |

## Key Rules

- **FitScore privacy:** your FitScore is visible only to you, unless you opt in to the leaderboard. Hiding it from your own screens doesn't change your leaderboard choice.
- **Leaderboard opt-in:** off by default. Members who opt out are removed right away.
- **Boards:** all three rank each member's latest scan. Members with no scan yet don't appear.
- **Months:** start and end in the gym's own timezone.

## Summary

| Status      | Count  |
| ----------- | ------ |
| Planned     | 17     |
| In Progress | 0      |
| Done        | 0      |
| **Total**   | **17** |
