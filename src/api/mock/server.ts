/*
 * In-memory mock of the LevelUP API. It serves the member routes from the core
 * plan (Tasks 5, 7, 9) with the same status codes and DTO shapes, so
 * switching VITE_USE_MOCKS off needs no component changes.
 *
 * State resets on reload. The saved portrait and member-created goals are
 * persisted in Preferences under the member’s Fit ID.
 *
 * Only src/api/client.ts and tests may import this module (ESLint enforces it).
 */
import { Preferences } from '@capacitor/preferences';

import { isValidAvatar } from '../../avatar/catalog';
import { adviceFor } from '../../body/advice';
import {
  type AvatarConfigDto,
  type CreateGoalRequest,
  type DashboardDto,
  type GoalMetric,
  type GoalView,
  type GoalsDto,
  type LoginResponse,
  type ProfileDto,
  type ProgressDto,
} from '../types';
import { goalProgress, metricValue, round1 } from './domain';
import type { GoalRecord } from './fixtures';
import { journeyFor } from './journey';
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
/** Members whose created goals were read from Preferences. */
const goalsLoaded = new Set<number>();
/** Saved characters by member id. Missing: not read from Preferences yet. */
const avatars = new Map<number, AvatarConfigDto | null>();

/** Rebuilds all fixtures relative to `now`. Tests pass a fixed date. */
export function resetMockServer(at: Date = new Date()): void {
  now = at;
  members = buildMembers(now);
  loginAttempts = [];
  goalsLoaded.clear();
  avatars.clear();
}

resetMockServer();

const ok = (body: unknown, status = 200): MockResponse => ({ status, body });
const fail = (status: number, message: string): MockResponse => ({ status, body: { statusCode: status, message } });
const noContent: MockResponse = { status: 204, body: null };

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
    colors: { ...body.colors },
    ...(body.portrait && { portrait: { ...body.portrait } }),
  };
  await Preferences.set({ key: avatarKey(m), value: JSON.stringify(config) });
  avatars.set(m.id, config);
  return ok(config);
}

const goalsKey = (m: MockMember) => `lu.mock.goals.${m.fitId}`;

/** Stored form of a created goal: dates as ISO strings. */
type StoredGoal = Omit<GoalRecord, 'startDate' | 'completedAt'> & {
  startDate: string;
  completedAt: string | null;
};

async function loadGoals(m: MockMember): Promise<void> {
  if (goalsLoaded.has(m.id)) return;
  goalsLoaded.add(m.id);
  const { value } = await Preferences.get({ key: goalsKey(m) });
  if (!value) return;
  try {
    const saved = JSON.parse(value) as StoredGoal[];
    if (!Array.isArray(saved)) return;
    for (const g of saved) {
      if (m.goals.some((x) => x.id === g.id)) continue;
      m.goals.push({
        ...g,
        startDate: new Date(g.startDate),
        completedAt: g.completedAt ? new Date(g.completedAt) : null,
        createdByMember: true,
      });
    }
  } catch {
    // A corrupt entry reads as no created goals.
  }
}

