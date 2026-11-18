# LevelUP — Minimal Business Plan

*Track. Improve. Transform.*

> Pricing, customer counts, and financial projections are planning assumptions to validate with pilot gyms. The [PDF plan](LevelUP-Business-Plan.pdf) carries the detailed model in Egyptian pounds.

## 1. Summary

LevelUP is a white-label gym member app. Members use body composition scans to understand their progress, set personal goals, and see milestones in the Trophy Room. The app gives gyms a branded way to follow up between scans. LevelUP supports Egyptian Arabic (RTL) and English, with light and dark themes.

## 2. Problem

- Gyms lose a large share of members within the first months. Retention is their biggest revenue lever.
- Body composition scans produce data members rarely understand or revisit, so the scan becomes a one-off.
- Gyms have no cheap, branded way to engage members between visits.

## 3. Solution

A branded app where members use a numeric Fit ID from the front desk after the splash screen and onboarding. The app has four tabs.

- **Home** shows the member's private FitScore number, a personal goal card, scan-based guidance, and notifications.
- **Progress** shows assessment results, changes between scans, and trends in weight, muscle, and body fat.
- **Goals** lets members set and track their own weight, muscle, and body-fat targets.
- **Profile** offers a customizable portrait with outfits and a hijab option, the Trophy Room and medal celebrations, and settings for language, theme, and sound.

The pilot will test whether this gives members a reason to revisit their scans and helps gyms retain them.

## 4. Target Customer

- **Primary buyer:** owners of independent gyms and small chains (1–10 branches) that already run body composition scans.
- **Users:** their members, mostly 18–40, smartphone-first, Arabic- and English-speaking.
- **Beachhead:** Egypt and the wider MENA region, where Arabic-first fitness software is thin.

## 5. Business Model

B2B SaaS, billed per gym per month. Members use the app free.

| Plan | Price per gym per month | Includes |
|---|---|---|
| Starter | EGP 2,500 | Up to 300 members, one branch, standard branding |
| Growth | EGP 4,500 | Unlimited members at one branch and full gym branding |
| Chain | EGP 9,000 | Up to three branches, dedicated support, and EGP 2,500 per extra branch |

A one-time EGP 5,000 setup fee covers branding, member import, and staff onboarding. Pilot gyms receive a fee waiver.

## 6. Go-to-Market

1. **Pilot:** sign 2–3 friendly gyms free for 3 months in exchange for feedback and a testimonial.
2. **Direct sales:** founder-led visits and demos to local gyms. The demo is the app itself, branded live with the prospect's logo.
3. **Proof:** measure repeat scan viewing, goal adoption, and renewals during the pilots. Publish the findings with participating gyms.
4. **Referrals:** one month free for any gym that refers another.
5. **Channel (later):** partner with body-scanner distributors who already sell to gyms.

## 7. Product Roadmap

| Phase | Scope | Goal |
|---|---|---|
| Demo | Fit ID, Home, Progress, member-set goals, profiles, portraits, and Trophy Room using mock data | Review the member flow with gym owners |
| Pilot | Connect the member app to live gym scan data and establish the staff intake workflow | Measure repeat usage and renewals |
| After pilot | Prioritize gym administration, imports, and reporting based on pilot feedback | Reduce staff setup and support time |

Tech: Ionic React + Capacitor (iOS, Android, web), NestJS + Prisma + PostgreSQL backend.

## 8. Competition

- Gym management platforms and scanner apps are the alternatives a pilot gym may already use.
- LevelUP focuses on the member experience after a scan, with Egyptian Arabic support, gym branding, personal goals, and medal milestones.

## 9. Team and Operations

- Founder builds product and sells (currently a single person).
- Needs over the next 12 months: one part-time designer, one part-time customer-success person once there are 10+ gyms.
- Hosting stays small: one backend, one Postgres database, multi-tenant by gym.

## 10. Financial Snapshot (12-month, assumption)

| Item | Estimate |
|---|---|
| Gyms signed by month 12 | 15 **(assumption)** |
| Average revenue per gym per month | EGP 3,750 |
| Monthly recurring revenue at month 12 | EGP 56,250 |
| Annualized recurring revenue at month 12 | EGP 675,000 |
| First month with positive cash flow | Month 9 |
| Cumulative cash above zero | Month 13 |

## 11. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Gyms slow to adopt or pay | Free pilots, low entry price, visible ROI via retention data |
| Dependence on scan data entry | Simple import and front-desk workflow; manual entry fallback |
| Single-founder bandwidth | Tight MVP scope, white-label config instead of custom builds |
| Member data privacy | Keep FitScore private, collect minimal personal data, and establish consent for the pilot |

## 12. Next 90 Days

1. Verify the member flow from Fit ID login through Home, Progress, Goals, and Profile with realistic demo scans.
2. Line up 2–3 pilot gyms and brand the app for each.
3. Measure repeat scan viewing, goal adoption, and renewals from day one.
4. Turn pilot results into a one-page case study.
5. Set pricing from real willingness to pay, then launch paid plans.
