/*
 * Progress, Goals, and Profile against the mock API, for the
 * three mock members: 101 Mohamed (full), 102 Lina (new), 103 Omar (one scan,
 * FitScore hidden, membership ending soon), 104 Karim (lean-only body parts).
 */
import { Preferences } from '@capacitor/preferences';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockServer, resetMockServer } from '../api/mock/server';
import type { AssessmentDto, GoalsDto } from '../api/types';
import { setToken } from '../auth/token';
import { setLanguage } from '../i18n';
import { resetSound } from '../sound/useSound';
import Goals from './Goals';
import { markGoalCreated, takeGoalCreated } from './goals/created';
import NewGoal from './NewGoal';
import Profile from './Profile';
import Progress from './Progress';
import Settings from './Settings';

const NOW = new Date('2026-11-13T10:00:00Z');

async function renderAs(fitId: string, Page: React.FC) {
  await setToken(`mock.${fitId}`);
  return render(
    <MemoryRouter initialEntries={['/tabs/x']}>
      <Route exact path="/tabs/x" component={Page} />
      <Route exact path="/login" render={() => <p>login page</p>} />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await Preferences.clear();
  resetMockServer(NOW);
  resetSound();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await setLanguage('en');
});

describe('Progress', () => {
  it('tapping the scan date opens a calendar of scans; tapping a scan day shows that scan', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('scan-calendar-open'));
    const cal = await screen.findByTestId('scan-calendar');
    expect(within(cal).getByTestId('calendar-month')).toHaveTextContent('November 2026');
    // The scan on screen is marked; later months can't be reached.
    const days = within(cal).getAllByTestId('calendar-scan-day');
    expect(days).toHaveLength(1);
    expect(days[0]).toHaveAttribute('aria-current', 'date');
    expect(days[0]).toHaveAccessibleName(/^Scan on .*November \d+, 2026$/);
    expect(within(cal).getByTestId('calendar-next')).toBeDisabled();
    await userEvent.click(within(cal).getByTestId('calendar-prev'));
    expect(within(cal).getByTestId('calendar-month')).toHaveTextContent('October 2026');
    await userEvent.click(within(cal).getByTestId('calendar-scan-day'));
    expect(screen.getByTestId('scan-title')).toHaveTextContent('Oct 15, 2026');
  });

  it('opens on the key numbers; everything else waits behind See full scan, remembered per device', async () => {
    await renderAs('101', Progress);
    const more = await screen.findByTestId('progress-more');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveAttribute('aria-controls', 'progress-details');
    expect(more).toHaveTextContent('See full scan');
    expect(screen.queryByTestId('body-comp')).toBeNull();
    expect(screen.queryByTestId('more-metrics')).toBeNull();
    expect(screen.queryByTestId('compare-open')).toBeNull();
    // Collapsed, the changes are always against the scan before: one quiet line, no button.
    expect(screen.getByTestId('change-caption')).toHaveTextContent('Compared with your previous scan');
    await userEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(more).toHaveTextContent('Show less');
    expect(screen.getByTestId('compare-open')).toHaveTextContent('Pick scan');
    expect((await Preferences.get({ key: 'lu.progress.details' })).value).toBe('open');
    // Body composition is its own lazy chunk; on a busy CI runner it can take over a second.
    expect(await screen.findByTestId('body-comp', {}, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(more);
    expect(screen.queryByTestId('body-comp')).toBeNull();
    expect((await Preferences.get({ key: 'lu.progress.details' })).value).toBe('closed');
  });

  it('opens the full scan straight away when the member left it open', async () => {
    await Preferences.set({ key: 'lu.progress.details', value: 'open' });
    await renderAs('101', Progress);
    expect(await screen.findByTestId('more-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('progress-more')).toHaveAttribute('aria-expanded', 'true');
  });

  it('a failed refresh keeps the scan on screen, with the error and Retry above it', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    const handle = mockServer.handle.bind(mockServer);
    const spy = vi.spyOn(mockServer, 'handle').mockResolvedValue({ status: 500, body: null });
    window.dispatchEvent(new Event('online'));
    const alert = await screen.findByTestId('progress-refresh-error');
    expect(alert).toHaveTextContent("Couldn't refresh your progress");
    expect(screen.getByTestId('metric-weight')).toHaveTextContent(/80\.0\s?kg/);
    spy.mockImplementation(handle);
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.queryByTestId('progress-refresh-error')).toBeNull());
    expect(screen.getByTestId('metric-weight')).toHaveTextContent(/80\.0\s?kg/);
  });

  it("shows Mohamed's 3 key numbers with their change, and the other 6 in the full scan", async () => {
    await renderAs('101', Progress);
    const scan = await screen.findByTestId('latest-scan');
    expect(within(scan).getAllByRole('term')).toHaveLength(3);
    await userEvent.click(screen.getByTestId('progress-more'));
    const more = screen.getByTestId('more-metrics');
    expect(within(more).getAllByRole('term')).toHaveLength(6);
    expect(within(scan).getByTestId('metric-weight')).toHaveTextContent(/80\.0\s?kg/);
    expect(within(scan).getByTestId('metric-bodyFat')).toHaveTextContent('8.0%');
    expect(within(more).getByTestId('metric-visceral')).toHaveTextContent(/^Belly fat \(around organs\)3/);
    // Level 3 is under 10: a plain verdict beside it.
    expect(within(more).getByTestId('visceral-verdict')).toHaveTextContent('Healthy');
    expect(within(more).getByTestId('metric-bmr')).toHaveTextContent(/1,\d{3}\s?kcal/);
    // The six smaller cards show the change since the scan before, with a sign.
    for (const key of ['water', 'protein', 'minerals', 'bmr', 'bmi', 'visceral'])
      expect(within(more).getByTestId(`change-${key}`)).toHaveTextContent(/^[+−]|±0/);
    // Muscle up is good news, body fat down is good news (a check on the block), weight has no right way.
    expect(within(scan).getByText('Up 0.9 kg since the scan before').parentElement).toHaveAttribute(
      'data-tone',
      'good',
    );
    expect(within(scan).getByText('Down 1.1% since the scan before').parentElement).toHaveAttribute(
      'data-tone',
      'good',
    );
    expect(within(scan).getByText('Up 0.7 kg since the scan before').parentElement).toHaveAttribute(
      'data-tone',
      'none',
    );
    expect(within(scan).getByTestId('change-muscle').querySelector('[data-icon="checkCircle"]')).toBeInTheDocument();
    expect(within(scan).getByTestId('change-weight').querySelector('[data-icon="checkCircle"]')).toBeNull();
    // The direction is an icon, not a text arrow.
    expect(within(scan).getByTestId('change-muscle').querySelector('[data-icon="trendUp"]')).toBeInTheDocument();
    expect(within(scan).getByTestId('change-bodyFat').querySelector('[data-icon="trendDown"]')).toBeInTheDocument();
  });

  it('draws one trend at a time, with a screen-reader summary, and switches metric', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    expect(await screen.findByTestId('chart-trend')).toBeInTheDocument();
    expect(screen.getByText(/Weight went from 76\.2 kg to 80\.0 kg/)).toBeInTheDocument();
    // Each option carries its metric's icon; the name stays the visible label.
    expect(screen.getByRole('radio', { name: 'Body fat' }).querySelector('svg.lu-icon')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Body fat' }));
    expect(screen.getByText(/Body fat went from 14\.6% to 8\.0%/)).toBeInTheDocument();
    expect(screen.queryByTestId('trend-score')).toBeNull();
  });

  it('the chart points work from the keyboard: arrow keys move between scans', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    await screen.findByTestId('chart-trend');
    const last = screen.getByTestId('chart-trend-point-5');
    expect(last).toHaveAttribute('tabindex', '0');
    expect(last).toHaveAccessibleName(/Weight 80\.0 kg/);
    last.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('chart-trend-point-4')).toHaveFocus();
    expect(screen.getByTestId('chart-trend-tip')).toHaveTextContent('Weight 79.3 kg');
  });

  it('steps back to an earlier scan and compares it with the one before', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    expect(screen.getByTestId('scan-newer')).toBeDisabled();
    // The newest scan is tagged Latest, with how long ago it was taken.
    expect(screen.getByTestId('scan-latest')).toHaveTextContent('Latest');
    expect(screen.getByTestId('scan-age')).toHaveTextContent(/^(Today|Yesterday|\d+ (day|week|month|year)s? ago)$/);
    await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.queryByTestId('scan-latest')).toBeNull();
    expect(screen.getByTestId('change-caption')).toHaveTextContent('Compared with your previous scan');
    // Oct 15 is compared with the scan 4 weeks before it (shown in the full scan).
    await userEvent.click(screen.getByTestId('progress-more'));
    expect(screen.getByTestId('compare-gap')).toHaveTextContent(/^\d+ (day|week|month)s? before$/);
    // The date is the title; only screen readers hear Scan 5 of 6.
    expect(screen.getByTestId('scan-title')).toHaveTextContent('Oct 15, 2026');
    expect(screen.getByTestId('scan-date')).toHaveTextContent('Scan 5 of 6');
    expect(screen.getByTestId('metric-weight')).toHaveTextContent(/79\.3\s?kg/);
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Older scan' }));
    expect(screen.getByTestId('scan-older')).toBeDisabled();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('Your first scan');
  });

  it('View all scans lists every scan and opens the one tapped', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    await userEvent.click(screen.getByRole('button', { name: 'All scans (6)' }));
    const rows = await screen.findAllByTestId('scan-row');
    // Five to a page; the pager shows because there are six.
    expect(rows).toHaveLength(5);
    expect(screen.getByTestId('pager')).toHaveTextContent('Page 1 of 2');
    expect(rows[0]).toHaveAttribute('aria-current', 'true');
    await userEvent.click(rows[2]);
    expect(screen.getByTestId('scan-date')).toHaveTextContent('Scan 4 of 6');
  });

  it('every measurement has an info button that explains it', async () => {
    await renderAs('101', Progress);
    await screen.findByTestId('latest-scan');
    // Only the three key numbers by default; all nine in the full scan.
    expect(screen.getAllByRole('button', { name: /^About / })).toHaveLength(3);
    await userEvent.click(screen.getByTestId('progress-more'));
    expect(screen.getAllByRole('button', { name: /^About / })).toHaveLength(9);
    await userEvent.click(screen.getByRole('button', { name: 'About Belly fat (around organs)' }));
    const dialog = screen.getByTestId('metric-info');
    expect(dialog).toHaveTextContent('Fat stored deep in your belly');
    expect(dialog).toHaveTextContent('What to do');
    expect(screen.getByTestId('metric-info-value')).toHaveTextContent('3');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.getByTestId('metric-info')).not.toHaveTextContent('Fat stored deep');
  });

  it('the body composition cards place each number as Low, Healthy or High', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    const bc = await screen.findByTestId('body-comp');
    const weight = within(bc).getByTestId('bar-weight');
    expect(weight).toHaveTextContent(/80\.0\s?kg/);
    expect(weight).toHaveAttribute('data-status', 'normal');
    expect(weight).toHaveTextContent(/Healthy\W*62\.6–84\.7\W*kg/);
    // 41.3 kg of muscle is over the 31.6–38.6 kg band for 183 cm: good news, shown as High with a check.
    const muscle = within(bc).getByTestId('bar-smm');
    expect(muscle).toHaveAttribute('data-status', 'over');
    expect(muscle.querySelector('.lu-status-good')).toHaveTextContent('High');
    // 8% body fat is under the men's 10–20% band.
    expect(within(bc).getByTestId('bar-pbf')).toHaveTextContent(/8\.0%/);
    expect(within(bc).getByTestId('bar-pbf')).toHaveAttribute('data-status', 'under');
    // Compared with the scan before by default: muscle up is green.
    expect(within(bc).getByTestId('bar-smm-delta')).toHaveTextContent('+0.9 kg');
    expect(within(bc).getByTestId('bar-smm-delta')).toHaveClass('text-success');
    // Body parts: a left/right list, muscle by default, fat a tap away.
    const segs = within(bc).getByTestId('segments');
    expect(within(segs).getByTestId('seg-rightArm')).toHaveTextContent(/kg/);
    expect(within(segs).getByTestId('seg-rightArm')).toHaveAttribute('data-status', 'over');
    expect(within(segs).getByTestId('seg-rightArm')).toHaveTextContent('135% of normal');
    await userEvent.click(within(segs).getByRole('radio', { name: 'Fat' }));
    expect(within(segs).getByRole('radio', { name: 'Fat' })).toHaveAttribute('aria-checked', 'true');
    expect(within(segs).getByTestId('seg-trunk')).toHaveAttribute('data-status', 'under');
    expect(within(segs).getByTestId('seg-trunk')).toHaveTextContent('Low');
  });

  it('lists all five body parts in both views', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    const segs = await screen.findByTestId('segments');
    const parts = () => segs.querySelectorAll('[data-testid^="seg-"][data-status]');
    expect(parts()).toHaveLength(5);
    await userEvent.click(screen.getByRole('radio', { name: 'Fat' }));
    expect(parts()).toHaveLength(5);
  });

  it('a lean-only scan lists the body parts with no fat view', async () => {
    await renderAs('104', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    const segs = await screen.findByTestId('segments');
    expect(segs.querySelectorAll('[data-testid^="seg-"][data-status]')).toHaveLength(5);
    expect(within(segs).queryByRole('radio', { name: 'Fat' })).toBeNull();
    expect(within(segs).getByTestId('seg-rightArm')).toHaveTextContent('3.48');
  });

  it('shows a plan: what to do next, with the reason and how', async () => {
    await renderAs('101', Progress);
    const plan = await screen.findByTestId('action-plan');
    // Mohamed is very lean (8% body fat, under 10%) with plenty of muscle.
    const first = within(plan).getByTestId('advice-fatLow');
    expect(first).toHaveAttribute('data-level', 'watch');
    expect(first).toHaveTextContent('Your body fat is 8.0%, under the healthy 10%.');
    expect(first).toHaveTextContent('How:');
    expect(within(plan).getByTestId('advice-muscleStrong')).toHaveAttribute('data-level', 'keep');
    // What the change since the scan before adds up to sits at the top of the plan.
    expect(within(plan).getByTestId('scan-insight')).toHaveAttribute('data-kind', 'recomp');
  });

  it('compares the scan with any other scan, or with none', async () => {
    await renderAs('101', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    await screen.findByTestId('body-comp');
    await userEvent.click(screen.getByTestId('compare-open'));
    const picker = await screen.findByTestId('compare-picker');
    const rows = within(picker).getAllByTestId('scan-row');
    // The compare sheet fits fewer rows than the list (it has a hint and a Don't compare row): 4 at this height.
    expect(rows).toHaveLength(4);
    expect(rows[0]).toBeDisabled(); // the scan on screen
    expect(rows[1]).toHaveAttribute('aria-current', 'true'); // the scan before, by default
    // The first scan is the last row of page 2.
    await userEvent.click(within(picker).getByRole('button', { name: 'Next page' }));
    const page2 = within(picker).getAllByTestId('scan-row');
    expect(page2).toHaveLength(2);
    await userEvent.click(page2[1]);
    // Now every change is since the first scan: 36.4 → 41.3 kg of muscle.
    expect(screen.getByTestId('change-muscle')).toHaveTextContent('4.9 kg');
    expect(screen.getByTestId('bar-smm-delta')).toHaveTextContent('+4.9 kg');
    await userEvent.click(screen.getByTestId('compare-open'));
    await userEvent.click(await screen.findByTestId('compare-none'));
    expect(screen.getByTestId('change-caption')).toHaveTextContent('No scan');
    expect(screen.queryByTestId('bar-smm-delta')).toBeNull();
    expect(screen.getByTestId('change-muscle')).toHaveTextContent('');
  });

  it('Lina sees the empty state', async () => {
    await renderAs('102', Progress);
    expect(await screen.findByText('No scans yet.')).toBeInTheDocument();
    // The next step, as text: there is nowhere in the app to book a scan.
    expect(screen.getByTestId('progress-empty-next')).toHaveTextContent('Book your first scan at the front desk.');
  });

  it('Omar (one scan) sees when changes and trends will appear, and no FitScore trend', async () => {
    await renderAs('103', Progress);
    await userEvent.click(await screen.findByTestId('progress-more'));
    expect(await screen.findByText('Your trends appear after your second scan.')).toBeInTheDocument();
    expect(screen.getByTestId('change-weight')).toHaveTextContent('After 2nd scan');
    expect(screen.queryByTestId('trend-score')).toBeNull();
  });
});

