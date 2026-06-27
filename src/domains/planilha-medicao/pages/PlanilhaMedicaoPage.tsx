import { useState } from 'react'
import { FileSpreadsheet, Download, ChevronDown, ChevronRight } from 'lucide-react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { fmtNum, fmtMoeda, metricasOperacionais } from '../../../core/utils/format'
import type { Record as ViaGestRecord } from '../../../core/types/records'

type GeracaoTipo = 'uma_via' | 'todas_vias_bairro' | 'todas_vias_producao'

const CATEGORIAS = [
  'escavacao_m3', 'colchao_m3', 'aterro_m3', 'terraplenagem_m3',
  'tubos_drenagem_un', 'manta_m2', 'pv_un', 'bl_un',
  'subbase_m2', 'cbuq_m2', 'cbuq_t', 'binder_m2',
  'tampao70_un', 'fresagem_m3', 'remendo_t', 'meio_fio_m',
  'linha_agua_m', 'calcada_m2', 'limpeza_m2',
] as const

const CATEGORIA_LABELS: Record<string, string> = {
  escavacao_m3: 'Escavação (m³)',
  colchao_m3: 'Colchão (m³)',
  aterro_m3: 'Aterro (m³)',
  terraplenagem_m3: 'Terrapl. (m³)',
  tubos_drenagem_un: 'Tubos (un)',
  manta_m2: 'Manta (m²)',
  pv_un: 'PV (un)',
  bl_un: 'BL (un)',
  subbase_m2: 'Sub-base (m²)',
  cbuq_m2: 'CBUQ (m²)',
  cbuq_t: 'CBUQ (t)',
  binder_m2: 'Binder (m²)',
  tampao70_un: 'Tampão (un)',
  fresagem_m3: 'Fresagem (m³)',
  remendo_t: 'Remendo (t)',
  meio_fio_m: 'Meio-fio (m)',
  linha_agua_m: 'Linha água (m)',
  calcada_m2: 'Calçada (m²)',
  limpeza_m2: 'Limpeza (m²)',
}

const KPI_PREVIEW = [
  { label: 'Registros', key: 'registros' as const, fmt: (v: number) => String(v) },
  { label: 'Escavação', key: 'escavacao_m3' as const, fmt: (v: number) => fmtNum(v, 'm³') },
  { label: 'Tubos', key: 'tubos_drenagem_un' as const, fmt: (v: number) => fmtNum(v, 'un') },
  { label: 'Total estimado', key: '' as const, fmt: () => 'R$ --' },
  { label: 'PV finalizados', key: 'pv_un' as const, fmt: (v: number) => fmtNum(v, 'un') },
  { label: 'BL finalizados', key: 'bl_un' as const, fmt: (v: number) => fmtNum(v, 'un') },
  { label: 'Calçada', key: 'calcada_m2' as const, fmt: (v: number) => fmtNum(v, 'm²') },
  { label: 'Meio-fio', key: 'meio_fio_m' as const, fmt: (v: number) => fmtNum(v, 'm') },
  { label: 'Tampão Ø70', key: 'tampao70_un' as const, fmt: (v: number) => fmtNum(v, 'un') },
  { label: 'Fresagem', key: 'fresagem_m3' as const, fmt: (v: number) => fmtNum(v, 'm³') },
  { label: 'Remendo profundo', key: 'remendo_t' as const, fmt: (v: number) => fmtNum(v, 't') },
]

function recordsDoPeriodo(records: ViaGestRecord[], mes: number, ano: number): ViaGestRecord[] {
  const mesStr = String(mes).padStart(2, '0')
  return records.filter((r) => r.date.startsWith(`${ano}-${mesStr}`))
}

