import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardShell } from '@/components/layout'
import CarbonCalculator from '@/pages/CarbonCalculator'
import Dashboard from '@/pages/Dashboard'
import FarmProfile from '@/pages/FarmProfile'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ResourceTracking from '@/pages/ResourceTracking'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<ResourceTracking />} />
          <Route path="/carbon" element={<CarbonCalculator />} />
          <Route path="/profile" element={<FarmProfile />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
