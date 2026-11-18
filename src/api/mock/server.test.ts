import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it } from 'vitest';

import type {
  AssessmentDto,
  DashboardDto,
  GoalsDto,
  GoalView,
  NotificationDto,
  ProfileDto,
  ProgressDto,
} from '../types';
import { mockServer, resetMockServer } from './server';

const NOW = new Date('2026-11-13T10:00:00Z');

const login = (fitId: string) => mockServer.handle('POST', '/auth/login', { fitId }, null);
const get = <T>(path: string, fitId: string) =>
  mockServer.handle('GET', path, null, `mock.${fitId}`) as Promise<{ status: number; body: T }>;
const patch = <T>(path: string, body: unknown, fitId: string) =>
  mockServer.handle('PATCH', path, body, `mock.${fitId}`) as Promise<{ status: number; body: T }>;
const post = (path: string, fitId: string) => mockServer.handle('POST', path, null, `mock.${fitId}`);

beforeEach(async () => {
  await Preferences.clear();
  resetMockServer(NOW);
});

describe('auth', () => {
  it('login: known id → token, unknown → 401, 6th attempt → 429', async () => {
    expect((await login('101')).body).toMatchObject({ accessToken: 'mock.101', member: { firstName: 'Mohamed' } });
    expect((await login('999')).status).toBe(401);
    for (let i = 0; i < 3; i++) await login('999');
    expect((await login('999')).status).toBe(429);
  });

  it('all three mock members can sign in', async () => {
    for (const [fitId, firstName] of [
      ['101', 'Mohamed'],
      ['102', 'Lina'],
      ['103', 'Omar'],
    ]) {
      const r = await login(fitId);
      expect(r.status).toBe(201);
      expect(r.body).toMatchObject({ accessToken: `mock.${fitId}`, member: { firstName } });
    }
  });

  it('unknown and malformed ids get the same 401', async () => {
    const a = await login('999');
    const b = await login('abc');
    expect(a.status).toBe(401);
    expect(b).toEqual(a);
  });

  it('no token → 401 on /me', async () => {
    expect((await mockServer.handle('GET', '/me', null, null)).status).toBe(401);
  });

  it('an unknown token → 401 on every data route', async () => {
    for (const path of ['/me', '/me/dashboard', '/me/progress', '/me/goals', '/me/notifications'])
      expect((await mockServer.handle('GET', path, null, 'mock.999')).status).toBe(401);
  });

  it('unknown route → 404', async () => {
    expect((await get('/nope', '101')).status).toBe(404);
  });
});

describe('dashboard', () => {
  it('Mohamed (101) has a FitScore and an active goal', async () => {
    const { status, body: d } = await get<DashboardDto>('/me/dashboard', '101');
    expect(status).toBe(200);
    expect(d.member).toEqual({
      memberId: 1,
      firstName: 'Mohamed',
      sex: 'MALE',
      avatar: null,
    });
    // FitScore is computed from the scan with the InBody Score method (domain.ts).
    expect(d.fitScore).toEqual({ score: 91 });
    expect(d.mission).toMatchObject({ title: 'Gain 3 kg of muscle', percent: 67, doneKg: 2, remainingKg: 1 });
    expect(d.mission!.estimatedCompletion).not.toBeNull();
    expect(d.unreadNotifications).toBe(2);
  });

  it('new member dashboard has nulls, never NaN', async () => {
    const d = (await get<DashboardDto>('/me/dashboard', '102')).body;
    expect(d.fitScore).toBeNull();
    expect(d.mission).toBeNull();
    expect(JSON.stringify(d)).not.toContain('NaN');
  });

  it('Omar gets a FitScore after one scan', async () => {
    const d = (await get<DashboardDto>('/me/dashboard', '103')).body;
    expect(d.fitScore?.score).toBeGreaterThan(0);
  });

  it('no response for any mock member contains NaN or undefined values', async () => {
    for (const fitId of ['101', '102', '103'])
      for (const path of ['/me', '/me/dashboard', '/me/progress', '/me/assessments', '/me/goals', '/me/notifications'])
        expect(JSON.stringify((await get(path, fitId)).body)).not.toMatch(/NaN|undefined|Infinity/);
  });
});

describe('dates are relative to today', () => {
  it('Mohamed has a scan this month', async () => {
    const progress = (await get<ProgressDto>('/me/progress', '101')).body.assessments;
    const latest = new Date(progress.at(-1)!.takenAt);
    expect(latest.getUTCFullYear()).toBe(NOW.getUTCFullYear());
    expect(latest.getUTCMonth()).toBe(NOW.getUTCMonth());
    expect(latest.getTime()).toBeLessThanOrEqual(NOW.getTime());
  });

  it('a different "today" moves the data with it', async () => {
    const later = new Date('2027-03-02T08:00:00Z');
    resetMockServer(later);
    const progress = (await get<ProgressDto>('/me/progress', '101')).body.assessments;
    expect(new Date(progress.at(-1)!.takenAt).getUTCMonth()).toBe(later.getUTCMonth());
  });
});

