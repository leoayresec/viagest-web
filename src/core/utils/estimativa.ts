import type { Record as ViaGestRecord } from '../types/records'
import { toNum } from './format'

export const DMT_PADRAO_KM = 30.0
export const ESPESSURA_DEMOLICAO_CALCADA_M = 0.06
export const DECLIVIDADE_ESCAVACAO_VALAS = 0.05

export interface PrecoItem {
  grupo: string
  item: string
  un: string
  preco: number
}

export const PRECOS_ORCAMENTO: Record<string, PrecoItem> = {
  '2.1': { grupo: 'Drenagem', item: 'Escavação mecanizada de valas', un: 'm³', preco: 17.05 },
  '2.2': { grupo: 'Drenagem', item: 'Escavação manual de vala', un: 'm³', preco: 123.34 },
  '2.3': { grupo: 'Drenagem', item: 'Escoramento de valas', un: 'm²', preco: 54.54 },
  '2.4': { grupo: 'Drenagem', item: 'Esgotamento com motobomba', un: 'h', preco: 28.88 },
  '2.5': { grupo: 'Drenagem', item: 'Colchão de areia / lastro de vala', un: 'm³', preco: 301.27 },
  '2.6.1': { grupo: 'Drenagem', item: 'Tubo concreto DN 400', un: 'm', preco: 216.61 },
  '2.6.2': { grupo: 'Drenagem', item: 'Tubo concreto DN 500', un: 'm', preco: 262.69 },
  '2.6.3': { grupo: 'Drenagem', item: 'Tubo concreto DN 600', un: 'm', preco: 396.94 },
  '2.6.4': { grupo: 'Drenagem', item: 'Tubo concreto DN 800', un: 'm', preco: 644.57 },
  '2.6.5': { grupo: 'Drenagem', item: 'Tubo concreto DN 1000', un: 'm', preco: 786.24 },
  '2.6.6': { grupo: 'Drenagem', item: 'Tubo concreto DN 1200', un: 'm', preco: 1142.24 },
  '2.7': { grupo: 'Drenagem', item: 'Reaterro de valas compactado', un: 'm³', preco: 81.31 },
  '2.8': { grupo: 'Drenagem', item: 'Transporte caminhão basculante - DMT 30 km', un: 'm³xkm', preco: 3.27 },
  '2.10.1': { grupo: 'PV / BL', item: 'Tampa PV - tamanho menor', un: 'un', preco: 965.98 },
  '2.10.2': { grupo: 'PV / BL', item: 'Tampa PV - tamanho médio', un: 'un', preco: 1318.79 },
  '2.10.3': { grupo: 'PV / BL', item: 'Tampa PV - tamanho maior', un: 'un', preco: 1485.58 },
  '2.10.4': { grupo: 'PV / BL', item: 'Tampa Boca de Lobo', un: 'un', preco: 834.76 },
  '2.11.1': { grupo: 'PV / BL', item: 'PV alvenaria/bloco - tamanho menor', un: 'un', preco: 4266.67 },
  '2.11.2': { grupo: 'PV / BL', item: 'PV alvenaria/bloco - tamanho médio', un: 'un', preco: 6472.28 },
  '2.11.3': { grupo: 'PV / BL', item: 'PV alvenaria/bloco - tamanho maior', un: 'un', preco: 9733.01 },
  '2.11.4': { grupo: 'PV / BL', item: 'Boca de lobo', un: 'un', preco: 2699.85 },
  '2.12': { grupo: 'PV / BL', item: 'Tampão em concreto armado D=70cm', un: 'un', preco: 215.19 },
  '2.14': { grupo: 'Drenagem', item: 'Carga e transporte para bota-fora', un: 'm³xkm', preco: 5.26 },
  '3.1.1': { grupo: 'Limpeza', item: 'Limpeza/regularização de subleito', un: 'm²', preco: 2.13 },
  '3.1.2': { grupo: 'Terraplenagem', item: 'Carga, manobra e descarga', un: 'm³', preco: 11.52 },
  '3.1.3': { grupo: 'Terraplenagem', item: 'Transporte caminhão basculante - DMT 30 km', un: 'm³xkm', preco: 3.27 },
  '3.2.1': { grupo: 'Pavimentação', item: 'Base/Sub-base BGS ou seixo', un: 'm³', preco: 446.30 },
  '3.2.2': { grupo: 'Pavimentação', item: 'Execução da imprimação / Binder', un: 'm²', preco: 10.08 },
  '3.2.3': { grupo: 'Pavimentação', item: 'Pintura de ligação RR-2C', un: 'm²', preco: 3.51 },
  '3.2.4': { grupo: 'Pavimentação', item: 'CBUQ', un: 't', preco: 1524.86 },
  '3.2.5': { grupo: 'Pavimentação', item: 'Transporte CBUQ - DMT 30 km', un: 'txkm', preco: 2.19 },
  '4.1.1': { grupo: 'Recuperação de Vias', item: 'Fresagem de pavimento asfáltico (esp. até 10cm)', un: 'm³', preco: 181.64 },
  '4.1.2': { grupo: 'Recuperação de Vias', item: 'Carga, manobra e descarga - fresagem', un: 'm³', preco: 11.52 },
  '4.1.3': { grupo: 'Recuperação de Vias', item: 'Transporte de material fresado - DMT 30 km', un: 'm³xkm', preco: 3.27 },
  '4.1.4': { grupo: 'Recuperação de Vias', item: 'Remendo profundo / tapa buraco em CBUQ', un: 't', preco: 1437.62 },
  '4.1.5': { grupo: 'Recuperação de Vias', item: 'Transporte remendo profundo - DMT 30 km', un: 'txkm', preco: 2.19 },
  '4.1.6': { grupo: 'Recuperação de Vias', item: 'Pintura de ligação RR-2C', un: 'm²', preco: 3.51 },
  '4.1.7': { grupo: 'Recuperação de Vias', item: 'CBUQ recuperação/recapeamento', un: 't', preco: 1524.86 },
  '4.1.8': { grupo: 'Recuperação de Vias', item: 'Transporte CBUQ recuperação - DMT 30 km', un: 'txkm', preco: 2.19 },
  '6.1.1': { grupo: 'Urbanização', item: 'Demolição de piso/calçada/meio-fio/linha d\'água', un: 'm²', preco: 28.57 },
  '6.1.2': { grupo: 'Urbanização', item: 'Carga, manobra e descarga de demolição', un: 'm³', preco: 11.52 },
  '6.1.3': { grupo: 'Urbanização', item: 'Transporte de demolição - DMT 30 km', un: 'm³xkm', preco: 3.27 },
  '6.1.4': { grupo: 'Urbanização', item: 'Confecção de calçada em concreto', un: 'm²', preco: 93.78 },
  '6.1.5': { grupo: 'Urbanização', item: 'Construção de meio-fio', un: 'm', preco: 62.65 },
  '6.1.6': { grupo: 'Urbanização', item: 'Construção de linha d\'água / sarjeta', un: 'm', preco: 16.64 },
}

