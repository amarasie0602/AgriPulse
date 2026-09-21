import type { AuthSession, AuthUser } from '@/types'
import { isTokenExpired } from '@/utils/jwt'

const TOKEN_KEY = 'agripulse.token'
const USER_KEY = 'agripulse.user'

/**
 * Session persistence strategy
 * ----------------------------
 * The API returns the JWT in the response body, so the client has to hold it.
 *  - "Remember me" ON  -> localStorage   (survives browser restarts)
 *  - "Remember me" OFF -> sessionStorage (cleared when the tab closes)
 * Only the token and basic profile are stored. Never store passwords.
 * A stricter option for production is an httpOnly, SameSite cookie set by
 * the backend, which keeps the token out of reach of page scripts entirely.
 */

function safeStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  const user = value as Record<string, unknown>
  return (
    (typeof user.id === 'number' || typeof user.id === 'string') &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  )
}

export const tokenStorage = {
  save(session: AuthSession, remember: boolean): void {
    this.clear()
    const store = safeStorage(remember ? 'local' : 'session')
    store?.setItem(TOKEN_KEY, session.token)
    store?.setItem(USER_KEY, JSON.stringify(session.user))
  },

  /** Returns a stored, unexpired session, or null (clearing anything stale). */
  load(): AuthSession | null {
    for (const kind of ['local', 'session'] as const) {
      const store = safeStorage(kind)
      const token = store?.getItem(TOKEN_KEY)
      const rawUser = store?.getItem(USER_KEY)
      if (!token || !rawUser) continue

      try {
        const user: unknown = JSON.parse(rawUser)
        if (isAuthUser(user) && !isTokenExpired(token)) return { token, user }
      } catch {
        // Corrupt entry — fall through and clear it below.
      }
      break
    }

    this.clear()
    return null
  },

  getToken(): string | null {
    return (
      safeStorage('local')?.getItem(TOKEN_KEY) ?? safeStorage('session')?.getItem(TOKEN_KEY) ?? null
    )
  },

  clear(): void {
    for (const kind of ['local', 'session'] as const) {
      const store = safeStorage(kind)
      store?.removeItem(TOKEN_KEY)
      store?.removeItem(USER_KEY)
    }
  },
}
