import { useState, useMemo } from 'react'
import { Search, FileText, Download, Calendar } from 'lucide-react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { labelTipo, fmtNum, dataBr, resumoRecord } from '../../../core/utils/format'
import type { ViaGestRecord, ServiceType } from '../../../core/types/records'
import type { ApiRecord } from '../../records/stores/records.store'

const GRUPOS_DRENAGEM: ServiceType[] = ['escavacao', 'colchao_areia', 'tubo', 'manta_bidim', 'aterro', 'motor', 'obs_drenagem']
const GRUPOS_URBANIZACAO: ServiceType[] = ['urb', 'urb_controle', 'demolicao_calcada', 'demolicao_meiofio', 'colchao_areia_meiofio', 'demolicao_linha_agua', 'linha_agua', 'obs_urb']
const GRUPOS_PAVIMENTACAO: ServiceType[] = ['subbase', 'cbuq', 'binder', 'pintura_ligacao', 'tampao_70', 'fresagem', 'remendo_profundo', 'obs_pav', 'obs_recuperacao']

function mesCorrente(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${mes}`
}

export function HistoricoViaPage() {
  const records = useRecordsStore((s) => s.records)
  const { listarBairros, listarVias } = useSettingsStore()

  const [filtroBairro, setFiltroBairro] = useState('')
  const [filtroVia, setFiltroVia] = useState('')
  const [dataInicio, setDataInicio] = useState(`${mesCorrente()}-01`)
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date()
    const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    return `${mesCorrente()}-${String(ultimo).padStart(2, '0')}`
  })
  const [consultado, setConsultado] = useState(false)

  const bairros = listarBairros()
  const vias = filtroBairro ? listarVias(filtroBairro) : []

  const resultado = useMemo(() => {
    if (!consultado) return [] as ApiRecord[]
    return records.filter((r) => {
      if (filtroBairro && r.neighborhood !== filtroBairro) return false
      if (filtroVia && r.road !== filtroVia) return false
      if (dataInicio && r.date < dataInicio) return false
      if (dataFim && r.date > dataFim) return false
      return true
    }).sort((a, b) => a.date.localeCompare(b.date) || a.serviceType.localeCompare(b.serviceType))
  }, [records, filtroBairro, filtroVia, dataInicio, dataFim, consultado])

  const gruposPorData = useMemo(() => {
    const map = new Map<string, ApiRecord[]>()
    for (const r of resultado) {
      const arr = map.get(r.date) || []
      arr.push(r)
      map.set(r.date, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [resultado])

  function filtrarGrupo(rs: ApiRecord[], tipos: ServiceType[]) {
    return rs.filter((r) => tipos.includes(r.serviceType as ServiceType))
  }

  function formatarDrenagem(r: ApiRecord): string {
    const d = r.data.drenagens?.[0]
    if (!d) return ''
    const partes: string[] = []
    if (r.serviceType === 'escavacao' && d.escComp) partes.push(`Esc: ${fmtNum(d.escComp, 'm')}x${fmtNum(d.escLarg, 'm')}x${fmtNum(d.escProf, 'm')}`)
    if (r.serviceType === 'colchao_areia' && d.colComp) partes.push(`Colchão: ${fmtNum(d.colComp, 'm')}x${fmtNum(d.colLarg, 'm')}x${fmtNum(d.colProf, 'm')}`)
    if (r.serviceType === 'tubo' && d.tuboQtd) partes.push(`Tubo: ${fmtNum(d.tuboQtd, 'un')} | DN ${d.diam || '—'}`)
    if (r.serviceType === 'manta_bidim' && d.bidimComp) partes.push(`Manta: ${fmtNum(d.bidimComp, 'm')}x${fmtNum(d.bidimLarg, 'm')}`)
    if (r.serviceType === 'aterro' && d.aterroComp) partes.push(`Aterro: ${fmtNum(d.aterroComp, 'm')}x${fmtNum(d.aterroLarg, 'm')}x${fmtNum(d.aterroProf, 'm')}`)
    if (r.serviceType === 'motor') partes.push(`Motorbomba: ${fmtNum(r.data.motorbombaMin || 0, 'min')}`)
    if (r.serviceType === 'obs_drenagem' && d.obs) partes.push(d.obs)
    return partes.join(' | ')
  }

  function formatarUrb(r: ApiRecord): string {
    const d = r.data
    const partes: string[] = []
    if (r.serviceType === 'urb') {
      const dir = d.urbDireito; const esq = d.urbEsquerdo
      if (dir?.calcada || esq?.calcada) {
        partes.push(`Calçada: D ${fmtNum(dir?.calcada, 'm²')} | E ${fmtNum(esq?.calcada, 'm²')}`)
      }
      if (dir?.meioFio || esq?.meioFio) {
        partes.push(`Meio-fio: D ${fmtNum(dir?.meioFio, 'm')} | E ${fmtNum(esq?.meioFio, 'm')}`)
      }
      if (dir?.linhaAgua || esq?.linhaAgua) {
        partes.push(`Linha d'água: D ${fmtNum(dir?.linhaAgua, 'm')} | E ${fmtNum(esq?.linhaAgua, 'm')}`)
      }
    }
    if (r.serviceType === 'demolicao_calcada') partes.push(`Dem. calçada: ${fmtNum(d.demolicaoCalcada, 'm²')}`)
    if (r.serviceType === 'demolicao_meiofio') partes.push(`Dem. meio-fio: ${fmtNum(d.demolicaoMeiofio, 'm')}`)
    if (r.serviceType === 'demolicao_linha_agua') partes.push(`Dem. linha d'água: ${fmtNum(d.demolicaoLinhaAgua, 'm')}`)
    if (r.serviceType === 'linha_agua') partes.push(`Linha d'água: ${fmtNum(d.demolicaoLinhaAgua, 'm')}`)
    if (r.serviceType === 'obs_urb' && d.obsUrb) partes.push(d.obsUrb)
    return partes.join(' | ')
  }

  function formatarPav(r: ApiRecord): string {
    const d = r.data
    const partes: string[] = []
    const trechos = d.pavSubbase || d.pavCbuq || d.pavBinder || d.pavPintura || d.fresagemTrechos || d.remendoTrechos
    if (trechos?.length) {
      const total = trechos.reduce((s: number, t: any) => s + (t.area || (t.comp || 0) * (t.larg || 0)), 0)
      const ton = trechos.reduce((s: number, t: any) => s + (t.ton || 0), 0)
      if (total) partes.push(`Área: ${fmtNum(total, 'm²')}`)
      if (ton) partes.push(`Peso: ${fmtNum(ton, 't')}`)
    }
    if (r.serviceType === 'tampao_70') partes.push(`Tampão Ø70: ${fmtNum(d.tampao70Qtd, 'un')}`)
    if (r.serviceType === 'obs_pav' && d.obsPav) partes.push(d.obsPav)
    if (r.serviceType === 'obs_recuperacao' && d.obsRecuperacao) partes.push(d.obsRecuperacao)
    return partes.join(' | ')
  }

  function formatarOutros(r: ApiRecord): string {
    const viaGestRecord = { ...r, tipo: r.serviceType, bairro: r.neighborhood, via: r.road, encarregado: r.supervisor, apontador: r.recorder } as ViaGestRecord
    return resumoRecord(viaGestRecord)
  }

  function renderGrupo(rs: ApiRecord[], titulo: string, formatter: (r: ApiRecord) => string) {
    if (!rs.length) return null
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">{titulo}</h4>
        <div className="space-y-2">
          {rs.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">{labelTipo(r.serviceType)}</span>
                <span>Supervisor: {r.supervisor || '—'} | Apontador: {r.recorder || '—'}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">{formatter(r) || 'Sem dados'}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico da Via</h1>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bairro</label>
            <select
              value={filtroBairro}
              onChange={(e) => { setFiltroBairro(e.target.value); setFiltroVia('') }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Via</label>
            <select
              value={filtroVia}
              onChange={(e) => setFiltroVia(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {vias.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setConsultado(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Consultar histórico
            </button>
          </div>
        </div>
      </div>

      {consultado && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resultado.length} registro{resultado.length !== 1 ? 's' : ''} encontrado{resultado.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => alert('PDF disponível quando conectado ao back-end')}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Gerar PDF
              </button>
              <button
                onClick={() => alert('Download disponível quando conectado ao back-end')}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          {gruposPorData.map(([data, rs]) => {
            const drenagem = filtrarGrupo(rs, GRUPOS_DRENAGEM)
            const urbanizacao = filtrarGrupo(rs, GRUPOS_URBANIZACAO)
            const pavimentacao = filtrarGrupo(rs, GRUPOS_PAVIMENTACAO)
            const outros = rs.filter((r) => ![...GRUPOS_DRENAGEM, ...GRUPOS_URBANIZACAO, ...GRUPOS_PAVIMENTACAO].includes(r.serviceType as ServiceType))

            return (
              <div key={data} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{dataBr(data)}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({rs.length} registro{rs.length !== 1 ? 's' : ''})</span>
                </div>
                {renderGrupo(drenagem, 'Drenagem', formatarDrenagem)}
                {renderGrupo(urbanizacao, 'Urbanização', formatarUrb)}
                {renderGrupo(pavimentacao, 'Pavimentação', formatarPav)}
                {renderGrupo(outros, 'Outros', formatarOutros)}
              </div>
            )
          })}

          {!resultado.length && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado para os filtros selecionados.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
