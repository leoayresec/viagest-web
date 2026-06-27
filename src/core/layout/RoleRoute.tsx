import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../domains/auth/auth.store'

interface RoleRouteProps {
  allowedProfiles: Array<'admin' | 'apontador'>
}

export function RoleRoute({ allowedProfiles }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user)

  if (!user || !allowedProfiles.includes(user.profile)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
