import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../domains/auth/auth.store'

interface RoleRouteProps {
  requiredPermissions: string[]
}

export function RoleRoute({ requiredPermissions }: RoleRouteProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const allowed = requiredPermissions.every((p) => hasPermission(p))

  if (!allowed) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
