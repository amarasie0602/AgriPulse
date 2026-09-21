import axios, { AxiosError } from 'axios'
import { tokenStorage } from './tokenStorage'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL && import.meta.env.DEV) {
  console.warn('VITE_API_URL is not set. Copy .env.example to .env and restart the dev server.')
}

/** Endpoints where a 401 means "bad credentials", not "session expired". */
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register']

let unauthorizedHandler: (() => void) | null = null

/** Lets the auth layer react to expired/invalid tokens without api.ts importing React. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((path) => error.config?.url?.endsWith(path))
    if (error.response?.status === 401 && !isPublicAuthCall) unauthorizedHandler?.()
    return Promise.reject(error)
  },
)
