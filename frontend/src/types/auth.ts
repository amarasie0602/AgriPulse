/** Roles supported by the platform. Role-specific areas are built on top of this later. */
export type UserRole = 'FARMER' | 'ADMIN' | 'ANALYST'

export interface AuthUser {
  id: number | string
  name: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  /** Optional. Only sent when the user fills it in. */
  farmName?: string
}

/** Shape returned by POST /auth/login. */
export interface LoginResponse {
  access_token: string
  user: AuthUser
}

/** What the frontend keeps for a signed-in user. */
export interface AuthSession {
  token: string
  user: AuthUser
}

/** Contract shared by the real HTTP service and the offline demo service. */
export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>
  register(payload: RegisterPayload): Promise<void>
  /** `credential` is the ID token Google Identity Services hands back on success. */
  loginWithGoogle(credential: string): Promise<AuthSession>
}
