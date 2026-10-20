import { isAxiosError } from 'axios'
import { api } from './api'
import { isMockAuthEnabled } from './authService'
import type { Crop, CropInput } from '@/types/crop'

async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
  if (isMockAuthEnabled) throw new Error('Crop records require a backend session. Sign in with demo authentication disabled.')
  try { return (await operation()).data }
  catch (error) {
    if (isAxiosError(error)) {
      const data = error.response?.data
      if (error.response?.status === 400 && Array.isArray(data?.errors)) {
        throw new Error(data.errors.map((issue: { field: string; message: string }) => `${issue.field}: ${issue.message}`).join(' '))
      }
      if (typeof data?.message === 'string' && (error.response?.status ?? 500) < 500) throw new Error(data.message)
    }
    throw new Error('Unable to complete the crop request. Check your connection and try again.')
  }
}
export const cropService = {
  list: (signal?: AbortSignal) => request(() => api.get<Crop[]>('/crops', { signal })),
  create: (input: CropInput) => request(() => api.post<Crop>('/crops', input)),
  update: (id: string, input: CropInput) => request(() => api.put<Crop>(`/crops/${id}`, input)),
  remove: (id: string) => request(() => api.delete<void>(`/crops/${id}`)),
}
