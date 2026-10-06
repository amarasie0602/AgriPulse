import type {
  CreateFarmInput,
  CreateFieldInput,
  Farm,
  FarmService,
  UpdateFarmInput,
  UpdateFieldInput,
} from '@/types'
import { api } from './api'
import { toAuthError } from './errors'
import { isMockAuthEnabled } from './authService'
import { mockFarmService } from './mockFarmService'

const httpFarmService: FarmService = {
  async list() {
    try {
      const { data } = await api.get<Farm[]>('/farms')
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async create(input) {
    try {
      const { data } = await api.post<Farm>('/farms', input)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get<Farm>(`/farms/${id}`)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async update(id, input) {
    try {
      const { data } = await api.patch<Farm>(`/farms/${id}`, input)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async remove(id) {
    try {
      await api.delete(`/farms/${id}`)
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async addField(farmId, input) {
    try {
      const { data } = await api.post<Farm>(`/farms/${farmId}/fields`, input)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async updateField(farmId, fieldId, input) {
    try {
      const { data } = await api.patch<Farm>(`/farms/${farmId}/fields/${fieldId}`, input)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },

  async removeField(farmId, fieldId) {
    try {
      const { data } = await api.delete<Farm>(`/farms/${farmId}/fields/${fieldId}`)
      return data
    } catch (error) {
      throw toAuthError(error, 'farms')
    }
  },
}

export const farmService: FarmService = isMockAuthEnabled ? mockFarmService : httpFarmService
