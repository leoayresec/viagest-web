import type { Record as ViaGestRecord } from '../types/records'

export const TIPO_LABELS: Record<string, string> = {
  escavacao: 'Escavação',
  colchao_areia: 'Colchão de Areia',
  tubo: 'Tubo',
  aterro: 'Aterro',
  motor: 'Motorbomba',
  pv: 'PV',
  bl: 'BL',
  obs_pvbl: 'Informações da Via',
  limpeza: 'Limpeza mecanizada',
  terrap: 'Terraplenagem',
  subbase: 'Sub-base',
  cbuq: 'CBUQ',
  binder: 'Binder',
  pintura_ligacao: 'Pintura de Ligação',
  tampao_70: 'Tampão Ø70cm',
  fresagem: 'Fresagem',
  remendo_profundo: 'Remendo profundo',
  demolicao_calcada: 'Demolição de calçada',
  demolicao_meiofio: 'Demolição de meio-fio',
  colchao_areia_meiofio: 'Colchão de areia de meio-fio',
  demolicao_linha_agua: 'Demolição de linha d\'água',
  linha_agua: 'Linha d\'água / Sarjeta',
  urb: 'Concretagem de calçada / meio-fio',
  urb_controle: 'Controle de urbanização',
  espinha_bl: 'Espinha BL',
  manta_bidim: 'Manta Bidim',
  redes_auxiliares: 'Redes auxiliares',
  rede_domiciliar: 'Rede domiciliar',
  info_adicionais: 'Informações adicionais',
  obs_limpeza: 'Observação limpeza',
  obs_drenagem: 'Observação drenagem',
  obs_terrap: 'Observação terraplenagem',
  obs_pav: 'Observação pavimentação',
  obs_urb: 'Observação urbanização',
  obs_recuperacao: 'Observação recuperação',
}

