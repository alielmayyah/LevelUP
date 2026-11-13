import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initLanguage } from './i18n';
import { initTheme } from './theme/theme';

// Resolve language and theme before the first paint so the page never flashes
// the wrong direction or palette.
void Promise.all([initLanguage(), initTheme()]).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
