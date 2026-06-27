import { useState } from 'react'
import { FileText, Download, AlertCircle } from 'lucide-react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { fmtNum, toNum, dataBr, metricasOperacionais } from '../../../core/utils/format'

type TipoPDF = 'quantitativo_geral' | 'quantitativo_via' | 'redes_auxiliares' | 'rede_domiciliar'

export function RelatorioPDFPage() {
  const records = useRecordsStore((s) => s.records)
  const { listarBairros, listarVias } = useSettingsStore()

  const [tipoPDF, setTipoPDF] = useState<TipoPDF>('quantitativo_geral')
  const [dataIni, setDataIni] = useState(new Date().toISOString().slice(0, 10))
  const [dataFim, setDataFim] = useState(new Date().toISOString().slice(0, 10))
  const [bairro, setBairro] = useState('')
  const [via, setVia] = useState('')
  const [resultado, setResultado] = useState<{ tipo: TipoPDF; texto: string; registros: number } | null>(null)
  const [erro, setErro] = useState('')
  const bairros = listarBairros()
  const vias = listarVias(bairro)

  function handleGerar() {
    setErro('')
    setResultado(null)

    let filtrados = records.filter((r) => r.date >= dataIni && r.date <= dataFim)

    if (tipoPDF === 'quantitativo_via') {
      if (!bairro || !via) { setErro('Selecione o bairro e a via.'); return }
      filtrados = filtrados.filter((r) => r.bairro === bairro && r.via === via)
    } else if (tipoPDF === 'redes_auxiliares') {
      filtrados = filtrados.filter((r) => r.tipo === 'redes_auxiliares')
    } else if (tipoPDF === 'rede_domiciliar') {
      filtrados = filtrados.filter((r) => r.tipo === 'rede_domiciliar')
    }

    if (filtrados.length === 0) {
      setErro('Nenhum registro encontrado para os filtros selecionados.')
      return
    }

    const m = metricasOperacionais(filtrados)
    const linhas: string[] = []

    if (tipoPDF === 'quantitativo_geral' || tipoPDF === 'quantitativo_via') {
      linhas.push(`Período: ${dataBr(dataIni)} a ${dataBr(dataFim)}`)
      if (tipoPDF === 'quantitativo_via') linhas.push(`Bairro: ${bairro} | Via: ${via}`)
      linhas.push(`Total de registros: ${m.registros}`)
      linhas.push(`Vias: ${m.vias} | Bairros: ${m.bairros} | Apontadores: ${m.apontadores}`)
      linhas.push('')
      linhas.push('== QUANTITATIVO GERAL ==')
      linhas.push('')
      if (m.escavacao_m3 > 0) linhas.push(`Escavação: ${fmtNum(m.escavacao_m3, 'm³')}`)
      if (m.colchao_m3 > 0) linhas.push(`Colchão de areia: ${fmtNum(m.colchao_m3, 'm³')}`)
      if (m.aterro_m3 > 0) linhas.push(`Aterro: ${fmtNum(m.aterro_m3, 'm³')}`)
      if (m.terraplenagem_m3 > 0) linhas.push(`Terraplenagem: ${fmtNum(m.terraplenagem_m3, 'm³')}`)
      if (m.tubos_drenagem_un > 0) linhas.push(`Tubos drenagem: ${fmtNum(m.tubos_drenagem_un, 'un')}`)
      if (m.manta_m2 > 0) linhas.push(`Manta bidim: ${fmtNum(m.manta_m2, 'm²')}`)
      if (m.pv_un > 0) linhas.push(`PV: ${fmtNum(m.pv_un, 'un')}`)
      if (m.bl_un > 0) linhas.push(`BL: ${fmtNum(m.bl_un, 'un')}`)
      if (m.subbase_m2 > 0) linhas.push(`Sub-base: ${fmtNum(m.subbase_m2, 'm²')}`)
      if (m.cbuq_m2 > 0) linhas.push(`CBUQ (área): ${fmtNum(m.cbuq_m2, 'm²')}`)
      if (m.cbuq_t > 0) linhas.push(`CBUQ (ton): ${fmtNum(m.cbuq_t, 't')}`)
      if (m.binder_m2 > 0) linhas.push(`Binder: ${fmtNum(m.binder_m2, 'm²')}`)
      if (m.pintura_m2 > 0) linhas.push(`Pintura de ligação: ${fmtNum(m.pintura_m2, 'm²')}`)
      if (m.tampao70_un > 0) linhas.push(`Tampão Ø70cm: ${fmtNum(m.tampao70_un, 'un')}`)
      if (m.fresagem_m3 > 0) linhas.push(`Fresagem: ${fmtNum(m.fresagem_m3, 'm³')}`)
      if (m.remendo_t > 0) linhas.push(`Remendo profundo: ${fmtNum(m.remendo_t, 't')}`)
      if (m.meio_fio_m > 0) linhas.push(`Meio-fio: ${fmtNum(m.meio_fio_m, 'm')}`)
      if (m.linha_agua_m > 0) linhas.push(`Linha d'água: ${fmtNum(m.linha_agua_m, 'm')}`)
      if (m.calcada_m2 > 0) linhas.push(`Calçada: ${fmtNum(m.calcada_m2, 'm²')}`)
      if (m.limpeza_m2 > 0) linhas.push(`Limpeza: ${fmtNum(m.limpeza_m2, 'm²')}`)
      if (m.caixa_inspecao_un > 0) linhas.push(`Caixa de inspeção: ${fmtNum(m.caixa_inspecao_un, 'un')}`)
      for (const [diam, comp] of Object.entries(m.pvc_por_diametro)) {
        if (comp > 0) linhas.push(`${diam}: ${fmtNum(comp, 'm')}`)
      }
    } else if (tipoPDF === 'redes_auxiliares') {
      linhas.push(`Período: ${dataBr(dataIni)} a ${dataBr(dataFim)}`)
      linhas.push(`Total de registros: ${m.registros}`)
      linhas.push('')
      linhas.push('== REDES AUXILIARES ==')
      linhas.push('')
      if (m.escavacao_m3 > 0) linhas.push(`Escavação: ${fmtNum(m.escavacao_m3, 'm³')}`)
      if (m.colchao_m3 > 0) linhas.push(`Colchão de areia: ${fmtNum(m.colchao_m3, 'm³')}`)
      if (m.aterro_m3 > 0) linhas.push(`Aterro: ${fmtNum(m.aterro_m3, 'm³')}`)
      if (m.caixa_inspecao_un > 0) linhas.push(`Caixas de inspeção: ${fmtNum(m.caixa_inspecao_un, 'un')}`)
      for (const [diam, comp] of Object.entries(m.pvc_por_diametro)) {
        if (comp > 0) linhas.push(`PVC ${diam}: ${fmtNum(comp, 'm')}`)
      }
    } else if (tipoPDF === 'rede_domiciliar') {
      linhas.push(`Período: ${dataBr(dataIni)} a ${dataBr(dataFim)}`)
      linhas.push(`Total de registros: ${m.registros}`)
      linhas.push('')
      linhas.push('== REDE DOMICILIAR ==')
      linhas.push('')
      let totalLigacoes = 0
      for (const r of filtrados) {
        totalLigacoes += toNum(r.data.redeDomiciliarQtd)
      }
      linhas.push(`Ligações domiciliares: ${fmtNum(totalLigacoes, 'un')}`)
    }

    setResultado({ tipo: tipoPDF, texto: linhas.join('\n'), registros: filtrados.length })
  }

  function handleDownload() {
    if (!resultado) return
    const nome = `relatorio_${tipoPDF}_${dataIni}_${dataFim}.txt`
    const blob = new Blob([resultado.texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Relatório PDF</h1>
      <p className="text-sm text-zinc-500">Gere relatórios quantitativos dos serviços executados.</p>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-2">Tipo de PDF</label>
          <div className="flex gap-4 flex-wrap">
            {([
              { value: 'quantitativo_geral', label: 'Quantitativo geral' },
              { value: 'quantitativo_via', label: 'Quantitativo por via' },
              { value: 'redes_auxiliares', label: 'Redes auxiliares' },
              { value: 'rede_domiciliar', label: 'Rede domiciliar' },
            ] as { value: TipoPDF; label: string }[]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input type="radio" checked={tipoPDF === opt.value} onChange={() => setTipoPDF(opt.value)} className="accent-zinc-600" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data início</label>
            <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Data fim</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </div>

        {tipoPDF === 'quantitativo_via' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Bairro</label>
              <select value={bairro} onChange={(e) => { setBairro(e.target.value); setVia('') }} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Selecione</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Via</label>
              <select value={via} onChange={(e) => setVia(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                <option value="">Selecione</option>
                {vias.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        )}

        <button onClick={handleGerar} className="px-5 py-2.5 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2">
          <FileText size={16} />
          Gerar PDF
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          {erro}
        </div>
      )}

      {resultado && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{resultado.registros} registro(s) encontrado(s).</p>
            <button onClick={handleDownload} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Download size={16} />
              Baixar relatório (.txt)
            </button>
          </div>
          <pre className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">{resultado.texto}</pre>
        </div>
      )}
    </div>
  )
}
