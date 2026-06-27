import { useState } from 'react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'

interface ApontadorStatus {
  nome: string
  temRegistros: boolean
  qtd: number
  primeiroEnvio: string | null
  ultimoEnvio: string | null
}

export function ControleRelatoriosPage() {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [carregado, setCarregado] = useState(false)
  const [statusList, setStatusList] = useState<ApontadorStatus[]>([])

  const { listarEquipe } = useSettingsStore()
  const { fetchRecords } = useRecordsStore()

  async function handleCarregar() {
    const apontadores = listarEquipe('apontador')
    await fetchRecords({ date: data })
    const records = useRecordsStore.getState().records

    const list: ApontadorStatus[] = apontadores.map((nome) => {
      const doApontador = records.filter((r) => r.recorder === nome)
      const tempos = doApontador.map((r) => r.createdAt).filter(Boolean).sort()
      return {
        nome,
        temRegistros: doApontador.length > 0,
        qtd: doApontador.length,
        primeiroEnvio: tempos.length > 0 ? tempos[0] : null,
        ultimoEnvio: tempos.length > 0 ? tempos[tempos.length - 1] : null,
      }
    })

    setStatusList(list)
    setCarregado(true)
  }

  const total = statusList.length
  const recebidos = statusList.filter((s) => s.temRegistros).length
  const pendentes = statusList.filter((s) => !s.temRegistros).length
  const pendentesNomes = statusList.filter((s) => !s.temRegistros).map((s) => s.nome)

  function handleDownloadCSV() {
    const header = 'Apontador;Status;Lançamentos;Primeiro envio;Último envio'
    const rows = statusList.map((s) => [
      s.nome,
      s.temRegistros ? 'Enviado' : 'Pendente',
      s.qtd,
      s.primeiroEnvio ? new Date(s.primeiroEnvio).toLocaleString('pt-BR') : '',
      s.ultimoEnvio ? new Date(s.ultimoEnvio).toLocaleString('pt-BR') : '',
    ].join(';'))
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `controle_relatorios_${data}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Controle de Relatórios do Dia</h1>

      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
        </div>
        <button onClick={handleCarregar} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">Carregar controle</button>
      </div>

      {carregado && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500">Total de apontadores</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{total}</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500">Recebidos ✅</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{recebidos}</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500">Pendentes ❌</p>
              <p className={`text-2xl font-bold mt-1 ${pendentes > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{pendentes}</p>
            </div>
          </div>

          {pendentes > 0 ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              ⚠️ {pendentes} apontador(es) ainda não enviaram o relatório de {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
              ✅ Todos os {total} apontador(es) enviaram o relatório de {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}.
            </div>
          )}

          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Apontadores</h2>
              <button onClick={handleDownloadCSV} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">Download CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                    <th className="p-3 font-medium">Apontador</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Lançamentos</th>
                    <th className="p-3 font-medium">Primeiro envio</th>
                    <th className="p-3 font-medium">Último envio</th>
                  </tr>
                </thead>
                <tbody>
                  {statusList.map((s) => (
                    <tr key={s.nome} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                      <td className="p-3">{s.nome}</td>
                      <td className="p-3">{s.temRegistros ? '✅ Enviado' : '❌ Pendente'}</td>
                      <td className="p-3">{s.qtd}</td>
                      <td className="p-3">{s.primeiroEnvio ? new Date(s.primeiroEnvio).toLocaleString('pt-BR') : '-'}</td>
                      <td className="p-3">{s.ultimoEnvio ? new Date(s.ultimoEnvio).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pendentesNomes.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pendentes (copiar para WhatsApp)</h2>
              <textarea readOnly value={pendentesNomes.join('\n')} className="w-full h-24 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none resize-none" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
