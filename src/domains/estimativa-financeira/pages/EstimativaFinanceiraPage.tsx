import { useState, useMemo } from 'react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { metricasOperacionais, fmtNum, fmtMoeda, dataSql } from '../../../core/utils/format'
import { estimativaCustosOperacionais } from '../../../core/utils/estimativa'
import { Search, Calculator } from 'lucide-react'

const SERVICOS_MAPA: [string, string][] = [
  ['Escavação m³', 'escavacao_m3'],
  ['Colchão m³', 'colchao_m3'],
  ['Aterro m³', 'aterro_m3'],
  ['Terraplenagem m³', 'terraplenagem_m3'],
  ['Tubos m', 'tubos_drenagem_un'],
  ['Manta m²', 'manta_m2'],
  ['PV un', 'pv_un'],
  ['BL un', 'bl_un'],
  ['Sub-base m²', 'subbase_m2'],
  ['CBUQ m²', 'cbuq_m2'],
  ['CBUQ t', 'cbuq_t'],
  ['Binder m²', 'binder_m2'],
  ['Pintura m²', 'pintura_m2'],
  ['Meio-fio m', 'meio_fio_m'],
  ['Linha d\'água m', 'linha_agua_m'],
  ['Calçada m²', 'calcada_m2'],
  ['Limpeza m²', 'limpeza_m2'],
  ['Caixa de inspeção un', 'caixa_inspecao_un'],
]

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{value}</p>
    </div>
  )
}

