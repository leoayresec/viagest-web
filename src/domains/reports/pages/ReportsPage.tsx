export function ReportsPage() {
  const sections = [
    { title: 'WhatsApp', desc: 'Resumo das atividades formatado para WhatsApp', buttons: ['Gerar Relatório'] },
    { title: 'PDF', desc: 'Relatórios quantitativos em PDF', buttons: ['Quantitativo Geral', 'Por Via', 'Redes Auxiliares', 'Rede Domiciliar'] },
    { title: 'Planilha de Medição', desc: 'Exportar planilha modelo por mês, bairro e via', buttons: ['Gerar Planilha'] },
    { title: 'Dados Abertos', desc: 'Tabela editável com filtros avançados', buttons: ['Visualizar Dados'] },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{s.title}</h2>
            <p className="text-sm text-zinc-500 mb-4">{s.desc}</p>
            <div className="space-y-2">
              {s.buttons.map((b) => (
                <button key={b} className="w-full px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left">{b}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
