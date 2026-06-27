export function BackupPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Backup</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Backup Manual', desc: 'Baixar backup completo em ZIP', label: 'Gerar Backup' },
          { title: 'Fechamento Mensal', desc: 'Arquivar registros do mês e iniciar novo período', label: 'Iniciar Novo Mês' },
          { title: 'Restauração', desc: 'Restaurar backup de arquivo JSON ou ZIP', label: 'Restaurar' },
        ].map((item) => (
          <div key={item.title} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{item.title}</h2>
            <p className="text-sm text-zinc-500 mb-4">{item.desc}</p>
            <button className="px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">{item.label}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
