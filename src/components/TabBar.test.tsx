import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { setLanguage } from '../i18n';
import TabBar from './TabBar';
import { pillTransform, tabIndex } from './tabConfig';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  );

describe('TabBar', () => {
  afterEach(async () => {
    await setLanguage('en');
  });

  // Ionic renders role="tab" inside each button's shadow DOM, which jsdom can't
  // see, so these query the buttons directly. e2e/tabs.spec.ts checks roles.
  const tabs = () => Array.from(document.querySelectorAll('ion-tab-button'));

  it('tab bar has 5 tabs in order', () => {
    renderAt('/tabs/home');
    expect(tabs().map((t) => t.textContent)).toEqual(['Home', 'Progress', 'Goals', 'Leaderboard', 'Profile']);
  });

  it('every tab has an accessible name, even when labels are hidden', () => {
    renderAt('/tabs/home');
    expect(tabs().map((t) => t.getAttribute('aria-label'))).toEqual([
      'Home',
      'Progress',
      'Goals',
      'Leaderboard',
      'Profile',
    ]);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('pill sits under the active tab', () => {
    renderAt('/tabs/leaderboard');
    expect(screen.getByTestId('tab-pill').style.transform).toBe('translateX(300%)');
  });

  it('pill mirrors in rtl', async () => {
    await setLanguage('ar');
    renderAt('/tabs/goals');
    expect(screen.getByTestId('tab-pill').style.transform).toBe('translateX(-200%)');
    expect(tabs()[0]).toHaveAttribute('aria-label', 'الرئيسية');
  });

  it('pill hides outside the tabs', () => {
    renderAt('/login');
    expect(screen.getByTestId('tab-pill')).not.toBeVisible();
  });
});

describe('tabIndex / pillTransform', () => {
  it('matches a tab and its sub-pages', () => {
    expect(tabIndex('/tabs/home')).toBe(0);
    expect(tabIndex('/tabs/profile')).toBe(4);
    expect(tabIndex('/tabs/goals/12')).toBe(2);
    expect(tabIndex('/tabs/goalsx')).toBe(-1);
  });

  it('never prints -0%', () => {
    expect(pillTransform(0, true)).toBe('translateX(0%)');
    expect(pillTransform(1, false)).toBe('translateX(100%)');
    expect(pillTransform(4, true)).toBe('translateX(-400%)');
  });
});
