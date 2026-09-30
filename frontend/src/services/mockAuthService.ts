import type {
  AuthService,
  AuthSession,
  AuthUser,
  FarmProfile,
  LoginPayload,
  ProfileService,
  RegisterPayload,
  UpdateProfileInput,
} from '@/types'
import { decodeJwtPayload } from '@/utils/jwt'
import { AuthError } from './errors'
import { tokenStorage } from './tokenStorage'

/**
 * Offline stand-in for the Express auth endpoints, used only in development
 * (see VITE_USE_MOCK_AUTH). Accounts live in this browser's localStorage and
 * are never sent anywhere. It mirrors the real API's behaviour and messages
 * so the UI flow is identical.
 */

const USERS_KEY = 'agripulse.mock.users'
const LATENCY_MS = 450
const TOKEN_LIFETIME_S = 60 * 60 * 24

export const DEMO_CREDENTIALS = { email: 'demo@agripulse.dev', password: 'password123' } as const

interface StoredUser extends AuthUser {
  /** Absent for accounts created via the (mock) Google sign-in below. */
  passwordHash?: string
  farmName?: string
  location?: string
  farmSizeHectares?: number
  cropTypes?: string[]
  createdAt?: string
}

/** Fields this mock reads out of the ID token Google Identity Services returns. Not verified. */
interface GoogleCredentialPayload {
  email?: string
  email_verified?: boolean
  name?: string
  sub?: string
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

async function hash(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw) as StoredUser[]
  } catch {
    // Fall through to a fresh store.
  }
  return []
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function nextId(users: StoredUser[]): number {
  return Math.max(0, ...users.map((user) => Number(user.id))) + 1
}

/** Ensures the demo account exists so there is always something to sign in with. */
async function seedDemoUser(): Promise<StoredUser[]> {
  const users = readUsers()
  if (users.some((user) => user.email === DEMO_CREDENTIALS.email)) return users

  users.push({
    id: 1,
    name: 'Demo Farmer',
    email: DEMO_CREDENTIALS.email,
    role: 'FARMER',
    farmName: 'Demo Farm',
    location: 'Kandy, Sri Lanka',
    farmSizeHectares: 8.5,
    cropTypes: ['Rice', 'Tea'],
    passwordHash: await hash(DEMO_CREDENTIALS.password),
    createdAt: new Date().toISOString(),
  })
  writeUsers(users)
  return users
}

const base64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/** Unsigned token shaped like a JWT, so expiry handling behaves as with the real API. */
function createToken(user: AuthUser): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_S
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ sub: user.id, exp })}.demo`
}

export const mockAuthService: AuthService = {
  async login({ email, password }: LoginPayload): Promise<AuthSession> {
    await wait()
    const users = await seedDemoUser()
    const found = users.find((user) => user.email === email.trim().toLowerCase())

    if (!found?.passwordHash || found.passwordHash !== (await hash(password))) {
      throw new AuthError('Incorrect email or password.', 401)
    }

    const user: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role }
    return { token: createToken(user), user }
  },

  async register({ name, email, password, farmName }: RegisterPayload): Promise<void> {
    await wait()
    const users = await seedDemoUser()
    const normalized = email.trim().toLowerCase()

    if (users.some((user) => user.email === normalized)) {
      throw new AuthError('An account with this email already exists.', 409)
    }

    users.push({
      id: nextId(users),
      name: name.trim(),
      email: normalized,
      role: 'FARMER',
      farmName: farmName?.trim() || undefined,
      passwordHash: await hash(password),
      createdAt: new Date().toISOString(),
    })
    writeUsers(users)
  },

  /**
   * Reads the Google ID token's payload directly in the browser (no
   * signature check — there's no backend here to verify it against Google).
   * This is fine for a local demo: nothing more sensitive than a placeholder
   * dashboard is guarded by it, and real deployments always go through
   * authService's HTTP path, which verifies the token server-side.
   */
  async loginWithGoogle(credential: string): Promise<AuthSession> {
    await wait()
    const payload = decodeJwtPayload<GoogleCredentialPayload>(credential)

    if (!payload?.email) {
      throw new AuthError('Google sign-in failed. Please try again.', 401)
    }
    if (!payload.email_verified) {
      throw new AuthError('Please verify your email with Google before continuing.', 403)
    }

    const email = payload.email.toLowerCase()
    const users = await seedDemoUser()
    let found = users.find((user) => user.email === email)

    if (!found) {
      found = {
        id: nextId(users),
        name: payload.name?.trim() || email.split('@')[0],
        email,
        role: 'FARMER',
        createdAt: new Date().toISOString(),
      }
      users.push(found)
      writeUsers(users)
    }

    const user: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role }
    return { token: createToken(user), user }
  },
}

function toFarmProfile(user: StoredUser): FarmProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    farmName: user.farmName,
    location: user.location,
    farmSizeHectares: user.farmSizeHectares,
    cropTypes: user.cropTypes ?? [],
    authProvider: user.passwordHash ? 'local' : 'google',
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
}

/** Same tokenless-checks-aside pattern as mockAuthService: no backend, storage only. */
export const mockProfileService: ProfileService = {
  async getProfile(): Promise<FarmProfile> {
    await wait()
    const session = tokenStorage.load()
    if (!session) throw new AuthError('Your session has expired. Please sign in again.', 401)

    const users = readUsers()
    const found = users.find((user) => user.id === session.user.id)
    if (!found) throw new AuthError('Your account could not be found. Please sign in again.', 404)

    return toFarmProfile(found)
  },

  async updateProfile(input: UpdateProfileInput): Promise<FarmProfile> {
    await wait()
    const session = tokenStorage.load()
    if (!session) throw new AuthError('Your session has expired. Please sign in again.', 401)

    const users = readUsers()
    const found = users.find((user) => user.id === session.user.id)
    if (!found) throw new AuthError('Your account could not be found. Please sign in again.', 404)

    if (input.farmName !== undefined) found.farmName = input.farmName
    if (input.location !== undefined) found.location = input.location
    if (input.farmSizeHectares !== undefined) found.farmSizeHectares = input.farmSizeHectares
    if (input.cropTypes !== undefined) found.cropTypes = input.cropTypes

    writeUsers(users)
    return toFarmProfile(found)
  },
}
