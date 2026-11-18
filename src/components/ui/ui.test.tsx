import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setLanguage } from '../../i18n';
import { Button, Chip, FeedCard, IconTile, Num, StateCard } from '.';

afterEach(async () => {
  await setLanguage('en');
});

describe('Num', () => {
  it('uses the number font with tabular figures inside a bdi', () => {
    render(<Num value={77.9} unit="kg" testId="n" />);
    const n = screen.getByTestId('n');
    expect(n.tagName).toBe('BDI');
    expect(n).toHaveClass('font-num', 'tabular-nums');
    expect(n).toHaveTextContent('77.9 kg');
  });

  it('keeps Latin digits in Arabic and puts % right after the number', async () => {
    await setLanguage('ar');
    render(<Num value={19.15} digits={2} unit="%" testId="n" />);
    expect(screen.getByTestId('n')).toHaveTextContent('19.15%');
  });

  it('signs a change with a real minus', () => {
    render(<Num value={-2.3} unit="kg" signed testId="n" />);
    // Strip the bidi isolates around the signed number; the unit follows a no-break space.
    expect(screen.getByTestId('n').textContent?.replace(/[\u2066-\u2069]/g, '')).toBe('−2.3\u00a0kg');
  });

  it('a missing value never shows a unit', () => {
    render(<Num value={null} unit="kg" testId="n" />);
    expect(screen.getByTestId('n')).toHaveTextContent('—');
    expect(screen.getByTestId('n')).not.toHaveTextContent('kg');
  });
});

describe('Button', () => {
  it('is a button that fires once per tap, with its variant', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book the scan</Button>);
    const b = screen.getByRole('button', { name: 'Book the scan' });
    expect(b).toHaveAttribute('type', 'button');
    expect(b).toHaveAttribute('data-variant', 'primary');
    expect(b).toHaveClass('bg-brand-strong', 'text-on-brand');
    await userEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('secondary and quiet use the brand tint and soft text', () => {
    render(
      <>
        <Button variant="secondary">Later</Button>
        <Button variant="quiet">Skip</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Later' })).toHaveClass('bg-brand-tint', 'text-brand-soft');
    expect(screen.getByRole('button', { name: 'Skip' })).toHaveClass('text-brand-soft');
  });
});

describe('Chip', () => {
  it.each([
    ['good', 'checkCircle'],
    ['attention', 'warning'],
    ['stable', 'remove'],
  ] as const)('%s carries an icon as well as its word', (tone, icon) => {
    render(
      <Chip tone={tone} testId="c">
        word
      </Chip>,
    );
    const c = screen.getByTestId('c');
    expect(c).toHaveAttribute('data-tone', tone);
    expect(c.querySelector(`[data-icon="${icon}"]`)).not.toBeNull();
    expect(c).toHaveTextContent('word');
  });
});

describe('IconTile', () => {
  it('is decorative and carries its tone', () => {
    const { container } = render(<IconTile icon="muscle" tone="muscle" />);
    const tile = container.querySelector('.lu-tile');
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile).toHaveAttribute('data-tone', 'muscle');
  });
});

describe('FeedCard', () => {
  it('is a section named by its h2, with the action at the bottom', () => {
    render(
      <FeedCard icon="calendar" title="Next scan" subtitle="In 4 weeks" action={<Button>Book</Button>} testId="card">
        <p>body</p>
      </FeedCard>,
    );
    const card = screen.getByRole('region', { name: 'Next scan' });
    expect(card).toBe(screen.getByTestId('card'));
    expect(screen.getByRole('heading', { level: 2, name: 'Next scan' })).toBeInTheDocument();
    expect(card.lastElementChild).toContainElement(screen.getByRole('button', { name: 'Book' }));
  });
});

describe('StateCard', () => {
  it('says what is missing and offers one way forward', () => {
    render(
      <StateCard
        icon="scan"
        title="No scans yet"
        message="Book your first scan at the front desk."
        action={<Button>Book</Button>}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Book your first scan at the front desk.');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
