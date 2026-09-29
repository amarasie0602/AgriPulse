import type { Role } from './user.model';

/** Shape returned to the frontend. Never includes the password hash. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResult {
  access_token: string;
  user: PublicUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
