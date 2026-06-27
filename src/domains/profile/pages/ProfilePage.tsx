import { useAuthStore } from '../../auth/auth.store'
import { User } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Meu perfil</h1>
      </div>

      <div className="max-w-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Login</label>
          <p className="text-zinc-900 dark:text-zinc-100">{user?.login}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome</label>
          <p className="text-zinc-900 dark:text-zinc-100">{user?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Perfil</label>
          <p className="text-zinc-900 dark:text-zinc-100 capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  )
}
