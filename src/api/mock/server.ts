/*
 * In-memory mock of the LevelUP API. It serves the member routes from the core
 * plan (Tasks 5, 7, 8, 9) with the same status codes and DTO shapes, so
 * switching VITE_USE_MOCKS off needs no component changes.
 *
 * State lives in memory and resets on page reload, except settings and the saved
 * character, which are also written to Preferences (lu.mock.settings.<fitId>,
 * lu.mock.avatar.<fitId>), so switching Fit IDs never leaks another member's data.
 *
 * Only src/api/client.ts and tests may import this module (ESLint enforces it).
 */
import { Preferences } from '@capacitor/preferences';

import { isValidAvatar } from '../../avatar/catalog';
import {
  LEADERBOARD_BOARDS,
  type AvatarConfigDto,
  type DashboardDto,
  type GoalView,
  type GoalsDto,
  type LeaderboardBoard,
  type LeaderboardDto,
  type LeaderboardRow,
  type LeaderboardSummary,
  type LoginResponse,
  type ProfileDto,
  type ProgressDto,
  type SettingsDto,
} from '../types';
import { fitScoreTier, goalProgress, metricValue, monthDelta, monthRange, round1, type Sample } from './domain';
import type { GoalRecord } from './fixtures';
import { buildMembers, type MockMember } from './members';

