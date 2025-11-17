/// <reference types="vite/client" />

// Extend the ImportMetaEnv interface for environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_COGNITO_DOMAIN?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}