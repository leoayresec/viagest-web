import { useState, useEffect } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { useGeographyStore } from '../../records/stores/geography.store'

export function SettingsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const isAdmin = hasPermission('settings:write')

  const {
    states, cities, neighborhoods, roads,
    fetchStates, fetchCities, fetchNeighborhoods, createNeighborhood, deleteNeighborhood,
    fetchRoads, createRoad, deleteRoad,
  } = useGeographyStore()

  const [tab, setTab] = useState('bairros')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')

  // Forms
  const [novoBairro, setNovoBairro] = useState('')
  const [novaVia, setNovaVia] = useState('')
  const [novaExt, setNovaExt] = useState('')
  const [novaLarg, setNovaLarg] = useState('')
  const [msg, setMsg] = useState('')

  // Carregar estados ao montar
  useEffect(() => { fetchStates() }, [])
  useEffect(() => { if (selectedState) fetchCities(selectedState) }, [selectedState])
  useEffect(() => { if (selectedCity) fetchNeighborhoods(selectedCity) }, [selectedCity])
  useEffect(() => { if (selectedNeighborhood) fetchRoads(selectedNeighborhood) }, [selectedNeighborhood])

  async function handleAddBairro() {
    if (!novoBairro.trim() || !selectedCity) { alert('Selecione a cidade e informe o bairro.'); return }
    const result = await createNeighborhood(selectedCity, novoBairro.trim())
    if (result) {
      setNovoBairro('')
      setMsg(`Bairro "${result.name}" criado.`)
      setSelectedNeighborhood(result.id)
    }
  }

  async function handleDelBairro(id: string, name: string) {
    if (!confirm(`Excluir o bairro "${name}"?`)) return
    await deleteNeighborhood(id)
    if (selectedNeighborhood === id) setSelectedNeighborhood('')
    setMsg(`Bairro "${name}" excluído.`)
  }

  async function handleAddVia() {
    if (!novaVia.trim() || !selectedNeighborhood) { alert('Selecione o bairro e informe a via.'); return }
    const result = await createRoad(selectedNeighborhood, novaVia.trim())
    if (result) {
      setNovaVia(''); setNovaExt(''); setNovaLarg('')
      setMsg(`Via "${result.name}" criada.`)
    }
  }

  async function handleDelVia(id: string, name: string) {
    if (!confirm(`Excluir a via "${name}"?`)) return
    await deleteRoad(id)
    setMsg(`Via "${name}" excluída.`)
  }

  const selectedCityName = cities.find(c => c.id === selectedCity)?.name ?? ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cadastros</h1>
      <p className="text-sm text-zinc-500">Gerencie bairros, vias e equipe da obra.</p>

      {msg && (
        <div className="p-3 border rounded-lg text-sm bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
          {msg}
          <button onClick={() => setMsg('')} className="ml-2 underline text-xs">fechar</button>
        </div>
      )}

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button onClick={() => setTab('bairros')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === 'bairros' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Bairros e Vias</button>
      </div>

      {/* ─── BAIRROS E VIAS ─── */}
      {tab === 'bairros' && (
        <div className="space-y-6">
          {/* Cascata: Estado → Cidade */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Estado</label>
                <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedNeighborhood('') }} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm">
                  <option value="">Selecione o estado</option>
                  {states.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Cidade</label>
                <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedNeighborhood('') }} disabled={!selectedState} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm disabled:opacity-50">
                  <option value="">Selecione a cidade</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Cadastrar bairro */}
          {selectedCity && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Novo bairro em {selectedCityName}</h2>
              <div className="flex gap-3">
                <input type="text" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} placeholder="Nome do bairro" onKeyDown={(e) => e.key === 'Enter' && handleAddBairro()} className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm" />
                <button onClick={handleAddBairro} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300">Adicionar</button>
              </div>
            </div>
          )}

          {/* Lista de bairros */}
          {selectedCity && neighborhoods.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Bairros de {selectedCityName}</h2>
              </div>
              <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {neighborhoods.map(n => (
                  <div key={n.id} className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${selectedNeighborhood === n.id ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`} onClick={() => setSelectedNeighborhood(selectedNeighborhood === n.id ? '' : n.id)}>
                    <div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.name}</span>
                      {selectedNeighborhood === n.id && (
                        <span className="ml-2 text-xs text-zinc-500">({roads.length} vias)</span>
                      )}
                    </div>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelBairro(n.id, n.name) }} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Excluir</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cadastrar via */}
          {selectedNeighborhood && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Nova via em {neighborhoods.find(n => n.id === selectedNeighborhood)?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" value={novaVia} onChange={(e) => setNovaVia(e.target.value)} placeholder="Nome da via" onKeyDown={(e) => e.key === 'Enter' && handleAddVia()} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm" />
                <input type="text" value={novaExt} onChange={(e) => setNovaExt(e.target.value)} placeholder="Extensão (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm" />
                <input type="text" value={novaLarg} onChange={(e) => setNovaLarg(e.target.value)} placeholder="Largura média (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm" />
                <button onClick={handleAddVia} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300">Adicionar</button>
              </div>
            </div>
          )}

          {/* Lista de vias */}
          {selectedNeighborhood && roads.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Vias</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                      <th className="p-3 font-medium">Via</th>
                      <th className="p-3 font-medium">Extensão</th>
                      <th className="p-3 font-medium">Largura</th>
                      <th className="p-3 font-medium">Status</th>
                      {isAdmin && <th className="p-3 font-medium"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {roads.map(r => (
                      <tr key={r.id} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3 font-medium">{r.name}</td>
                        <td className="p-3">{r.lengthM > 0 ? r.lengthM.toFixed(1).replace('.', ',') + ' m' : '-'}</td>
                        <td className="p-3">{r.widthM > 0 ? r.widthM.toFixed(2).replace('.', ',') + ' m' : '-'}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'ativa' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : r.status === 'encerrada' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>{r.status.replace('_', ' ')}</span>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-right">
                            <button onClick={() => handleDelVia(r.id, r.name)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Excluir</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
