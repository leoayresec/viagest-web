import { useState, useMemo } from 'react'
import { PackageSearch, Calendar, Download, Info, BarChart3, ListTree, Table } from 'lucide-react'
import { useRecordsStore } from '../../records/stores/records.store'
import { useSettingsStore } from '../../settings/stores/settings.store'
import { fmtNum, dataBr } from '../../../core/utils/format'

interface PrateleiraItem {
  id: string
  data: string
  neighborhood: string
  road: string
  grupo: string
  item: string
  unidade: string
  quantidade: number
  motivo: string
  recorder: string
  supervisor: string
}

const PV_TAMANHOS_PADRAO = ['1.40', '1.50', '1.60', '1.80']

function mesCorrente(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${mes}`
}

export function PrateleiraPage() {
  const records = useRecordsStore((s) => s.records)
  const { listarBairros, listarVias } = useSettingsStore()

  const [dataInicio, setDataInicio] = useState(`${mesCorrente()}-01`)
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date()
    const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    return `${mesCorrente()}-${String(ultimo).padStart(2, '0')}`
  })
  const [filtroBairro, setFiltroBairro] = useState('')
  const [filtroVia, setFiltroVia] = useState('')
  const [carregado, setCarregado] = useState(false)

  const bairros = listarBairros()
  const vias = filtroBairro ? listarVias(filtroBairro) : []

  const itensPrateleira = useMemo((): PrateleiraItem[] => {
    if (!carregado) return []
    const filtrados = records.filter((r) => {
      if (filtroBairro && r.neighborhood !== filtroBairro) return false
      if (filtroVia && r.road !== filtroVia) return false
      if (dataInicio && r.date < dataInicio) return false
      if (dataFim && r.date > dataFim) return false
      return true
    })

    const resultado: PrateleiraItem[] = []

    for (const r of filtrados) {
      if (r.serviceType === 'redes_auxiliares') {
        const totalTubos = (r.data.redesAux || []).reduce((s: number, ra: any) => {
          return s + (ra.tubos || []).reduce((st: number, t: any) => st + (t.comp || 0), 0)
        }, 0)
        resultado.push({
          id: `${r.id}-redes`,
          data: r.date,
          neighborhood: r.neighborhood,
          road: r.road,
          grupo: 'Redes Auxiliares',
          item: 'Rede auxiliar (escavação, colchão, tubos, caixas)',
          unidade: 'm',
          quantidade: totalTubos || 1,
          motivo: 'Item fora da medição financeira',
          recorder: r.recorder || '—',
          supervisor: r.supervisor || '—',
        })
      }

      if (r.serviceType === 'rede_domiciliar') {
        resultado.push({
          id: `${r.id}-domiciliar`,
          data: r.date,
          neighborhood: r.neighborhood,
          road: r.road,
          grupo: 'Rede Domiciliar',
          item: 'Ligação domiciliar',
          unidade: 'un',
          quantidade: r.data.redeDomiciliarQtd || 1,
          motivo: 'Item fora da medição financeira',
          recorder: r.recorder || '—',
          supervisor: r.supervisor || '—',
        })
      }

      if (r.serviceType === 'tubo') {
        const diam = r.data.drenagens?.[0]?.diam
        if (diam === '1500') {
          resultado.push({
            id: `${r.id}-tubo1500`,
            data: r.date,
            neighborhood: r.neighborhood,
            road: r.road,
            grupo: 'Drenagem',
            item: 'Tubo DN 1500',
            unidade: 'm',
            quantidade: r.data.drenagens?.[0]?.tuboQtd || 1,
            motivo: 'Diâmetro sem preço cadastrado',
            recorder: r.recorder || '—',
            supervisor: r.supervisor || '—',
          })
        }
      }

      if (r.serviceType === 'pv') {
        const pvs = r.data.pvs || []
        for (let i = 0; i < pvs.length; i++) {
          const pv = pvs[i]
          const status = (pv.status || '').toUpperCase()
          const tam = (pv.tam || '').trim()
          const naoFinalizado = status !== 'FINALIZADO'
          const tamEspecial = tam && !PV_TAMANHOS_PADRAO.includes(tam.replace(',', '.'))

          if (naoFinalizado || tamEspecial) {
            const motivos: string[] = []
            if (naoFinalizado) motivos.push(`Status: ${pv.status}`)
            if (tamEspecial) motivos.push(`Tamanho: ${tam}`)
            resultado.push({
              id: `${r.id}-pv-${i}`,
              data: r.date,
              neighborhood: r.neighborhood,
              road: r.road,
              grupo: 'PV / BL',
              item: 'PV não compatível',
              unidade: 'un',
              quantidade: 1,
              motivo: motivos.join(' | '),
              recorder: r.recorder || '—',
              supervisor: r.supervisor || '—',
            })
          }
        }
      }

      if (r.serviceType === 'bl') {
        const bls = r.data.bls || []
        for (let i = 0; i < bls.length; i++) {
          const bl = bls[i]
          const status = (bl.status || '').toUpperCase()
          const qtd = bl.qtd || 1
          if (status !== 'FINALIZADO') {
            resultado.push({
              id: `${r.id}-bl-${i}`,
              data: r.date,
              neighborhood: r.neighborhood,
              road: r.road,
              grupo: 'PV / BL',
              item: 'BL não finalizado',
              unidade: 'un',
              quantidade: qtd,
              motivo: `Status: ${bl.status || '—'}`,
              recorder: r.recorder || '—',
              supervisor: r.supervisor || '—',
            })
          }
        }
      }
    }

    return resultado
  }, [records, dataInicio, dataFim, filtroBairro, filtroVia, carregado])

  const totalItens = itensPrateleira.length
  const totalQuantidade = itensPrateleira.reduce((s, i) => s + i.quantidade, 0)
  const itensUnicos = new Set(itensPrateleira.map((i) => `${i.grupo}||${i.item}||${i.unidade}||${i.motivo}`)).size

  const sumario = useMemo(() => {
    const map = new Map<string, PrateleiraItem & { qtd: number }>()
    for (const item of itensPrateleira) {
      const chave = `${item.grupo}||${item.item}||${item.unidade}||${item.motivo}`
      if (map.has(chave)) {
        map.get(chave)!.qtd += item.quantidade
      } else {
        map.set(chave, { ...item, qtd: item.quantidade })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.grupo.localeCompare(b.grupo) || a.item.localeCompare(b.item))
  }, [itensPrateleira])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PackageSearch className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prateleira</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Itens lançados que ainda não possuem preço/código financeiro e ficam fora da medição financeira.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            A prateleira reúne itens que não entram na medição financeira por não possuírem preço cadastrado no orçamento.
            Isso inclui redes auxiliares, rede domiciliar, tubos de diâmetro não previsto e PVs/BLs com status ou
            dimensões fora do padrão. Estes itens são acompanhados separadamente para controle operacional.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bairro</label>
            <select
              value={filtroBairro}
              onChange={(e) => { setFiltroBairro(e.target.value); setFiltroVia('') }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
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
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas</option>
              {vias.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setCarregado(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            <PackageSearch className="h-4 w-4" />
            Carregar prateleira
          </button>
          {carregado && (
            <button
              onClick={() => alert('Exportação disponível quando conectado ao back-end')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </button>
          )}
        </div>
      </div>

      {carregado && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wide">Período</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {dataBr(dataInicio)} — {dataBr(dataFim)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wide">Itens</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{itensUnicos}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">itens únicos</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <ListTree className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wide">Quantidade total</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmtNum(totalQuantidade, 'un')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{totalItens} registro{totalItens !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <Table className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Resumo por grupo
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Grupo</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Item</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Un.</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Quantidade</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sumario.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{item.grupo}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.item}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.unidade}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-white font-medium">{fmtNum(item.qtd)}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate">{item.motivo}</td>
                    </tr>
                  ))}
                </tbody>
                {sumario.length > 0 && (
                  <tfoot className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Total</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">{fmtNum(totalQuantidade)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {!sumario.length && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum item encontrado na prateleira para os filtros selecionados.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <ListTree className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                Detalhamento
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Data</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Bairro</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Via</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Item</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Quantidade</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Motivo</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Apontador</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Encarregado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {itensPrateleira.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{dataBr(item.data)}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{item.neighborhood}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{item.road}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{item.item}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-white font-medium">{fmtNum(item.quantidade)}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate">{item.motivo}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.recorder}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.supervisor}</td>
                    </tr>
                  ))}
                </tbody>
                {itensPrateleira.length > 0 && (
                  <tfoot className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">Total</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">{fmtNum(totalQuantidade)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {!itensPrateleira.length && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum item encontrado na prateleira para os filtros selecionados.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
