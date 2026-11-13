import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

import App from './App';

it('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement.querySelector('ion-app')).not.toBeNull();
});