function codigoTuboDrenagem(diametro: string): string | undefined {
  const mapa: Record<string, string> = {
    '400': '2.6.1', '500': '2.6.2', '600': '2.6.3',
    '800': '2.6.4', '1000': '2.6.5', '1200': '2.6.6',
  }
  return mapa[diametro.replace(/[.,]/g, '')]
}

function codigoPV(tamanho: string): string | undefined {
  const t = String(tamanho || '').toLowerCase().replace(',', '.')
  if (!t || t.includes('outro') || t.includes('personalizado')) return
  if (t.includes('1.80') || t.includes('1.8')) return '2.11.3'
  if (t.includes('1.60') || t.includes('1.6') || t.includes('1.50') || t.includes('1.5')) return '2.11.2'
  if (t.includes('1.40') || t.includes('1.4')) return '2.11.1'
}

function horaParaDecimal(valor: unknown): number {
  const txt = String(valor || '').toLowerCase().replace('h', '')
  if (txt.includes(':')) {
    const [h, m] = txt.split(':')
    return toNum(h) + toNum(m) / 60
  }
  return toNum(txt)
}

export interface LinhaCusto {
  Tipo: string
  Grupo: string
  Item: string
  Código: string
  Unidade: string
  Quantidade: number
  'Preço unitário': number
  Total: number
  Origem: string
  Cálculo: string
}

