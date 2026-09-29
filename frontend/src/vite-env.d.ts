/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** "true" enables the offline demo auth service (dev server only). */
  readonly VITE_USE_MOCK_AUTH?: string
  /** Google OAuth Client ID. Leave unset to keep "Continue with Google" disabled. */
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