export interface MockResponse {
  status: number;
  body: unknown;
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60_000;
const FIT_ID = /^\d{3,8}$/;

let now = new Date();
let members: MockMember[] = [];
let loginAttempts: number[] = [];
const settingsLoaded = new Set<number>();
/** Saved characters by member id. Missing: not read from Preferences yet. */
const avatars = new Map<number, AvatarConfigDto | null>();

/** Rebuilds all fixtures relative to `now`. Tests pass a fixed date. */
export function resetMockServer(at: Date = new Date()): void {
  now = at;
  members = buildMembers(now);
  loginAttempts = [];
  settingsLoaded.clear();
  avatars.clear();
}

resetMockServer();

const ok = (body: unknown, status = 200): MockResponse => ({ status, body });
const fail = (status: number, message: string): MockResponse => ({ status, body: { statusCode: status, message } });
const noContent: MockResponse = { status: 204, body: null };

const settingsKey = (m: MockMember) => `lu.mock.settings.${m.fitId}`;

async function loadSettings(m: MockMember): Promise<void> {
  if (settingsLoaded.has(m.id)) return;
  settingsLoaded.add(m.id);
  const { value } = await Preferences.get({ key: settingsKey(m) });
  if (!value) return;
  try {
    const saved = JSON.parse(value) as Partial<SettingsDto>;
    if (typeof saved.showFitScore === 'boolean') m.settings.showFitScore = saved.showFitScore;
    if (typeof saved.fitScoreOnLeaderboard === 'boolean')
      m.settings.fitScoreOnLeaderboard = saved.fitScoreOnLeaderboard;
  } catch {
    // Ignore a corrupt entry; the fixture defaults stay.
  }
}

const avatarKey = (m: MockMember) => `lu.mock.avatar.${m.fitId}`;

async function loadAvatar(m: MockMember): Promise<AvatarConfigDto | null> {
  if (avatars.has(m.id)) return avatars.get(m.id)!;
  const { value } = await Preferences.get({ key: avatarKey(m) });
  let saved: AvatarConfigDto | null = null;
  try {
    const parsed: unknown = value ? JSON.parse(value) : null;
    if (isValidAvatar(parsed)) saved = parsed;
  } catch {
    // A corrupt entry reads as no saved character.
  }
  avatars.set(m.id, saved);
  return saved;
}

/** PUT /me/avatar: full replacement with a catalog-valid config; anything else is a 400. */
async function saveAvatar(m: MockMember, body: unknown): Promise<MockResponse> {
  if (!isValidAvatar(body)) return fail(400, 'Invalid avatar');
  const config: AvatarConfigDto = {
    schemaVersion: body.schemaVersion,
    rig: body.rig,
    colors: { ...body.colors },
    ...(body.styles ? { styles: { ...body.styles } } : {}),
  };
  avatars.set(m.id, config);
  await Preferences.set({ key: avatarKey(m), value: JSON.stringify(config) });
  return ok(config);
}

async function memberForToken(token: string | null): Promise<MockMember | null> {
  const fitId = token?.startsWith('mock.') ? token.slice(5) : null;
  const m = members.find((x) => x.fitId === fitId) ?? null;
  if (m) await loadSettings(m);
  return m;
}

/* ---------- Auth ---------- */

function login(body: unknown): MockResponse {
  const t = Date.now();
  loginAttempts = loginAttempts.filter((at) => t - at < LOGIN_WINDOW_MS);
  if (loginAttempts.length >= LOGIN_LIMIT) return fail(429, 'Too many requests');
  loginAttempts.push(t);

  const fitId = (body as { fitId?: unknown } | null)?.fitId;
  const m = typeof fitId === 'string' && FIT_ID.test(fitId) ? members.find((x) => x.fitId === fitId) : undefined;
  if (!m) return fail(401, 'Invalid Fit ID');
  const res: LoginResponse = { accessToken: `mock.${m.fitId}`, member: { id: m.id, firstName: m.firstName } };
  return ok(res, 201);
}

/* ---------- Leaderboard ---------- */

const samples = (m: MockMember, pick: (a: MockMember['assessments'][number]) => number): Sample[] =>
  m.assessments.map((a) => ({ takenAt: new Date(a.takenAt), value: pick(a) }));

/** Each board reads the member's latest scan; members with no scan are left off. */
function boardValue(m: MockMember, board: LeaderboardBoard): number | null {
  const scan = m.assessments[m.assessments.length - 1];
  if (!scan) return null;
  switch (board) {
    case 'score':
      return scan.fitScore;
    case 'muscle':
      return round1(scan.skeletalMuscleKg);
    case 'bodyFat':
      return round1(scan.bodyFatPct);
  }
}

/** Lowest body fat ranks first; the other boards rank the highest value first. */
const LOWEST_FIRST: readonly LeaderboardBoard[] = ['bodyFat'];

async function boardRows(board: LeaderboardBoard, me: MockMember): Promise<LeaderboardRow[]> {
  const myAvatar = await loadAvatar(me);
  return (
    members
      // Men and women are ranked separately: body composition differs too much to compare fairly.
      .filter((m) => m.settings.fitScoreOnLeaderboard && m.sex === me.sex)
      .map((m) => ({ m, value: boardValue(m, board) }))
      .filter((x): x is { m: MockMember; value: number } => x.value !== null)
      .sort((a, b) => (LOWEST_FIRST.includes(board) ? a.value - b.value : b.value - a.value) || a.m.id - b.m.id)
      .map(({ m, value }, i) => ({
        rank: i + 1,
        memberId: m.id,
        name: `${m.firstName} ${m.lastName.charAt(0)}.`,
        value,
        isMe: m.id === me.id,
        avatar: m.id === me.id ? myAvatar : null,
      }))
  );
}

async function leaderboardSummary(me: MockMember): Promise<LeaderboardSummary> {
  if (!me.settings.fitScoreOnLeaderboard) return { optedIn: false, standing: null };
  const rows = await boardRows('score', me);
  const mine = rows.find((r) => r.isMe);
  if (!mine) return { optedIn: true, standing: null };
  const total = rows.length;
  return {
    optedIn: true,
    standing: {
      rank: mine.rank,
      totalMembers: total,
      topPercent: Math.ceil((mine.rank / total) * 100),
      membersBehind: total - mine.rank,
      pointsToNextRank: mine.rank === 1 ? null : rows[mine.rank - 2].value - mine.value + 1,
    },
  };
}

async function leaderboard(me: MockMember, query: URLSearchParams): Promise<MockResponse> {
  const board = (query.get('board') ?? 'score') as LeaderboardBoard;
  if (!LEADERBOARD_BOARDS.includes(board)) return fail(400, 'Unknown board');
  const res: LeaderboardDto = {
    board,
    division: me.sex,
    optedIn: me.settings.fitScoreOnLeaderboard,
    rows: await boardRows(board, me),
  };
  return ok(res);
}

/* ---------- Me ---------- */

const latest = (m: MockMember) => m.assessments[m.assessments.length - 1] ?? null;

function progressFor(goal: GoalRecord, m: MockMember) {
  const scan = latest(m);
  return scan ? goalProgress(goal, metricValue(scan, goal.metric), now) : null;
}

function goalView(goal: GoalRecord, m: MockMember): GoalView {
  const percent =
    goal.status === 'COMPLETED' ? 100 : goal.status === 'UPCOMING' ? 0 : (progressFor(goal, m)?.percent ?? 0);
  return {
    id: goal.id,
    title: goal.title,
    metric: goal.metric,
    startValue: goal.startValue,
    targetValue: goal.targetValue,
    deadline: goal.deadline.toISOString(),
    coachNote: goal.coachNote,
    percent,
    completedAt: goal.completedAt?.toISOString() ?? null,
  };
}

async function dashboard(m: MockMember): Promise<DashboardDto> {
  const scans = m.assessments;
  const last = latest(m);
  const prev = scans.length > 1 ? scans[scans.length - 2] : null;
  const month = monthRange(now);
  const fat = monthDelta(
    samples(m, (a) => a.bodyFatPct),
    month,
  );
  const muscle = monthDelta(
    samples(m, (a) => a.skeletalMuscleKg),
    month,
  );

  const active = m.goals
    .filter((g) => g.status === 'ACTIVE')
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0];
  const p = active ? progressFor(active, m) : null;

