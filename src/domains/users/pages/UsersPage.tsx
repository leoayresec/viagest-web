import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { api } from '../../../core/api/client'
import { UserPlus, Edit3, Trash2, AlertTriangle, CheckCircle2, XCircle, Shield, User } from 'lucide-react'

interface ApiUser {
  id: string
  login: string
  name: string
  role: string
  active: boolean
  createdAt: string
}

interface ApiRole {
  id: string
  name: string
  description: string | null
}

export function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [loading, setLoading] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newForm, setNewForm] = useState({ login: '', nome: '', password: '123456', roleName: 'apontador' })
  const [selectedId, setSelectedId] = useState('')
  const [editForm, setEditForm] = useState({ login: '', nome: '', roleName: 'apontador', password: '', confirmPassword: '' })
  const [confirmDelete, setConfirmDelete] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedUser = users.find((u) => u.id === selectedId)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<ApiUser[]>('/users')
      setUsers(data)
    } catch {
      setErrorMsg('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRoles = useCallback(async () => {
    try {
      const data = await api.get<ApiRole[]>('/users/roles')
      setRoles(data)
    } catch {
      // fallback to default roles
      setRoles([
        { id: '1', name: 'admin', description: 'Administrador' },
        { id: '2', name: 'apontador', description: 'Apontador' },
      ])
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { loadRoles() }, [loadRoles])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    if (!newForm.login.trim() || !newForm.nome.trim()) { setErrorMsg('Preencha todos os campos.'); return }
    if (newForm.password.length < 4) { setErrorMsg('A senha deve ter no mínimo 4 caracteres.'); return }

    try {
      await api.post('/users', {
        login: newForm.login.trim(),
        password: newForm.password,
        name: newForm.nome.trim().toUpperCase(),
        roleName: newForm.roleName,
      })
      await loadUsers()
      setSuccessMsg('Usuário criado com sucesso.')
      setNewForm({ login: '', nome: '', password: '123456', roleName: 'apontador' })
      setShowCreate(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar usuário.')
    }
  }

  function handleSelectUser(user: ApiUser) {
    setSelectedId(user.id)
    setConfirmDelete('')
    setSuccessMsg(null)
    setErrorMsg(null)
    setEditForm({ login: user.login, nome: user.name, roleName: user.role, password: '', confirmPassword: '' })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    if (!editForm.login.trim() || !editForm.nome.trim()) { setErrorMsg('Preencha login e nome.'); return }

    if (editForm.password || editForm.confirmPassword) {
      if (editForm.password !== editForm.confirmPassword) { setErrorMsg('As senhas não conferem.'); return }
      if (editForm.password.length < 4) { setErrorMsg('A senha deve ter no mínimo 4 caracteres.'); return }
    }

    try {
      const body: Record<string, string> = {
        login: editForm.login.trim(),
        name: editForm.nome.trim().toUpperCase(),
        roleName: editForm.roleName,
      }
      if (editForm.password) body.password = editForm.password

      await api.put(`/users/${selectedId}`, body)
      await loadUsers()
      setSuccessMsg('Usuário atualizado com sucesso.')
      setSelectedId('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar usuário.')
    }
  }

  async function handleDeactivate() {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await api.put(`/users/${selectedId}/deactivate`, {})
      await loadUsers()
      setSuccessMsg('Acesso desativado.')
      setSelectedId('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao desativar.')
    }
  }

  async function handleReactivate() {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await api.put(`/users/${selectedId}/reactivate`, {})
      await loadUsers()
      setSuccessMsg('Acesso reativado.')
      setSelectedId('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao reativar.')
    }
  }

  async function handleDelete() {
    setSuccessMsg(null)
    setErrorMsg(null)
    if (confirmDelete.trim() !== selectedUser?.login) { setErrorMsg(`Digite "${selectedUser?.login}" para confirmar.`); return }

    try {
      await api.delete(`/users/${selectedId}`)
      await loadUsers()
      setSuccessMsg('Usuário excluído.')
      setSelectedId('')
      setConfirmDelete('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir.')
    }
  }

  function getRoleLabel(name: string) {
    const role = roles.find((r) => r.name === name)
    return role?.description || name
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Usuários</h1>
      </div>

      <p className="text-zinc-500 text-sm">Gerencie usuários do sistema.</p>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 group" open={showCreate} onToggle={(e) => setShowCreate(e.currentTarget.open)}>
        <summary className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer select-none flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Criar novo usuário
        </summary>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Usuário</label>
              <input type="text" value={newForm.login} onChange={(e) => setNewForm({ ...newForm, login: e.target.value })} placeholder="Usuário novo"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome</label>
              <input type="text" value={newForm.nome} onChange={(e) => setNewForm({ ...newForm, nome: e.target.value })} placeholder="Nome completo"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Senha inicial</label>
              <input type="text" value={newForm.password} onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Perfil</label>
              <select value={newForm.roleName} onChange={(e) => setNewForm({ ...newForm, roleName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{getRoleLabel(r.name)}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Criar usuário</button>
        </form>
      </details>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Usuários cadastrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                <th className="p-3 font-medium">Usuário</th>
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Perfil</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-zinc-500">Carregando...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  <td className="p-3">{u.login}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                      {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.active ? 'Ativo' : 'Desativado'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleSelectUser(u)}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-sm transition-colors flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Editar usuário: {selectedUser.login}</h2>

          <p className="text-sm text-zinc-500">
            Status:{' '}
            <span className={selectedUser.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {selectedUser.active ? 'Ativo' : 'Desativado'}
            </span>
          </p>

          <div className="flex gap-2">
            {selectedUser.active ? (
              <button onClick={handleDeactivate} disabled={currentUser?.id === selectedId}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Desativar acesso
              </button>
            ) : (
              <button onClick={handleReactivate}
                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Reativar acesso
              </button>
            )}
          </div>

          <form onSubmit={handleEdit} className="space-y-3 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Login</label>
              <input type="text" value={editForm.login} onChange={(e) => setEditForm({ ...editForm, login: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome</label>
              <input type="text" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Perfil</label>
              <select value={editForm.roleName} onChange={(e) => setEditForm({ ...editForm, roleName: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{getRoleLabel(r.name)}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">Preencha a senha somente se quiser trocar.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nova senha</label>
                <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" placeholder="Nova senha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Confirmar senha</label>
                <input type="password" value={editForm.confirmPassword} onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" placeholder="Confirmar nova senha" />
              </div>
            </div>
            <button type="submit"
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors flex items-center gap-1">
              <Edit3 className="w-4 h-4" /> Salvar alterações
            </button>
          </form>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <details className="group">
              <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:text-red-500 dark:hover:text-red-300 transition-colors select-none flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Zona de perigo: excluir usuário
              </summary>
              <div className="mt-3 space-y-3 max-w-lg">
                <p className="text-sm text-zinc-500">Exclui o login. Lançamentos antigos permanecem no histórico.</p>
                <input type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder={`Digite: ${selectedUser.login}`}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-900 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button onClick={handleDelete} disabled={currentUser?.id === selectedId}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Excluir usuário
                </button>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
