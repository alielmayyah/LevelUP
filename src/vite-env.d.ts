/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_MOCK_LATENCY_MS?: string;
  readonly VITE_API_URL?: string;
  /** 'true' shows Community (tab, leaderboards, member cards, Home rank card). Off until it launches. */
  readonly VITE_COMMUNITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
