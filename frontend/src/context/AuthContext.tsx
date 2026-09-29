import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, setUnauthorizedHandler, tokenStorage } from '@/services'
import type {
  AuthLocationState,
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserRole,
} from '@/types'
import { getTokenExpiry } from '@/utils/jwt'

interface LoginOptions {
  /** Persist the session across browser restarts. Defaults to false (tab-only). */
  remember?: boolean
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  /** True while the stored session is being restored on first load. */
  loading: boolean
  login: (payload: LoginPayload, options?: LoginOptions) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<void>
  /** `credential` is the ID token Google Identity Services hands back on success. */
  loginWithGoogle: (credential: string, options?: LoginOptions) => Promise<AuthUser>
  logout: () => void
  /** Foundation for role-based access: `hasRole('ADMIN', 'ANALYST')`. */
  hasRole: (...roles: UserRole[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** setTimeout cannot exceed a signed 32-bit integer of milliseconds. */
const MAX_TIMEOUT_MS = 2_147_483_647

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const endSession = useCallback(
    (reason?: AuthLocationState['reason']) => {
      tokenStorage.clear()
      setSession(null)
      const state: AuthLocationState | undefined = reason ? { reason } : undefined
      navigate('/login', { replace: true, state })
    },
    [navigate],
  )

  // Restore a previous session once on startup.
  useEffect(() => {
    setSession(tokenStorage.load())
    setLoading(false)
  }, [])

  // The API rejected our token (expired/revoked): drop the session.
  useEffect(() => {
    setUnauthorizedHandler(() => endSession('expired'))
    return () => setUnauthorizedHandler(null)
  }, [endSession])

  // Sign out automatically when the token's own expiry passes.
  useEffect(() => {
    if (!session) return
    const expiry = getTokenExpiry(session.token)
    if (expiry === null) return

    const timer = window.setTimeout(
      () => endSession('expired'),
      Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMEOUT_MS),
    )
    return () => window.clearTimeout(timer)
  }, [session, endSession])

  const applySession = useCallback((next: AuthSession, remember: boolean): AuthUser => {
    tokenStorage.save(next, remember)
    setSession(next)
    return next.user
  }, [])

  const login = useCallback<AuthContextValue['login']>(
    async (payload, options) => applySession(await authService.login(payload), options?.remember ?? false),
    [applySession],
  )

  const register = useCallback<AuthContextValue['register']>(
    (payload) => authService.register(payload),
    [],
  )

  const loginWithGoogle = useCallback<AuthContextValue['loginWithGoogle']>(
    async (credential, options) =>
      applySession(await authService.loginWithGoogle(credential), options?.remember ?? false),
    [applySession],
  )

  const logout = useCallback(() => endSession(), [endSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      hasRole: (...roles) => (session ? roles.includes(session.user.role) : false),
    }),
    [session, loading, login, register, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