export function estimativaCustosOperacionais(records: ViaGestRecord[]): { linhas: LinhaCusto[]; total: number } {
  const acumulado = new Map<string, LinhaCusto & { OrigemSet: Set<string> }>()

  function add(codigo: string, quantidade: number, origem: string, tipoCalculo: string, formula: string) {
    quantidade = toNum(quantidade)
    if (quantidade <= 0) return
    const info = PRECOS_ORCAMENTO[codigo]
    if (!info) return
    const chave = `${codigo}||${tipoCalculo}||${formula || origem}`
    if (acumulado.has(chave)) {
      const item = acumulado.get(chave)!
      item.Quantidade += quantidade
      item.Total += quantidade * info.preco
      if (origem) item.OrigemSet.add(origem)
    } else {
      acumulado.set(chave, {
        Tipo: tipoCalculo,
        Grupo: info.grupo,
        Item: info.item,
        Código: codigo,
        Unidade: info.un,
        Quantidade: quantidade,
        'Preço unitário': info.preco,
        Total: quantidade * info.preco,
        Origem: origem,
        OrigemSet: new Set(origem ? [origem] : []),
        Cálculo: formula || origem || 'Produção lançada',
      })
    }
  }

  function totalCodigo(codigo: string): number {
    let total = 0
    for (const item of acumulado.values()) {
      if (item.Código === codigo) total += item.Quantidade
    }
    return total
  }

  for (const r of records) {
    const t = r.tipo
    const d = r.data

    if (t === 'redes_auxiliares') continue
    if (t === 'rede_domiciliar') continue

    if (t === 'escavacao') {
      const vol = toNum(d.drenagens?.[0]?.escProf ? toNum(d.drenagens[0].escComp) * toNum(d.drenagens[0].escLarg) * toNum(d.drenagens[0].escProf) : 0)
      const c = toNum(d.drenagens?.[0]?.escComp)
      const l = toNum(d.drenagens?.[0]?.escLarg)
      const a = toNum(d.drenagens?.[0]?.escProf)
      const volDecliv = c * a * DECLIVIDADE_ESCAVACAO_VALAS
      add('2.1', vol + volDecliv, 'Escavação drenagem', 'Direto', 'Volume lançado + declividade 5%')
      const volManual = c * l * 0.10
      const volManualDecliv = c * 0.10 * DECLIVIDADE_ESCAVACAO_VALAS
      add('2.2', volManual + volManualDecliv, 'Escavação drenagem', 'Derivado', 'Comprimento x largura x 0,10 + declividade')
      add('2.3', c * a * 2 * 0.20, 'Escavação drenagem', 'Derivado', 'Comprimento x profundidade x 2 faces x 20%')
    }

    if (t === 'motor') {
      const horas = horaParaDecimal(d.motorbombaMin ? d.motorbombaMin / 60 : 0)
      add('2.4', horas, 'Motorbomba', 'Direto', 'Horas decimais lançadas')
    }

    if (t === 'colchao_areia') {
      const vol = toNum(d.drenagens?.[0]?.colProf ? toNum(d.drenagens[0].colComp) * toNum(d.drenagens[0].colLarg) * toNum(d.drenagens[0].colProf) : 0)
      add('2.5', vol, 'Colchão de areia drenagem', 'Direto', 'Volume lançado')
    }

    if (t === 'tubo') {
      const codigo = codigoTuboDrenagem(String(d.drenagens?.[0]?.diam || '400'))
      const qtd = toNum(d.drenagens?.[0]?.tuboQtd)
      if (codigo) add(codigo, qtd, `Tubo DN ${d.drenagens?.[0]?.diam}`, 'Direto', 'Comprimento/quantidade em metros')
    }

    if (t === 'aterro') {
      const vol = toNum(d.drenagens?.[0]?.aterroProf ? toNum(d.drenagens[0].aterroComp) * toNum(d.drenagens[0].aterroLarg) * toNum(d.drenagens[0].aterroProf) : 0)
      const c = toNum(d.drenagens?.[0]?.aterroComp)
      const a = toNum(d.drenagens?.[0]?.aterroProf)
      const volDecliv = c * a * DECLIVIDADE_ESCAVACAO_VALAS
      const vol27 = vol + volDecliv
      add('2.7', vol27, 'Aterro/Reaterro drenagem', 'Direto', 'Volume reaterrado + declividade')
      add('2.8', vol27 * DMT_PADRAO_KM * 1.25, 'Transporte do reaterro', 'Derivado', 'Volume do item 2.7 x DMT x empolamento 25%')
    }

    if (t === 'pv') {
      const status = String(d.pvs?.[0]?.status || '').toUpperCase()
      if (status !== 'FINALIZADO') continue
      const tam = String(d.pvs?.[0]?.tam || '')
      const qtd = toNum(d.pvs?.length || 1)
      const codPV = codigoPV(tam)
      if (!codPV) continue
      add(codPV, qtd, 'PV', 'Direto', 'Quantidade lançada')
      const mapaTampas: Record<string, string> = { '2.11.1': '2.10.1', '2.11.2': '2.10.2', '2.11.3': '2.10.3' }
      const codTampa = mapaTampas[codPV]
      if (codTampa) add(codTampa, qtd, 'Tampa PV', 'Derivado', '1 tampa por PV')
    }

    if (t === 'bl') {
      const status = String(d.bls?.[0]?.status || '').toUpperCase()
      if (status !== 'FINALIZADO') continue
      const qtd = toNum(d.bls?.[0]?.qtd || 1)
      add('2.11.4', qtd, 'Boca de lobo', 'Direto', 'Quantidade lançada')
      add('2.10.4', qtd, 'Tampa BL', 'Derivado', '1 tampa por BL')
    }

    if (t === 'tampao_70') {
      add('2.12', toNum(d.tampao70Qtd), 'Tampão Ø70cm', 'Direto', 'Quantidade lançada')
    }

    if (t === 'fresagem') {
      const vol = (d.fresagemTrechos || []).reduce((s, tr) => s + toNum(tr.area ? toNum(tr.area) * toNum(tr.esp || 0.1) : toNum(tr.comp) * toNum(tr.larg) * toNum(tr.esp || 0.1)), 0)
      add('4.1.1', vol, 'Fresagem', 'Direto', 'Volume lançado')
      add('4.1.2', vol, 'Carga fresagem', 'Derivado', 'Volume fresado')
      add('4.1.3', vol * DMT_PADRAO_KM, 'Transporte fresagem', 'Derivado', 'Volume fresado x DMT')
    }

    if (t === 'remendo_profundo') {
      const ton = (d.remendoTrechos || []).reduce((s, tr) => s + toNum(tr.ton), 0)
      add('4.1.4', ton, 'Remendo profundo', 'Direto', 'Peso lançado')
      add('4.1.5', ton * DMT_PADRAO_KM, 'Transporte remendo profundo', 'Derivado', 'Toneladas x DMT')
    }

    if (t === 'terrap') {
      const c = toNum(d.terrapComp)
      const l = toNum(d.terrapLarg)
      const vol = c * l * toNum(d.terrapProf || 0.2)
      const area = c * l
      add('3.1.1', area, 'Limpeza/regularização pela terraplenagem', 'Derivado', 'Área da terraplenagem')
      add('3.1.2', vol, 'Terraplenagem', 'Direto', 'Volume lançado')
      add('3.1.3', vol * DMT_PADRAO_KM * 1.25, 'Terraplenagem', 'Derivado', 'Volume lançado x DMT padrão x empolamento 25%')
    }

    if (t === 'subbase') {
      const vol = (d.pavSubbase || []).reduce((s, tr) => s + toNum(tr.area ? toNum(tr.area) * toNum(tr.esp || 0.1) : toNum(tr.comp) * toNum(tr.larg) * toNum(tr.esp || 0.1)), 0)
      add('3.2.1', vol, 'Base/Sub-base', 'Direto', 'Volume lançado')
    }

    if (t === 'binder') {
      const area = (d.pavBinder || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
      add('3.2.2', area, 'Execução da imprimação / Binder', 'Direto', 'Área lançada')
    }

    if (t === 'pintura_ligacao') {
      const area = (d.pavPintura || []).reduce((s, tr) => s + toNum(tr.area || (toNum(tr.comp) * toNum(tr.larg))), 0)
      add('3.2.3', area, 'Pintura de ligação', 'Direto', 'Área lançada')
    }

    if (t === 'cbuq') {
      const ton = (d.pavCbuq || []).reduce((s, tr) => s + toNum(tr.ton), 0)
      add('3.2.4', ton, 'CBUQ', 'Direto', 'Toneladas lançadas')
      add('3.2.5', ton * DMT_PADRAO_KM, 'CBUQ', 'Derivado', 'Toneladas x DMT padrão')
    }

    if (t === 'demolicao_calcada' || t === 'demolicao_linha_agua') {
      let area = toNum(d.demolicaoCalcada || d.demolicaoLinhaAgua)
      if (area <= 0) area = 0
      add('6.1.1', area, 'Demolição urbanização', 'Direto', 'Área demolida')
      const volDemo = area * ESPESSURA_DEMOLICAO_CALCADA_M
      add('6.1.2', volDemo, 'Demolição urbanização', 'Derivado', 'Área demolida x espessura 0,06')
      add('6.1.3', volDemo * DMT_PADRAO_KM * 1.25, 'Demolição urbanização', 'Derivado', 'Volume x DMT x empolamento 25%')
    }

    if (t === 'urb') {
      const dir = d.urbDireito; const esq = d.urbEsquerdo
      add('6.1.5', toNum(dir?.meioFio) + toNum(esq?.meioFio), 'Meio-fio', 'Direto', 'Comprimento lançado')
      add('6.1.4', toNum(dir?.calcada) + toNum(esq?.calcada), 'Calçada', 'Direto', 'Área lançada')
    }

    if (t === 'linha_agua') {
      add('6.1.6', toNum(d.demolicaoLinhaAgua), 'Linha d\'água / Sarjeta', 'Direto', 'Comprimento lançado')
    }

    if (t === 'espinha_bl') {
      for (const esp of d.espinhas || []) {
        const sub = String(esp.referencia || 'tubo').toLowerCase()
        if (sub.includes('escav') || sub === 'escavacao') {
          const c = toNum(esp.escC); const l = toNum(esp.escL); const a = toNum(esp.escA)
          const vol = c * l * a
          add('2.1', vol + (c * a * DECLIVIDADE_ESCAVACAO_VALAS), 'Espinha BL - escavação', 'Direto', 'Volume lançado + declividade')
          add('2.2', (c * l * 0.10) + (c * 0.10 * DECLIVIDADE_ESCAVACAO_VALAS), 'Espinha BL - escavação manual', 'Derivado', 'C x L x 0,10 + declividade')
          add('2.3', c * a * 2 * 0.20, 'Espinha BL - escoramento', 'Derivado', 'C x prof x 2 faces x 20%')
        }
        if (sub.includes('colch')) {
          const vol = toNum(esp.colC) * toNum(esp.colL) * toNum(esp.colA)
          add('2.5', vol, 'Espinha BL - colchão', 'Direto', 'Volume lançado')
        }
        if (sub.includes('tubo') || sub.includes('diam')) {
          const qtd = toNum(esp.tuboM)
          const diam = String(esp.diam || '400').replace(/[.,]/g, '') || '400'
          const cod = codigoTuboDrenagem(diam)
          if (cod) add(cod, qtd, `Espinha BL - tubo DN ${diam}`, 'Direto', 'Comprimento em metros')
        }
        if (sub.includes('aterr') || sub.includes('reaterr')) {
          const c = toNum(esp.aterroC); const a = toNum(esp.aterroA); const vol = toNum(esp.aterroC) * toNum(esp.aterroL) * toNum(esp.aterroA)
          const vol27 = vol + (c * a * DECLIVIDADE_ESCAVACAO_VALAS)
          add('2.7', vol27, 'Espinha BL - aterro', 'Direto', 'Volume reaterrado + declividade')
          add('2.8', vol27 * DMT_PADRAO_KM * 1.25, 'Espinha BL - transporte reaterro', 'Derivado', 'Volume do item 2.7 x DMT x empolamento 25%')
        }
      }
    }
  }

  const volBotaFora = totalCodigo('2.1') + totalCodigo('2.2')
  add('2.14', volBotaFora * DMT_PADRAO_KM, 'Bota-fora', 'Derivado', 'Escavação mecanizada + manual x DMT')

  const linhas: LinhaCusto[] = Array.from(acumulado.values()).map((item) => ({
    ...item,
    Origem: Array.from(item.OrigemSet).sort().join(', '),
  }))
  linhas.sort((a, b) => {
    if (a.Tipo !== b.Tipo) return a.Tipo.localeCompare(b.Tipo)
    if (a.Grupo !== b.Grupo) return a.Grupo.localeCompare(b.Grupo)
    return a.Código.localeCompare(b.Código)
  })
  const total = linhas.reduce((s, l) => s + l.Total, 0)
  return { linhas, total }
}
