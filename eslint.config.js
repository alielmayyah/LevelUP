import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'android/**', 'ios/**', 'playwright-report/**', 'test-results/**', 'blob-report/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Screens and components must go through api(); only the client and tests
    // may reach the mock server, so turning mocks off can't break a screen.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/api/client.ts', 'src/api/mock/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/mock', '**/api/mock/**', './mock', './mock/**'],
              message: 'Import data through api() from src/api/client.ts, never from src/api/mock/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['*.config.{ts,js}', 'e2e/**/*.ts', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
