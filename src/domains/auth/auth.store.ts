import { create } from 'zustand'
import type { User } from '../../core/types/auth'
import { api, setAuthToken } from '../../core/api/client'

const SESSION_KEY = 'viagest_session'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  login: (login: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const saved = sessionStorage.getItem(SESSION_KEY)
  const initialUser: User | null = saved ? JSON.parse(saved) : null
  if (initialUser) {
    const savedToken = sessionStorage.getItem('viagest_token')
    if (savedToken) setAuthToken(savedToken)
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    error: null,

    login: async (login, password) => {
      try {
        set({ error: null })
        const res = await api.post<{ token: string; user: User }>('/auth/login', { login, password })

        setAuthToken(res.token)
        sessionStorage.setItem('viagest_token', res.token)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.user))
        set({ user: res.user, isAuthenticated: true, error: null })
        return true
      } catch (err: any) {
        set({ error: err.message || 'Usuário ou senha inválidos.' })
        return false
      }
    },

    logout: () => {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem('viagest_token')
      setAuthToken(null)
      set({ user: null, isAuthenticated: false, error: null })
    },

    clearError: () => set({ error: null }),
  }
})
