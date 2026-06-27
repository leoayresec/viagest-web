import { useState } from 'react'
import { useAuthStore } from '../../auth/auth.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { useRecordsStore } from '../stores/records.store'
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

export function RecordsPage() {
  const user = useAuthStore((s) => s.user)
  const { listarBairros, listarVias, listarViasAtivas, listarEquipe, salvarVia, salvarMembro } = useSettingsStore()
  const addRecord = useRecordsStore((s) => s.add)

  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [bairro, setBairro] = useState('')
  const [via, setVia] = useState('')
  const [encarregado, setEncarregado] = useState('')
  const [apontador, setApontador] = useState(user?.name || '')
  const [msg, setMsg] = useState('')

  const [novoBairro, setNovoBairro] = useState('')
  const [novaVia, setNovaVia] = useState('')
  const [novoEnc, setNovoEnc] = useState('')

  // Limpeza
  const [limpezaComp, setLimpezaComp] = useState('')
  const [limpezaLarg, setLimpezaLarg] = useState('')
  const [obsLimpeza, setObsLimpeza] = useState('')

  // Drenagem dinâmica
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

  // Motorbomba
  const [motorMin, setMotorMin] = useState('')
  const [obsMotor, setObsMotor] = useState('')

  // PV/BL
  const [qtdPV, setQtdPV] = useState(1)
  const [pvs, setPvs] = useState<{ num: string; tam: string; status: string }[]>(() => Array.from({ length: 1 }, () => ({ num: '', tam: '', status: '' })))
  const [qtdBL, setQtdBL] = useState(1)
  const [bls, setBls] = useState<{ qtd: string; status: string }[]>(() => Array.from({ length: 1 }, () => ({ qtd: '', status: '' })))
  const [tampao70, setTampao70] = useState('')
  const [obsPvbl, setObsPvbl] = useState('')

  // Espinhas BL
  const [qtdEsp, setQtdEsp] = useState(1)
  const [espinhas, setEspinhas] = useState<EspinhaBL[]>(() => Array.from({ length: 1 }, () => ({})))

  // Terraplenagem
  const [terrapComp, setTerrapComp] = useState('')
  const [terrapLarg, setTerrapLarg] = useState('')
  const [terrapProf, setTerrapProf] = useState('0,20')
  const [obsTerrap, setObsTerrap] = useState('')

  // Pavimentação trechos
  const [subbaseTrechos, setSubbaseTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [cbuqTrechos, setCbuqTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [binderTrechos, setBinderTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [obsPav, setObsPav] = useState('')

  // Urbanização
  const [demCalcada, setDemCalcada] = useState('')
  const [demMeiofio, setDemMeiofio] = useState('')
  const [demLinhaAgua, setDemLinhaAgua] = useState('')
  const [urbDireito, setUrbDireito] = useState<UrbanizacaoLado>({})
  const [urbEsquerdo, setUrbEsquerdo] = useState<UrbanizacaoLado>({})
  const [obsUrb, setObsUrb] = useState('')

  // Recuperação
  const [fresagemTrechos, setFresagemTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [remendoTrechos, setRemendoTrechos] = useState<PavTrecho[]>(() => Array.from({ length: 1 }, () => ({})))
  const [obsRecup, setObsRecup] = useState('')

  // Redes auxiliares
  const [qtdRA, setQtdRA] = useState(1)
  const [redesAux, setRedesAux] = useState<RedeAuxiliar[]>(() => Array.from({ length: 1 }, () => ({})))

  // Rede domiciliar
  const [redeDomQtd, setRedeDomQtd] = useState('')

  // Info adicionais
  const [infoAdic, setInfoAdic] = useState('')

  const bairros = listarBairros()
  const viasDisponiveis = user?.profile === 'apontador' ? listarViasAtivas(bairro) : listarVias(bairro)
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

  function handleSalvar() {
    if (!bairro || !via || !encarregado) { alert('Preencha Bairro, Via e Encarregado'); return }

    const dataRecord: any = {}

    if (limpezaComp || limpezaLarg) {
      dataRecord.limpezaComp = toFloat(limpezaComp)
      dataRecord.limpezaLarg = toFloat(limpezaLarg)
      dataRecord.obsLimpeza = obsLimpeza
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'limpeza', data: dataRecord })
    }

    const drenComDados = drenagens.filter((d) => d.escComp || d.tuboQtd)
    if (drenComDados.length > 0) {
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'escavacao', data: { drenagens: drenComDados } })
    }

    if (motorMin) {
      dataRecord.motorbombaMin = toFloat(motorMin)
      dataRecord.obsMotorbomba = obsMotor
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'motor', data: dataRecord })
    }

    const pvComDados = pvs.filter((p) => p.num)
    const blComDados = bls.filter((b) => b.qtd)
    const espComDados = espinhas.filter((e) => e.escC)
    if (pvComDados.length > 0 || blComDados.length > 0 || tampao70 || espComDados.length > 0) {
      dataRecord.pvs = pvComDados
      dataRecord.bls = blComDados.map((b) => ({ qtd: toFloat(b.qtd), status: b.status }))
      dataRecord.tampao70Qtd = toFloat(tampao70)
      dataRecord.espinhas = espComDados
      dataRecord.obsPvbl = obsPvbl
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'pv', data: dataRecord })
    }

    if (terrapComp) {
      dataRecord.terrapComp = toFloat(terrapComp)
      dataRecord.terrapLarg = toFloat(terrapLarg)
      dataRecord.terrapProf = toFloat(terrapProf)
      dataRecord.obsTerrap = obsTerrap
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'terrap', data: dataRecord })
    }

    const subOk = subbaseTrechos.filter((t) => t.comp)
    const cbuqOk = cbuqTrechos.filter((t) => t.comp)
    const bindOk = binderTrechos.filter((t) => t.comp)
    if (subOk.length > 0 || cbuqOk.length > 0 || bindOk.length > 0) {
      dataRecord.pavSubbase = subOk
      dataRecord.pavCbuq = cbuqOk
      dataRecord.pavBinder = bindOk
      dataRecord.obsPav = obsPav
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'subbase', data: dataRecord })
    }

    if (demCalcada || demMeiofio || demLinhaAgua || urbDireito.calcada || urbEsquerdo.calcada) {
      dataRecord.demolicaoCalcada = toFloat(demCalcada)
      dataRecord.demolicaoMeiofio = toFloat(demMeiofio)
      dataRecord.demolicaoLinhaAgua = toFloat(demLinhaAgua)
      dataRecord.urbDireito = urbDireito
      dataRecord.urbEsquerdo = urbEsquerdo
      dataRecord.obsUrb = obsUrb
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'urb', data: dataRecord })
    }

    const fresOk = fresagemTrechos.filter((t) => t.comp)
    const remOk = remendoTrechos.filter((t) => t.comp)
    if (fresOk.length > 0 || remOk.length > 0) {
      dataRecord.fresagemTrechos = fresOk
      dataRecord.remendoTrechos = remOk
      dataRecord.obsRecuperacao = obsRecup
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'fresagem', data: dataRecord })
    }

    const raComDados = redesAux.filter((r) => r.escComp)
    if (raComDados.length > 0) {
      dataRecord.redesAux = raComDados
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'redes_auxiliares', data: dataRecord })
    }

    if (redeDomQtd) {
      dataRecord.redeDomiciliarQtd = toFloat(redeDomQtd)
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'rede_domiciliar', data: dataRecord })
    }

    if (infoAdic) {
      dataRecord.infoAdicionais = infoAdic
      addRecord({ date: data, bairro, via, encarregado, apontador, tipo: 'info_adicionais', data: dataRecord })
    }

    setMsg('Lançamento(s) salvo(s) com sucesso!')
    // Não limpa para permitir continuar digitando
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Lançamento de atividades</h1>
      <p className="text-zinc-500 text-sm">Preencha a identificação da frente e marque somente os serviços executados.</p>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400">{msg}</div>
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
            {user?.profile === 'admin' ? (
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
            <p className="text-xs text-zinc-500">Lance cada frente de drenagem separadamente. Dentro de cada uma, preencha escavação, colchão, tubos, bidim e aterro.</p>
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

            {/* Espinhas BL */}
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
            {['subbase', 'cbuq', 'binder'].map((servico) => {
              const trechos = servico === 'subbase' ? subbaseTrechos : servico === 'binder' ? binderTrechos : cbuqTrechos
              const setter = servico === 'subbase' ? setSubbaseTrechos : servico === 'binder' ? setBinderTrechos : setCbuqTrechos
              const nomes: Record<string, string> = { subbase: 'Sub-base', cbuq: 'CBUQ', binder: 'Binder' }
              const temEsp = servico !== 'binder'
              return (
                <div key={servico} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{nomes[servico]}</h4>
                    <button onClick={() => { const a = [...trechos, {}]; setter(a) }} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
                  </div>
                  {trechos.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-end mb-2 flex-wrap">
                      <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      <input type="text" placeholder="Larg (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                      {temEsp && <input type="text" placeholder="Esp (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />}
                      {servico === 'cbuq' && <input type="text" placeholder="Ton" value={fmt(t.ton)} onChange={(e) => atualizarTrecho(trechos, setter, idx, 'ton', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />}
                      {t.area != null && t.area > 0 && <span className="text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{t.area.toFixed(2).replace('.', ',')} m²</span>}
                      {idx > 0 && <button onClick={() => { const a = trechos.filter((_, j) => j !== idx); setter(a) }} className="text-red-500 text-xs">x</button>}
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
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFresagemTrechos([...fresagemTrechos, {}])} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
              </div>
              {fresagemTrechos.map((t, i) => (
                <div key={i} className="flex gap-2 items-end flex-wrap">
                  <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Larg (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Prof (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(fresagemTrechos, setFresagemTrechos, i, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  {t.area != null && t.area > 0 && <span className="text-xs text-emerald-600">{t.area.toFixed(2)} m²</span>}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Remendo profundo</h4>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setRemendoTrechos([...remendoTrechos, {}])} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-xs rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ Trecho</button>
              </div>
              {remendoTrechos.map((t, i) => (
                <div key={i} className="flex gap-2 items-end flex-wrap">
                  <input type="text" placeholder="Comp (m)" value={fmt(t.comp)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'comp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Larg (m)" value={fmt(t.larg)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'larg', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                  <input type="text" placeholder="Prof (m)" value={fmt(t.esp)} onChange={(e) => atualizarTrecho(remendoTrechos, setRemendoTrechos, i, 'esp', e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
                </div>
              ))}
            </div>
            <input type="text" value={obsRecup} onChange={(e) => setObsRecup(e.target.value)} placeholder="Observação" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>

        {user?.profile === 'admin' && (
          <>
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
              <div className="p-4 pt-0">
                <input type="text" value={redeDomQtd} onChange={(e) => setRedeDomQtd(e.target.value)} placeholder="Quantidade de ligações" className="w-full max-w-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>
            </details>
          </>
        )}
        <details className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">Informações adicionais</summary>
          <div className="p-4 pt-0">
            <textarea value={infoAdic} onChange={(e) => setInfoAdic(e.target.value)} placeholder="Informações adicionais sobre o lançamento" rows={3} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
          </div>
        </details>
      </div>

      {/* Botão salvar */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <button onClick={handleSalvar} className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
          SALVAR LANÇAMENTO COMPLETO
        </button>
        {(!bairro || !via || !encarregado) && (
          <p className="text-xs text-zinc-500 mt-2 text-center">Preencha Bairro, Via e Encarregado antes de salvar.</p>
        )}
      </div>
    </div>
  )
}
