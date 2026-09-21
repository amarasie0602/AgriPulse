/**
 * Reads the `exp` claim from a JWT for client-side session housekeeping only.
 * The signature is NOT verified here — the backend remains the source of truth.
 */
export function getTokenExpiry(token: string): number | null {
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
    const { exp } = JSON.parse(json) as { exp?: unknown }

    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  return expiry !== null && expiry <= Date.now()
}
