import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../auth/auth.store'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { labelTipo, fmtNum, toNum, dataBr } from '../../../core/utils/format'
import type { ApiRecord } from '../../records/stores/records.store'

type TipoRelatorio = 'diario' | 'geral' | 'individual'

const CAT_EMOJIS: Record<string, string> = {
  limpeza: '🧹',
  escavacao: '🚧',
  colchao_areia: '🏖️',
  tubo: '🔴',
  aterro: '⛰️',
  manta_bidim: '🧵',
  motor: '⚙️',
  pv: '🕳️',
  bl: '⬛',
  espinha_bl: '📏',
  terrap: '🏗️',
  subbase: '🪨',
  cbuq: '🛣️',
  binder: '🛣️',
  pintura_ligacao: '🎨',
  tampao_70: '🔘',
  fresagem: '🛠️',
  remendo_profundo: '🔧',
  demolicao_calcada: '🔨',
  demolicao_meiofio: '🔨',
  linha_agua: '💧',
  urb: '🏙️',
  redes_auxiliares: '🔗',
  rede_domiciliar: '🏠',
  info_adicionais: '📝',
}

function gerarLinhasRecord(r: ApiRecord): string[] {
  const d = r.data
  const linhas: string[] = []

  if (r.serviceType === 'limpeza') {
    if (toNum(d.limpezaComp)) linhas.push(`• Comprimento: ${fmtNum(d.limpezaComp, 'm')}`)
    if (toNum(d.limpezaLarg)) linhas.push(`• Largura: ${fmtNum(d.limpezaLarg, 'm')}`)
    if (d.obsLimpeza) linhas.push(`• Obs: ${d.obsLimpeza}`)
  }

  if (r.serviceType === 'escavacao' || r.serviceType === 'colchao_areia' || r.serviceType === 'tubo' || r.serviceType === 'manta_bidim' || r.serviceType === 'aterro') {
    for (const dr of d.drenagens || []) {
      if (toNum(dr.escComp)) {
        const vol = toNum(dr.escComp) * toNum(dr.escLarg) * toNum(dr.escProf)
        linhas.push(`• Escavação: ${fmtNum(vol, 'm³')} (${fmtNum(dr.escComp, 'm')}x${fmtNum(dr.escLarg, 'm')}x${fmtNum(dr.escProf, 'm')})`)
      }
      if (toNum(dr.colComp)) {
        const vol = toNum(dr.colComp) * toNum(dr.colLarg) * toNum(dr.colProf)
        linhas.push(`• Colchão de areia: ${fmtNum(vol, 'm³')}`)
      }
      if (toNum(dr.tuboQtd)) linhas.push(`• Tubo DN ${dr.diam || '?'}: ${fmtNum(dr.tuboQtd, 'un')}`)
      if (toNum(dr.bidimComp)) {
        const area = toNum(dr.bidimComp) * toNum(dr.bidimLarg)
        linhas.push(`• Manta bidim: ${fmtNum(area, 'm²')}`)
      }
      if (toNum(dr.aterroComp)) {
        const vol = toNum(dr.aterroComp) * toNum(dr.aterroLarg) * toNum(dr.aterroProf)
        linhas.push(`• Aterro: ${fmtNum(vol, 'm³')}`)
      }
      if (dr.obs) linhas.push(`• Obs: ${dr.obs}`)
    }
  }

  if (r.serviceType === 'motor') {
    if (toNum(d.motorbombaMin)) linhas.push(`• Motorbomba: ${fmtNum(d.motorbombaMin, 'min')}`)
    if (d.obsMotorbomba) linhas.push(`• Obs: ${d.obsMotorbomba}`)
  }

  if (r.serviceType === 'pv' || r.serviceType === 'bl' || r.serviceType === 'espinha_bl') {
    if (d.pvs?.length) {
      for (const pv of d.pvs) {
        if (pv.num) linhas.push(`• PV ${pv.num}${pv.tam ? ` (${pv.tam})` : ''}${pv.status ? ` - ${pv.status}` : ''}`)
      }
    }
    if (d.bls?.length) {
      for (const bl of d.bls) {
        if (toNum(bl.qtd)) linhas.push(`• BL: ${fmtNum(bl.qtd, 'un')}${bl.status ? ` - ${bl.status}` : ''}`)
      }
    }
    if (toNum(d.tampao70Qtd)) linhas.push(`• Tampão Ø70cm: ${fmtNum(d.tampao70Qtd, 'un')}`)
    if (d.espinhas?.length) {
      for (const e of d.espinhas) {
        const partes: string[] = []
        if (e.referencia) partes.push(e.referencia)
        if (toNum(e.escC)) partes.push(`Esc: ${fmtNum(e.escC, 'm')}x${fmtNum(e.escL || 0, 'm')}x${fmtNum(e.escA || 0, 'm')}`)
        if (toNum(e.tuboM)) partes.push(`Tubo: ${fmtNum(e.tuboM, 'm')}`)
        if (partes.length) linhas.push(`• Espinha: ${partes.join(' | ')}`)
      }
    }
    if (d.obsPvbl) linhas.push(`• Obs: ${d.obsPvbl}`)
  }

  if (r.serviceType === 'terrap') {
    if (toNum(d.terrapComp)) {
      const vol = toNum(d.terrapComp) * toNum(d.terrapLarg) * toNum(d.terrapProf || 0.2)
      linhas.push(`• Terraplenagem: ${fmtNum(vol, 'm³')}`)
    }
    if (d.obsTerrap) linhas.push(`• Obs: ${d.obsTerrap}`)
  }

  if (r.serviceType === 'subbase' || r.serviceType === 'cbuq' || r.serviceType === 'binder' || r.serviceType === 'pintura_ligacao') {
    const trechos = r.serviceType === 'subbase' ? d.pavSubbase : r.serviceType === 'cbuq' ? d.pavCbuq : r.serviceType === 'binder' ? d.pavBinder : d.pavPintura
    let totalArea = 0; let totalTon = 0
    for (const t of trechos || []) {
      totalArea += toNum(t.area || (toNum(t.comp) * toNum(t.larg)))
      totalTon += toNum(t.ton)
    }
    if (totalArea > 0) linhas.push(`• Área: ${fmtNum(totalArea, 'm²')}`)
    if (totalTon > 0) linhas.push(`• Toneladas: ${fmtNum(totalTon, 't')}`)
    if (d.obsPav) linhas.push(`• Obs: ${d.obsPav}`)
  }

  if (r.serviceType === 'urb' || r.serviceType === 'demolicao_calcada' || r.serviceType === 'demolicao_meiofio' || r.serviceType === 'linha_agua') {
    let calcada = toNum(d.demolicaoCalcada)
    let meioFio = toNum(d.demolicaoMeiofio)
    let linhaAgua = toNum(d.demolicaoLinhaAgua)
    if (d.urbDireito) {
      calcada += toNum(d.urbDireito.calcada)
      meioFio += toNum(d.urbDireito.meioFio)
      linhaAgua += toNum(d.urbDireito.linhaAgua)
    }
    if (d.urbEsquerdo) {
      calcada += toNum(d.urbEsquerdo.calcada)
      meioFio += toNum(d.urbEsquerdo.meioFio)
      linhaAgua += toNum(d.urbEsquerdo.linhaAgua)
    }
    if (calcada > 0) linhas.push(`• Calçada: ${fmtNum(calcada, 'm²')}`)
    if (meioFio > 0) linhas.push(`• Meio-fio: ${fmtNum(meioFio, 'm')}`)
    if (linhaAgua > 0) linhas.push(`• Linha d'água: ${fmtNum(linhaAgua, 'm')}`)
    if (d.obsUrb) linhas.push(`• Obs: ${d.obsUrb}`)
  }

  if (r.serviceType === 'fresagem' || r.serviceType === 'remendo_profundo') {
    const trechos = r.serviceType === 'fresagem' ? d.fresagemTrechos : d.remendoTrechos
    let total = 0
    for (const t of trechos || []) {
      if (r.serviceType === 'fresagem') total += toNum(t.area ? toNum(t.area) * toNum(t.esp || 0.1) : toNum(t.comp) * toNum(t.larg) * toNum(t.esp || 0.1))
      else total += toNum(t.ton)
    }
    if (total > 0) linhas.push(`• ${r.serviceType === 'fresagem' ? 'Fresagem' : 'Remendo profundo'}: ${fmtNum(total, r.serviceType === 'fresagem' ? 'm³' : 't')}`)
    if (d.obsRecuperacao) linhas.push(`• Obs: ${d.obsRecuperacao}`)
  }

  if (r.serviceType === 'redes_auxiliares') {
    for (const ra of d.redesAux || []) {
      const partes: string[] = []
      if (toNum(ra.escProf)) {
        const vol = toNum(ra.escComp) * toNum(ra.escLarg) * toNum(ra.escProf)
        partes.push(`Esc: ${fmtNum(vol, 'm³')}`)
      }
      if (toNum(ra.colEsp)) {
        const vol = toNum(ra.colComp) * toNum(ra.colLarg) * toNum(ra.colEsp)
        partes.push(`Col: ${fmtNum(vol, 'm³')}`)
      }
      if (ra.tubos?.length) {
        for (const tubo of ra.tubos) {
          if (toNum(tubo.comp)) partes.push(`PVC ${tubo.diam || '?'}: ${fmtNum(tubo.comp, 'm')}`)
        }
      }
      if (ra.caixas?.length) {
        for (const cx of ra.caixas) {
          if (toNum(cx.qtd)) partes.push(`Caixa insp. ${cx.tam || ''}: ${fmtNum(cx.qtd, 'un')}`)
        }
      }
      if (partes.length) linhas.push(`• ${partes.join(' | ')}`)
      if (ra.obs) linhas.push(`• Obs: ${ra.obs}`)
    }
  }

  if (r.serviceType === 'rede_domiciliar') {
    if (toNum(d.redeDomiciliarQtd)) linhas.push(`• Ligações domiciliares: ${fmtNum(d.redeDomiciliarQtd, 'un')}`)
  }

  if (r.serviceType === 'info_adicionais' && d.infoAdicionais) {
    linhas.push(`• ${d.infoAdicionais}`)
  }

  return linhas
}

