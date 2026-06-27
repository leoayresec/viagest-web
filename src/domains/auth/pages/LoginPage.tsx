import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../auth.store'

export function LoginPage() {
  const { login, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({ login: '', password: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    const ok = login(form.login, form.password)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">ViaGest</h1>
          <p className="text-zinc-500 mt-1">Sistema de Gestão de Obras Viárias</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 text-center">Acessar Sistema</h2>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Usuário</label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              placeholder="Digite seu usuário"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Digite sua senha"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Contas de teste:</p>
          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <p><span className="font-mono font-semibold">admin</span> / <span className="font-mono font-semibold">1234</span> <span className="text-purple-600 dark:text-purple-400">(Administrador)</span></p>
            <p><span className="font-mono font-semibold">apontador</span> / <span className="font-mono font-semibold">1234</span> <span className="text-zinc-500 dark:text-zinc-400">(Apontador)</span></p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">admin / 1234</p>
      </div>
    </div>
  )
}
