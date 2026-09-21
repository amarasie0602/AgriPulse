import type { AuthSession, LoginPayload, LoginResponse, RegisterPayload } from '@/types'
import { api } from './api'
import { AuthError, toAuthError } from './errors'

/** All authentication HTTP calls live here so UI components never touch Axios. */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      })

      if (!data?.access_token || !data.user) {
        throw new AuthError('Unexpected response from AgriPulse. Please try again.')
      }
      return { token: data.access_token, user: data.user }
    } catch (error) {
      throw toAuthError(error, 'login')
    }
  },

  async register(payload: RegisterPayload): Promise<void> {
    try {
      const farmName = payload.farmName?.trim()
      await api.post('/auth/register', {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        ...(farmName ? { farmName } : {}),
      })
    } catch (error) {
      throw toAuthError(error, 'register')
    }
  },
}
