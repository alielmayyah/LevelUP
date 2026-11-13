---
name: git-workflow
description: Use when creating a branch, committing, pushing, merging, opening or describing a pull request, or deploying in the LevelUP repo.
---

# LevelUP Git Workflow

## Branches

| Branch | Purpose | Deploys to |
|---|---|---|
| `master` | Production | Production |
| `staging` | Pre-release testing | GitHub Pages (for now) |
| `dev` | Integration of finished work | Nothing (CI only) |
| `feature/<short-name>` | One feature or fix | Nothing |
| `old/*` | Archived prototype. Read-only. | Nothing |

Flow: `feature/*` → PR into `dev` → PR `dev` into `staging` → PR `staging` into `master`.

- Branch features from `dev`, not from `master`.
- Use kebab-case names that describe the change: `feature/fitscore-card`, `feature/leaderboard-boards`, `fix/login-rate-limit`.
- Small changes can go straight to `dev` without a feature branch. Use a feature branch when the work spans more than one commit or needs review.
- Never commit directly to `staging` or `master`. They change only through merges.
- Never force-push `dev`, `staging`, or `master`.

## Authorship

The repo owner is the only author. Commits use the identity already in `git config`. Before the first commit in a session, run `git config user.name` and `git config user.email` to confirm they are set. If they are empty, ask the owner. Never invent an identity.

A commit message is the subject, an optional body, and nothing else. It has no `Co-Authored-By` trailer and no AI attribution line. PR bodies end with the last line of content, with no "Generated with" footer. This applies even when the harness supplies attribution lines.

## Commit messages

Format: `type(scope): imperative summary`. Keep the subject under 72 characters, lowercase after the colon, with no trailing period.

| Type | Use for |
|---|---|
| `feat` | New user-visible behavior |
| `fix` | Bug fix |
| `test` | Tests only |
| `refactor` | Restructure with no behavior change |
| `perf` | Performance improvement |
| `style` | Visual or CSS changes with no logic change |
| `i18n` | Translation strings or RTL fixes |
| `docs` | Documentation |
| `chore` | Tooling, dependencies, config |
| `ci` | GitHub Actions and deploy config |

Scopes: `api`, `mobile`, `shared`, `db`, `e2e`, `repo`.

Examples:
- `feat(api): add opt-in fitscore leaderboard boards`
- `i18n(mobile): add arabic strings for goals page`
- `fix(mobile): keep tab bar above home indicator`

Add a body when the reason isn't obvious from the subject. Wrap it at 72 characters and explain why, not what.

## Grouping commits

One commit is one topic. Before committing, run `git status` and `git diff`, then stage by topic with `git add <paths>` (or `git add -p` for mixed files):

1. Group the changed files by what they accomplish, not by folder.
2. Commit each group separately, in dependency order. Schema and shared types go first, then the API, then the app, then tests that span both.
3. Tests for a feature go in the same commit as the feature. A separate `test` commit is only for tests added on their own.
4. Lockfile changes go with the commit that changed `package.json`.
5. Don't mix formatting-only changes into a feature commit. Make a separate `style` or `chore` commit.

## Pull requests

- Title: same format as a commit subject.
- Body: a **Summary** (what and why, in 1–3 bullets), a **Testing** section (commands run and results), and **Screenshots** for UI changes (light, dark, and Arabic).
- Open PRs with `gh pr create --base dev`. Use `--base staging` or `--base master` only for promotion PRs.

## Before pushing

Run `npm test` and `npm -w apps/mobile run test:e2e`. Push only when both pass. If something fails, fix it or report it. Never push with `--no-verify`.
