# LevelUP — Minimal Business Plan

*Track. Improve. Transform.*

> Figures marked **(assumption)** are placeholders to validate with real gyms before relying on them.

## 1. Summary

LevelUP is a white-label, gamified member app for gyms. It turns body composition scans (InBody-style assessments) into XP, levels, streaks, goals, and leaderboards, so members stay motivated and gyms keep them longer. Each gym gets the app under its own name, logo, and colors. It ships in Arabic (RTL) and English.

## 2. Problem

- Gyms lose a large share of members within the first months. Retention is their biggest revenue lever.
- Body composition scans produce data members rarely understand or revisit, so the scan becomes a one-off.
- Gyms have no cheap, branded way to engage members between visits.

## 3. Solution

A branded app where members sign in with a numeric Fit ID from the front desk (no password) and see:

- **FitScore:** a private 0–100 body composition score.
- **XP, levels, streaks, trophies, achievements:** rewards for attending and improving.
- **Missions and goals:** coach-set targets with progress and XP rewards.
- **Gym leaderboard and challenges:** community and friendly competition.

Gyms get higher retention and a branded channel to members. Coaches get a structured way to set goals.

## 4. Target Customer

- **Primary buyer:** owners of independent gyms and small chains (1–10 branches) that already run body composition scans.
- **Users:** their members, mostly 18–40, smartphone-first, Arabic- and English-speaking.
- **Beachhead:** Egypt and the wider MENA region, where Arabic-first fitness software is thin.

## 5. Business Model

B2B SaaS, billed per gym per month. Members use the app free.

| Plan | Price per gym per month | Includes |
|---|---|---|
| Starter | $49 **(assumption)** | Up to 300 members, one branch, standard branding |
| Growth | $129 **(assumption)** | Up to 1,000 members, up to 3 branches, challenges |
| Chain | Custom | Multiple branches, custom branding, priority support |

Add-on: one-time setup fee of $200 **(assumption)** covering branding, member import, and staff onboarding.

## 6. Go-to-Market

1. **Pilot:** sign 2–3 friendly gyms free for 3 months in exchange for feedback and a testimonial.
2. **Direct sales:** founder-led visits and demos to local gyms. The demo is the app itself, branded live with the prospect's logo.
3. **Proof:** publish retention and engagement results from the pilots.
4. **Referrals:** one month free for any gym that refers another.
5. **Channel (later):** partner with body-scanner distributors who already sell to gyms.

## 7. Product Roadmap

| Phase | Scope | Goal |
|---|---|---|
| MVP | Login, dashboard, XP and levels, FitScore, assessments, goals, branding config | Pilot-ready app |
| V1 | Streaks, leaderboard, challenges, achievements, trophies, notifications | Retention features |
| V2 | Gym admin panel, coach tools, analytics for owners | Self-serve for gyms |

Tech: Ionic React + Capacitor (iOS, Android, web), NestJS + Prisma + PostgreSQL backend.

## 8. Competition

- **Generic gym apps (Mindbody, Glofox, Trainerize):** broad but expensive, English-first, weak on body-composition gamification.
- **Scanner vendor apps:** show data but no engagement loop and no white-labeling.
- **Differentiator:** gamification built on body composition data, Arabic-first, fully white-labeled, priced for small gyms.

## 9. Team and Operations

- Founder builds product and sells (currently a single person).
- Needs over the next 12 months: one part-time designer, one part-time customer-success person once there are 10+ gyms.
- Hosting stays small: one backend, one Postgres database, multi-tenant by gym.

## 10. Financial Snapshot (12-month, assumption)

| Item | Estimate |
|---|---|
| Gyms signed by month 12 | 15 **(assumption)** |
| Average revenue per gym per month | $90 **(assumption)** |
| Monthly recurring revenue at month 12 | about $1,350 |
| Setup fees collected | about $3,000 |
| Monthly costs (hosting, tools, store fees, part-time help) | about $800 **(assumption)** |
| Break-even | roughly 9–10 paying gyms |

## 11. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Gyms slow to adopt or pay | Free pilots, low entry price, visible ROI via retention data |
| Dependence on scan data entry | Simple import and front-desk workflow; manual entry fallback |
| Single-founder bandwidth | Tight MVP scope, white-label config instead of custom builds |
| Member data privacy | FitScore private by default; minimal personal data; clear consent |

## 12. Next 90 Days

1. Finish MVP (login, dashboard, XP, FitScore, assessments, goals).
2. Line up 2–3 pilot gyms and brand the app for each.
3. Track weekly active members and visit frequency from day one.
4. Turn pilot results into a one-page case study.
5. Set pricing from real willingness to pay, then launch paid plans.
