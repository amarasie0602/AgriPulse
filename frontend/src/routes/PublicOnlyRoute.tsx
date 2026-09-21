import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/hooks/useAuth'
import type { AuthLocationState } from '@/types'

/** Keeps signed-in users away from /login and /register. */
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />

  if (isAuthenticated) {
    const { from } = (location.state ?? {}) as AuthLocationState
    return <Navigate to={from ?? '/dashboard'} replace />
  }

  return <Outlet />
}