describe('Goals', () => {
  it('shows every goal on one page: in progress, then completed; nothing up next', async () => {
    await renderAs('101', Goals);
    await screen.findByTestId('section-active');
    expect(screen.queryByTestId('journey')).toBeNull();
    expect(within(screen.getByTestId('section-active')).getAllByTestId('goal')).toHaveLength(2);
    expect(screen.queryByTestId('section-upcoming')).toBeNull();
    expect(within(screen.getByTestId('section-completed')).getAllByTestId('goal')).toHaveLength(2);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['In progress 2', 'Completed 2']);
  });

  it('an active goal shows percent, kg done of total, and its bar', async () => {
    await renderAs('101', Goals);
    const [goal] = within(await screen.findByTestId('section-active')).getAllByTestId('goal');
    expect(goal).toHaveTextContent('Gain 3 kg of muscle');
    expect(within(goal).getByTestId('goal-percent')).toHaveTextContent('67%');
    expect(within(goal).getByTestId('goal-meta')).toHaveTextContent('2.0 of 3.0 kg done');
    expect(within(goal).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
    // Start at the bar's beginning, target at its end: nothing to open.
    expect(within(goal).getByTestId('goal-stats')).toHaveTextContent(/Start 39\.3 kg.*Target 42\.3 kg/);
    expect(within(goal).queryByRole('button')).toBeNull();
  });

  it('completed goals keep a full bar and no date', async () => {
    await renderAs('101', Goals);
    const done = within(await screen.findByTestId('section-completed')).getAllByTestId('goal');
    expect(done[0]).toHaveTextContent('Goal reached');
    // A scan's date is when the member was measured, not when the goal was met.
    expect(done[0]).not.toHaveTextContent(/Completed |2026/);
    expect(within(done[0]).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('cards show no due date and no coach note', async () => {
    await renderAs('101', Goals);
    await screen.findByTestId('section-active');
    expect(screen.queryByText(/Due /)).toBeNull();
    expect(screen.queryByText('Keep protein high on training days.')).toBeNull();
  });

  it('Lina, with no goals, sees one empty state', async () => {
    await renderAs('102', Goals);
    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.queryByTestId('journey')).toBeNull();
    expect(screen.getByTestId('goal-new-empty')).toHaveTextContent('Set your first goal');
    // One primary button on screen: no header New goal while the empty state offers one.
    expect(screen.queryByTestId('goal-new')).toBeNull();
  });

  it('offers a New goal button in the header once there are goals', async () => {
    await renderAs('101', Goals);
    expect(await screen.findByTestId('goal-new')).toHaveTextContent('New goal');
  });

  it('confirms a goal just created with a toast, once', async () => {
    markGoalCreated();
    await renderAs('101', Goals);
    expect(await screen.findByTestId('toast')).toHaveTextContent('Goal set! It counts from your last scan.');
    expect(takeGoalCreated()).toBe(false);
  });
});

describe('New goal', () => {
  const mock = <T,>(path: string, fitId: string) =>
    mockServer.handle('GET', path, null, `mock.${fitId}`).then((r) => r.body as T);

  it('Omar sets a muscle goal himself: what and how much, and it starts now', async () => {
    const [scan] = await mock<AssessmentDto[]>('/me/assessments', '103');
    await renderAs('103', NewGoal);
    await userEvent.click(await screen.findByTestId('goal-type-MUSCLE_KG'));
    expect(screen.getByTestId('goal-type-MUSCLE_KG')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('2');
    // The stepper buttons say how much each press moves.
    expect(screen.getByTestId('goal-less')).toHaveAccessibleName('Less (−0.5 kg)');
    expect(screen.getByTestId('goal-more')).toHaveAccessibleName('More (+0.5 kg)');
    await userEvent.click(screen.getByTestId('goal-more'));
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('2.5');
    expect(screen.getByTestId('goal-name')).toHaveTextContent('Gain 2.5 kg of muscle');
    expect(screen.queryByText('By when?')).toBeNull();
    expect(await screen.findByTestId('goal-starts')).toHaveTextContent('Starts today');

    await userEvent.click(screen.getByTestId('goal-create'));
    await waitFor(async () => {
      const goals = await mock<GoalsDto>('/me/goals', '103');
      expect(goals.active).toHaveLength(1);
      expect(goals.active[0]).toMatchObject({
        title: 'Gain 2.5 kg of muscle',
        metric: 'MUSCLE_KG',
        targetValue: Math.round((scan.skeletalMuscleKg + 2.5) * 10) / 10,
      });
    });
    // Goals shows "Goal set!" when the member lands back on it.
    await waitFor(() => expect(takeGoalCreated()).toBe(true));
  });

  it('a fat goal cannot go below half a kilo, and starts today even with others in progress', async () => {
    await renderAs('101', NewGoal);
    const less = await screen.findByTestId('goal-less');
    for (let i = 0; i < 4; i++) if (!(less as HTMLButtonElement).disabled) await userEvent.click(less);
    expect(screen.getByTestId('goal-amount')).toHaveTextContent('0.5');
    expect(less).toBeDisabled();
    expect(screen.getByTestId('goal-starts')).toHaveTextContent('Starts today');
  });

  it('a weight goal steps the target and skips the current weight', async () => {
    await renderAs('103', NewGoal);
    await userEvent.click(await screen.findByTestId('goal-type-WEIGHT_KG'));
    expect(screen.getByTestId('goal-name')).toHaveTextContent(/^Reach [\d.]+ kg$/);
    expect(screen.getByTestId('goal-change')).toHaveTextContent(/from your last scan/);
  });

  it('Lina, with no scan, is told to book one and has a way back', async () => {
    await renderAs('102', NewGoal);
    expect(await screen.findByTestId('new-goal-no-scan')).toHaveTextContent('You need a body scan');
    expect(screen.getByTestId('new-goal-back')).toBeInTheDocument();
    expect(screen.queryByTestId('goal-create')).toBeNull();
  });

  it('reads in Egyptian Arabic', async () => {
    await setLanguage('ar');
    await renderAs('103', NewGoal);
    expect(await screen.findByText('عايز تعمل إيه؟')).toBeInTheDocument();
    expect(screen.getByTestId('goal-create')).toHaveTextContent('اعمل الهدف');
    expect(screen.getByTestId('goal-more')).toHaveAccessibleName('أكتر (+0.5 كجم)');
  });
});

describe('Profile', () => {
  it('shows the member identity, avatar, age, height, and earned medals', async () => {
    await renderAs('101', Profile);
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Mohamed Omran');
    expect(screen.getByText('Fit ID 101')).toBeInTheDocument();
    expect(screen.getByTestId('profile-age')).toHaveTextContent(/\d+ years/);
    expect(screen.getByTestId('profile-height')).toHaveTextContent(/\d+.* cm/);
    expect(screen.getByTestId('profile-avatar')).toHaveAttribute('data-crop', 'portrait');
    const medals = await screen.findByTestId('profile-medal-grid');
    // Scan medals only: muscle, body fat, and BMI.
    expect(within(medals).getAllByRole('listitem')).toHaveLength(3);
    expect(within(medals).getByTestId('profile-medal-bodyFat')).toHaveTextContent('Legendary');
    expect(within(medals).getByTestId('profile-medal-bmi')).toHaveTextContent('Gold');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/tabs/account/settings');
    expect(screen.queryByText('Rami Saad')).toBeNull();
    expect(screen.queryByText(/Premium/)).toBeNull();
  });

  it('shows the no-medals state for a new member', async () => {
    await renderAs('102', Profile);
    const medals = await screen.findByTestId('profile-medal-grid');
    expect(await screen.findByTestId('profile-medal-count')).toHaveTextContent('Medals earned in 0 of 3 categories');
    expect(within(medals).getAllByRole('button')).toHaveLength(3);
    expect(within(medals).getByTestId('profile-medal-muscle')).toHaveAttribute('data-unlocked', 'false');
  });
});

describe('Settings', () => {
  it('language, theme and sound work even when the profile fails to load', async () => {
    vi.spyOn(mockServer, 'handle').mockResolvedValue({ status: 500, body: null });
    await renderAs('101', Settings);
    expect(screen.getByTestId('setting-language')).toBeInTheDocument();
    expect(screen.getByTestId('setting-theme')).toBeInTheDocument();
    expect(screen.getByTestId('setting-sound')).toBeInTheDocument();
    expect(screen.queryByTestId('setting-show-fitscore')).toBeNull();
    expect(screen.getByTestId('sign-out')).toBeInTheDocument();
  });

  it('warns about the Fit ID before signing out', async () => {
    await renderAs('101', Settings);
    await userEvent.click(screen.getByTestId('sign-out'));
    expect(await screen.findByText(/You'll need your Fit ID to sign back in\./)).toBeInTheDocument();
  });

  it('switching language to Arabic flips the whole app', async () => {
    await renderAs('101', Settings);
    const lang = await screen.findByTestId('setting-language');
    await userEvent.click(within(lang).getByRole('radio', { name: 'عربي' }));
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(screen.getByText('الإعدادات')).toBeInTheDocument();
  });
});
