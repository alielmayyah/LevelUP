import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      treeshake: {
        // Each @ionic/core component module only defines its custom element when
        // defineCustomElement() runs, but the package doesn't declare sideEffects,
        // so without this every Ionic component lands in the initial bundle.
        moduleSideEffects: (id: string) => !/[\\/]@ionic[\\/]core[\\/]components[\\/]ion-[^\\/]+\.js$/.test(id),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    env: {
      VITE_USE_MOCKS: 'true',
      VITE_MOCK_LATENCY_MS: '0',
    },
  },
});
