import { useState, useMemo } from 'react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { toNum } from '../../../core/utils/format'
import { ChevronDown, ChevronRight, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react'

interface AvancoVia {
  bairro: string
  via: string
  extensao: number
  largura: number
  totalTubos: number
  compTerrap: number
  calcadaM2: number
  meioFioM: number
  linhaAguaM: number
  drenagemPct: number
  terrapPct: number
  calcadaPct: number
  meioFioPct: number
  linhaAguaPct: number
  urbPct: number
  avancoGeral: number
}

function pctFmt(v: number): string {
  return `${v.toFixed(1).replace('.', ',')}%`
}

function pctBar(v: number): string {
  const capped = Math.min(v, 100)
  return `${capped.toFixed(0)}%`
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ativa: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    em_andamento: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    encerrada: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    arquivada: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.ativa}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function AvancObraPage() {
  const records = useRecordsStore((s) => s.records)
  const { vias, atualizarStatus, listarBairros, listarVias } = useSettingsStore()

  const [bairroFiltro, setBairroFiltro] = useState('')
  const [viaFiltro, setViaFiltro] = useState('')
  const [filtroAtivas, setFiltroAtivas] = useState(true)
  const [filtroEncerradas, setFiltroEncerradas] = useState(true)
  const [filtroArquivadas, setFiltroArquivadas] = useState(false)
  const [carregado, setCarregado] = useState(false)

  const [expandedDetalhes, setExpandedDetalhes] = useState(false)
  const [expandedStatus, setExpandedStatus] = useState(false)

  const [selBairroStatus, setSelBairroStatus] = useState('')
  const [selViaStatus, setSelViaStatus] = useState('')
  const [novoStatus, setNovoStatus] = useState<string>('encerrada')
  const [obsStatus, setObsStatus] = useState('')
  const [msgStatus, setMsgStatus] = useState('')

  const bairros = listarBairros()

  const viasDisponiveis = useMemo(() => {
    if (!carregado) return []
    const viasSet = new Set<string>()
    for (const r of records) {
      const passaBairro = !bairroFiltro || r.bairro === bairroFiltro
      const passaVia = !viaFiltro || r.via === viaFiltro
      const viaInfo = vias.find((v) => v.bairro === r.bairro && v.nome === r.via)
      const passaStatus = viaInfo
        ? (viaInfo.status === 'ativa' && filtroAtivas) ||
          (viaInfo.status === 'encerrada' && filtroEncerradas) ||
          (viaInfo.status === 'arquivada' && filtroArquivadas) ||
          (viaInfo.status === 'em_andamento' && filtroAtivas)
        : filtroAtivas
      if (passaBairro && passaVia && passaStatus) {
        viasSet.add(`${r.bairro}||${r.via}`)
      }
    }
    return Array.from(viasSet).sort()
  }, [records, bairroFiltro, viaFiltro, filtroAtivas, filtroEncerradas, filtroArquivadas, carregado, vias])

  const registroPorChave = useMemo(() => {
    const map = new Map<string, typeof records>()
    for (const r of records) {
      const chave = `${r.bairro}||${r.via}`
      if (!map.has(chave)) map.set(chave, [])
      map.get(chave)!.push(r)
    }
    return map
  }, [records])

  const viaInfoMap = useMemo(() => {
    const map = new Map<string, { extensao: number; largura: number; status: string }>()
    for (const v of vias) {
      map.set(`${v.bairro}||${v.nome}`, { extensao: v.extensaoM || 0, largura: v.larguraM || 0, status: v.status })
    }
    return map
  }, [vias])

  const avancos = useMemo(() => {
    const result: AvancoVia[] = []
    for (const chave of viasDisponiveis) {
      const [bairro, via] = chave.split('||')
      const recs = registroPorChave.get(chave) || []
      const info = viaInfoMap.get(chave)
      const extensao = info?.extensao || 0
      const largura = info?.largura || 0

      let totalTubos = 0
      let compTerrap = 0
      let calcadaM2 = 0
      let meioFioM = 0
      let linhaAguaM = 0

      for (const r of recs) {
        const d = r.data
        if (r.tipo === 'tubo') {
          totalTubos += toNum(d.drenagens?.[0]?.tuboQtd)
        }
        if (r.tipo === 'terrap') {
          compTerrap += toNum(d.terrapComp)
        }
        if (r.tipo === 'urb') {
          const dir = d.urbDireito; const esq = d.urbEsquerdo
          calcadaM2 += toNum(dir?.calcada) + toNum(esq?.calcada)
          meioFioM += toNum(dir?.meioFio) + toNum(esq?.meioFio)
          linhaAguaM += toNum(dir?.linhaAgua) + toNum(esq?.linhaAgua)
        }
      }

      let drenagemPct = 0
      let terrapPct = 0
      let calcadaPct = 0
      let meioFioPct = 0
      let linhaAguaPct = 0
      let urbPct = 0
      let avancoGeral = 0

      if (extensao > 0) {
        drenagemPct = (totalTubos / extensao) * 100
        terrapPct = (compTerrap / extensao) * 100
        const baseDupla = extensao * 2
        meioFioPct = baseDupla > 0 ? (meioFioM / baseDupla) * 100 : 0
        linhaAguaPct = baseDupla > 0 ? (linhaAguaM / baseDupla) * 100 : 0
        calcadaPct = largura > 0 && extensao > 0 ? (calcadaM2 / (extensao * largura)) * 100 : 0
        urbPct = (calcadaPct + meioFioPct + linhaAguaPct) / 3
        avancoGeral = (drenagemPct + terrapPct + urbPct) / 3
      }

      result.push({
        bairro, via, extensao, largura,
        totalTubos, compTerrap, calcadaM2, meioFioM, linhaAguaM,
        drenagemPct, terrapPct, calcadaPct, meioFioPct, linhaAguaPct,
        urbPct, avancoGeral,
      })
    }
    return result.sort((a, b) => a.bairro.localeCompare(b.bairro) || a.via.localeCompare(b.via))
  }, [viasDisponiveis, registroPorChave, viaInfoMap])

  const viasSemExtensao = useMemo(() => {
    return avancos.filter((a) => a.extensao <= 0)
  }, [avancos])

  function handleCarregar() {
    setCarregado(true)
  }

  function handleSalvarStatus() {
    if (!selBairroStatus || !selViaStatus) {
      setMsgStatus('Selecione bairro e via.')
      return
    }
    atualizarStatus(selBairroStatus, selViaStatus, novoStatus as any)
    setMsgStatus(`Status de "${selViaStatus}" alterado para "${novoStatus.replace(/_/g, ' ')}".`)
    if (obsStatus) {
      localStorage.setItem(`viagest_obs_${selBairroStatus}_${selViaStatus}`, obsStatus)
    }
    setSelViaStatus('')
    setObsStatus('')
    setTimeout(() => setMsgStatus(''), 3000)
  }

  const viasStatus = selBairroStatus ? listarVias(selBairroStatus) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Avanço da Obra</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Drenagem = tubos assentados / extensão. Terraplenagem = comprimento / extensão. Urbanização = média de calçada, meio-fio e linha d'água usando base extensão × 2.
        </p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BarChart3 size={18} /> Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
              {bairroFiltro ? listarVias(bairroFiltro).map((v) => <option key={v} value={v}>{v}</option>) : []}
            </select>
          </div>
          <div className="flex items-end gap-3 flex-wrap md:col-span-2">
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={filtroAtivas} onChange={(e) => setFiltroAtivas(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500" />
              Ativas
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={filtroEncerradas} onChange={(e) => setFiltroEncerradas(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500" />
              Encerradas
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={filtroArquivadas} onChange={(e) => setFiltroArquivadas(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500" />
              Arquivadas
            </label>
            <button onClick={handleCarregar}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors flex items-center gap-1.5">
              <RefreshCw size={15} /> Carregar / atualizar
            </button>
          </div>
        </div>
      </div>

      {carregado && (
        <>
          {viasSemExtensao.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atenção: vias sem extensão cadastrada</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {viasSemExtensao.map((v) => `${v.bairro} / ${v.via}`).join(', ')} — os percentuais ficarão zerados. Cadastre a extensão em Cadastros &gt; Bairros e vias.
                </p>
              </div>
            </div>
          )}

          {avancos.length === 0 ? (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-sm text-zinc-500">Nenhuma via encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            <>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Avanço por via</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                        <th className="p-3 font-medium">Bairro</th>
                        <th className="p-3 font-medium">Via</th>
                        <th className="p-3 font-medium">Extensão</th>
                        <th className="p-3 font-medium">Drenagem</th>
                        <th className="p-3 font-medium">Terraplenagem</th>
                        <th className="p-3 font-medium">Urbanização</th>
                        <th className="p-3 font-medium">Avanço Geral</th>
                        <th className="p-3 font-medium">Alerta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {avancos.map((a) => {
                        const alerta = a.drenagemPct > 100 || a.terrapPct > 100 || a.urbPct > 100 || a.avancoGeral > 100
                        return (
                          <tr key={`${a.bairro}||${a.via}`} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                            <td className="p-3">{a.bairro}</td>
                            <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">{a.via}</td>
                            <td className="p-3">{a.extensao > 0 ? `${a.extensao.toFixed(1).replace('.', ',')} m` : '-'}</td>
                            <td className="p-3">{a.extensao > 0 ? pctFmt(a.drenagemPct) : '-'}</td>
                            <td className="p-3">{a.extensao > 0 ? pctFmt(a.terrapPct) : '-'}</td>
                            <td className="p-3">{a.extensao > 0 ? pctFmt(a.urbPct) : '-'}</td>
                            <td className="p-3 font-semibold">{a.extensao > 0 ? pctFmt(a.avancoGeral) : '-'}</td>
                            <td className="p-3">
                              {alerta ? (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                  <AlertTriangle size={14} /> Acima de 100%
                                </span>
                              ) : (
                                <span className="text-xs text-zinc-400">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                <button onClick={() => setExpandedStatus(!expandedStatus)}
                  className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 w-full text-left">
                  {expandedStatus ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Encerrar / arquivar via
                </button>
                {expandedStatus && (
                  <div className="space-y-4">
                    {msgStatus && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400">{msgStatus}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select value={selBairroStatus} onChange={(e) => { setSelBairroStatus(e.target.value); setSelViaStatus('') }}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                        <option value="">Bairro</option>
                        {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <select value={selViaStatus} onChange={(e) => setSelViaStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                        <option value="">Via</option>
                        {viasStatus.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                        <option value="encerrada">Encerrada</option>
                        <option value="arquivada">Arquivada</option>
                        <option value="ativa">Ativa</option>
                        <option value="em_andamento">Em andamento</option>
                      </select>
                      <button onClick={handleSalvarStatus}
                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                        Salvar status da via
                      </button>
                    </div>
                    <div>
                      <input type="text" value={obsStatus} onChange={(e) => setObsStatus(e.target.value)}
                        placeholder="Observação (opcional)"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                <button onClick={() => setExpandedDetalhes(!expandedDetalhes)}
                  className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 w-full text-left">
                  {expandedDetalhes ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Detalhar avanço por via
                </button>
                {expandedDetalhes && (
                  <div className="space-y-6">
                    {avancos.map((a) => {
                      const info = viaInfoMap.get(`${a.bairro}||${a.via}`)
                      return (
                        <div key={`det-${a.bairro}||${a.via}`} className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{a.bairro} / {a.via}</h3>
                              <p className="text-xs text-zinc-500">Extensão: {a.extensao > 0 ? `${a.extensao.toFixed(1).replace('.', ',')} m` : 'não cadastrada'} | Largura: {a.largura > 0 ? `${a.largura.toFixed(2).replace('.', ',')} m` : '-'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {info && statusBadge(info.status)}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                              <span>Avanço Geral</span>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{a.extensao > 0 ? pctFmt(a.avancoGeral) : '-'}</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                              <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                                style={{ width: pctBar(a.avancoGeral) }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-xs text-zinc-500 mb-1">Drenagem</p>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{a.extensao > 0 ? pctFmt(a.drenagemPct) : '-'}</p>
                              <p className="text-xs text-zinc-400 mt-1">{fmtParcial(a.totalTubos, 'tubos')} / {a.extensao > 0 ? `${a.extensao.toFixed(0)} m` : '-'}</p>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-xs text-zinc-500 mb-1">Terraplenagem</p>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{a.extensao > 0 ? pctFmt(a.terrapPct) : '-'}</p>
                              <p className="text-xs text-zinc-400 mt-1">{fmtParcial(a.compTerrap, 'm')} / {a.extensao > 0 ? `${a.extensao.toFixed(0)} m` : '-'}</p>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-xs text-zinc-500 mb-1">Urbanização</p>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{a.extensao > 0 ? pctFmt(a.urbPct) : '-'}</p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Calçada {pctFmt(a.calcadaPct)} | Meio-fio {pctFmt(a.meioFioPct)} | Linha d'água {pctFmt(a.linhaAguaPct)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Os percentuais de avanço consideram todo o acumulado já lançado nos registros. O progresso preservado dos fechamentos mensais é incorporado automaticamente.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function fmtParcial(valor: number, unidade: string): string {
  if (valor <= 0) return `0 ${unidade}`
  const txt = valor.toFixed(2).replace('.', ',')
  return `${txt} ${unidade}`.trim()
}
