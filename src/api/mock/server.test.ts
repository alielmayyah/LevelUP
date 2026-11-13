import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it } from 'vitest';

import type {
  AssessmentDto,
  DashboardDto,
  GoalsDto,
  LeaderboardDto,
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

const BOARDS = ['score', 'progress', 'muscle', 'fatLoss'] as const;

beforeEach(async () => {
  await Preferences.clear();
  resetMockServer(NOW);
});

describe('auth', () => {
  it('login: known id → token, unknown → 401, 6th attempt → 429', async () => {
    expect((await login('100001')).body).toMatchObject({ accessToken: 'mock.100001', member: { firstName: 'Sam' } });
    expect((await login('999999')).status).toBe(401);
    for (let i = 0; i < 3; i++) await login('999999');
    expect((await login('999999')).status).toBe(429);
  });

  it('all three mock members can sign in', async () => {
    for (const [fitId, firstName] of [
      ['100001', 'Sam'],
      ['100002', 'Lina'],
      ['100003', 'Omar'],
    ]) {
      const r = await login(fitId);
      expect(r.status).toBe(201);
      expect(r.body).toMatchObject({ accessToken: `mock.${fitId}`, member: { firstName } });
    }
  });

  it('unknown and malformed ids get the same 401', async () => {
    const a = await login('999999');
    const b = await login('abc');
    expect(a.status).toBe(401);
    expect(b).toEqual(a);
  });

  it('no token → 401 on /me', async () => {
    expect((await mockServer.handle('GET', '/me', null, null)).status).toBe(401);
  });

  it('an unknown token → 401 on every data route', async () => {
    for (const path of ['/me', '/me/dashboard', '/me/progress', '/me/goals', '/me/notifications', '/leaderboard'])
      expect((await mockServer.handle('GET', path, null, 'mock.999999')).status).toBe(401);
  });

  it('unknown route → 404', async () => {
    expect((await get('/nope', '100001')).status).toBe(404);
  });
});

describe('dashboard', () => {
  it('Sam gets the suggested screenshot values', async () => {
    const { status, body: d } = await get<DashboardDto>('/me/dashboard', '100001');
    expect(status).toBe(200);
    expect(d.member).toEqual({ firstName: 'Sam', showFitScore: true });
    expect(d.fitScore).toEqual({ score: 72, tier: 'Strong', changeSinceLastScan: 3 });
    expect(d.mission).toMatchObject({ title: 'Lose 5 kg of body fat', percent: 60, doneKg: 3, remainingKg: 2 });
    expect(d.mission!.estimatedCompletion).not.toBeNull();
    expect(d.monthlyWins).toEqual({ bodyFatChangePct: -1.2, muscleGainedKg: 0.8 });
    expect(d.leaderboard).toEqual({
      optedIn: true,
      standing: { rank: 4, totalMembers: 13, topPercent: 31, membersBehind: 9, pointsToNextRank: 5 },
    });
    expect(d.unreadNotifications).toBe(2);
  });

  it('new member dashboard has nulls, never NaN', async () => {
    const d = (await get<DashboardDto>('/me/dashboard', '100002')).body;
    expect(d.fitScore).toBeNull();
    expect(d.mission).toBeNull();
    expect(d.monthlyWins).toEqual({ bodyFatChangePct: null, muscleGainedKg: null });
    expect(d.leaderboard).toEqual({ optedIn: false, standing: null });
    expect(JSON.stringify(d)).not.toContain('NaN');
  });

  it('Omar: one scan, FitScore hidden, no change yet', async () => {
    const d = (await get<DashboardDto>('/me/dashboard', '100003')).body;
    expect(d.member.showFitScore).toBe(false);
    expect(d.fitScore).toMatchObject({ changeSinceLastScan: null });
    expect(d.monthlyWins).toEqual({ bodyFatChangePct: null, muscleGainedKg: null });
  });

  it('no response for any mock member contains NaN or undefined values', async () => {
    for (const fitId of ['100001', '100002', '100003'])
      for (const path of ['/me', '/me/dashboard', '/me/progress', '/me/assessments', '/me/goals', '/me/notifications'])
        expect(JSON.stringify((await get(path, fitId)).body)).not.toMatch(/NaN|undefined|Infinity/);
  });
});

describe('dates are relative to today', () => {
  it('Sam has a scan this month and Omar’s membership ends in 10 days', async () => {
    const progress = (await get<ProgressDto>('/me/progress', '100001')).body.assessments;
    const latest = new Date(progress.at(-1)!.takenAt);
    expect(latest.getUTCFullYear()).toBe(NOW.getUTCFullYear());
    expect(latest.getUTCMonth()).toBe(NOW.getUTCMonth());
    expect(latest.getTime()).toBeLessThanOrEqual(NOW.getTime());

    const omar = (await get<ProfileDto>('/me', '100003')).body;
    const days = (new Date(omar.membershipEnd).getTime() - NOW.getTime()) / 86_400_000;
    expect(Math.round(days)).toBe(10);
  });

  it('a different "today" moves the data with it', async () => {
    const later = new Date('2027-03-02T08:00:00Z');
    resetMockServer(later);
    const d = (await get<DashboardDto>('/me/dashboard', '100001')).body;
    expect(d.monthlyWins).toEqual({ bodyFatChangePct: -1.2, muscleGainedKg: 0.8 });
    const progress = (await get<ProgressDto>('/me/progress', '100001')).body.assessments;
    expect(new Date(progress.at(-1)!.takenAt).getUTCMonth()).toBe(later.getUTCMonth());
  });
});

describe('progress, assessments, goals, profile', () => {
  it('Sam has 6 scans ascending; assessments come newest first with all metrics', async () => {
    const p = (await get<ProgressDto>('/me/progress', '100001')).body.assessments;
    expect(p).toHaveLength(6);
    expect(p.map((a) => a.takenAt)).toEqual([...p.map((a) => a.takenAt)].sort());
    const a = (await get<AssessmentDto[]>('/me/assessments', '100001')).body;
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
      ].sort(),
    );
  });

  it('progress is an empty array for a new member', async () => {
    expect((await get<ProgressDto>('/me/progress', '100002')).body.assessments).toEqual([]);
  });

  it('Sam’s goals: 1 active, 2 completed, 1 upcoming', async () => {
    const g = (await get<GoalsDto>('/me/goals', '100001')).body;
    expect([g.active.length, g.completed.length, g.upcoming.length]).toEqual([1, 2, 1]);
    expect(g.completed.every((x) => x.percent === 100 && x.completedAt)).toBe(true);
    expect(g.upcoming[0]).toMatchObject({ percent: 0, completedAt: null });
  });

  it('Lina has no goals', async () => {
    expect((await get<GoalsDto>('/me/goals', '100002')).body).toEqual({ active: [], completed: [], upcoming: [] });
  });

  it('profile reflects settings', async () => {
    const p = (await get<ProfileDto>('/me', '100001')).body;
    expect(p).toMatchObject({ firstName: 'Sam', lastName: 'Khalil', fitId: '100001', fitScoreOnLeaderboard: true });
    expect(p.coach).not.toBeNull();
    expect((await get<ProfileDto>('/me', '100002')).body.coach).toBeNull();
  });
});

