import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecordsStore } from '../../records/stores/records.store'
import { useAuthStore } from '../../auth/auth.store'

function fmt(v: number | undefined): string {
  if (v == null || v <= 0) return '-'
  return v.toFixed(2).replace('.', ',')
}

function calcMetricas(registros: any[]) {
  const bairros = new Set<string>()
  const vias = new Set<string>()
  const apontadores = new Set<string>()
  let escM3 = 0, colM3 = 0, aterroM3 = 0, terrapM3 = 0, tubosUn = 0
  let mantaM2 = 0, pvUn = 0, blUn = 0, subM2 = 0, cbuqM2 = 0, cbuqT = 0
  let bindM2 = 0, meioFioM = 0, linhaAguaM = 0, calcadaM2 = 0
  let limpezaM2 = 0

  for (const r of registros) {
    const d = r.data || {}
    bairros.add(r.bairro)
    vias.add(r.via)
    if (r.apontador) apontadores.add(r.apontador)
    if (d.drenagens) {
      for (const dr of d.drenagens) {
        if (dr.escComp && dr.escLarg && dr.escProf) escM3 += dr.escComp * dr.escLarg * dr.escProf
        if (dr.colComp && dr.colLarg && dr.colProf) colM3 += dr.colComp * dr.colLarg * dr.colProf
        if (dr.aterroComp && dr.aterroLarg && dr.aterroProf) aterroM3 += dr.aterroComp * dr.aterroLarg * dr.aterroProf
        tubosUn += dr.tuboQtd || 0
        if (dr.bidimComp && dr.bidimLarg) mantaM2 += dr.bidimComp * dr.bidimLarg
      }
    }
    if (d.pvs) pvUn += d.pvs.filter((p: any) => p.num).length
    if (d.bls) blUn += d.bls.reduce((s: number, b: any) => s + (b.qtd || 0), 0)
    if (d.terrapComp && d.terrapLarg && d.terrapProf) terrapM3 += d.terrapComp * d.terrapLarg * d.terrapProf
    if (d.pavSubbase) for (const t of d.pavSubbase) if (t.area) subM2 += t.area
    if (d.pavCbuq) for (const t of d.pavCbuq) { if (t.area) cbuqM2 += t.area; if (t.ton) cbuqT += t.ton }
    if (d.pavBinder) for (const t of d.pavBinder) if (t.area) bindM2 += t.area
    if (d.urbDireito) {
      meioFioM += d.urbDireito.meioFio || 0; linhaAguaM += d.urbDireito.linhaAgua || 0; calcadaM2 += d.urbDireito.calcada || 0
    }
    if (d.urbEsquerdo) {
      meioFioM += d.urbEsquerdo.meioFio || 0; linhaAguaM += d.urbEsquerdo.linhaAgua || 0; calcadaM2 += d.urbEsquerdo.calcada || 0
    }
    if (d.limpezaComp && d.limpezaLarg) limpezaM2 += d.limpezaComp * d.limpezaLarg
  }

  const pinturaPorBinder = bindM2
  return {
    registros: registros.length, bairros: bairros.size, vias: vias.size, apontadores: apontadores.size,
    escavacao_m3: escM3, colchao_m3: colM3, aterro_m3: aterroM3, terraplenagem_m3: terrapM3,
    tubos_drenagem_un: tubosUn, manta_m2: mantaM2, pv_un: pvUn, bl_un: blUn,
    subbase_m2: subM2, cbuq_m2: cbuqM2, cbuq_t: cbuqT, binder_m2: bindM2,
    pintura_m2: pinturaPorBinder, meio_fio_m: meioFioM, linha_agua_m: linhaAguaM,
    calcada_m2: calcadaM2, limpeza_m2: limpezaM2,
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.profile === 'admin'

  const [dataFoco, setDataFoco] = useState(new Date().toISOString().slice(0, 10))
  const records = useRecordsStore((s) => s.records)

  const registrosFiltrados = isAdmin
    ? records.filter((r) => r.date === dataFoco)
    : records.filter((r) => r.date === dataFoco && r.apontador === user?.name)

  const metricas = calcMetricas(registrosFiltrados)
  const producao = [
    metricas.escavacao_m3 > 0 && { label: 'Escavação', valor: fmt(metricas.escavacao_m3) + ' m³' },
    metricas.colchao_m3 > 0 && { label: 'Colchão de areia', valor: fmt(metricas.colchao_m3) + ' m³' },
    metricas.aterro_m3 > 0 && { label: 'Aterro', valor: fmt(metricas.aterro_m3) + ' m³' },
    metricas.terraplenagem_m3 > 0 && { label: 'Terraplenagem', valor: fmt(metricas.terraplenagem_m3) + ' m³' },
    metricas.tubos_drenagem_un > 0 && { label: 'Tubos drenagem', valor: String(metricas.tubos_drenagem_un) + ' un' },
    metricas.manta_m2 > 0 && { label: 'Manta bidim', valor: fmt(metricas.manta_m2) + ' m²' },
    metricas.pv_un > 0 && { label: 'PV', valor: String(metricas.pv_un) + ' un' },
    metricas.bl_un > 0 && { label: 'BL', valor: String(metricas.bl_un) + ' un' },
    metricas.subbase_m2 > 0 && { label: 'Sub-base', valor: fmt(metricas.subbase_m2) + ' m²' },
    metricas.cbuq_m2 > 0 && { label: 'CBUQ - Área', valor: fmt(metricas.cbuq_m2) + ' m²' },
    metricas.cbuq_t > 0 && { label: 'CBUQ - Toneladas', valor: fmt(metricas.cbuq_t) + ' t' },
    metricas.binder_m2 > 0 && { label: 'Binder', valor: fmt(metricas.binder_m2) + ' m²' },
    metricas.pintura_m2 > 0 && { label: 'Pintura ligação', valor: fmt(metricas.pintura_m2) + ' m²' },
    metricas.meio_fio_m > 0 && { label: 'Meio-fio', valor: fmt(metricas.meio_fio_m) + ' m' },
    metricas.linha_agua_m > 0 && { label: "Linha d'água", valor: fmt(metricas.linha_agua_m) + ' m' },
    metricas.calcada_m2 > 0 && { label: 'Calçada', valor: fmt(metricas.calcada_m2) + ' m²' },
    metricas.limpeza_m2 > 0 && { label: 'Limpeza', valor: fmt(metricas.limpeza_m2) + ' m²' },
  ].filter(Boolean) as { label: string; valor: string }[]

  const frentes = [...new Set(registrosFiltrados.map((r) => `${r.bairro} / ${r.via}`))].sort()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {isAdmin ? 'Central Operacional' : 'Meu Dia'}
      </h1>

      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Data de acompanhamento</label>
          <input type="date" value={dataFoco} onChange={(e) => setDataFoco(e.target.value)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
        </div>
      </div>

      {registrosFiltrados.length > 0 ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{metricas.registros} lançamento(s) encontrado(s) para {new Date(dataFoco + 'T12:00:00').toLocaleDateString('pt-BR')}.</p>
      ) : (
        <p className="text-sm text-zinc-500">Nenhum lançamento encontrado para esta data.</p>
      )}

      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lançamentos', value: String(metricas.registros) },
            { label: 'Bairros', value: String(metricas.bairros) },
            { label: 'Vias', value: String(metricas.vias) },
            { label: 'Apontadores', value: String(metricas.apontadores) },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500">Meus lançamentos</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{String(metricas.registros)}</p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500">Vias trabalhadas</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{String(metricas.vias)}</p>
          </div>
        </div>
      )}

      {producao.length > 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            {isAdmin ? 'Resumo operacional do dia' : 'Minha produção do dia'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                  <th className="p-2 font-medium">Serviço</th>
                  <th className="p-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {producao.map((p) => (
                  <tr key={p.label} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    <td className="p-2">{p.label}</td>
                    <td className="p-2">{p.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Frentes trabalhadas</h2>
          {frentes.length > 0 ? (
            <ul className="space-y-1">
              {frentes.map((f) => <li key={f} className="text-sm text-zinc-700 dark:text-zinc-300">{f}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma frente trabalhada nessa data.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => navigate('/lancamentos')} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Lançar atividade</button>
        {isAdmin && <button onClick={() => navigate('/controle-relatorios')} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Relatórios</button>}
        <button onClick={() => navigate('/correcoes')} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Correções</button>
        {isAdmin && <button onClick={() => navigate('/cadastros')} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">Cadastros</button>}
        {!isAdmin && <button onClick={() => navigate('/relatorio-whatsapp')} className="px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">WhatsApp</button>}
      </div>
    </div>
  )
}
