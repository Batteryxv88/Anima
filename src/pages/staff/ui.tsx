import { useTranslation } from 'react-i18next'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { isStaffRole, useUserStore } from '@/entities/user'

export function StaffLayout() {
  const { t } = useTranslation()
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  const location = useLocation()
  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          to="/staff/techniques"
          className={`text-sm ${location.pathname.includes('/techniques') ? 'text-sage-deep' : 'text-muted'}`}
        >
          {t('staff.catalogTitle')}
        </Link>
        {role === 'superadmin' ? (
          <Link
            to="/staff/roles"
            className={`text-sm ${location.pathname.includes('/roles') ? 'text-sage-deep' : 'text-muted'}`}
          >
            {t('staff.rolesTitle')}
          </Link>
        ) : null}
      </div>
      <Outlet />
    </>
  )
}

export function StaffHome() {
  const role = useUserStore((state) => state.role)
  if (role === 'superadmin') return <Navigate to="/staff/roles" replace />
  return <Navigate to="/staff/techniques" replace />
}