describe('settings', () => {
  it('hiding FitScore shows on the dashboard and profile', async () => {
    const r = await patch('/me/settings', { showFitScore: false }, '100001');
    expect(r).toEqual({ status: 200, body: { showFitScore: false, fitScoreOnLeaderboard: true } });
    expect((await get<DashboardDto>('/me/dashboard', '100001')).body.member.showFitScore).toBe(false);
    expect((await get<ProfileDto>('/me', '100001')).body.showFitScore).toBe(false);
  });

  it('rejects non-boolean and empty bodies with 400', async () => {
    expect((await patch('/me/settings', { showFitScore: 'nope' }, '100001')).status).toBe(400);
    expect((await patch('/me/settings', {}, '100001')).status).toBe(400);
    expect((await patch('/me/settings', null, '100001')).status).toBe(400);
  });

  it('settings survive a mock server restart (page reload)', async () => {
    await patch('/me/settings', { showFitScore: false }, '100001');
    resetMockServer(NOW);
    expect((await get<ProfileDto>('/me', '100001')).body.showFitScore).toBe(false);
  });
});

describe('leaderboard', () => {
  it('only opted-in members appear; Sam is #4 of 13 on Top Score', async () => {
    const r = (await get<LeaderboardDto>('/leaderboard', '100001')).body;
    expect(r.board).toBe('score');
    expect(r.optedIn).toBe(true);
    expect(r.rows).toHaveLength(13);
    expect(r.rows.find((x) => x.isMe)).toMatchObject({ rank: 4, name: 'Sam K.', value: 72 });
    expect(r.rows.map((x) => x.name)).not.toContain('Lina H.');
    expect(r.rows.map((x) => x.name)).not.toContain('Omar A.');
  });

  it.each(BOARDS)('board %s orders by value desc and ranks from 1', async (board) => {
    const r = (await get<LeaderboardDto>(`/leaderboard?board=${board}`, '100001')).body;
    expect(r.board).toBe(board);
    expect(r.rows.length).toBeGreaterThanOrEqual(3);
    expect(r.rows.map((x) => x.value)).toEqual([...r.rows.map((x) => x.value)].sort((a, b) => b - a));
    expect(r.rows.map((x) => x.rank)).toEqual(r.rows.map((_, i) => i + 1));
  });

  it('monthly boards leave out members with no scan this month', async () => {
    const score = (await get<LeaderboardDto>('/leaderboard?board=score', '100001')).body.rows;
    const progress = (await get<LeaderboardDto>('/leaderboard?board=progress', '100001')).body.rows;
    expect(progress.length).toBeLessThan(score.length);
  });

  it('fatLoss is positive when fat dropped', async () => {
    const me = (await get<LeaderboardDto>('/leaderboard?board=fatLoss', '100001')).body.rows.find((r) => r.isMe);
    expect(me?.value).toBeCloseTo(1.2, 1);
  });

  it('opt-out removes member from every board immediately', async () => {
    await patch('/me/settings', { fitScoreOnLeaderboard: false }, '100001');
    for (const b of BOARDS) {
      const r = (await get<LeaderboardDto>(`/leaderboard?board=${b}`, '100001')).body;
      expect(r.optedIn).toBe(false);
      expect(r.rows.some((x) => x.isMe)).toBe(false);
    }
    expect((await get<DashboardDto>('/me/dashboard', '100001')).body.leaderboard).toEqual({
      optedIn: false,
      standing: null,
    });
  });

  it('opting in with no scans keeps Lina off every board', async () => {
    await patch('/me/settings', { fitScoreOnLeaderboard: true }, '100002');
    for (const b of BOARDS) {
      const r = (await get<LeaderboardDto>(`/leaderboard?board=${b}`, '100002')).body;
      expect(r.optedIn).toBe(true);
      expect(r.rows.some((x) => x.isMe)).toBe(false);
    }
  });

  it('unknown board → 400', async () => {
    expect((await get('/leaderboard?board=xp', '100001')).status).toBe(400);
  });

  it('no row exposes xp or level', async () => {
    for (const row of (await get<LeaderboardDto>('/leaderboard', '100001')).body.rows) {
      expect(Object.keys(row).sort()).toEqual(['isMe', 'memberId', 'name', 'rank', 'value']);
    }
  });
});