function gerarTextoWhatsApp(records: ApiRecord[], dataTxt: string): string {
  if (!records.length) return 'Nenhum registro encontrado para o período.'

  const grupos = new Map<string, ApiRecord[]>()
  for (const r of records) {
    const chave = `${r.neighborhood}||${r.road}||${r.supervisor}`
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(r)
  }

  const blocos: string[] = []
  for (const [chave, grupo] of grupos) {
    const [bairro, via, encarregado] = chave.split('||')
    const linhas: string[] = []
    linhas.push(`📅 DATA: ${dataTxt}`)
    linhas.push(`🏘️ BAIRRO: ${bairro}`)
    linhas.push(`📍 VIA: ${via}`)
    linhas.push(`👷 ENCARREGADO: ${encarregado}`)
    linhas.push('')

    const porTipo = new Map<string, ApiRecord[]>()
    for (const r of grupo) {
      if (!porTipo.has(r.serviceType)) porTipo.set(r.serviceType, [])
      porTipo.get(r.serviceType)!.push(r)
    }

    for (const [tipo, recs] of porTipo) {
      const emoji = CAT_EMOJIS[tipo] || '📋'
      linhas.push(`${emoji} ${labelTipo(tipo).toUpperCase()}`)
      for (const r of recs) {
        const detalhes = gerarLinhasRecord(r)
        linhas.push(...detalhes)
      }
      linhas.push('')
    }

    blocos.push(linhas.join('\n'))
  }

  return blocos.join('\n━━━━━━━━━━━━━━━━━━━━━━\n\n')
}

