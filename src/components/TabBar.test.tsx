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

  it('tab bar has 4 tabs in order, named by their visible labels', () => {
    renderAt('/tabs/home');
    expect(tabs().map((t) => t.textContent)).toEqual(['Home', 'Progress', 'Goals', 'Profile']);
    // No aria-label on the buttons: the visible label is the name (WCAG 2.5.3).
    expect(tabs().some((t) => t.hasAttribute('aria-label'))).toBe(false);
  });

  it('sits in a navigation landmark', () => {
    renderAt('/tabs/home');
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('pill sits under the active tab', () => {
    renderAt('/tabs/profile');
    expect(screen.getByTestId('tab-pill').style.transform).toBe('translateX(300%)');
  });

  it('pill mirrors in rtl', async () => {
    await setLanguage('ar');
    renderAt('/tabs/goals');
    expect(screen.getByTestId('tab-pill').style.transform).toBe('translateX(-200%)');
    expect(tabs()[0]).toHaveTextContent('الرئيسية');
  });

  it('pill hides outside the tabs', () => {
    renderAt('/login');
    expect(screen.getByTestId('tab-pill')).not.toBeVisible();
  });
});

describe('tabIndex / pillTransform', () => {
  it('matches a tab and its sub-pages', () => {
    expect(tabIndex('/tabs/home')).toBe(0);
    expect(tabIndex('/tabs/profile')).toBe(3);
    expect(tabIndex('/tabs/profile/settings')).toBe(3);
    expect(tabIndex('/tabs/community/leaderboard')).toBe(-1);
    expect(tabIndex('/tabs/leaderboard')).toBe(-1);
    expect(tabIndex('/tabs/goals/12')).toBe(2);
    expect(tabIndex('/tabs/goalsx')).toBe(-1);
  });

  it('never prints -0%', () => {
    expect(pillTransform(0, true)).toBe('translateX(0%)');
    expect(pillTransform(1, false)).toBe('translateX(100%)');
    expect(pillTransform(4, true)).toBe('translateX(-400%)');
  });
});