describe('progress, assessments, goals, profile', () => {
  it('Mohamed has 6 scans ascending; assessments come newest first with all metrics', async () => {
    const p = (await get<ProgressDto>('/me/progress', '101')).body.assessments;
    expect(p).toHaveLength(6);
    expect(p.map((a) => a.takenAt)).toEqual([...p.map((a) => a.takenAt)].sort());
    const a = (await get<AssessmentDto[]>('/me/assessments', '101')).body;
    expect(a[0].takenAt).toBe(p.at(-1)!.takenAt);
    expect(Object.keys(a[0]).sort()).toEqual(
      [
        'id',
        'takenAt',
        'weightKg',
        'skeletalMuscleKg',
        'bodyFatKg',
        'bodyFatPct',
        'bmi',
        'visceralFatLevel',
        'totalBodyWaterKg',
        'proteinKg',
        'mineralsKg',
        'bmrKcal',
        'fitScore',
        'segments',
      ].sort(),
    );
  });

  it('progress is an empty array for a new member', async () => {
    expect((await get<ProgressDto>('/me/progress', '102')).body.assessments).toEqual([]);
  });

  it('Mohamed’s goals: 2 in progress, 2 completed, none waiting', async () => {
    const g = (await get<GoalsDto>('/me/goals', '101')).body;
    expect([g.active.length, g.completed.length]).toEqual([2, 2]);
    expect(g).not.toHaveProperty('upcoming');
    expect(g.completed.every((x) => x.percent === 100 && x.completedAt)).toBe(true);
  });

  it('Lina has no goals', async () => {
    expect((await get<GoalsDto>('/me/goals', '102')).body).toEqual({ active: [], completed: [] });
  });

  it('profile includes member details', async () => {
    const p = (await get<ProfileDto>('/me', '101')).body;
    expect(p).toMatchObject({
      firstName: 'Mohamed',
      lastName: 'Omran',
      fitId: '101',
      heightCm: 183,
    });
  });
});

const createGoal = (body: unknown, fitId: string) =>
  mockServer.handle('POST', '/me/goals', body, `mock.${fitId}`) as Promise<{ status: number; body: GoalView }>;

describe('creating a goal', () => {
  it('Omar, with no goal yet, sets one that starts now from his latest scan', async () => {
    const [scan] = (await get<AssessmentDto[]>('/me/assessments', '103')).body;
    const r = await createGoal({ metric: 'BODY_FAT_KG', targetValue: scan.bodyFatKg - 2 }, '103');
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({
      title: 'Lose 2 kg of body fat',
      startValue: scan.bodyFatKg,
      percent: 0,
    });
    const goals = (await get<GoalsDto>('/me/goals', '103')).body;
    expect(goals.active.map((g) => g.id)).toEqual([r.body.id]);
    expect((await get<DashboardDto>('/me/dashboard', '103')).body.mission?.goalId).toBe(r.body.id);
  });

  it('Mohamed, with goals in progress, gets the new one in progress too, no approval needed', async () => {
    const [scan] = (await get<AssessmentDto[]>('/me/assessments', '101')).body;
    const r = await createGoal({ metric: 'MUSCLE_KG', targetValue: scan.skeletalMuscleKg + 1.5 }, '101');
    expect(r.status).toBe(201);
    expect(r.body.title).toBe('Gain 1.5 kg of muscle');
    const goals = (await get<GoalsDto>('/me/goals', '101')).body;
    expect(goals.active.map((g) => g.id)).toContain(r.body.id);
  });

  it('a weight goal is named by its target', async () => {
    const r = await createGoal({ metric: 'WEIGHT_KG', targetValue: 70 }, '103');
    expect(r.body.title).toBe('Reach 70 kg');
  });

  it('Lina, with no scan, is told to scan first (409)', async () => {
    const r = await createGoal({ metric: 'MUSCLE_KG', targetValue: 40 }, '102');
    expect(r.status).toBe(409);
  });

  it('rejects bad metrics, targets, and targets that point the wrong way', async () => {
    const [scan] = (await get<AssessmentDto[]>('/me/assessments', '103')).body;
    const ok = { metric: 'MUSCLE_KG', targetValue: scan.skeletalMuscleKg + 1 };
    for (const bad of [
      null,
      { ...ok, metric: 'HEIGHT' },
      { ...ok, targetValue: 'x' },
      { ...ok, targetValue: -1 },
      { ...ok, targetValue: scan.skeletalMuscleKg - 1 },
      { ...ok, metric: 'BODY_FAT_KG', targetValue: scan.bodyFatKg + 1 },
      { ...ok, metric: 'WEIGHT_KG', targetValue: scan.weightKg },
    ])
      expect((await createGoal(bad, '103')).status).toBe(400);
    expect((await get<GoalsDto>('/me/goals', '103')).body.active).toEqual([]);
  });

  it('created goals survive a mock server restart, and stay with their member', async () => {
    const r = await createGoal({ metric: 'WEIGHT_KG', targetValue: 70 }, '103');
    resetMockServer(NOW);
    expect((await get<GoalsDto>('/me/goals', '103')).body.active.map((g) => g.id)).toEqual([r.body.id]);
    const sam = (await get<GoalsDto>('/me/goals', '101')).body;
    expect([...sam.active, ...sam.completed].map((g) => g.title)).not.toContain('Reach 70 kg');
  });
});

