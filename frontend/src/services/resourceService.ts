import type { ResourceEntry, ResourceService, ResourceSummary } from '@/types'
import { api } from './api'
import { toAuthError } from './errors'
import { isMockAuthEnabled } from './authService'
import { mockResourceService } from './mockResourceService'

/** Real HTTP calls for the resource tracking log. */
const httpResourceService: ResourceService = {
  async list() {
    try {
      const { data } = await api.get<ResourceEntry[]>('/resources')
      return data
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },

  async create(input) {
    try {
      const { data } = await api.post<ResourceEntry>('/resources', input)
      return data
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },

  async remove(id) {
    try {
      await api.delete(`/resources/${id}`)
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },

  async summary() {
    try {
      const { data } = await api.get<ResourceSummary>('/resources/summary')
      return data
    } catch (error) {
      throw toAuthError(error, 'profile')
    }
  },
}

/** Same demo-mode switch as authService — see its comment for why. */
export const resourceService: ResourceService = isMockAuthEnabled ? mockResourceService : httpResourceService
