import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import '../../i18n';
import Pager from './Pager';

describe('Pager', () => {
  it('shows the page, disables the ends, and moves by one', async () => {
    const onPage = vi.fn();
    const { rerender } = render(<Pager page={0} pages={3} onPage={onPage} />);
    expect(screen.getByTestId('pager')).toHaveTextContent('Page 1 of 3');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPage).toHaveBeenCalledWith(1);

    rerender(<Pager page={2} pages={3} onPage={onPage} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPage).toHaveBeenCalledWith(1);
  });
});