describe('notifications', () => {
  it('newest first with i18n keys', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '100001')).body;
    expect(list).toHaveLength(4);
    expect(list.map((n) => n.createdAt)).toEqual([...list.map((n) => n.createdAt)].sort().reverse());
    expect(list[0]).toMatchObject({ type: 'SCAN_RESULT', title: { key: 'notifications.scanResult.title' } });
    expect(list.filter((n) => n.readAt === null)).toHaveLength(2);
  });

  it('marking one read lowers the unread count', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '100001')).body;
    const unread = list.find((n) => n.readAt === null)!;
    expect((await patch(`/me/notifications/${unread.id}/read`, null, '100001')).status).toBe(204);
    expect((await get<DashboardDto>('/me/dashboard', '100001')).body.unreadNotifications).toBe(1);
  });

  it('cannot mark another member’s notification read', async () => {
    const list = (await get<NotificationDto[]>('/me/notifications', '100001')).body;
    expect((await patch(`/me/notifications/${list[0].id}/read`, null, '100002')).status).toBe(404);
  });

  it('read-all zeroes unread count', async () => {
    expect((await post('/me/notifications/read-all', '100001')).status).toBe(201);
    expect((await get<DashboardDto>('/me/dashboard', '100001')).body.unreadNotifications).toBe(0);
    const list = (await get<NotificationDto[]>('/me/notifications', '100001')).body;
    expect(list.every((n) => n.readAt !== null)).toBe(true);
  });

  it('Lina has none', async () => {
    expect((await get<NotificationDto[]>('/me/notifications', '100002')).body).toEqual([]);
  });
});