export function EstimativaFinanceiraPage() {
  const records = useRecordsStore((s) => s.records)
  const { listarBairros, listarVias } = useSettingsStore()

  const hoje = dataSql(new Date())
  const [dataInicio, setDataInicio] = useState(hoje)
  const [dataFim, setDataFim] = useState(hoje)
  const [bairroFiltro, setBairroFiltro] = useState('')
  const [viaFiltro, setViaFiltro] = useState('')
  const [carregado, setCarregado] = useState(false)

  const bairros = listarBairros()
  const vias = bairroFiltro ? listarVias(bairroFiltro) : listarVias()

  const dataInicioVal = dataInicio || ''
  const dataFimVal = dataFim || ''

  const registrosFiltrados = useMemo(() => {
    if (!carregado) return []
    let filtrados = records
    if (dataInicioVal && dataFimVal) {
      filtrados = filtrados.filter((r) => r.date >= dataInicioVal && r.date <= dataFimVal)
    }
    if (bairroFiltro) filtrados = filtrados.filter((r) => r.bairro === bairroFiltro)
    if (viaFiltro) filtrados = filtrados.filter((r) => r.via === viaFiltro)
    return filtrados
  }, [records, dataInicioVal, dataFimVal, bairroFiltro, viaFiltro, carregado])

  const metricas = useMemo(() => metricasOperacionais(registrosFiltrados), [registrosFiltrados])
  const { linhas, total } = useMemo(() => estimativaCustosOperacionais(registrosFiltrados), [registrosFiltrados])

  const linhasDiretas = linhas.filter((l: { Tipo: string }) => l.Tipo === 'Direto')
  const linhasDerivadas = linhas.filter((l: { Tipo: string }) => l.Tipo === 'Derivado')
  const totalDireto = linhasDiretas.reduce((s: number, l: { Total: number }) => s + l.Total, 0)
  const totalDerivado = linhasDerivadas.reduce((s: number, l: { Total: number }) => s + l.Total, 0)

  const grupos = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of linhas) {
      map.set(l.Grupo, (map.get(l.Grupo) || 0) + l.Total)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [linhas])

  const pvcDiametros = Object.entries(metricas.pvc_por_diametro).filter(([, v]: [string, number]) => v > 0)

  function handleCarregar() {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      alert('Data inicial não pode ser maior que a data final.')
      return
    }
    setCarregado(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Estimativa Financeira</h1>
        <p className="text-sm text-zinc-500 mt-1">Consulta de custo estimado por dia, período, bairro e via</p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Search size={18} /> Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bairro</label>
            <select value={bairroFiltro} onChange={(e) => { setBairroFiltro(e.target.value); setViaFiltro('') }}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
              <option value="">Todos</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Via</label>
            <select value={viaFiltro} onChange={(e) => setViaFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
              <option value="">Todas</option>
              {vias.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleCarregar}
              className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
              Carregar estimativa
            </button>
          </div>
        </div>
      </div>

      {carregado && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Período" value={`${dataInicio} a ${dataFim}`} />
            <KpiCard label="Lançamentos" value={String(metricas.registros)} />
            <KpiCard label="Bairros" value={String(metricas.bairros)} />
            <KpiCard label="Vias" value={String(metricas.vias)} />
          </div>

          {registrosFiltrados.length === 0 ? (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-sm text-zinc-500">Nenhum registro encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Produção física vinculada</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                        <th className="p-2 font-medium">Serviço</th>
                        <th className="p-2 font-medium">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SERVICOS_MAPA.map(([label, chave]) => {
                        const valor = (metricas as any)[chave]
                        if (!valor || valor <= 0) return null
                        return (
                          <tr key={chave} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                            <td className="p-2">{label}</td>
                            <td className="p-2">{fmtNum(valor)}</td>
                          </tr>
                        )
                      })}
                      {pvcDiametros.map(([diam, qtd]) => (
                        <tr key={diam} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                          <td className="p-2">{diam}</td>
                          <td className="p-2">{fmtNum(qtd, 'm')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calculator size={18} /> Conferência da estimativa financeira
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KpiCard label="Custos diretos" value={fmtMoeda(totalDireto)} />
                  <KpiCard label="Custos derivados" value={fmtMoeda(totalDerivado)} />
                  <KpiCard label="Total estimado" value={fmtMoeda(total)} />
                </div>

                {linhasDiretas.length > 0 && (
                  <div className="overflow-x-auto">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Itens diretos</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                          <th className="p-2 font-medium">Tipo</th>
                          <th className="p-2 font-medium">Grupo</th>
                          <th className="p-2 font-medium">Item</th>
                          <th className="p-2 font-medium">Código</th>
                          <th className="p-2 font-medium">Quantidade</th>
                          <th className="p-2 font-medium">Preço unitário</th>
                          <th className="p-2 font-medium">Total</th>
                          <th className="p-2 font-medium">Origem</th>
                          <th className="p-2 font-medium">Cálculo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhasDiretas.map((l, i) => (
                          <tr key={i} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                            <td className="p-2">{l.Tipo}</td>
                            <td className="p-2">{l.Grupo}</td>
                            <td className="p-2">{l.Item}</td>
                            <td className="p-2">{l.Código}</td>
                            <td className="p-2">{fmtNum(l.Quantidade)}</td>
                            <td className="p-2">{fmtMoeda(l['Preço unitário'])}</td>
                            <td className="p-2">{fmtMoeda(l.Total)}</td>
                            <td className="p-2 text-xs">{l.Origem}</td>
                            <td className="p-2 text-xs">{l.Cálculo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {linhasDerivadas.length > 0 && (
                  <div className="overflow-x-auto">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Itens derivados</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                          <th className="p-2 font-medium">Tipo</th>
                          <th className="p-2 font-medium">Grupo</th>
                          <th className="p-2 font-medium">Item</th>
                          <th className="p-2 font-medium">Código</th>
                          <th className="p-2 font-medium">Quantidade</th>
                          <th className="p-2 font-medium">Preço unitário</th>
                          <th className="p-2 font-medium">Total</th>
                          <th className="p-2 font-medium">Origem</th>
                          <th className="p-2 font-medium">Cálculo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhasDerivadas.map((l, i) => (
                          <tr key={i} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                            <td className="p-2">{l.Tipo}</td>
                            <td className="p-2">{l.Grupo}</td>
                            <td className="p-2">{l.Item}</td>
                            <td className="p-2">{l.Código}</td>
                            <td className="p-2">{fmtNum(l.Quantidade)}</td>
                            <td className="p-2">{fmtMoeda(l['Preço unitário'])}</td>
                            <td className="p-2">{fmtMoeda(l.Total)}</td>
                            <td className="p-2 text-xs">{l.Origem}</td>
                            <td className="p-2 text-xs">{l.Cálculo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {grupos.length > 0 && (
                  <div className="overflow-x-auto">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Total por grupo</h3>
                    <table className="w-full text-sm max-w-md">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                          <th className="p-2 font-medium">Grupo</th>
                          <th className="p-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupos.map(([grupo, valor]) => (
                          <tr key={grupo} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                            <td className="p-2">{grupo}</td>
                            <td className="p-2">{fmtMoeda(valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
