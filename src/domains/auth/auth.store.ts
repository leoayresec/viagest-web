import { create } from 'zustand'
import type { User, StoredUser } from '../../core/types/auth'

const STORAGE_KEY = 'viagest_users'
const SESSION_KEY = 'viagest_session'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  login: (login: string, password: string) => boolean
  register: (login: string, password: string, name: string, profile: 'admin' | 'apontador') => string | null
  updateUser: (currentLogin: string, data: { login?: string; name?: string; profile?: 'admin' | 'apontador'; password?: string }) => string | null
  deactivateUser: (login: string) => string | null
  reactivateUser: (login: string) => string | null
  deleteUser: (login: string) => string | null
  listUsers: () => StoredUser[]
  logout: () => void
  clearError: () => void
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const defaultUser: StoredUser = { login: 'admin', password: '1234', name: 'ADMIN', profile: 'admin', active: true }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultUser]))
      return [defaultUser]
    }
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export const useAuthStore = create<AuthState>((set, get) => {
  getUsers()

  const saved = sessionStorage.getItem(SESSION_KEY)
  const initialUser: User | null = saved ? JSON.parse(saved) : null

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    error: null,

    login: (login, password) => {
      const users = getUsers()
      const found = users.find((u) => u.login === login && u.password === password && u.active)

      if (!found) {
        set({ error: 'Usuário ou senha inválidos.' })
        return false
      }

      const user: User = { login: found.login, name: found.name, profile: found.profile }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      set({ user, isAuthenticated: true, error: null })
      return true
    },

    register: (login, password, name, profile) => {
      const users = getUsers()
      if (!login.trim() || !password.trim() || !name.trim()) return 'Preencha todos os campos.'
      if (users.some((u) => u.login === login)) return 'Este usuário já existe.'
      if (password.length < 4) return 'A senha deve ter no mínimo 4 caracteres.'

      users.push({ login: login.trim(), password, name: name.trim(), profile, active: true })
      saveUsers(users)
      return null
    },

    updateUser: (currentLogin, data) => {
      const users = getUsers()
      const idx = users.findIndex((u) => u.login === currentLogin)
      if (idx === -1) return 'Usuário não encontrado.'

      const newLogin = data.login ?? users[idx].login
      if (newLogin !== currentLogin && users.some((u) => u.login === newLogin)) return 'Este login já está em uso.'
      if (data.password && data.password.length < 4) return 'A senha deve ter no mínimo 4 caracteres.'

      users[idx] = { ...users[idx], login: newLogin, name: data.name ?? users[idx].name, profile: data.profile ?? users[idx].profile, password: data.password ?? users[idx].password }
      saveUsers(users)

      const currentUser = get().user
      if (currentUser && currentUser.login === currentLogin) {
        const updated: User = { login: newLogin, name: users[idx].name, profile: users[idx].profile }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
        set({ user: updated })
      }
      return null
    },

    deactivateUser: (login) => {
      const currentUser = get().user
      if (currentUser && currentUser.login === login) return 'Você não pode desativar o próprio usuário logado.'
      const users = getUsers()
      const idx = users.findIndex((u) => u.login === login)
      if (idx === -1) return 'Usuário não encontrado.'
      users[idx].active = false
      saveUsers(users)
      return null
    },

    reactivateUser: (login) => {
      const users = getUsers()
      const idx = users.findIndex((u) => u.login === login)
      if (idx === -1) return 'Usuário não encontrado.'
      users[idx].active = true
      saveUsers(users)
      return null
    },

    deleteUser: (login) => {
      const currentUser = get().user
      if (currentUser && currentUser.login === login) return 'Você não pode excluir o próprio usuário logado.'
      const users = getUsers()
      const idx = users.findIndex((u) => u.login === login)
      if (idx === -1) return 'Usuário não encontrado.'

      const target = users[idx]
      if (target.profile === 'admin' && target.active) {
        const activeAdmins = users.filter((u) => u.profile === 'admin' && u.active)
        if (activeAdmins.length <= 1) return 'Não é possível excluir o último administrador ativo.'
      }

      users.splice(idx, 1)
      saveUsers(users)
      return null
    },

    listUsers: () => getUsers(),

    logout: () => {
      sessionStorage.removeItem(SESSION_KEY)
      set({ user: null, isAuthenticated: false, error: null })
    },

    clearError: () => set({ error: null }),
  }
})
