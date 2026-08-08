# Mock data

Static JSON standing in for the future PostgreSQL database. One member
("Ali Hassan", the same person used throughout the UI so far), fully
cross-consistent: XP history sums to exactly `member.xp`, `member.level`
is derived from that XP via a level-curve formula, the current goal's 74%
matches the weight lost since its start date, achievement/trophy unlock
dates are computed from the real assessment/gym-visit/XP data rather than
guessed, and the member sits at exactly rank 23 of 50 in the leaderboard.

Regenerate after editing the generator:

```
npm run generate:mock-data
```

The script (`scripts/generate-mock-data.mjs`) recomputes every
cross-reference from source values each run and throws if a consistency
check fails (XP sum, event count, leaderboard placement) — it can't
silently write data that doesn't add up.

| File | Future Postgres table |
|---|---|
| `member.json` | `members` |
| `assessments.json` | `assessments` |
| `gym-visits.json` | `gym_visits` |
| `goals.json` | `goals` (three arrays: current/completed/future — would be one table filtered by `status`) |
| `achievements.json` | `achievements` + `member_achievements` |
| `leaderboard.json` | derived view over `members`, not its own table |
| `xp-history.json` | `xp_events` |
| `notifications.json` | `notifications` |
| `trophies.json` | `trophies` + `member_trophies` |
| `challenges.json` | `challenges` + `challenge_participants` |

`types.ts` has the TypeScript interface for each shape.

**Not yet wired into the app.** The dashboard (`app/(app)/dashboard`)
still reads `data/dashboard-mock.ts`, a separate hand-written mock
predating this generator. Swapping the dashboard over to these files is
a follow-up, not done here.

**Point-in-time snapshot.** `member.streak` (12 days) and the most recent
12 entries in `gym-visits.json` are only accurate as of generation time
(2026-07-07). Re-running the script later without bumping `TODAY` in the
generator will leave the streak stale relative to the real calendar —
a real backend would compute this per-request instead.
