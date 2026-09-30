import type { Role } from '../auth/user.model';

/** How this account authenticates. A Google-only account has no password to sign in with directly. */
export type AuthProvider = 'local' | 'google' | 'both';

/** The farm profile shown on and edited from the dashboard. Never includes the password hash. */
export interface FarmProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  farmName?: string;
  location?: string;
  farmSizeHectares?: number;
  cropTypes: string[];
  authProvider: AuthProvider;
  createdAt: string;
}
