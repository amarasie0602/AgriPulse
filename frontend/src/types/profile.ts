import type { UserRole } from './auth'

/** How the account authenticates. A Google-only account has no password to sign in with directly. */
export type AuthProvider = 'local' | 'google' | 'both'

/** The farm profile shown on and edited from the dashboard. */
export interface FarmProfile {
  id: string | number
  name: string
  email: string
  role: UserRole
  farmName?: string
  location?: string
  farmSizeHectares?: number
  cropTypes: string[]
  authProvider: AuthProvider
  createdAt: string
}

/** All fields optional: a partial update, not a full replace. */
export interface UpdateProfileInput {
  farmName?: string
  location?: string
  farmSizeHectares?: number
  cropTypes?: string[]
}

export interface ProfileService {
  getProfile(): Promise<FarmProfile>
  updateProfile(input: UpdateProfileInput): Promise<FarmProfile>
}