describe('notifications', () => {
  it('newest first with i18n keys', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '101')).body;
    expect(list).toHaveLength(4);
    expect(list.map((n) => n.createdAt)).toEqual([...list.map((n) => n.createdAt)].sort().reverse());
    expect(list[0]).toMatchObject({ type: 'SCAN_RESULT', title: { key: 'notifications.scanResult.title' } });
    expect(list.filter((n) => n.readAt === null)).toHaveLength(2);
  });

  it('marking one read lowers the unread count', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '101')).body;
    const unread = list.find((n) => n.readAt === null)!;
    expect((await patch(`/me/notifications/${unread.id}/read`, null, '101')).status).toBe(204);
    expect((await get<DashboardDto>('/me/dashboard', '101')).body.unreadNotifications).toBe(1);
  });

  it('cannot mark another member’s notification read', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '101')).body;
    expect((await patch(`/me/notifications/${list[0].id}/read`, null, '102')).status).toBe(404);
  });

  it('read-all zeroes unread count', async () => {
    expect((await post('/me/notifications/read-all', '101')).status).toBe(201);
    expect((await get<DashboardDto>('/me/dashboard', '101')).body.unreadNotifications).toBe(0);
    const list = (await get<NotificationDto[]>('/me/notifications', '101')).body;
    expect(list.every((n) => n.readAt !== null)).toBe(true);
  });

  it('Lina has none', async () => {
    expect((await get<NotificationDto[]>('/me/notifications', '102')).body).toEqual([]);
  });
});

describe('avatar', () => {
  const put = (body: unknown, fitId: string) => mockServer.handle('PUT', '/me/avatar', body, `mock.${fitId}`);
  const look = {
    schemaVersion: 2,
    colors: { skin: 'brown', hair: 'black', top: 'teal', bottom: 'navy', shoes: 'orange' },
  };

  it('starts null, saves a valid look, and keeps it after a reload', async () => {
    expect((await get<ProfileDto>('/me', '101')).body.avatar).toBeNull();
    expect(await put(look, '101')).toEqual({ status: 200, body: look });
    resetMockServer(NOW);
    expect((await get<ProfileDto>('/me', '101')).body.avatar).toEqual(look);
  });

  it('keeps each member’s look separate', async () => {
    await put(look, '101');
    expect((await get<ProfileDto>('/me', '102')).body.avatar).toBeNull();
  });

  it('reads an older drawn-character save as no saved look', async () => {
    await Preferences.set({
      key: 'lu.mock.avatar.101',
      value: JSON.stringify({ schemaVersion: 1, rig: 'standard', colors: { skin: 'deep-brown' } }),
    });
    resetMockServer(NOW);
    expect((await get<ProfileDto>('/me', '101')).body.avatar).toBeNull();
  });

  it('rejects unknown presets, missing parts, extra fields, and wrong versions', async () => {
    for (const bad of [
      null,
      { ...look, colors: { ...look.colors, hair: 'neon' } },
      { ...look, colors: { ...look.colors, shoes: undefined } },
      { ...look, colors: { ...look.colors, hat: 'red' } },
      { ...look, schemaVersion: 1 },
      { ...look, colors: { ...look.colors, skin: '#ff0000' } },
    ]) {
      expect((await put(bad, '101')).status).toBe(400);
    }
    expect((await get<ProfileDto>('/me', '101')).body.avatar).toBeNull();
  });

  it('the dashboard carries the member id and saved look for the Home picture', async () => {
    await put(look, '101');
    const member = (await get<DashboardDto>('/me/dashboard', '101')).body.member;
    expect(member).toMatchObject({ memberId: 1, avatar: look });
  });

  it('needs a signed-in member', async () => {
    expect((await mockServer.handle('PUT', '/me/avatar', look, null)).status).toBe(401);
  });
});

