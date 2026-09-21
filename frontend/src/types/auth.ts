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
