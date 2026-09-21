import { isAxiosError } from 'axios'

/** Error safe to show in the UI. Never wraps raw backend payloads. */
export class AuthError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

type AuthAction = 'login' | 'register'

export const NETWORK_ERROR_MESSAGE = 'Unable to connect to AgriPulse. Please try again.'

/** Turns any thrown value into a friendly AuthError. */
export function toAuthError(error: unknown, action: AuthAction): AuthError {
  if (error instanceof AuthError) return error

  if (!isAxiosError(error)) {
    return new AuthError('Something went wrong. Please try again.')
  }

  // No response at all: offline, DNS failure, CORS block, timeout.
  if (!error.response) return new AuthError(NETWORK_ERROR_MESSAGE)

  const { status } = error.response

  switch (status) {
    case 400:
      return new AuthError('Please check the details you entered and try again.', status)
    case 401:
      return new AuthError(
        action === 'login'
          ? 'Incorrect email or password.'
          : 'Your session has expired. Please sign in again.',
        status,
      )
    case 409:
      return new AuthError('An account with this email already exists.', status)
    case 429:
      return new AuthError('Too many attempts. Please wait a moment and try again.', status)
    default:
      if (status >= 500) {
        return new AuthError('AgriPulse ran into a problem. Please try again shortly.', status)
      }
      return new AuthError('Something went wrong. Please try again.', status)
  }
}
