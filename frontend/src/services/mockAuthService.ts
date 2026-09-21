import type { AuthService, AuthSession, AuthUser, LoginPayload, RegisterPayload } from '@/types'
import { AuthError } from './errors'

/**
 * Offline stand-in for the NestJS auth endpoints, used only in development
 * (see VITE_USE_MOCK_AUTH). Accounts live in this browser's localStorage and
 * are never sent anywhere. It mirrors the real API's behaviour and messages
 * so the UI flow is identical.
 */

const USERS_KEY = 'agripulse.mock.users'
const LATENCY_MS = 450
const TOKEN_LIFETIME_S = 60 * 60 * 24

export const DEMO_CREDENTIALS = { email: 'demo@agripulse.dev', password: 'password123' } as const

interface StoredUser extends AuthUser {
  passwordHash: string
  farmName?: string
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
    passwordHash: await hash(DEMO_CREDENTIALS.password),
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

    if (!found || found.passwordHash !== (await hash(password))) {
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
      id: Math.max(0, ...users.map((user) => Number(user.id))) + 1,
      name: name.trim(),
      email: normalized,
      role: 'FARMER',
      farmName: farmName?.trim() || undefined,
      passwordHash: await hash(password),
    })
    writeUsers(users)
  },
}
