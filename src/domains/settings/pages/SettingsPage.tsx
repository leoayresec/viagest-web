import { useState } from 'react'
import { useSettingsStore } from '../stores/settings.store'

function toFloat(v: string): number | undefined {
  const s = v.replace(',', '.').trim()
  if (!s) return undefined
  const n = parseFloat(s)
  return isNaN(n) ? undefined : n
}

export function SettingsPage() {
  const { vias, team, listarBairros, listarVias, salvarVia, atualizarDimensoes, atualizarStatus, excluirVia, excluirBairro, salvarMembro, excluirMembro } = useSettingsStore()
  const [tab, setTab] = useState('roads')

  // Bairro/via form
  const [novoBairro, setNovoBairro] = useState('')
  const [novaVia, setNovaVia] = useState('')
  const [novaExt, setNovaExt] = useState('')
  const [novaLarg, setNovaLarg] = useState('')

  // Update dimensions
  const [dimBairro, setDimBairro] = useState('')
  const [dimVia, setDimVia] = useState('')
  const [dimExt, setDimExt] = useState('')
  const [dimLarg, setDimLarg] = useState('')

  // Status
  const [statusBairro, setStatusBairro] = useState('')
  const [statusVia, setStatusVia] = useState('')
  const [novoStatus, setNovoStatus] = useState<string>('ativa')

  // Delete
  const [delBairro, setDelBairro] = useState('')
  const [delVia, setDelVia] = useState('')

  // Team
  const [novoNome, setNovoNome] = useState('')
  const [novaFuncao, setNovaFuncao] = useState<'encarregado' | 'apontador'>('encarregado')
  const [delNome, setDelNome] = useState('')
  const [delFuncao, setDelFuncao] = useState<'encarregado' | 'apontador'>('encarregado')

  const bairros = listarBairros()

  function handleCadastrar() {
    if (!novoBairro.trim() || !novaVia.trim()) { alert('Informe bairro e via.'); return }
    salvarVia(novoBairro.trim(), novaVia.trim(), toFloat(novaExt), toFloat(novaLarg))
    setNovoBairro(''); setNovaVia(''); setNovaExt(''); setNovaLarg('')
  }

  function handleSalvarDimensoes() {
    if (!dimBairro || !dimVia) { alert('Selecione bairro e via.'); return }
    const ext = toFloat(dimExt); const larg = toFloat(dimLarg)
    if (!ext || !larg) { alert('Informe extensão e largura válidas.'); return }
    atualizarDimensoes(dimBairro, dimVia, ext, larg)
  }

  function handleSalvarStatus() {
    if (statusBairro && statusVia) {
      atualizarStatus(statusBairro, statusVia, novoStatus as any)
    }
  }

  function handleExcluirVia() {
    if (delBairro && delVia) excluirVia(delBairro, delVia)
  }

  function handleExcluirBairro() {
    if (delBairro) excluirBairro(delBairro)
  }

  function handleAddMembro() {
    if (novoNome.trim()) {
      salvarMembro(novoNome.trim(), novaFuncao)
      setNovoNome('')
    }
  }

  function handleDelMembro() {
    if (delNome.trim()) {
      excluirMembro(delNome.trim(), delFuncao)
      setDelNome('')
    }
  }

  const viasDim = dimBairro ? listarVias(dimBairro) : []
  const viasStatus = statusBairro ? listarVias(statusBairro) : []
  const viasDel = delBairro ? listarVias(delBairro) : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cadastros</h1>
      <p className="text-sm text-zinc-500">Gerencie listas usadas no lançamento: bairros, vias, encarregados e apontadores.</p>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button onClick={() => setTab('roads')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === 'roads' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Bairros e vias</button>
        <button onClick={() => setTab('team')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === 'team' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Equipe</button>
      </div>

      {tab === 'roads' && (
        <div className="space-y-6">
          {/* Cadastrar */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Cadastrar bairro e via</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} placeholder="Bairro" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novaVia} onChange={(e) => setNovaVia(e.target.value)} placeholder="Via" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novaExt} onChange={(e) => setNovaExt(e.target.value)} placeholder="Extensão (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novaLarg} onChange={(e) => setNovaLarg(e.target.value)} placeholder="Largura média (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <button onClick={handleCadastrar} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Cadastrar</button>
          </div>

          {/* Tabela */}
          {vias.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Vias cadastradas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                      <th className="p-3 font-medium">Bairro</th>
                      <th className="p-3 font-medium">Via</th>
                      <th className="p-3 font-medium">Extensão</th>
                      <th className="p-3 font-medium">Largura</th>
                      <th className="p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vias.map((v, i) => (
                      <tr key={i} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">{v.bairro}</td>
                        <td className="p-3">{v.nome}</td>
                        <td className="p-3">{v.extensaoM ? v.extensaoM.toFixed(1).replace('.', ',') + ' m' : '-'}</td>
                        <td className="p-3">{v.larguraM ? v.larguraM.toFixed(2).replace('.', ',') + ' m' : '-'}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'ativa' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : v.status === 'encerrada' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>{v.status.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dimensões */}
          {bairros.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Atualizar dimensões das vias</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select value={dimBairro} onChange={(e) => { setDimBairro(e.target.value); setDimVia('') }} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="">Bairro</option>
                  {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={dimVia} onChange={(e) => setDimVia(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="">Via</option>
                  {viasDim.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <input type="text" value={dimExt} onChange={(e) => setDimExt(e.target.value)} placeholder="Extensão (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" value={dimLarg} onChange={(e) => setDimLarg(e.target.value)} placeholder="Largura média (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <button onClick={handleSalvarDimensoes} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Salvar dimensões</button>
            </div>
          )}

          {/* Status */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Status das vias</h2>
            <p className="text-xs text-zinc-500">Vias encerradas/arquivadas não aparecem para apontadores no lançamento.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={statusBairro} onChange={(e) => { setStatusBairro(e.target.value); setStatusVia('') }} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Bairro</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={statusVia} onChange={(e) => setStatusVia(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Via</option>
                {viasStatus.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="ativa">Ativa</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrada">Encerrada</option>
                <option value="arquivada">Arquivada</option>
              </select>
              <button onClick={handleSalvarStatus} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Salvar status</button>
            </div>
          </div>

          {/* Excluir */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Excluir bairro ou via</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={delBairro} onChange={(e) => { setDelBairro(e.target.value); setDelVia('') }} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Bairro</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={delVia} onChange={(e) => setDelVia(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Via (ou deixe vazio pra excluir bairro inteiro)</option>
                {viasDel.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleExcluirVia} disabled={!delVia} className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50">Excluir via</button>
                <button onClick={handleExcluirBairro} className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Excluir bairro</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div className="space-y-6">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Adicionar membro da equipe</h2>
            <div className="flex gap-3">
              <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <select value={novaFuncao} onChange={(e) => setNovaFuncao(e.target.value as any)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="encarregado">Encarregado</option>
                <option value="apontador">Apontador</option>
              </select>
              <button onClick={handleAddMembro} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Adicionar</button>
            </div>
          </div>

          {team.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Equipe cadastrada</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                      <th className="p-3 font-medium">Nome</th>
                      <th className="p-3 font-medium">Função</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m, i) => (
                      <tr key={i} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                        <td className="p-3">{m.nome}</td>
                        <td className="p-3 capitalize">{m.funcao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Remover membro</h2>
            <div className="flex gap-3">
              <input type="text" value={delNome} onChange={(e) => setDelNome(e.target.value)} placeholder="Nome" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <select value={delFuncao} onChange={(e) => setDelFuncao(e.target.value as any)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="encarregado">Encarregado</option>
                <option value="apontador">Apontador</option>
              </select>
              <button onClick={handleDelMembro} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