export function labelTipo(tipo: string): string {
  return TIPO_LABELS[tipo] || tipo.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function fmtNum(valor: number | string | undefined | null, unidade = ''): string {
  const n = toNum(valor)
  const partes = n.toFixed(2).split('.')
  const intPart = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const txt = `${intPart},${partes[1]}`
  return `${txt} ${unidade}`.trim()
}

export function fmtMoeda(valor: number | string | undefined | null): string {
  const txt = fmtNum(valor)
  return `R$ ${txt}`.trim()
}

export function toNum(valor: unknown): number {
  if (valor === null || valor === undefined || valor === '') return 0
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor
  const str = String(valor).replace(',', '.').replace(/[^0-9.\-]/g, '')
  const n = parseFloat(str)
  return isNaN(n) ? 0 : n
}

export function dataSql(data: Date | string): string {
  if (typeof data === 'string' && data.includes('-')) return data.slice(0, 10)
  const d = typeof data === 'string' ? new Date(data) : data
  return d.toISOString().slice(0, 10)
}

export function dataBr(data: string): string {
  if (!data) return ''
  if (data.includes('/')) return data
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export function parseDateBr(data: string): string {
  if (!data) return ''
  if (data.includes('-')) return data.slice(0, 10)
  const [dia, mes, ano] = data.split('/')
  return `${ano}-${mes}-${dia}`
}

export interface MetricasOperacionais {
  registros: number
  vias: number
  bairros: number
  apontadores: number
  escavacao_m3: number
  colchao_m3: number
  aterro_m3: number
  terraplenagem_m3: number
  tubos_drenagem_un: number
  manta_m2: number
  pv_un: number
  bl_un: number
  subbase_m2: number
  cbuq_m2: number
  cbuq_t: number
  binder_m2: number
  pintura_m2: number
  tampao70_un: number
  fresagem_m3: number
  remendo_t: number
  meio_fio_m: number
  linha_agua_m: number
  calcada_m2: number
  limpeza_m2: number
  caixa_inspecao_un: number
  pvc_por_diametro: Record<string, number>
}

export function metricasOperacionais(records: ViaGestRecord[]): MetricasOperacionais {
  const vias = new Set<string>()
  const bairros = new Set<string>()
  const apontadores = new Set<string>()
  for (const r of records) {
    if (r.bairro && r.via) vias.add(`${r.bairro}||${r.via}`)
    if (r.bairro) bairros.add(r.bairro)
    if (r.apontador) apontadores.add(r.apontador)
  }

  const m: MetricasOperacionais = {
    registros: records.length,
    vias: vias.size,
    bairros: bairros.size,
    apontadores: apontadores.size,
    escavacao_m3: 0, colchao_m3: 0, aterro_m3: 0, terraplenagem_m3: 0,
    tubos_drenagem_un: 0, manta_m2: 0, pv_un: 0, bl_un: 0,
    subbase_m2: 0, cbuq_m2: 0, cbuq_t: 0, binder_m2: 0, pintura_m2: 0,
    tampao70_un: 0, fresagem_m3: 0, remendo_t: 0,
    meio_fio_m: 0, linha_agua_m: 0, calcada_m2: 0, limpeza_m2: 0,
    caixa_inspecao_un: 0, pvc_por_diametro: {},
  }

  for (const r of records) {
    const t = r.tipo
    const d = r.data
    if (t === 'escavacao') m.escavacao_m3 += toNum(d.drenagens?.[0]?.escProf ? (toNum(d.drenagens[0].escComp) * toNum(d.drenagens[0].escLarg) * toNum(d.drenagens[0].escProf)) : 0)
    if (t === 'colchao_areia') m.colchao_m3 += toNum(d.drenagens?.[0]?.colProf ? (toNum(d.drenagens[0].colComp) * toNum(d.drenagens[0].colLarg) * toNum(d.drenagens[0].colProf)) : 0)
    if (t === 'aterro') m.aterro_m3 += toNum(d.drenagens?.[0]?.aterroProf ? (toNum(d.drenagens[0].aterroComp) * toNum(d.drenagens[0].aterroLarg) * toNum(d.drenagens[0].aterroProf)) : 0)
    if (t === 'terrap') m.terraplenagem_m3 += toNum(d.terrapComp) * toNum(d.terrapLarg) * toNum(d.terrapProf || 0.2)
    if (t === 'tubo') m.tubos_drenagem_un += toNum(d.drenagens?.[0]?.tuboQtd)
    if (t === 'manta_bidim') {
      const c = toNum(d.drenagens?.[0]?.bidimComp)
      const l = toNum(d.drenagens?.[0]?.bidimLarg)
      m.manta_m2 += c * l
    }
    if (t === 'pv') m.pv_un += toNum(d.pvs?.length || 1)
    if (t === 'bl') m.bl_un += toNum(d.bls?.length || toNum(d.bls?.[0]?.qtd))
    if (t === 'subbase') m.subbase_m2 += (d.pavSubbase || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
    if (t === 'cbuq') {
      const area = (d.pavCbuq || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
      const ton = (d.pavCbuq || []).reduce((s, tr) => s + toNum(tr.ton), 0)
      m.cbuq_m2 += area
      m.cbuq_t += ton
    }
    if (t === 'binder') m.binder_m2 += (d.pavBinder || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
    if (t === 'pintura_ligacao') m.pintura_m2 += (d.pavPintura || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
    if (t === 'tampao_70') m.tampao70_un += toNum(d.tampao70Qtd)
    if (t === 'fresagem') m.fresagem_m3 += (d.fresagemTrechos || []).reduce((s, tr) => s + toNum(tr.area ? toNum(tr.area) * toNum(tr.esp || 0.1) : toNum(tr.comp) * toNum(tr.larg) * toNum(tr.esp || 0.1)), 0)
    if (t === 'remendo_profundo') m.remendo_t += (d.remendoTrechos || []).reduce((s, tr) => s + toNum(tr.ton), 0)
    if (t === 'limpeza') m.limpeza_m2 += toNum(d.limpezaComp) * toNum(d.limpezaLarg)
    if (t === 'urb') {
      const dir = d.urbDireito; const esq = d.urbEsquerdo
      m.meio_fio_m += toNum(dir?.meioFio) + toNum(esq?.meioFio)
      m.calcada_m2 += toNum(dir?.calcada) + toNum(esq?.calcada)
      m.linha_agua_m += toNum(dir?.linhaAgua) + toNum(esq?.linhaAgua)
    }
    if (t === 'demolicao_calcada') m.calcada_m2 += toNum(d.demolicaoCalcada)
    if (t === 'demolicao_meiofio') m.meio_fio_m += toNum(d.demolicaoMeiofio)
    if (t === 'linha_agua' || t === 'demolicao_linha_agua') m.linha_agua_m += toNum(d.demolicaoLinhaAgua)
    if (t === 'espinha_bl') {
      const esp = d.espinhas?.[0]
      if (esp) {
        if (toNum(esp.escC)) m.escavacao_m3 += toNum(esp.escC) * toNum(esp.escL) * toNum(esp.escA)
        if (toNum(esp.colC)) m.colchao_m3 += toNum(esp.colC) * toNum(esp.colL) * toNum(esp.colA)
        if (toNum(esp.tuboM)) m.tubos_drenagem_un += toNum(esp.tuboM)
        if (toNum(esp.aterroC)) m.aterro_m3 += toNum(esp.aterroC) * toNum(esp.aterroL) * toNum(esp.aterroA)
      }
    }
    if (t === 'redes_auxiliares') {
      for (const ra of d.redesAux || []) {
        if (toNum(ra.escProf)) m.escavacao_m3 += toNum(ra.escComp) * toNum(ra.escLarg) * toNum(ra.escProf)
        if (toNum(ra.colEsp)) m.colchao_m3 += toNum(ra.colComp) * toNum(ra.colLarg) * toNum(ra.colEsp)
        if (toNum(ra.reatProf)) m.aterro_m3 += toNum(ra.reatComp) * toNum(ra.reatLarg) * toNum(ra.reatProf)
        for (const tubo of ra.tubos || []) {
          const diam = String(tubo.diam || '').trim()
          if (diam && toNum(tubo.comp)) {
            const chave = `PVC ${diam} mm`
            m.pvc_por_diametro[chave] = (m.pvc_por_diametro[chave] || 0) + toNum(tubo.comp)
          }
        }
        for (const cx of ra.caixas || []) {
          m.caixa_inspecao_un += toNum(cx.qtd)
        }
      }
    }
  }
  return m
}

export function resumoRecord(r: ViaGestRecord, maxItens = 4): string {
  const d = r.data
  const partes: string[] = []
  if (r.tipo === 'escavacao' && d.drenagens?.[0]) {
    const dr = d.drenagens[0]
    if (toNum(dr.escComp)) partes.push(`Esc: ${fmtNum(dr.escComp, 'm')}x${fmtNum(dr.escLarg, 'm')}x${fmtNum(dr.escProf, 'm')}`)
  }
  if (r.tipo === 'tubo') {
    if (d.drenagens?.[0]?.tuboQtd) partes.push(`Tubo: ${fmtNum(d.drenagens[0].tuboQtd, 'un')}`)
    if (d.drenagens?.[0]?.diam) partes.push(`DN ${d.drenagens[0].diam}`)
  }
  if (r.tipo === 'cbuq') {
    const tot = (d.pavCbuq || []).reduce((s, t) => s + toNum(t.ton), 0)
    if (tot) partes.push(`CBUQ: ${fmtNum(tot, 't')}`)
  }
  if (r.tipo === 'terrap' && toNum(d.terrapComp)) {
    partes.push(`Terraplenagem: ${fmtNum(d.terrapComp, 'm')}x${fmtNum(d.terrapLarg, 'm')}`)
  }
  if (r.tipo === 'limpeza' && toNum(d.limpezaComp)) {
    partes.push(`Limpeza: ${fmtNum(d.limpezaComp, 'm')}x${fmtNum(d.limpezaLarg, 'm')}`)
  }
  return partes.length ? partes.slice(0, maxItens).join(' | ') : 'Sem medidas detalhadas'
}
