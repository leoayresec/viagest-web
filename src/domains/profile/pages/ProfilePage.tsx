import { useState, useEffect } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import type { StoredUser } from '../../../core/types/auth'
import { Save, User } from 'lucide-react'

const USERS_KEY = 'viagest_users'
const SESSION_KEY = 'viagest_session'

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

function saveUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

export function ProfilePage() {
  const { user: currentUser, login } = useAuthStore()

  const [form, setForm] = useState({ login: '', nome: '', password: '', confirmPassword: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (currentUser) {
      const users = getUsers()
      const u = users.find((x) => x.login === currentUser.login)
      setForm({ login: u?.login || currentUser.login, nome: u?.name || currentUser.name, password: '', confirmPassword: '' })
    }
  }, [currentUser])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)

    if (!form.login.trim() || !form.nome.trim()) { alert('Preencha login e nome.'); return }
    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) { alert('As senhas não conferem.'); return }
      if (form.password.length < 4) { alert('A senha deve ter no mínimo 4 caracteres.'); return }
    }

    const users = getUsers()
    const idx = users.findIndex((u) => currentUser && u.login === currentUser.login)
    if (idx === -1) { alert('Usuário não encontrado.'); return }

    const newLogin = form.login.trim()
    if (newLogin !== currentUser?.login && users.some((u) => u.login === newLogin)) { alert('Este login já está em uso.'); return }

    users[idx].login = newLogin
    users[idx].name = form.nome.trim().toUpperCase()
    if (form.password) users[idx].password = form.password

    saveUsers(users)

    const sessionUser = { login: newLogin, name: users[idx].name, profile: users[idx].profile }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))

    setSaved(true)
    login(newLogin, form.password || users[idx].password || '')
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Meu perfil</h1>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Save className="w-4 h-4" /> Perfil atualizado com sucesso.
        </div>
      )}

      <div className="max-w-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Login / Usuário</label>
            <input type="text" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-600">Preencha a senha somente se quiser trocar.</p>

          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nova senha</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Deixe em branco para manter"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Confirmar nova senha</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirme a nova senha"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>

          <button type="submit"
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors flex items-center gap-1">
            <Save className="w-4 h-4" /> Salvar meu perfil
          </button>
        </form>
      </div>
    </div>
  )
}
