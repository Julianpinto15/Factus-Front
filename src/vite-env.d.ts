/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NG_APP_API_URL_PRODUCTION: string;
  readonly NG_APP_API_URL: string;
  readonly NG_APP_CLIENT_ID: string;
  readonly NG_APP_CLIENT_SECRET: string;
  readonly NG_APP_EMAIL: string;
  readonly NG_APP_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
