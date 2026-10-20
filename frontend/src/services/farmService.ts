import { isAxiosError } from 'axios'
import { api } from './api'
import { isMockAuthEnabled } from './authService'
import type { Farm, FarmInput } from '@/types/farm'

export class FarmRequestError extends Error {
  constructor(message: string, readonly fields: Record<string, string> = {}) {
    super(message)
  }
}

async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
  if (isMockAuthEnabled) {
    throw new FarmRequestError('Farm Management requires a backend session. Turn off demo authentication and sign in to store farm records in MongoDB.')
  }
  try {
    return (await operation()).data
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status
      if (status === 400) {
        const issues = error.response?.data?.errors
        const fields: Record<string, string> = {}
        if (Array.isArray(issues)) for (const issue of issues) {
          if (typeof issue.field === 'string' && typeof issue.message === 'string') fields[issue.field] = issue.message
        }
        throw new FarmRequestError('Please check the farm details and try again.', fields)
      }
      if (status === 404) throw new FarmRequestError('This farm is no longer available. Refresh the farm list.')
      if (status === 401) throw new FarmRequestError('Your session has expired. Please sign in again.')
      if (status === 403) throw new FarmRequestError('You do not have access to this farm.')
      if (!error.response) throw new FarmRequestError('Unable to connect. Check your connection and try again.')
    }
    throw new FarmRequestError('Could not complete the farm request. Please try again.')
  }
}
export const farmService = {
  list: (signal?: AbortSignal) => request(() => api.get<Farm[]>('/farms', { signal })),
  get: (id: string) => request(() => api.get<Farm>(`/farms/${id}`)),
  create: (input: FarmInput) => request(() => api.post<Farm>('/farms', input)),
  update: (id: string, input: Partial<FarmInput>) => request(() => api.patch<Farm>(`/farms/${id}`, input)),
  remove: (id: string) => request(() => api.delete<void>(`/farms/${id}`)),
}
