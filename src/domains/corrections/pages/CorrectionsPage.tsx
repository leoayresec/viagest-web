import { useState } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'

export function CorrectionsPage() {
  const user = useAuthStore((s) => s.user)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { records, update, remove } = useRecordsStore()
  const { listarBairros, listarVias } = useSettingsStore()

  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [bairroFiltro, setBairroFiltro] = useState('')
  const [viaFiltro, setViaFiltro] = useState('')
  const [resultados, setResultados] = useState<typeof records>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [msg, setMsg] = useState('')

  // Correção em lote
  const [loteIds, setLoteIds] = useState<string[]>([])

  function handleBuscar() {
    let filtrados = records
    if (data) filtrados = filtrados.filter((r) => r.date === data)
    if (bairroFiltro) filtrados = filtrados.filter((r) => r.bairro === bairroFiltro)
    if (viaFiltro) filtrados = filtrados.filter((r) => r.via === viaFiltro)
    if (!hasPermission('corrections:manage') && user) filtrados = filtrados.filter((r) => r.apontador === user.name)
    setResultados(filtrados)
    setEditId(null)
    setMsg('')
  }

  function handleEditar(r: any) {
    setEditId(r.id)
    setEditData({ ...r })
  }

  function handleSalvarEdicao() {
    if (editData) {
      update(editData.id, { bairro: editData.bairro, via: editData.via, encarregado: editData.encarregado, date: editData.date })
      setMsg('Registro atualizado.')
      setEditId(null)
      handleBuscar()
    }
  }

  function handleExcluir(id: string) {
    if (confirm('Excluir este registro?')) {
      remove(id)
      setMsg('Registro excluído.')
      handleBuscar()
    }
  }

  function handleExcluirLote() {
    if (loteIds.length === 0) return
    if (confirm(`Excluir ${loteIds.length} registro(s)?`)) {
      loteIds.forEach((id) => remove(id))
      setMsg(`${loteIds.length} registro(s) excluído(s).`)
      setLoteIds([])
      handleBuscar()
    }
  }

  const bairros = listarBairros()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {hasPermission('corrections:manage') ? 'Central de Correções' : 'Correções do Dia'}
      </h1>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400">{msg}</div>
      )}

      {/* Filtros */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          <select value={bairroFiltro} onChange={(e) => { setBairroFiltro(e.target.value); setViaFiltro('') }} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
            <option value="">Todos os bairros</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={viaFiltro} onChange={(e) => setViaFiltro(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
            <option value="">Todas as vias</option>
            {bairroFiltro && listarVias(bairroFiltro).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={handleBuscar} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">Buscar</button>
        </div>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && hasPermission('corrections:manage') && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Correção em lote</h2>
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => setLoteIds(loteIds.length === resultados.length ? [] : resultados.map((r) => r.id))} className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
              {loteIds.length === resultados.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            <span className="text-xs text-zinc-500">{loteIds.length} selecionado(s)</span>
            {loteIds.length > 0 && (
              <button onClick={handleExcluirLote} className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50">Excluir selecionados</button>
            )}
          </div>
        </div>
      )}

      {resultados.length > 0 ? (
        <div className="space-y-3">
          {resultados.map((r) => (
            <div key={r.id} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              {editId === r.id ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Editando #{r.id}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="date" value={editData?.date || ''} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" value={editData?.bairro || ''} onChange={(e) => setEditData({ ...editData, bairro: e.target.value })} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" value={editData?.via || ''} onChange={(e) => setEditData({ ...editData, via: e.target.value })} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" value={editData?.encarregado || ''} onChange={(e) => setEditData({ ...editData, encarregado: e.target.value })} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSalvarEdicao} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/60">Salvar</button>
                    <button onClick={() => setEditId(null)} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-0.5">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">#{r.id} — {r.date} | {r.bairro} / {r.via}</p>
                    <p className="text-xs text-zinc-500">Encarregado: {r.encarregado} | Apontador: {r.apontador} | Tipo: {r.tipo}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEditar(r)} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">Editar</button>
                    <button onClick={() => handleExcluir(r.id)} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded hover:bg-red-200 dark:hover:bg-red-900/50">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-zinc-500 text-center">Clique em Buscar para carregar os registros.</p>
        </div>
      )}
    </div>
  )
}
