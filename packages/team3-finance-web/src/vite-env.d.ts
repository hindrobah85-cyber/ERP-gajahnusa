/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ML_HUB_URL: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_TOKEN_STORAGE_KEY: string
  readonly VITE_PAYMENT_GATEWAY_URL: string
  readonly VITE_BANK_API_URL: string
  readonly VITE_TAX_API_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_REAL_TIME: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_EXPORT: string
  readonly VITE_DEFAULT_CURRENCY: string
  readonly VITE_DEFAULT_LOCALE: string
  readonly VITE_THEME_MODE: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_API_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}