async function memberForToken(token: string | null): Promise<MockMember | null> {
  const fitId = token?.startsWith('mock.') ? token.slice(5) : null;
  const m = members.find((x) => x.fitId === fitId) ?? null;
  if (m) await loadGoals(m);
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

const latest = (m: MockMember) => m.assessments[m.assessments.length - 1] ?? null;

function progressFor(goal: GoalRecord, m: MockMember) {
  const scan = latest(m);
  return scan ? goalProgress(goal, metricValue(scan, goal.metric), now) : null;
}

function goalView(goal: GoalRecord, m: MockMember): GoalView {
  const percent = goal.status === 'COMPLETED' ? 100 : (progressFor(goal, m)?.percent ?? 0);
  return {
    id: goal.id,
    title: goal.title,
    metric: goal.metric,
    startValue: goal.startValue,
    targetValue: goal.targetValue,
    percent,
    completedAt: goal.completedAt?.toISOString() ?? null,
  };
}

async function dashboard(m: MockMember): Promise<DashboardDto> {
  const scans = m.assessments;
  const last = latest(m);
  const prev = scans.length > 1 ? scans[scans.length - 2] : null;
  const active = m.goals.find((g) => g.status === 'ACTIVE');
  const p = active ? progressFor(active, m) : null;

  return {
    member: {
      memberId: m.id,
      firstName: m.firstName,
      sex: m.sex,
      avatar: await loadAvatar(m),
    },
    fitScore: last ? { score: last.fitScore } : null,
    plan: last ? adviceFor(last, prev, m.sex, m.heightCm) : [],
    mission:
      active && p
        ? {
            goalId: active.id,
            title: active.title,
            percent: p.percent,
            doneKg: p.doneKg,
            remainingKg: p.remainingKg,
            estimatedCompletion: p.estimatedCompletion?.toISOString() ?? null,
          }
        : null,
    unreadNotifications: m.notifications.filter((n) => n.readAt === null).length,
    journey: journeyFor(scans),
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
    avatar: await loadAvatar(m),
  };
}

function goals(m: MockMember): GoalsDto {
  const by = (status: GoalRecord['status']) => m.goals.filter((g) => g.status === status).map((g) => goalView(g, m));
  return { active: by('ACTIVE'), completed: by('COMPLETED') };
}

const GOAL_METRICS: readonly GoalMetric[] = ['BODY_FAT_KG', 'MUSCLE_KG', 'WEIGHT_KG'];

/** "3" for 3.0, "2.5" for 2.5, as the goal titles read. */
const kgText = (n: number) => String(round1(n));

function goalTitle(metric: GoalMetric, start: number, target: number): string {
  const amount = kgText(Math.abs(target - start));
  switch (metric) {
    case 'BODY_FAT_KG':
      return `Lose ${amount} kg of body fat`;
    case 'MUSCLE_KG':
      return `Gain ${amount} kg of muscle`;
    case 'WEIGHT_KG':
      return `Reach ${kgText(target)} kg`;
  }
}

/**
 * POST /me/goals: the member sets their own goal, no coach approval and no due
 * date. It starts from the latest scan and is in progress at once, alongside
 * any others. A target that points the wrong way (gaining fat) is a 400.
 */
async function createGoal(m: MockMember, body: unknown): Promise<MockResponse> {
  const req = (body && typeof body === 'object' ? body : {}) as Partial<Record<keyof CreateGoalRequest, unknown>>;
  const metric = req.metric as GoalMetric;
  const target = typeof req.targetValue === 'number' ? round1(req.targetValue) : NaN;
  if (!GOAL_METRICS.includes(metric)) return fail(400, 'Invalid metric');
  if (!Number.isFinite(target) || target <= 0 || target > 400) return fail(400, 'Invalid target');

  const scan = latest(m);
  if (!scan) return fail(409, 'Take a scan before setting a goal');
  const start = metricValue(scan, metric);
  const wrongWay =
    metric === 'BODY_FAT_KG' ? target >= start : metric === 'MUSCLE_KG' ? target <= start : target === start;
  if (wrongWay) return fail(400, 'Target must move from your latest scan');

  const goal: GoalRecord = {
    id: Math.max(0, ...members.flatMap((x) => x.goals.map((g) => g.id))) + 1,
    title: goalTitle(metric, start, target),
    metric,
    startValue: start,
    targetValue: target,
    startDate: now,
    status: 'ACTIVE',
    completedAt: null,
    createdByMember: true,
  };
  m.goals.push(goal);
  const stored: StoredGoal[] = m.goals
    .filter((g) => g.createdByMember)
    .map(({ startDate, completedAt, ...rest }) => ({
      ...rest,
      startDate: startDate.toISOString(),
      completedAt: completedAt?.toISOString() ?? null,
    }));
  await Preferences.set({ key: goalsKey(m), value: JSON.stringify(stored) });
  return ok(goalView(goal, m), 201);
}

function progress(m: MockMember): ProgressDto {
  return {
    assessments: m.assessments.map(({ takenAt, weightKg, skeletalMuscleKg, bodyFatPct }) => ({
      takenAt,
      weightKg,
      skeletalMuscleKg,
      bodyFatPct,
    })),
  };
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
    const { pathname } = new URL(url, 'http://mock');
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
      case 'POST /me/goals':
        return createGoal(me, body);
      case 'GET /me/notifications':
        return ok(newestFirst(me));
      case 'PATCH /me/notifications/:id/read':
        return markRead(me, Number(read![1]));
      case 'POST /me/notifications/read-all':
        return markAllRead(me);
      default:
        return fail(404, 'Not found');
    }
  },
};