  return {
    member: {
      memberId: m.id,
      firstName: m.firstName,
      showFitScore: m.settings.showFitScore,
      memberSince: m.membershipStart.toISOString(),
      avatar: await loadAvatar(m),
    },
    fitScore: last
      ? {
          score: last.fitScore,
          tier: fitScoreTier(last.fitScore),
          changeSinceLastScan: prev ? last.fitScore - prev.fitScore : null,
        }
      : null,
    mission:
      active && p
        ? {
            goalId: active.id,
            title: active.title,
            percent: p.percent,
            doneKg: p.doneKg,
            remainingKg: p.remainingKg,
            estimatedCompletion: p.estimatedCompletion?.toISOString() ?? null,
            coachNote: active.coachNote,
            deadline: active.deadline.toISOString(),
          }
        : null,
    monthlyWins: {
      bodyFatChangePct: fat === null ? null : round1(fat),
      muscleGainedKg: muscle === null ? null : round1(muscle),
    },
    leaderboard: await leaderboardSummary(m),
    unreadNotifications: m.notifications.filter((n) => n.readAt === null).length,
  };
}

async function profile(m: MockMember): Promise<ProfileDto> {
  return {
    memberId: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    fitId: m.fitId,
    sex: m.sex,
    birthDate: m.birthDate.toISOString(),
    heightCm: m.heightCm,
    membershipPlan: m.membershipPlan,
    membershipStart: m.membershipStart.toISOString(),
    membershipEnd: m.membershipEnd.toISOString(),
    coach: m.coach ? { name: m.coach } : null,
    showFitScore: m.settings.showFitScore,
    fitScoreOnLeaderboard: m.settings.fitScoreOnLeaderboard,
    avatar: await loadAvatar(m),
  };
}

function goals(m: MockMember): GoalsDto {
  const by = (status: GoalRecord['status']) => m.goals.filter((g) => g.status === status).map((g) => goalView(g, m));
  return { active: by('ACTIVE'), completed: by('COMPLETED'), upcoming: by('UPCOMING') };
}

function progress(m: MockMember): ProgressDto {
  return {
    assessments: m.assessments.map(({ takenAt, weightKg, skeletalMuscleKg, bodyFatPct, fitScore }) => ({
      takenAt,
      weightKg,
      skeletalMuscleKg,
      bodyFatPct,
      fitScore,
    })),
  };
}

async function updateSettings(m: MockMember, body: unknown): Promise<MockResponse> {
  if (!body || typeof body !== 'object') return fail(400, 'Invalid settings');
  const patch = body as Record<string, unknown>;
  const fields = (['showFitScore', 'fitScoreOnLeaderboard'] as const).filter((k) => k in patch);
  if (fields.length === 0 || fields.some((k) => typeof patch[k] !== 'boolean')) return fail(400, 'Invalid settings');
  for (const k of fields) m.settings[k] = patch[k] as boolean;
  await Preferences.set({ key: settingsKey(m), value: JSON.stringify(m.settings) });
  return ok({ ...m.settings });
}

const newestFirst = (m: MockMember) =>
  [...m.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id).slice(0, 50);

function markRead(m: MockMember, id: number): MockResponse {
  const n = m.notifications.find((x) => x.id === id);
  if (!n) return fail(404, 'Notification not found');
  n.readAt ??= now.toISOString();
  return noContent;
}

function markAllRead(m: MockMember): MockResponse {
  for (const n of m.notifications) n.readAt ??= now.toISOString();
  return ok(null, 201);
}

/* ---------- Router ---------- */

export const mockServer = {
  async handle(method: string, url: string, body: unknown, token: string | null): Promise<MockResponse> {
    const { pathname, searchParams } = new URL(url, 'http://mock');
    const verb = method.toUpperCase();

    if (verb === 'POST' && pathname === '/auth/login') return login(body);

    const me = await memberForToken(token);
    if (!me) return fail(401, 'Unauthorized');

    const read = pathname.match(/^\/me\/notifications\/(\d+)\/read$/);
    switch (`${verb} ${read ? '/me/notifications/:id/read' : pathname}`) {
      case 'GET /me':
        return ok(await profile(me));
      case 'PUT /me/avatar':
        return saveAvatar(me, body);
      case 'GET /me/dashboard':
        return ok(await dashboard(me));
      case 'GET /me/progress':
        return ok(progress(me));
      case 'GET /me/assessments':
        return ok([...me.assessments].reverse());
      case 'GET /me/goals':
        return ok(goals(me));
      case 'PATCH /me/settings':
        return updateSettings(me, body);
      case 'GET /me/notifications':
        return ok(newestFirst(me));
      case 'PATCH /me/notifications/:id/read':
        return markRead(me, Number(read![1]));
      case 'POST /me/notifications/read-all':
        return markAllRead(me);
      case 'GET /leaderboard':
        return leaderboard(me, searchParams);
      default:
        return fail(404, 'Not found');
    }
  },
};
