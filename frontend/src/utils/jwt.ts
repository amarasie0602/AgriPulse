/**
 * Decodes a JWT's payload for client-side use only (session expiry, reading
 * a Google credential's profile fields in demo mode). The signature is NOT
 * verified here — the backend remains the source of truth for anything that
 * matters security-wise.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/** Reads the `exp` claim (seconds since epoch) and converts it to a millisecond timestamp. */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload<{ exp?: unknown }>(token)
  return payload && typeof payload.exp === 'number' ? payload.exp * 1000 : null
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  return expiry !== null && expiry <= Date.now()
}
