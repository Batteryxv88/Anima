import { Navigate, Outlet } from 'react-router-dom'
import { isStaffRole, useUserStore } from '@/entities/user'

export function StaffLayout() {
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />
  return <Outlet />
}

export function StaffHome() {
  const role = useUserStore((state) => state.role)
  if (role === 'superadmin') return <Navigate to="/staff/roles" replace />
  return <Navigate to="/profile" replace />
}
