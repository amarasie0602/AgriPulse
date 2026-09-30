/**
 * Google sign-in is only active when a Client ID is configured. Without one,
 * Google's script has nothing valid to render against, so the UI falls back
 * to a disabled button rather than pretending the feature works.
 * See .env.example for how to create a Client ID.
 */
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || undefined

export const isGoogleAuthEnabled = Boolean(googleClientId)