export function RelatorioWhatsAppPage() {
  const user = useAuthStore((s) => s.user)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const records = useRecordsStore((s) => s.records)
  const { listarEquipe } = useSettingsStore()

  const [tipoRel, setTipoRel] = useState<TipoRelatorio>('diario')
  const [dataIni, setDataIni] = useState(new Date().toISOString().slice(0, 10))
  const [dataFim, setDataFim] = useState(new Date().toISOString().slice(0, 10))
  const [apontadorSel, setApontadorSel] = useState('')
  const [texto, setTexto] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [gerou, setGerou] = useState(false)

  const apontadores = listarEquipe('apontador')

  function handleGerar() {
    setGerou(true)
    setCopiado(false)

    let filtrados: ApiRecord[] = []

    if (!hasPermission('reports:controle') && user) {
      filtrados = records.filter((r) => r.recorder === user.name && r.date === dataIni)
    } else {
      if (tipoRel === 'diario') {
        filtrados = records.filter((r) => r.date === dataIni)
      } else if (tipoRel === 'geral') {
        filtrados = records.filter((r) => r.date >= dataIni && r.date <= dataFim)
      } else if (tipoRel === 'individual') {
        if (!apontadorSel) { setTexto('Selecione um apontador.'); return }
        filtrados = records.filter((r) => r.recorder === apontadorSel && r.date >= dataIni && r.date <= dataFim)
      }
    }

    const dataTxt = dataBr(dataIni)
    setTexto(gerarTextoWhatsApp(filtrados, dataTxt))
  }

  function handleCopiar() {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Relatório WhatsApp</h1>
      <p className="text-sm text-zinc-500">Texto formatado para copiar e enviar ao grupo da obra.</p>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        {hasPermission('reports:controle') && (
          <>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input type="radio" checked={tipoRel === 'diario'} onChange={() => setTipoRel('diario')} className="accent-zinc-600" />
                Diário
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input type="radio" checked={tipoRel === 'geral'} onChange={() => setTipoRel('geral')} className="accent-zinc-600" />
                Geral
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input type="radio" checked={tipoRel === 'individual'} onChange={() => setTipoRel('individual')} className="accent-zinc-600" />
                Individual por apontador
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Data início</label>
                <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              {tipoRel !== 'diario' && (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Data fim</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                </div>
              )}
              {tipoRel === 'individual' && (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Apontador</label>
                  <select value={apontadorSel} onChange={(e) => setApontadorSel(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                    <option value="">Selecione</option>
                    {apontadores.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {!hasPermission('reports:controle') && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data</label>
            <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="w-full max-w-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        )}

        <button onClick={handleGerar} className="px-5 py-2.5 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2">
          <RefreshCw size={16} />
          Gerar relatório WhatsApp
        </button>
      </div>

      {gerou && texto && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Texto gerado</h2>
            <button onClick={handleCopiar} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              {copiado ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {copiado ? 'Copiado!' : 'Copiar texto'}
            </button>
          </div>
          <textarea readOnly value={texto} rows={20} className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed resize-y focus:outline-none" />
        </div>
      )}
    </div>
  )
}
