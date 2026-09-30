import type { FarmProfile, ProfileService } from '@/types'
import { api } from './api'
import { toAuthError } from './errors'
import { isMockAuthEnabled } from './authService'
import { mockProfileService } from './mockAuthService'

/** Real HTTP calls for the farm profile shown on the dashboard. */
const httpProfileService: ProfileService = {
  async getProfile() {
    try {
      const { data } = await api.get<FarmProfile>('/users/me')
      return data
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },

  async updateProfile(input) {
    try {
      const { data } = await api.patch<FarmProfile>('/users/me', input)
      return data
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },
}

/** Same demo-mode switch as authService — see its comment for why. */
export const profileService: ProfileService = isMockAuthEnabled ? mockProfileService : httpProfileService
