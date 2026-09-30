import type { AuthService, LoginResponse } from '@/types'
import { api } from './api'
import { AuthError, toAuthError } from './errors'
import { mockAuthService } from './mockAuthService'

/** All authentication HTTP calls live here so UI components never touch Axios. */
const httpAuthService: AuthService = {
  async login(payload) {
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

  async register(payload) {
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

  async loginWithGoogle(credential) {
    try {
      const { data } = await api.post<LoginResponse>('/auth/google', { credential })

      if (!data?.access_token || !data.user) {
        throw new AuthError('Unexpected response from AgriPulse. Please try again.')
      }
      return { token: data.access_token, user: data.user }
    } catch (error) {
      throw toAuthError(error, 'google')
    }
  },
}

/**
 * Demo mode lets the login flow run without a backend. It is honoured only in
 * the dev server (`import.meta.env.DEV`), so a production build always uses the real API.
 */
export const isMockAuthEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true'

export const authService: AuthService = isMockAuthEnabled ? mockAuthService : httpAuthService
