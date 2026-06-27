import { useState } from 'react'
import { useSettingsStore } from '../../settings/stores/settings.store'

type Opcao = 'bairros' | 'vias' | 'apontadores' | 'personalizado'

export function RelatoriosCadastrosPage() {
  const [opcao, setOpcao] = useState<Opcao>('bairros')
  const [checkBairros, setCheckBairros] = useState(false)
  const [checkVias, setCheckVias] = useState(false)
  const [checkApontadores, setCheckApontadores] = useState(false)
  const [checkApontadorVia, setCheckApontadorVia] = useState(false)

  const { vias, listarBairros, listarEquipe } = useSettingsStore()

  function gerarDados(): { colunas: string[]; linhas: string[][] } {
    if (opcao === 'bairros') {
      const bairros = listarBairros()
      return {
        colunas: ['Bairro', 'Vias ativas'],
        linhas: bairros.map((b) => [b, String(vias.filter((v) => v.bairro === b && v.status === 'ativa').length)]),
      }
    }

    if (opcao === 'vias') {
      const ativas = vias.filter((v) => v.status === 'ativa')
      return {
        colunas: ['Bairro', 'Via'],
        linhas: ativas.map((v) => [v.bairro, v.nome]),
      }
    }

    if (opcao === 'apontadores') {
      const nomes = listarEquipe('apontador')
      return {
        colunas: ['Apontador'],
        linhas: nomes.map((n) => [n]),
      }
    }

    const blocos: { colunas: string[]; linhas: string[][] }[] = []

    if (checkBairros) {
      const bairros = listarBairros()
      blocos.push({
        colunas: ['Bairro', 'Vias ativas'],
        linhas: bairros.map((b) => [b, String(vias.filter((v) => v.bairro === b && v.status === 'ativa').length)]),
      })
    }

    if (checkVias) {
      const ativas = vias.filter((v) => v.status === 'ativa')
      blocos.push({
        colunas: ['Bairro', 'Via'],
        linhas: ativas.map((v) => [v.bairro, v.nome]),
      })
    }

    if (checkApontadores) {
      const nomes = listarEquipe('apontador')
      blocos.push({
        colunas: ['Apontador'],
        linhas: nomes.map((n) => [n]),
      })
    }

    if (checkApontadorVia) {
      const nomes = listarEquipe('apontador')
      blocos.push({
        colunas: ['Apontador', 'Via'],
        linhas: nomes.map((n) => [n, vias.find((v) => v.status === 'ativa')?.nome || '-']),
      })
    }

    const colunas = [...new Set(blocos.flatMap((b) => b.colunas))]
    const linhas = blocos.flatMap((b, idx) => {
      if (idx > 0) return [colunas.map(() => ''), ...b.linhas.map((l) => {
        const row = colunas.map(() => '')
        b.colunas.forEach((col, ci) => {
          const destIdx = colunas.indexOf(col)
          if (destIdx >= 0) row[destIdx] = l[ci]
        })
        return row
      })]
      return b.linhas.map((l) => {
        const row = colunas.map(() => '')
        b.colunas.forEach((col, ci) => {
          const destIdx = colunas.indexOf(col)
          if (destIdx >= 0) row[destIdx] = l[ci]
        })
        return row
      })
    })

    return { colunas, linhas }
  }

  const dados = gerarDados()

  function handleDownloadCSV() {
    if (dados.colunas.length === 0) return
    const header = dados.colunas.join(';')
    const rows = dados.linhas.map((l) => l.join(';'))
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_cadastros_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Relatórios de Cadastros</h1>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">O que deseja gerar?</h2>
        <div className="space-y-2">
          {[
            { value: 'bairros', label: 'Bairros' },
            { value: 'vias', label: 'Vias ativas' },
            { value: 'apontadores', label: 'Apontadores ativos' },
            { value: 'personalizado', label: 'Geral personalizado' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="radio" name="opcao" value={opt.value} checked={opcao === opt.value} onChange={() => setOpcao(opt.value as Opcao)} className="accent-zinc-900 dark:accent-zinc-100" />
              {opt.label}
            </label>
          ))}
        </div>

        {opcao === 'personalizado' && (
          <div className="space-y-2 pl-6">
            {[
              { label: 'Bairros', setter: setCheckBairros, val: checkBairros },
              { label: 'Vias ativas', setter: setCheckVias, val: checkVias },
              { label: 'Apontadores ativos', setter: setCheckApontadores, val: checkApontadores },
              { label: 'Apontador e via', setter: setCheckApontadorVia, val: checkApontadorVia },
            ].map((cb) => (
              <label key={cb.label} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={cb.val} onChange={(e) => cb.setter(e.target.checked)} className="accent-zinc-900 dark:accent-zinc-100" />
                {cb.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {dados.colunas.length > 0 && dados.linhas.length > 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pré-visualização</h2>
            <button onClick={handleDownloadCSV} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">Download CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                  {dados.colunas.map((c, i) => <th key={i} className="p-3 font-medium">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {dados.linhas.map((linha, i) => (
                  <tr key={i} className={`border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 ${linha.every((c) => !c) ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''}`}>
                    {linha.map((cel, j) => <td key={j} className="p-3">{cel}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
