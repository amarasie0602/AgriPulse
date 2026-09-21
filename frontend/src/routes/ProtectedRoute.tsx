import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/hooks/useAuth'
import type { AuthLocationState, UserRole } from '@/types'

interface ProtectedRouteProps {
  /**
   * Restrict the route to specific roles, e.g. `<ProtectedRoute allowedRoles={['ADMIN']} />`.
   * Omit to allow any signed-in user.
   */
  allowedRoles?: UserRole[]
}

/** Layout route: renders nested routes only for authenticated users. */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader />

  if (!isAuthenticated) {
    const state: AuthLocationState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
