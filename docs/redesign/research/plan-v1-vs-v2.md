# Plan v1 vs Plan v2

**Sources.** v1: `levelup-frontend/docs/LevelUP-Business-Plan.pdf` (all 11 pages). v2: `plan-v2.txt`, the text of `docs/LevelUP-Business-Technical-Plan-v2.pdf` (24 pages, spot-checked). Current app: 13 screenshots in `docs/business-plan-source/shots/`, checked against `src/`.

**Screenshot caveat.** Only `dashboard-dark`, `progress-dark` and `profile-dark` (18 Nov, used in the v1 PDF) match today's code. The other 10 (17 Nov) are an older pixel-art build with a Community tab, leaderboard, XP and exercise medals, which the code has removed (`tabConfig.ts` has four tabs; `medals/config.ts` covers only muscle, body fat and BMI).

## Differences

| Topic | v1 | v2 | Current app |
|---|---|---|---|
| Branding and pitch | White-label; retention is the gym's revenue lever | LevelUP look plus the gym's logo; pitch is paid re-scans and PT leads, retention only "the story, not the proof"; white-label only for later software partners | Co-branded: `brand.config.ts` fixes LevelUP's name, logo and colours and adds only a gym logo (currently `null`) |
| Buyer | Independent gyms and small chains with scanners; Cairo first | Nutritionists and diet clinics first, then CrossFit, slimming centres, chains | n/a |
| Login | Numeric Fit ID from the front desk | Phone number plus WhatsApp/SMS code; the phone is the account | Fit ID (`Login.tsx` posts `{ fitId }`) |
| Tabs | Home, Progress, Goals, Profile | Home, Scans, Compare, Account (mockup tab bar) | Home, Progress, Goals, Profile |
| Headline score | Private 0–100 FitScore | No FitScore; the machine's InBody Score on Home and in the reveal | FitScore 91/100 (mock); per `docs/inbody/README.md` the API derives it with the InBody Score method |
| Medals | Trophy Room (muscle, body fat, BMI) with unlock celebration; in the Starter plan | None; only Lottie/haptic celebrations on the reveal and "goal reached" | Medals in 3 categories on Profile; `UnlockCelebration.tsx`. XP and leaderboard in old shots only |
| Personal goals | Goals tab: member-set weight, muscle, body-fat targets | A goal bar on Home only; no Goal entity, endpoint or roadmap week | Goals tab, New goal flow, "Current mission" card on Home |
| Avatar | Cartoon portrait editor with optional sports hijab | Not mentioned | Cartoon portrait on Home and Profile, "Edit avatar" |
| Scan screens | Results, comparisons, trends, scan guidance | Plain-Arabic report with tap-to-explain; timeline across venues; machine-checked compare; fat/lean charts; body map; new-result reveal; share card; rule-based templates, no AI | Progress: weight split (water, protein, minerals, fat), muscle and fat vs previous scan, scan history, "Your plan"; Home "What to do next" |
| Gym side and data | Mock demo to Q1 2027; live intake in the Q2 2027 pilot; admin, imports, reporting after it | Web dashboard in the MVP: LookinBody120 CSV/Excel upload with identity check, typed entry, follow-up leads, owner stats in EGP | Mock data. `levelup-backend` (local and GitHub `dev`) holds only docs: "Not scaffolded yet" |
| Notifications | In-app scan and goal notifications | Push "new result" and re-scan reminders every 4–6 weeks | Bell with unread badge; no push package |
| Pricing | Per gym/month: EGP 2,500 / 4,500 / 9,000; EGP 5,000 setup; 3-month free pilots | Per branch/month: EGP 990 / 2,490; EGP 15 per scan; Member Plus EGP 49–79 paid by members; 60-day pilot; no setup fee | n/a |
| Targets and team | 15 gyms, EGP 56k MRR by month 12; part-time designer, CS, developer | 50 venues, EGP 75k/month by month 12; ~92% gross margin before operating costs; no team section | n/a |
| Stack | Ionic React + Capacitor; NestJS + Prisma + PostgreSQL | Adds a React/shadcn dashboard; NestJS + MongoDB, BullMQ/Redis, R2, FCM, WhatsApp API; pnpm/Turborepo monorepo; ECharts, TanStack Query, Zustand, Lottie | Two repos; Ionic React, Capacitor Android only, Tailwind v4, i18next, motion, GSAP; none of v2's added libraries |
| Design | No design system; shows the purple app | Figma/ProtoPie prototype tested with 5 members before code; words before numbers; calm dark canvas; Alexandria + IBM Plex | `tokens.css` and `brand.config.ts` already hold v2's colours and fonts |
| Privacy | Rated low risk | Health data under Egypt's PDPL 151/2020: lawyer, PDPC licence, per-gym consent, export/delete | n/a |

## Decisions for the owner

1. **Login and account.** Fit ID (v1, app, backend README) or phone plus WhatsApp/SMS code (v2), on which v2's cross-venue history and family profiles depend.
2. **Headline score.** Keep FitScore (private; meant to use the InBody Score method) or show the machine's own InBody Score (v2).
3. **Medals.** Built and sold in v1's Starter plan, absent from v2. Keep, cut, or fold into the new-result reveal.
4. **Goals.** v2 shows a goal bar but plans no goal data or API. Keep the Goals tab, only a Home card, or neither.
5. **Avatar.** Built (`Character.tsx`, `src/avatar/`), missing from v2. Keep or drop.
6. **Tabs.** Home/Progress/Goals/Profile or Home/Scans/Compare/Account, and where goals, medals, avatar and settings move.
7. **Branding.** Code and v2 are co-branded; v1, the spec, frontend `CLAUDE.md` and backend README say white-label. Pick one.
8. **MVP scope.** Member app first (v1) or a 2-week Figma prototype, then app plus gym dashboard by week 9 (v2), and who builds it, since v2 has no hiring plan.
9. **Database and repos.** PostgreSQL/Prisma in two repos (v1, workspace `CLAUDE.md`, backend README) or MongoDB in a monorepo (v2). The backend isn't scaffolded, so switching costs least now.
10. **Pricing and targets.** Which price list and month-12 target (15 gyms or 50 venues) the pilots test.
11. **Metrics.** v2's `Scan.values` omits BMI, protein and minerals, which the Progress screen and BMI medals use.
12. **Data contract.** `inbody-data-example.json` holds made-up InBody 770/970 values; v2 targets LookinBody120 exports, whose columns it calls unknown until real files arrive. Decide which to design against.
13. **Rebuild or evolve.** The current app already matches v2's design tokens.

Once decided, update `LevelUP-Features-Core.md` and the backend README (both describe v1) and retake the 10 old screenshots.
