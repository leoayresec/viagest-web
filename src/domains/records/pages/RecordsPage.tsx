import { useState } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { useRecordsStore, type NewRecord } from '../stores/records.store'
import type { DrenagemItem, EspinhaBL, PavTrecho, RedeAuxiliar, UrbanizacaoLado } from '../../../core/types/records'

function toFloat(v: string): number | undefined {
  const s = v.replace(',', '.').trim()
  if (!s) return undefined
  const n = parseFloat(s)
  return isNaN(n) ? undefined : n
}

function fmt(v: number | undefined): string {
  if (v == null || v <= 0) return ''
  return v.toFixed(2).replace('.', ',')
}

function positivo(v: number | undefined): boolean {
  return v != null && v > 0
}

const DIAM_EXTERNO: Record<string, number> = {
  '400': 0.5188, '500': 0.6739, '600': 0.7487, '800': 0.9677,
  '1000': 1.2128, '1200': 1.42, '1500': 1.70,
}

function tuboVol(diam: string | undefined, comp: number): number {
  if (!diam || !DIAM_EXTERNO[diam]) return 0
  return Math.PI * Math.pow(DIAM_EXTERNO[diam] / 2, 2) * comp
}

export function RecordsPage() {
  const user = useAuthStore((s) => s.user)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { listarBairros, listarVias, listarViasAtivas, listarEquipe, salvarVia, salvarMembro } = useSettingsStore()
  const addBatch = useRecordsStore((s) => s.addBatch)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [bairro, setBairro] = useState('')
  const [via, setVia] = useState('')
  const [encarregado, setEncarregado] = useState('')
  const [apontador, setApontador] = useState(user?.name || '')
  const [msg, setMsg] = useState('')

  const [novoBairro, setNovoBairro] = useState('')
  const [novaVia, setNovaVia] = useState('')
  const [novoEnc, setNovoEnc] = useState('')

  const [limpezaComp, setLimpezaComp] = useState('')
  const [limpezaLarg, setLimpezaLarg] = useState('')
  const [obsLimpeza, setObsLimpeza] = useState('')

  const [qtdDren, setQtdDren] = useState(1)
  const [drenagens, setDrenagens] = useState<DrenagemItem[]>(() => Array.from({ length: 1 }, () => ({})))

  function atualizarDren(n: number, campo: string, valor: any) {
    const nova = [...drenagens]
    nova[n] = { ...nova[n], [campo]: valor }
    setDrenagens(nova)
  }

  function sincronizarDren(n: number) {
    const d = drenagens[n]
    if (!d?.escComp && !d?.escLarg && !d?.escProf) return
    const nova = [...drenagens]
    if (d.escComp && !d.colComp) nova[n] = { ...nova[n], colComp: d.escComp }
    if (d.escLarg && !d.colLarg) nova[n] = { ...nova[n], colLarg: d.escLarg }
    if (d.escComp && !d.aterroComp) nova[n] = { ...nova[n], aterroComp: d.escComp }
    if (d.escLarg && !d.aterroLarg) nova[n] = { ...nova[n], aterroLarg: d.escLarg }
    if (d.escProf && !d.aterroProf) nova[n] = { ...nova[n], aterroProf: d.escProf }
    if (!nova[n].colProf) nova[n] = { ...nova[n], colProf: 0.10 }
    setDrenagens(nova)
  }

  const [motorMin, setMotorMin] = useState('')
  const [obsMotor, setObsMotor] = useState('')

  const [qtdPV, setQtdPV] = useState(1)
  const [pvs, setPvs] = useState<{ num: string; tam: string; status: string }[]>(() => Array.from({ length: 1 }, () => ({ num: '', tam: '', status: '' })))
  const [qtdBL, setQtdBL] = useState(1)
  const [bls, setBls] = useState<{ qtd: string; status: string }[]>(() => Array.from({ length: 1 }, () => ({ qtd: '', status: '' })))
  const [tampao70, setTampao70] = useState('')
  const [obsPvbl, setObsPvbl] = useState('')

  const [qtdEsp, setQtdEsp] = useState(1)
  const [espinhas, setEspinhas] = useState<EspinhaBL[]>(() => Array.from({ length: 1 }, () => ({})))

  const [terrapComp, setTerrapComp] = useState('')
  const [terrapLarg, setTerrapLarg] = useState('')
  const [terrapProf, setTerrapProf] = useState('0,20')
  const [obsTerrap, setObsTerrap] = useState('')

  const [subbaseTrechos, setSubbaseTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [cbuqTrechos, setCbuqTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [binderTrechos, setBinderTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [pinturaTrechos, setPinturaTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [obsPav, setObsPav] = useState('')

  const [demCalcada, setDemCalcada] = useState('')
  const [demMeiofio, setDemMeiofio] = useState('')
  const [demLinhaAgua, setDemLinhaAgua] = useState('')
  const [urbDireito, setUrbDireito] = useState<UrbanizacaoLado>({})
  const [urbEsquerdo, setUrbEsquerdo] = useState<UrbanizacaoLado>({})
  const [obsUrb, setObsUrb] = useState('')

  const [fresagemTrechos, setFresagemTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [remendoTrechos, setRemendoTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [obsRecup, setObsRecup] = useState('')

  const [qtdRA, setQtdRA] = useState(1)
  const [redesAux, setRedesAux] = useState<RedeAuxiliar[]>(() => Array.from({ length: 1 }, () => ({})))

  const [redeDomItems, setRedeDomItems] = useState<{ tipo: string; material: string; qtd: string; unidade: string; obs: string }[]>(() => Array.from({ length: 1 }, () => ({ tipo: '', material: '', qtd: '', unidade: 'un', obs: '' })))

  const [infoAdic, setInfoAdic] = useState('')

  const bairros = listarBairros()
  const viasDisponiveis = !hasPermission('settings:write') ? listarViasAtivas(bairro) : listarVias(bairro)
  const encarregados = listarEquipe('encarregado')
  const apontadores = listarEquipe('apontador')

  function handleAddBairro() {
    if (novoBairro.trim()) {
      salvarVia(novoBairro.trim(), '_placeholder_')
      setBairro(novoBairro.trim())
      setNovoBairro('')
    }
  }

  function handleAddVia() {
    if (bairro && novaVia.trim()) {
      salvarVia(bairro, novaVia.trim())
      setVia(novaVia.trim())
      setNovaVia('')
    }
  }

  function handleAddEnc() {
    if (novoEnc.trim()) {
      salvarMembro(novoEnc.trim(), 'encarregado')
      setEncarregado(novoEnc.trim())
      setNovoEnc('')
    }
  }

  function atualizarTrecho(arr: PavTrecho[], setter: any, n: number, campo: string, valor: any) {
    const nova = [...arr]
    nova[n] = { ...nova[n], [campo]: valor }
    if (campo === 'comp' || campo === 'larg') {
      const c = toFloat(String(nova[n].comp ?? ''))
      const l = toFloat(String(nova[n].larg ?? ''))
      if (c && l) nova[n].area = c * l
    }
    if (campo === 'ton') {
      const c = toFloat(String(nova[n].comp ?? ''))
      const e = toFloat(String(nova[n].esp ?? ''))
      const t = toFloat(String(valor))
      if (c && e && t) nova[n].area = t / (c * e * 2.4) * c
    }
    setter(nova)
  }

  async function handleSalvar() {
    if (!bairro || !via || !encarregado) { alert('Preencha Bairro, Via e Encarregado'); return }
    setSaving(true)
    setMsg('')

    const base = { date: data, neighborhood: bairro, road: via, supervisor: encarregado || undefined, recorder: apontador || undefined }
    const toSave: NewRecord[] = []

    // Limpeza
    if (positivo(toFloat(limpezaComp)) || positivo(toFloat(limpezaLarg))) {
      const c = toFloat(limpezaComp) || 0
      const l = toFloat(limpezaLarg) || 0
      toSave.push({ ...base, serviceType: 'limpeza', data: { c, l, area: c * l } })
    }
    if (obsLimpeza.trim()) {
      toSave.push({ ...base, serviceType: 'obs_limpeza', data: { obs: obsLimpeza.trim() } })
    }

    // Drenagem
    for (const d of drenagens) {
      if (positivo(d.escComp) || positivo(d.escLarg) || positivo(d.escProf)) {
        const c = d.escComp || 0, l = d.escLarg || 0, a = d.escProf || 0
        toSave.push({ ...base, serviceType: 'escavacao', data: { c, l, a, vol: c * l * a } })
      }
      if (positivo(d.colComp) || positivo(d.colLarg) || positivo(d.colProf)) {
        const c = d.colComp || 0, l = d.colLarg || 0, a = d.colProf || 0
        toSave.push({ ...base, serviceType: 'colchao_areia', data: { c, l, a, vol: c * l * a } })
      }
      if (positivo(d.tuboQtd) && d.diam) {
        toSave.push({ ...base, serviceType: 'tubo', data: { diam: Number(d.diam), qtd: d.tuboQtd } })
      }
      if (positivo(d.bidimComp) || positivo(d.bidimLarg)) {
        toSave.push({ ...base, serviceType: 'manta_bidim', data: { c: d.bidimComp || 0, l: d.bidimLarg || 0 } })
      }
      if (positivo(d.aterroComp) || positivo(d.aterroLarg) || positivo(d.aterroProf)) {
        const c = d.aterroComp || 0, l = d.aterroLarg || 0, a = d.aterroProf || 0
        const volBruto = c * l * a
        const volTubo = d.diam && d.escComp ? tuboVol(d.diam, d.escComp) : 0
        toSave.push({ ...base, serviceType: 'aterro', data: { c, l, a, vol: volBruto - volTubo } })
      }
      if (d.obs?.trim()) {
        toSave.push({ ...base, serviceType: 'obs_drenagem', data: { obs: d.obs.trim() } })
      }
    }

    // Motorbomba
    if (positivo(toFloat(motorMin))) {
      toSave.push({ ...base, serviceType: 'motor', data: { h: (toFloat(motorMin) || 0) / 60 } })
    }
    if (obsMotor.trim() && !positivo(toFloat(motorMin))) {
      toSave.push({ ...base, serviceType: 'obs_drenagem', data: { obs: obsMotor.trim() } })
    }

    // PV / BL
    for (const p of pvs) {
      if (p.num.trim()) {
        toSave.push({ ...base, serviceType: 'pv', data: { qtd: 1, num: p.num.trim(), tam: p.tam, status: p.status } })
      }
    }
    for (const b of bls) {
      if (positivo(toFloat(b.qtd))) {
        toSave.push({ ...base, serviceType: 'bl', data: { qtd: toFloat(b.qtd), status: b.status } })
      }
    }
    if (positivo(toFloat(tampao70))) {
      toSave.push({ ...base, serviceType: 'tampao_70', data: { qtd: toFloat(tampao70) } })
    }
    if (obsPvbl.trim()) {
      toSave.push({ ...base, serviceType: 'obs_pvbl', data: { obs: obsPvbl.trim() } })
    }

    // Espinhas BL
    for (const e of espinhas) {
      if (positivo(e.escC) || positivo(e.escL) || positivo(e.escA)) {
        toSave.push({ ...base, serviceType: 'espinha_bl', data: { subtipo: 'escavacao', referencia: e.referencia, c: e.escC || 0, l: e.escL || 0, a: e.escA || 0, vol: (e.escC || 0) * (e.escL || 0) * (e.escA || 0), diam: e.diam, lancamento: 1 } })
      }
      if (positivo(e.colC) || positivo(e.colL) || positivo(e.colA)) {
        toSave.push({ ...base, serviceType: 'espinha_bl', data: { subtipo: 'colchao', referencia: e.referencia, c: e.colC || 0, l: e.colL || 0, a: e.colA || 0, vol: (e.colC || 0) * (e.colL || 0) * (e.colA || 0), diam: e.diam, lancamento: 2 } })
      }
      if (positivo(e.tuboM) && e.diam) {
        toSave.push({ ...base, serviceType: 'espinha_bl', data: { subtipo: 'tubo', referencia: e.referencia, diam: Number(e.diam), qtd: e.tuboM, m: e.tuboM, lancamento: 3 } })
      }
      if (positivo(e.aterroC) || positivo(e.aterroL) || positivo(e.aterroA)) {
        const c = e.aterroC || 0, l = e.aterroL || 0, a = e.aterroA || 0
        const volBruto = c * l * a
        const volTubo = e.diam && e.tuboM ? tuboVol(e.diam, e.tuboM) : 0
        toSave.push({ ...base, serviceType: 'espinha_bl', data: { subtipo: 'aterro', referencia: e.referencia, c, l, a, vol: volBruto - volTubo, diam: e.diam, lancamento: 4 } })
      }
    }

    // Terraplenagem
    if (positivo(toFloat(terrapComp)) || positivo(toFloat(terrapLarg))) {
      const c = toFloat(terrapComp) || 0, l = toFloat(terrapLarg) || 0, a = toFloat(terrapProf) || 0.20
      toSave.push({ ...base, serviceType: 'terrap', data: { c, l, a, vol: c * l * a } })
    }
    if (obsTerrap.trim()) {
      toSave.push({ ...base, serviceType: 'obs_terrap', data: { obs: obsTerrap.trim() } })
    }

    // Pavimentação
    subbaseTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, l = t.larg || 0, e = t.esp || 0
      toSave.push({ ...base, serviceType: 'subbase', data: { trecho: idx + 1, c, l, e, area: c * l, vol: c * l * e } })
    })
    cbuqTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, e = t.esp || 0.035, ton = t.ton || 0
      const lCalc = ton > 0 && c > 0 && e > 0 ? ton / (c * e * 2.4) : 0
      toSave.push({ ...base, serviceType: 'cbuq', data: { trecho: idx + 1, c, l: lCalc, largura_medida: t.larg, e, area: c * lCalc, vol: ton, ton, densidade: 2.4 } })
    })
    binderTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, l = t.larg || 0
      toSave.push({ ...base, serviceType: 'binder', data: { trecho: idx + 1, c, l, area: c * l } })
    })
    pinturaTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, l = t.larg || 0
      toSave.push({ ...base, serviceType: 'pintura_ligacao', data: { trecho: idx + 1, c, l, area: c * l } })
    })
    if (obsPav.trim()) {
      toSave.push({ ...base, serviceType: 'obs_pav', data: { obs: obsPav.trim() } })
    }

    // Urbanização
    if (positivo(toFloat(demCalcada))) {
      toSave.push({ ...base, serviceType: 'demolicao_calcada', data: { lado: 'ambas', c: 0, l: 0, area: toFloat(demCalcada) } })
    }
    if (positivo(toFloat(demMeiofio))) {
      toSave.push({ ...base, serviceType: 'demolicao_meiofio', data: { lado: 'ambas', mf: toFloat(demMeiofio) } })
    }
    if (positivo(toFloat(demLinhaAgua))) {
      toSave.push({ ...base, serviceType: 'demolicao_linha_agua', data: { lado: 'ambas', c: toFloat(demLinhaAgua) } })
    }
    for (const [lado, urb] of [['direito', urbDireito], ['esquerdo', urbEsquerdo]] as const) {
      if (positivo(urb.meioFio)) {
        toSave.push({ ...base, serviceType: 'urb', data: { lado, c: 0, l: 0, area: 0, mf: urb.meioFio, subtipo: 'meio_fio_assentamento' } })
      }
      if (positivo(urb.linhaAgua)) {
        toSave.push({ ...base, serviceType: 'linha_agua', data: { lado, c: urb.linhaAgua } })
      }
      if (positivo(urb.calcada)) {
        toSave.push({ ...base, serviceType: 'urb', data: { lado, c: 0, l: 0, area: urb.calcada, subtipo: 'concretagem_calcada' } })
      }
    }
    if (obsUrb.trim()) {
      toSave.push({ ...base, serviceType: 'obs_urb', data: { obs: obsUrb.trim() } })
    }

    // Recuperação
    fresagemTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, l = t.larg || 0, e = t.esp || 0.035
      toSave.push({ ...base, serviceType: 'fresagem', data: { trecho: idx + 1, c, l, e, a: e, area: c * l, vol: c * l * e } })
    })
    remendoTrechos.filter((t) => t.comp).forEach((t, idx) => {
      const c = t.comp || 0, e = t.esp || 0.20, ton = t.ton || 0
      const lCalc = ton > 0 && c > 0 && e > 0 ? ton / (c * e * 2.4) : 0
      toSave.push({ ...base, serviceType: 'remendo_profundo', data: { trecho: idx + 1, c, l: lCalc, l_medida: t.larg, e, a: e, area: c * lCalc, ton, vol: ton, densidade: 2.4 } })
    })
    if (obsRecup.trim()) {
      toSave.push({ ...base, serviceType: 'obs_recuperacao', data: { obs: obsRecup.trim() } })
    }

    // Redes auxiliares
    for (const ra of redesAux) {
      if (positivo(ra.escComp) || positivo(ra.escLarg) || positivo(ra.escProf)) {
        const c = ra.escComp || 0, l = ra.escLarg || 0, a = ra.escProf || 0
        toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'escavacao', lancamento: 1, c, l, a, vol: c * l * a } })
      }
      if (positivo(ra.colComp) || positivo(ra.colLarg) || positivo(ra.colEsp)) {
        const c = ra.colComp || 0, l = ra.colLarg || 0, a = ra.colEsp || 0.10
        toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'colchao', lancamento: 2, c, l, a, vol: c * l * a } })
      }
      if (ra.tubos && ra.tubos.length > 0) {
        ra.tubos.filter((t) => t.diam && positivo(t.comp)).forEach((t) => {
          toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'tubo_pvc', lancamento: 3, diam: Number(t.diam), comp: t.comp, trecho: 1 } })
        })
      }
      if (positivo(ra.reatComp) || positivo(ra.reatLarg) || positivo(ra.reatProf)) {
        const c = ra.reatComp || 0, l = ra.reatLarg || 0, a = ra.reatProf || 0
        const volBruto = c * l * a
        const volTubos = ra.tubos?.reduce((sum, t) => sum + tuboVol(t.diam, t.comp || 0), 0) || 0
        toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'reaterro', lancamento: 4, c, l, a, vol: Math.max(volBruto - volTubos, 0) } })
      }
      if (ra.caixas && ra.caixas.length > 0) {
        ra.caixas.filter((cx) => positivo(cx.qtd)).forEach((cx) => {
          toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'caixa_inspecao', lancamento: 5, qtd: cx.qtd, tam: cx.tam, status: cx.status, trecho: 1 } })
        })
      }
      if (ra.obs?.trim()) {
        toSave.push({ ...base, serviceType: 'redes_auxiliares', data: { subtipo: 'obs', lancamento: 6, obs: ra.obs.trim() } })
      }
    }

    // Rede domiciliar
    for (const rd of redeDomItems) {
      if (rd.tipo && rd.qtd) {
        toSave.push({ ...base, serviceType: 'rede_domiciliar', data: { tipo_material: rd.tipo, material: rd.material, qtd: toFloat(rd.qtd), unidade: rd.unidade, obs: rd.obs } })
      }
    }

    // Info adicionais
    if (infoAdic.trim()) {
      toSave.push({ ...base, serviceType: 'info_adicionais', data: { info: infoAdic.trim() } })
    }

    if (toSave.length === 0) {
      setMsg('Nenhum dado preenchido.')
      setSaving(false)
      return
    }

    const ok = await addBatch(toSave)
    setSaving(false)
    if (ok) {
      setMsg(`${toSave.length} registro(s) salvo(s) com sucesso!`)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Lançamento de atividades</h1>
      <p className="text-zinc-500 text-sm">Preencha a identificação da frente e marque somente os serviços executados.</p>

      {msg && (
        <div className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${
          msg.includes('sucesso')
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
        }`}>{msg}</div>
      )}

      {/* Dados principais */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Identificação do lançamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Bairro</label>
            <div className="flex gap-1">
              <datalist id="bairroList">{bairros.map((b) => <option key={b} value={b} />)}</datalist>
              <input type="text" list="bairroList" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Selecione ou digite" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} placeholder="Novo" className="w-20 px-2 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <button onClick={handleAddBairro} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Via</label>
            <div className="flex gap-1">
              <datalist id="viaList">{viasDisponiveis.map((v) => <option key={v} value={v} />)}</datalist>
              <input type="text" list="viaList" value={via} onChange={(e) => setVia(e.target.value)} placeholder="Selecione ou digite" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novaVia} onChange={(e) => setNovaVia(e.target.value)} placeholder="Nova" className="w-20 px-2 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <button onClick={handleAddVia} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Encarregado</label>
            <div className="flex gap-1">
              <datalist id="encList">{encarregados.map((e) => <option key={e} value={e} />)}</datalist>
              <input type="text" list="encList" value={encarregado} onChange={(e) => setEncarregado(e.target.value)} placeholder="Selecione ou digite" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={novoEnc} onChange={(e) => setNovoEnc(e.target.value)} placeholder="Novo" className="w-20 px-2 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <button onClick={handleAddEnc} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Apontador</label>
            {hasPermission('settings:write') ? (
              <div className="flex gap-1">
                <datalist id="apontList">{apontadores.map((a) => <option key={a} value={a} />)}</datalist>
                <input type="text" list="apontList" value={apontador} onChange={(e) => setApontador(e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            ) : (
              <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Atividades */}
      <div className="space-y-3">
        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Limpeza mecanizada</summary>
          <div className="p-4 pt-0 space-y-3">
            <p className="text-xs text-zinc-500">Comprimento e largura em metros. Área calculada automaticamente.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-0.5">Comprimento (m)</label>
                <input type="text" value={limpezaComp} onChange={(e) => setLimpezaComp(e.target.value)} placeholder="Ex: 20,00" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-0.5">Largura (m)</label>
                <input type="text" value={limpezaLarg} onChange={(e) => setLimpezaLarg(e.target.value)} placeholder="Ex: 6,00" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-500 mb-0.5">Observação</label>
                <input type="text" value={obsLimpeza} onChange={(e) => setObsLimpeza(e.target.value)} placeholder="Ex: Limpeza executada com apoio de máquina" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            </div>
            {positivo(toFloat(limpezaComp)) && positivo(toFloat(limpezaLarg)) && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Área: {(toFloat(limpezaComp)! * toFloat(limpezaLarg)!).toFixed(2).replace('.', ',')} m²</p>
            )}
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Drenagem</summary>
          <div className="p-4 pt-0 space-y-4">
            <p className="text-xs text-zinc-500">Lance cada frente de drenagem separadamente.</p>
            <div className="flex gap-2">
              <button onClick={() => { setQtdDren(qtdDren + 1); setDrenagens([...drenagens, {}]) }} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar drenagem</button>
              {qtdDren > 1 && <button onClick={() => { setQtdDren(qtdDren - 1); setDrenagens(drenagens.slice(0, -1)) }} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50">- Remover última</button>}
            </div>
            {drenagens.map((d, i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 space-y-3">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Drenagem {i + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500">Escavação</p>
                    <input type="text" placeholder="Comprimento (m)" value={fmt(d.escComp)} onChange={(e) => { atualizarDren(i, 'escComp', toFloat(e.target.value)); setTimeout(() => sincronizarDren(i), 50) }} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Largura (m)" value={fmt(d.escLarg)} onChange={(e) => { atualizarDren(i, 'escLarg', toFloat(e.target.value)); setTimeout(() => sincronizarDren(i), 50) }} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Profundidade (m)" value={fmt(d.escProf)} onChange={(e) => { atualizarDren(i, 'escProf', toFloat(e.target.value)); setTimeout(() => sincronizarDren(i), 50) }} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500">Colchão de areia</p>
                    <input type="text" placeholder="Comprimento (m)" value={fmt(d.colComp)} onChange={(e) => atualizarDren(i, 'colComp', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Largura (m)" value={fmt(d.colLarg)} onChange={(e) => atualizarDren(i, 'colLarg', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Profundidade (m)" value={fmt(d.colProf)} onChange={(e) => atualizarDren(i, 'colProf', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500">Tubos</p>
                    <input type="text" placeholder="Quantidade (un)" value={d.tuboQtd ?? ''} onChange={(e) => atualizarDren(i, 'tuboQtd', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <select value={d.diam ?? ''} onChange={(e) => atualizarDren(i, 'diam', e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                      <option value="">Diâmetro (mm)</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="800">800</option>
                      <option value="1000">1000</option>
                      <option value="1200">1200</option>
                      <option value="1500">1500</option>
                    </select>
                    <p className="text-xs font-medium text-zinc-500 mt-2">Manta bidim</p>
                    <input type="text" placeholder="Comprimento (m)" value={fmt(d.bidimComp)} onChange={(e) => atualizarDren(i, 'bidimComp', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Largura (m)" value={fmt(d.bidimLarg)} onChange={(e) => atualizarDren(i, 'bidimLarg', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Aterro</p>
                    <input type="text" placeholder="Comprimento (m)" value={fmt(d.aterroComp)} onChange={(e) => atualizarDren(i, 'aterroComp', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Largura (m)" value={fmt(d.aterroLarg)} onChange={(e) => atualizarDren(i, 'aterroLarg', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <input type="text" placeholder="Profundidade (m)" value={fmt(d.aterroProf)} onChange={(e) => atualizarDren(i, 'aterroProf', toFloat(e.target.value))} className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-500 mb-0.5">Observação</label>
                    <input type="text" value={d.obs ?? ''} onChange={(e) => atualizarDren(i, 'obs', e.target.value)} placeholder="Ex: Interferência de rede, solo saturado" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Motorbomba</summary>
          <div className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" value={motorMin} onChange={(e) => setMotorMin(e.target.value)} placeholder="Tempo de operação (min)" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={obsMotor} onChange={(e) => setObsMotor(e.target.value)} placeholder="Observação" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">PV / BL</summary>
          <div className="p-4 pt-0 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setQtdPV(qtdPV + 1)} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar PV</button>
              {qtdPV > 1 && <button onClick={() => { setQtdPV(qtdPV - 1); setPvs(pvs.slice(0, -1)) }} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50">- Remover PV</button>}
              <button onClick={() => setQtdBL(qtdBL + 1)} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar BL</button>
              {qtdBL > 1 && <button onClick={() => { setQtdBL(qtdBL - 1); setBls(bls.slice(0, -1)) }} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50">- Remover BL</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Poços de Visita (PV)</p>
                {pvs.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" value={p.num} onChange={(e) => { const n = [...pvs]; n[i] = { ...n[i], num: e.target.value }; setPvs(n) }} placeholder="Nº do PV" className="flex-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <select value={p.tam} onChange={(e) => { const n = [...pvs]; n[i] = { ...n[i], tam: e.target.value }; setPvs(n) }} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                      <option value="">Tamanho</option>
                      <option value="1,40x1,40">1,40x1,40</option>
                      <option value="1,60x1,60">1,60x1,60</option>
                      <option value="1,80x1,80">1,80x1,80</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                    <select value={p.status} onChange={(e) => { const n = [...pvs]; n[i] = { ...n[i], status: e.target.value }; setPvs(n) }} className="px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                      <option value="">Status</option>
                      <option value="EM ANDAMENTO">Em andamento</option>
                      <option value="FINALIZADO">Finalizado</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Bocas de Lobo (BL)</p>
                {bls.map((b, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" value={b.qtd} onChange={(e) => { const n = [...bls]; n[i] = { ...n[i], qtd: e.target.value }; setBls(n) }} placeholder="Quantidade" className="w-24 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <select value={b.status} onChange={(e) => { const n = [...bls]; n[i] = { ...n[i], status: e.target.value }; setBls(n) }} className="flex-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                      <option value="">Status</option>
                      <option value="EM ANDAMENTO">Em andamento</option>
                      <option value="FINALIZADO">Finalizado</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-0.5">Tampão Ø70cm (un)</label>
              <input type="text" value={tampao70} onChange={(e) => setTampao70(e.target.value)} placeholder="Ex: 2" className="w-full max-w-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-0.5">Observação PV/BL</label>
              <input type="text" value={obsPvbl} onChange={(e) => setObsPvbl(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <details className="border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <summary className="p-3 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400">Espinhas das BL</summary>
              <div className="p-3 space-y-3">
                <button onClick={() => { setQtdEsp(qtdEsp + 1); setEspinhas([...espinhas, {}]) }} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar espinha</button>
                {qtdEsp > 1 && <button onClick={() => { setQtdEsp(qtdEsp - 1); setEspinhas(espinhas.slice(0, -1)) }} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 ml-2">- Remover</button>}
                {espinhas.map((e, i) => (
                  <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded p-2 space-y-2">
                    <p className="text-xs font-medium">Espinha {i + 1}</p>
                    <input type="text" value={e.referencia ?? ''} onChange={(e2) => { const n = [...espinhas]; n[i] = { ...n[i], referencia: e2.target.value }; setEspinhas(n) }} placeholder="Referência" className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    <div className="grid grid-cols-4 gap-2">
                      <input type="text" placeholder="Esc C" value={fmt(e.escC)} onChange={(e2) => { const n = [...espinhas]; n[i] = { ...n[i], escC: toFloat(e2.target.value) }; setEspinhas(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      <input type="text" placeholder="Esc L" value={fmt(e.escL)} onChange={(e2) => { const n = [...espinhas]; n[i] = { ...n[i], escL: toFloat(e2.target.value) }; setEspinhas(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      <input type="text" placeholder="Esc A" value={fmt(e.escA)} onChange={(e2) => { const n = [...espinhas]; n[i] = { ...n[i], escA: toFloat(e2.target.value) }; setEspinhas(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      <input type="text" placeholder="Tubo (m)" value={fmt(e.tuboM)} onChange={(e2) => { const n = [...espinhas]; n[i] = { ...n[i], tuboM: toFloat(e2.target.value) }; setEspinhas(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Terraplenagem</summary>
          <div className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={terrapComp} onChange={(e) => setTerrapComp(e.target.value)} placeholder="Comprimento (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={terrapLarg} onChange={(e) => setTerrapLarg(e.target.value)} placeholder="Largura (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={terrapProf} onChange={(e) => setTerrapProf(e.target.value)} placeholder="Profundidade (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <input type="text" value={obsTerrap} onChange={(e) => setObsTerrap(e.target.value)} placeholder="Observação" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Pavimentação</summary>
          <div className="p-4 pt-0 space-y-4">
            {['subbase', 'cbuq', 'binder', 'pintura'].map((servico) => {
              const trechosMap: Record<string, PavTrecho[]> = { subbase: subbaseTrechos, cbuq: cbuqTrechos, binder: binderTrechos, pintura: pinturaTrechos }
              const setterMap: Record<string, any> = { subbase: setSubbaseTrechos, cbuq: setCbuqTrechos, binder: setBinderTrechos, pintura: setPinturaTrechos }
              const trechos = trechosMap[servico]
              const setter = setterMap[servico]
              const nomes: Record<string, string> = { subbase: 'Sub-base / Base', cbuq: 'CBUQ', binder: 'Binder / Imprimação', pintura: 'Pintura de Ligação' }
              const temEsp = servico !== 'binder' && servico !== 'pintura'
              const temTon = servico === 'cbuq'
              return (
                <div key={servico} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{nomes[servico]}</h4>
                    <button onClick={() => { setter([...trechos, {}]) }} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
                  </div>
                  {trechos.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-end mb-2 flex-wrap">
                      <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      <input type="text" placeholder="Larg (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      {temEsp && <input type="text" placeholder="Esp (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />}
                      {temTon && <input type="text" placeholder="Ton" value={fmt(t.ton)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'ton', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />}
                      {t.area != null && t.area > 0 && <span className="text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{t.area.toFixed(2).replace('.', ',')} m²</span>}
                      {idx > 0 && <button onClick={() => { setter(trechos.filter((_: any, j: number) => j !== idx)) }} className="text-red-500 text-xs">x</button>}
                    </div>
                  ))}
                </div>
              )
            })}
            <input type="text" value={obsPav} onChange={(e) => setObsPav(e.target.value)} placeholder="Observação da pavimentação" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Urbanização</summary>
          <div className="p-4 pt-0 space-y-3">
            <p className="text-xs text-zinc-500">Demolições</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={demCalcada} onChange={(e) => setDemCalcada(e.target.value)} placeholder="Dem. Calçada (m²)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={demMeiofio} onChange={(e) => setDemMeiofio(e.target.value)} placeholder="Dem. Meio-fio (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              <input type="text" value={demLinhaAgua} onChange={(e) => setDemLinhaAgua(e.target.value)} placeholder="Dem. Linha d'água (m)" className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500">Calçada / Meio-fio / Linha d'água</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Lado Direito</p>
                <input type="text" value={fmt(urbDireito.calcada)} onChange={(e) => setUrbDireito({ ...urbDireito, calcada: toFloat(e.target.value) })} placeholder="Calçada (m²)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" value={fmt(urbDireito.meioFio)} onChange={(e) => setUrbDireito({ ...urbDireito, meioFio: toFloat(e.target.value) })} placeholder="Meio-fio (m)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" value={fmt(urbDireito.linhaAgua)} onChange={(e) => setUrbDireito({ ...urbDireito, linhaAgua: toFloat(e.target.value) })} placeholder="Linha d'água (m)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">Lado Esquerdo</p>
                <input type="text" value={fmt(urbEsquerdo.calcada)} onChange={(e) => setUrbEsquerdo({ ...urbEsquerdo, calcada: toFloat(e.target.value) })} placeholder="Calçada (m²)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" value={fmt(urbEsquerdo.meioFio)} onChange={(e) => setUrbEsquerdo({ ...urbEsquerdo, meioFio: toFloat(e.target.value) })} placeholder="Meio-fio (m)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" value={fmt(urbEsquerdo.linhaAgua)} onChange={(e) => setUrbEsquerdo({ ...urbEsquerdo, linhaAgua: toFloat(e.target.value) })} placeholder="Linha d'água (m)" className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            </div>
            <input type="text" value={obsUrb} onChange={(e) => setObsUrb(e.target.value)} placeholder="Observação da urbanização" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Recuperação de vias</summary>
          <div className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Fresagem</h4>
              <button onClick={() => setFresagemTrechos([...fresagemTrechos, {}])} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
              {fresagemTrechos.map((t, i) => (
                <div key={i} className="flex gap-2 items-end flex-wrap">
                  <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Larg (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Prof (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  {t.area != null && t.area > 0 && <span className="text-xs text-emerald-600">{t.area.toFixed(2).replace('.', ',')} m²</span>}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Remendo profundo / Tapa-buraco</h4>
              <button onClick={() => setRemendoTrechos([...remendoTrechos, {}])} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
              {remendoTrechos.map((t, i) => (
                <div key={i} className="flex gap-2 items-end flex-wrap">
                  <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Larg medida (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Esp (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Ton" value={fmt(t.ton)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'ton', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                </div>
              ))}
            </div>
            <input type="text" value={obsRecup} onChange={(e) => setObsRecup(e.target.value)} placeholder="Observação" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Redes auxiliares</summary>
          <div className="p-4 pt-0 space-y-4">
            <button onClick={() => { setQtdRA(qtdRA + 1); setRedesAux([...redesAux, {}]) }} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar rede</button>
            {qtdRA > 1 && <button onClick={() => { setQtdRA(qtdRA - 1); setRedesAux(redesAux.slice(0, -1)) }} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-xs text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 ml-2">- Remover</button>}
            {redesAux.map((ra, i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium">Rede Auxiliar {i + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="text" placeholder="Esc Comp (m)" value={fmt(ra.escComp)} onChange={(e) => { const n = [...redesAux]; n[i] = { ...n[i], escComp: toFloat(e.target.value) }; setRedesAux(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Esc Larg (m)" value={fmt(ra.escLarg)} onChange={(e) => { const n = [...redesAux]; n[i] = { ...n[i], escLarg: toFloat(e.target.value) }; setRedesAux(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Esc Prof (m)" value={fmt(ra.escProf)} onChange={(e) => { const n = [...redesAux]; n[i] = { ...n[i], escProf: toFloat(e.target.value) }; setRedesAux(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                </div>
                <input type="text" value={ra.obs ?? ''} onChange={(e) => { const n = [...redesAux]; n[i] = { ...n[i], obs: e.target.value }; setRedesAux(n) }} placeholder="Observação" className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            ))}
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Rede domiciliar</summary>
          <div className="p-4 pt-0 space-y-3">
            {redeDomItems.map((rd, i) => (
              <div key={i} className="flex gap-2 items-end flex-wrap">
                <select value={rd.tipo} onChange={(e) => { const n = [...redeDomItems]; n[i] = { ...n[i], tipo: e.target.value }; setRedeDomItems(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="">Tipo</option>
                  <option value="Tubo">Tubo</option>
                  <option value="Luva">Luva</option>
                  <option value="T">T</option>
                  <option value="Joelho">Joelho</option>
                  <option value="CAP">CAP</option>
                  <option value="Outro">Outro</option>
                </select>
                <input type="text" placeholder="Material" value={rd.material} onChange={(e) => { const n = [...redeDomItems]; n[i] = { ...n[i], material: e.target.value }; setRedeDomItems(n) }} className="w-32 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <input type="text" placeholder="Qtd" value={rd.qtd} onChange={(e) => { const n = [...redeDomItems]; n[i] = { ...n[i], qtd: e.target.value }; setRedeDomItems(n) }} className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                <select value={rd.unidade} onChange={(e) => { const n = [...redeDomItems]; n[i] = { ...n[i], unidade: e.target.value }; setRedeDomItems(n) }} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  <option value="un">un</option>
                  <option value="m">m</option>
                  <option value="kg">kg</option>
                  <option value="pç">pç</option>
                </select>
                <input type="text" placeholder="Obs" value={rd.obs} onChange={(e) => { const n = [...redeDomItems]; n[i] = { ...n[i], obs: e.target.value }; setRedeDomItems(n) }} className="flex-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                {i > 0 && <button onClick={() => setRedeDomItems(redeDomItems.filter((_, j) => j !== i))} className="text-red-500 text-xs">x</button>}
              </div>
            ))}
            <button onClick={() => setRedeDomItems([...redeDomItems, { tipo: '', material: '', qtd: '', unidade: 'un', obs: '' }])} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Adicionar item</button>
          </div>
        </details>

        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Informações adicionais</summary>
          <div className="p-4 pt-0">
            <textarea value={infoAdic} onChange={(e) => setInfoAdic(e.target.value)} placeholder="Informações adicionais sobre o lançamento" rows={3} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>
      </div>

      {/* Botão salvar */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <button onClick={handleSalvar} disabled={saving || !bairro || !via || !encarregado} className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Salvando...' : 'SALVAR LANÇAMENTO COMPLETO'}
        </button>
        {(!bairro || !via || !encarregado) && (
          <p className="text-xs text-zinc-500 mt-2 text-center">Preencha Bairro, Via e Encarregado antes de salvar.</p>
        )}
      </div>
    </div>
  )
}
