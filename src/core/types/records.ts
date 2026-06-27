export type ServiceType =
  | 'limpeza' | 'obs_limpeza'
  | 'escavacao' | 'colchao_areia' | 'tubo' | 'manta_bidim' | 'aterro' | 'obs_drenagem' | 'motor'
  | 'pv' | 'bl' | 'obs_pvbl' | 'espinha_bl'
  | 'terrap' | 'obs_terrap'
  | 'subbase' | 'cbuq' | 'binder' | 'pintura_ligacao' | 'obs_pav'
  | 'tampao_70' | 'fresagem' | 'remendo_profundo' | 'obs_recuperacao'
  | 'demolicao_calcada' | 'demolicao_meiofio' | 'colchao_areia_meiofio'
  | 'demolicao_linha_agua' | 'linha_agua' | 'urb' | 'obs_urb' | 'urb_controle'
  | 'redes_auxiliares' | 'rede_domiciliar' | 'info_adicionais'

export interface DrenagemItem {
  escComp?: number; escLarg?: number; escProf?: number
  colComp?: number; colLarg?: number; colProf?: number
  tuboQtd?: number; diam?: string
  bidimComp?: number; bidimLarg?: number
  aterroComp?: number; aterroLarg?: number; aterroProf?: number
  obs?: string
}

export interface EspinhaBL {
  referencia?: string
  escC?: number; escL?: number; escA?: number
  colC?: number; colL?: number; colA?: number
  diam?: string; tuboM?: number
  aterroC?: number; aterroL?: number; aterroA?: number
}

export interface PavTrecho {
  comp?: number; larg?: number; esp?: number; area?: number; ton?: number
}

export interface UrbanizacaoLado {
  calcada?: number; meioFio?: number; linhaAgua?: number
}

export interface RedeAuxTubo {
  diam?: string; comp?: number
}

export interface RedeAuxCaixa {
  qtd?: number; tam?: string; status?: string
}

export interface RedeAuxiliar {
  escComp?: number; escLarg?: number; escProf?: number
  colComp?: number; colLarg?: number; colEsp?: number
  tubos?: RedeAuxTubo[]
  reatComp?: number; reatLarg?: number; reatProf?: number
  caixas?: RedeAuxCaixa[]
  obs?: string
}

export interface RecordData {
  limpezaComp?: number; limpezaLarg?: number; obsLimpeza?: string
  drenagens?: DrenagemItem[]
  motorbombaMin?: number; obsMotorbomba?: string
  pvs?: { num?: string; tam?: string; status?: string }[]
  bls?: { qtd?: number; status?: string }[]
  espinhas?: EspinhaBL[]
  tampao70Qtd?: number
  obsPvbl?: string
  terrapComp?: number; terrapLarg?: number; terrapProf?: number; obsTerrap?: string
  pavSubbase?: PavTrecho[]
  pavCbuq?: PavTrecho[]
  pavBinder?: PavTrecho[]
  pavPintura?: PavTrecho[]
  obsPav?: string
  demolicaoCalcada?: number; demolicaoMeiofio?: number; demolicaoLinhaAgua?: number
  urbDireito?: UrbanizacaoLado; urbEsquerdo?: UrbanizacaoLado
  obsUrb?: string
  fresagemTrechos?: PavTrecho[]
  remendoTrechos?: PavTrecho[]
  obsRecuperacao?: string
  redesAux?: RedeAuxiliar[]
  redeDomiciliarQtd?: number
  infoAdicionais?: string
}

export interface ViaGestRecord {
  id: string
  date: string
  serviceType: string
  data: Record<string, any>
  createdAt: string
  roadId: string | null
  supervisorId: string | null
  recorderId: string | null
  userId?: string | null
  road?: {
    id: string; name: string
    neighborhood?: {
      id: string; name: string
      city?: { id: string; name: string; state?: { id: string; name: string; code: string } }
    }
  } | null
  supervisor?: { id: string; name: string; role: string } | null
  recorder?: { id: string; name: string; role: string } | null
  user?: { id: string; name: string } | null
}

export interface Via {
  bairro: string
  nome: string
  extensaoM?: number
  larguraM?: number
  status: 'ativa' | 'em_andamento' | 'encerrada' | 'arquivada'
}

export interface TeamMember {
  nome: string
  funcao: 'encarregado' | 'apontador'
}

export function getRecordNeighborhood(r: ViaGestRecord): string {
  return r.road?.neighborhood?.name ?? ''
}

export function getRecordRoadName(r: ViaGestRecord): string {
  return r.road?.name ?? ''
}

export function getRecordCity(r: ViaGestRecord): string {
  return r.road?.neighborhood?.city?.name ?? ''
}

export function getRecordState(r: ViaGestRecord): string {
  return r.road?.neighborhood?.city?.state?.code ?? ''
}

export function getRecordSupervisorName(r: ViaGestRecord): string {
  return r.supervisor?.name ?? ''
}

export function getRecordRecorderName(r: ViaGestRecord): string {
  return r.recorder?.name ?? ''
}

export function getRecordFullLocation(r: ViaGestRecord): string {
  const parts: string[] = []
  const bairro = getRecordNeighborhood(r)
  const via = getRecordRoadName(r)
  const cidade = getRecordCity(r)
  if (cidade) parts.push(cidade)
  if (bairro) parts.push(bairro)
  if (via) parts.push(via)
  return parts.join(' / ')
}