export function PlanilhaMedicaoPage() {
  const records = useRecordsStore((s) => s.records)
  const { listarBairros, listarVias } = useSettingsStore()

  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [bairroFiltro, setBairroFiltro] = useState('')
  const [bairroSel, setBairroSel] = useState('')
  const [viaSel, setViaSel] = useState('')
  const [geracaoTipo, setGeracaoTipo] = useState<GeracaoTipo>('uma_via')
  const [resumoExpandido, setResumoExpandido] = useState(false)
  const [resumo, setResumo] = useState<{ via: string; categorias: Record<string, number>; total: number }[]>([])
  const [resumoCarregado, setResumoCarregado] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgTipo, setMsgTipo] = useState<'sucesso' | 'erro'>('sucesso')

  const bairros = listarBairros()
  const vias = listarVias(bairroSel)

  function carregarResumo() {
    const filtrados = recordsDoPeriodo(records, mes, ano).filter((r) => !bairroFiltro || r.bairro === bairroFiltro)

    if (!filtrados.length) {
      setMsgTipo('erro')
      setMsg('Nenhum registro encontrado para o período e bairro selecionado.')
      setResumoCarregado(false)
      return
    }

    const porVia = new Map<string, ViaGestRecord[]>()
    for (const r of filtrados) {
      const chave = `${r.bairro} / ${r.via}`
      if (!porVia.has(chave)) porVia.set(chave, [])
      porVia.get(chave)!.push(r)
    }

    const linhas: { via: string; categorias: Record<string, number>; total: number }[] = []
    for (const [via, recs] of porVia) {
      const m = metricasOperacionais(recs)
      const categorias: Record<string, number> = {}
      let total = 0
      for (const cat of CATEGORIAS) {
        const val = (m as any)[cat] || 0
        categorias[cat] = val
        total += val
      }
      linhas.push({ via, categorias, total })
    }

    linhas.sort((a, b) => a.via.localeCompare(b.via))
    setResumo(linhas)
    setResumoCarregado(true)
    setMsgTipo('sucesso')
    setMsg(`${linhas.length} via(s) encontrada(s) com produção.`)
  }

  function handleGerar() {
    const filtrados = recordsDoPeriodo(records, mes, ano)

    if (geracaoTipo === 'uma_via') {
      if (!bairroSel || !viaSel) { setMsgTipo('erro'); setMsg('Selecione o bairro e a via.'); return }
      const viaRecs = filtrados.filter((r) => r.bairro === bairroSel && r.via === viaSel)
      if (!viaRecs.length) { setMsgTipo('erro'); setMsg('Nenhum registro encontrado para esta via no período.'); return }
      setMsgTipo('sucesso')
      setMsg(`Planilha gerada para ${bairroSel} / ${viaSel} — ${viaRecs.length} registro(s). (Download simulado)`)
    } else if (geracaoTipo === 'todas_vias_bairro') {
      if (!bairroSel) { setMsgTipo('erro'); setMsg('Selecione o bairro.'); return }
      const bairroRecs = filtrados.filter((r) => r.bairro === bairroSel)
      if (!bairroRecs.length) { setMsgTipo('erro'); setMsg('Nenhum registro encontrado para este bairro.'); return }
      setMsgTipo('sucesso')
      setMsg(`ZIP gerado para ${bairroSel} — ${bairroRecs.length} registro(s). (Download simulado)`)
    } else {
      const producao = filtrados.filter((r) => !bairroFiltro || r.bairro === bairroFiltro)
      if (!producao.length) { setMsgTipo('erro'); setMsg('Nenhum registro com produção no período.'); return }
      setMsgTipo('sucesso')
      setMsg(`ZIP gerado — ${producao.length} registro(s). (Download simulado)`)
    }
  }

  const filtradosPreview = useRecordsStore((s) => {
    const doPeriodo = s.records.filter((r) => {
      const mesStr = String(mes).padStart(2, '0')
      return r.date.startsWith(`${ano}-${mesStr}`)
    })
    if (bairroSel && viaSel) return doPeriodo.filter((r) => r.bairro === bairroSel && r.via === viaSel)
    return []
  })

  const mPreview = filtradosPreview.length ? metricasOperacionais(filtradosPreview) : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Planilha Medição</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        A planilha será preenchida nas abas diárias, mantendo as fórmulas originais do modelo.
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Mês</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Ano</label>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} min={2025} max={2035} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bairro (filtro)</label>
            <select value={bairroFiltro} onChange={(e) => setBairroFiltro(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
              <option value="">Todos</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <details className="border border-zinc-200 dark:border-zinc-700 rounded-lg" open={resumoExpandido} onToggle={(e) => setResumoExpandido((e.target as HTMLDetailsElement).open)}>
          <summary className="flex items-center gap-2 p-3 cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg">
            {resumoExpandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Resumo Geral das Medições
          </summary>
          <div className="p-3 pt-0 space-y-3">
            <button onClick={carregarResumo} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-zinc-700 dark:text-zinc-300">
              Carregar Resumo Geral
            </button>

            {resumoCarregado && resumo.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Vias com produção</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{resumo.length}</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total produzido</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{fmtMoeda(resumo.reduce((s, l) => s + l.total, 0))}</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Média por via</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{fmtMoeda(resumo.reduce((s, l) => s + l.total, 0) / resumo.length)}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-500">
                        <th className="p-2 text-left font-medium whitespace-nowrap">Via</th>
                        {CATEGORIAS.map((cat) => <th key={cat} className="p-2 text-right font-medium whitespace-nowrap">{CATEGORIA_LABELS[cat]}</th>)}
                        <th className="p-2 text-right font-medium whitespace-nowrap">Total geral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumo.map((linha) => (
                        <tr key={linha.via} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                          <td className="p-2 font-medium whitespace-nowrap">{linha.via}</td>
                          {CATEGORIAS.map((cat) => (
                            <td key={cat} className="p-2 text-right whitespace-nowrap">{linha.categorias[cat] > 0 ? fmtNum(linha.categorias[cat]) : '-'}</td>
                          ))}
                          <td className="p-2 text-right font-semibold whitespace-nowrap">{fmtMoeda(linha.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </details>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">O que deseja gerar?</h2>
        <div className="flex gap-4 flex-wrap">
          {([
            { value: 'uma_via', label: 'Uma via' },
            { value: 'todas_vias_bairro', label: 'Todas as vias de um bairro' },
            { value: 'todas_vias_producao', label: 'Todas as vias com produção no mês' },
          ] as { value: GeracaoTipo; label: string }[]).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="radio" checked={geracaoTipo === opt.value} onChange={() => setGeracaoTipo(opt.value)} className="accent-zinc-600" />
              {opt.label}
            </label>
          ))}
        </div>

        {geracaoTipo !== 'todas_vias_producao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Bairro</label>
              <select value={bairroSel} onChange={(e) => { setBairroSel(e.target.value); setViaSel('') }} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Selecione</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {geracaoTipo === 'uma_via' && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Via</label>
                <select value={viaSel} onChange={(e) => setViaSel(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="">Selecione</option>
                  {vias.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {geracaoTipo === 'todas_vias_producao' && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bairro (opcional)</label>
            <select value={bairroSel} onChange={(e) => setBairroSel(e.target.value)} className="w-full max-w-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
              <option value="">Todos</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        {geracaoTipo === 'uma_via' && bairroSel && viaSel && mPreview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPI_PREVIEW.map((kpi) => (
              <div key={kpi.label} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">{kpi.label}</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {kpi.key ? kpi.fmt((mPreview as any)[kpi.key] || 0) : kpi.fmt()}
                </p>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleGerar} className="px-5 py-2.5 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2">
          <FileSpreadsheet size={16} />
          {geracaoTipo === 'uma_via' ? 'Gerar planilha desta via' : 'Gerar ZIP'}
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          msgTipo === 'sucesso'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {msgTipo === 'sucesso' ? <Download size={16} /> : null}
          {msg}
        </div>
      )}
    </div>
  )
}
