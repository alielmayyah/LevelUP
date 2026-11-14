// Tailwind first: it declares the cascade-layer order every later stylesheet joins.
import './theme/tailwind.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initLanguage } from './i18n';
import { initSound } from './sound/useSound';
import { applyBrand } from './theme/applyBrand';
import { initTheme } from './theme/theme';

applyBrand();

// Resolve language, theme, and sound before the first paint so the page never
// flashes the wrong direction, palette, or mute icon.
void Promise.all([initLanguage(), initTheme(), initSound()]).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
