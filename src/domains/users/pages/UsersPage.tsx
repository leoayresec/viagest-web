import { useState } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { useRecordsStore } from '../../records/stores/records.store'
import type { StoredUser } from '../../../core/types/auth'
import { UserPlus, Edit3, Trash2, AlertTriangle, CheckCircle2, XCircle, Shield, User } from 'lucide-react'

const USERS_KEY = 'viagest_users'

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

function saveUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

export function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const recordsStore = useRecordsStore()
  const [users, setUsers] = useState<StoredUser[]>(() => {
    const u = getUsers()
    if (u.length === 0) {
      const d: StoredUser = { login: 'admin', password: '123456', name: 'ADMIN', profile: 'admin', active: true }
      saveUsers([d])
      return [d]
    }
    return u
  })

  const [showCreate, setShowCreate] = useState(false)
  const [newForm, setNewForm] = useState({ login: '', nome: '', password: '123456', profile: 'apontador' as 'admin' | 'apontador' })
  const [selectedLogin, setSelectedLogin] = useState('')
  const [editForm, setEditForm] = useState({ login: '', nome: '', profile: 'apontador' as 'admin' | 'apontador', password: '', confirmPassword: '' })
  const [confirmDelete, setConfirmDelete] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const selectedUser = users.find((u) => u.login === selectedLogin)

  function recarregar() { setUsers(getUsers()) }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg(null)
    const lista = getUsers()
    if (!newForm.login.trim() || !newForm.nome.trim()) { alert('Preencha todos os campos.'); return }
    if (lista.some((u) => u.login === newForm.login.trim())) { alert('Este usuário já existe.'); return }
    if (newForm.password.length < 4) { alert('A senha deve ter no mínimo 4 caracteres.'); return }
    lista.push({ login: newForm.login.trim(), password: newForm.password, name: newForm.nome.trim().toUpperCase(), profile: newForm.profile, active: true })
    saveUsers(lista)
    recarregar()
    setSuccessMsg('Usuário criado. Se for apontador, já aparece no combo de apontadores.')
    setNewForm({ login: '', nome: '', password: '123456', profile: 'apontador' })
  }

  function handleSelectUser(login: string) {
    setSelectedLogin(login)
    setConfirmDelete('')
    setSuccessMsg(null)
    const u = getUsers().find((u) => u.login === login)
    if (u) setEditForm({ login: u.login, nome: u.name, profile: u.profile, password: '', confirmPassword: '' })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg(null)
    const lista = getUsers()
    const idx = lista.findIndex((u) => u.login === selectedLogin)
    if (idx === -1) { alert('Usuário não encontrado.'); return }

    const newLogin = editForm.login.trim() || lista[idx].login
    if (newLogin !== selectedLogin && lista.some((u) => u.login === newLogin)) { alert('Este login já está em uso.'); return }

    if (editForm.password || editForm.confirmPassword) {
      if (editForm.password !== editForm.confirmPassword) { alert('As senhas não conferem.'); return }
      if (editForm.password.length < 4) { alert('A senha deve ter no mínimo 4 caracteres.'); return }
    }

    const nomeAntigo = lista[idx].name
    lista[idx].login = newLogin
    lista[idx].name = editForm.nome.trim().toUpperCase() || lista[idx].name
    lista[idx].profile = editForm.profile
    if (editForm.password) lista[idx].password = editForm.password

    if (nomeAntigo !== lista[idx].name) {
      for (const r of recordsStore.records) {
        if (r.apontador === nomeAntigo) {
          recordsStore.update(r.id, { apontador: lista[idx].name })
        }
      }
    }

    saveUsers(lista)
    recarregar()
    if (currentUser && currentUser.login === selectedLogin) {
      const updated = { login: newLogin, name: lista[idx].name, profile: lista[idx].profile }
      sessionStorage.setItem('viagest_session', JSON.stringify(updated))
      window.location.reload()
    }
    setSuccessMsg('Usuário atualizado com sucesso.')
    setSelectedLogin('')
  }

  function handleDeactivate() {
    setSuccessMsg(null)
    const lista = getUsers()
    const idx = lista.findIndex((u) => u.login === selectedLogin)
    if (idx === -1) return
    if (currentUser && currentUser.login === selectedLogin) { alert('Você não pode desativar o próprio usuário logado.'); return }
    lista[idx].active = false
    saveUsers(lista)
    recarregar()
    setSuccessMsg('Acesso desativado. Os lançamentos antigos foram mantidos.')
    setSelectedLogin('')
  }

  function handleReactivate() {
    setSuccessMsg(null)
    const lista = getUsers()
    const idx = lista.findIndex((u) => u.login === selectedLogin)
    if (idx === -1) return
    lista[idx].active = true
    saveUsers(lista)
    recarregar()
    setSuccessMsg('Acesso reativado.')
    setSelectedLogin('')
  }

  function handleDelete() {
    setSuccessMsg(null)
    if (confirmDelete.trim() !== selectedLogin) { alert(`Digite "${selectedLogin}" exatamente para confirmar a exclusão.`); return }
    const lista = getUsers()
    const idx = lista.findIndex((u) => u.login === selectedLogin)
    if (idx === -1) return
    if (currentUser && currentUser.login === selectedLogin) { alert('Você não pode excluir o próprio usuário logado.'); return }
    const target = lista[idx]
    if (target.profile === 'admin' && target.active) {
      const activeAdmins = lista.filter((u) => u.profile === 'admin' && u.active)
      if (activeAdmins.length <= 1) { alert('Não é possível excluir o último administrador ativo.'); return }
    }
    lista.splice(idx, 1)
    saveUsers(lista)
    recarregar()
    setSuccessMsg('Usuário excluído. Os lançamentos antigos foram mantidos no histórico.')
    setSelectedLogin('')
    setConfirmDelete('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Usuários</h1>
      </div>

      <p className="text-zinc-500 text-sm">Gerencie usuários administradores e apontadores.</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-600">Ao alterar o nome de um apontador, o sistema também atualiza os lançamentos antigos dele.</p>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 group" open={showCreate} onToggle={(e) => setShowCreate(e.currentTarget.open)}>
        <summary className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer select-none flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Criar novo apontador/admin
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
              <select value={newForm.profile} onChange={(e) => setNewForm({ ...newForm, profile: e.target.value as 'admin' | 'apontador' })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="apontador">Apontador</option>
                <option value="admin">Administrador</option>
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
              {users.map((u) => (
                <tr key={u.login} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  <td className="p-3">{u.login}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.profile === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {u.profile === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.profile === 'admin' ? 'Administrador' : 'Apontador'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                      {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.active ? 'Ativo' : 'Desativado'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleSelectUser(u.login)}
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Editar usuário: {selectedLogin}</h2>

          <p className="text-sm text-zinc-500">
            Status atual:{' '}
            <span className={selectedUser.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {selectedUser.active ? 'Ativo' : 'Desativado'}
            </span>
          </p>

          <div className="flex gap-2">
            {selectedUser.active ? (
              <button onClick={handleDeactivate} disabled={currentUser?.login === selectedLogin}
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
              <select value={editForm.profile} onChange={(e) => setEditForm({ ...editForm, profile: e.target.value as 'admin' | 'apontador' })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="apontador">Apontador</option>
                <option value="admin">Administrador</option>
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
              <Edit3 className="w-4 h-4" /> Salvar alterações do usuário
            </button>
          </form>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <details className="group">
              <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:text-red-500 dark:hover:text-red-300 transition-colors select-none flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Zona de perigo: excluir usuário
              </summary>
              <div className="mt-3 space-y-3 max-w-lg">
                <p className="text-sm text-zinc-500">Exclui apenas o login do usuário. Os lançamentos já feitos permanecem no histórico. Para afastar alguém sem perder referência, prefira desativar em vez de excluir.</p>
                <input type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder={`Para excluir, digite exatamente: ${selectedLogin}`}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-900 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button onClick={handleDelete} disabled={currentUser?.login === selectedLogin}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Excluir usuário selecionado
                </button>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
