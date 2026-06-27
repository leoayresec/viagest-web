import { useState, useRef } from 'react'
import { useRecordsStore } from '../../records/stores/records.store'
import { Download, Upload, Archive, Trash2, AlertTriangle, CheckCircle2, FileJson, FileArchive } from 'lucide-react'

const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']

function nomeMesAtual(): string {
  const agora = new Date()
  return `${MESES[agora.getMonth()]}_${agora.getFullYear()}`
}

function baixarArquivo(conteudo: string, nomeArquivo: string) {
  const blob = new Blob([conteudo], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}

function coletarTodosOsDados(): Record<string, unknown> {
  const dados: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i)
    if (chave && chave.startsWith('viagest_')) {
      try {
        dados[chave] = JSON.parse(localStorage.getItem(chave) || '')
      } catch {
        dados[chave] = localStorage.getItem(chave)
      }
    }
  }
  return dados
}

function gerarTimestamp(): string {
  const agora = new Date()
  const dia = String(agora.getDate()).padStart(2, '0')
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const ano = agora.getFullYear()
  const h = String(agora.getHours()).padStart(2, '0')
  const m = String(agora.getMinutes()).padStart(2, '0')
  return `${dia}${mes}${ano}_${h}${m}`
}

export function SistemaPage() {
  const records = useRecordsStore((s) => s.records)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [backupGerado, setBackupGerado] = useState(false)
  const [closureName, setClosureName] = useState(nomeMesAtual())
  const [closureGerado, setClosureGerado] = useState(false)
  const [checkBaixei, setCheckBaixei] = useState(false)
  const [checkQueroFechar, setCheckQueroFechar] = useState(false)
  const [arquivosSalvos] = useState<{ nome: string; data: string; tipo: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('viagest_backup_log') || '[]')
    } catch {
      return []
    }
  })

  const [restoreTipo, setRestoreTipo] = useState<'json' | 'zip'>('json')
  const [restoreArquivo, setRestoreArquivo] = useState<File | null>(null)
  const [restoreSubstituir, setRestoreSubstituir] = useState(true)
  const [restoreCadastros, setRestoreCadastros] = useState(false)
  const [restoreConfirmado, setRestoreConfirmado] = useState(false)

  function handleGerarBackup() {
    const dados = coletarTodosOsDados()
    const timestamp = gerarTimestamp()
    baixarArquivo(JSON.stringify(dados, null, 2), `viagest_backup_${timestamp}.json`)
    setBackupGerado(true)

    const log = JSON.parse(localStorage.getItem('viagest_backup_log') || '[]')
    log.push({ nome: `viagest_backup_${timestamp}.json`, data: new Date().toISOString(), tipo: 'Backup manual' })
    localStorage.setItem('viagest_backup_log', JSON.stringify(log))
  }

  function handleGerarFechamento() {
    const dados = coletarTodosOsDados()
    const nome = closureName.trim() || nomeMesAtual()
    baixarArquivo(JSON.stringify(dados, null, 2), `viagest_fechamento_${nome}_${gerarTimestamp()}.json`)
    setClosureGerado(true)

    const log = JSON.parse(localStorage.getItem('viagest_backup_log') || '[]')
    log.push({ nome: `viagest_fechamento_${nome}.json`, data: new Date().toISOString(), tipo: 'Fechamento mensal' })
    localStorage.setItem('viagest_backup_log', JSON.stringify(log))
  }

  function handleLimparELancarNovoMes() {
    if (!checkBaixei || !checkQueroFechar) {
      alert('Confirme as duas opções antes de limpar os lançamentos.')
      return
    }
    if (!window.confirm('Tem certeza? Esta ação irá limpar todos os registros do mês atual. O backup já foi gerado.')) return
    localStorage.removeItem('viagest_records')
    window.location.reload()
  }

  function handleRestoreArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setRestoreArquivo(file)
  }

  function handleRestaurar() {
    if (!restoreConfirmado) { alert('Confirme que deseja restaurar o backup.'); return }
    if (!restoreArquivo) { alert('Selecione um arquivo de backup.'); return }

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const dados = JSON.parse(evt.target?.result as string)
        for (const [chave, valor] of Object.entries(dados)) {
          if (!restoreCadastros && (chave === 'viagest_vias' || chave === 'viagest_team' || chave === 'viagest_users')) continue
          if (!restoreSubstituir && chave === 'viagest_records') continue
          localStorage.setItem(chave, JSON.stringify(valor))
        }
        alert('Backup restaurado com sucesso! Recarregando a página...')
        window.location.reload()
      } catch {
        alert('Erro ao ler o arquivo. Verifique se é um backup válido.')
      }
    }
    reader.readAsText(restoreArquivo)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Archive className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Sistema</h1>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 space-y-1">
        <p><strong>Modelo de segurança:</strong> O ViaGest opera com dados locais (localStorage). Para evitar perda de dados, faça backups periódicos.</p>
        <p>O fechamento mensal gera um arquivo ZIP (JSON) com todos os dados antes de limpar os lançamentos, permitindo iniciar o mês seguinte com o sistema limpo.</p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Download className="w-5 h-5" /> Backup manual
        </h2>
        <p className="text-sm text-zinc-500">Gere um arquivo com todos os dados do sistema para guardar em local seguro.</p>
        <div className="flex items-center gap-3">
          <button onClick={handleGerarBackup} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors flex items-center gap-2">
            <Archive className="w-4 h-4" /> Gerar backup ZIP
          </button>
          {backupGerado && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Backup gerado e baixado
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">O arquivo foi baixado automaticamente. Salve-o no Google Drive ou outro local seguro.</p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Iniciar novo mês
        </h2>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome do fechamento</label>
          <input type="text" value={closureName} onChange={(e) => setClosureName(e.target.value.toUpperCase())}
            className="w-full max-w-xs px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" />
        </div>

        <p className="text-sm text-zinc-500">Registros atuais: <strong className="text-zinc-900 dark:text-zinc-100">{records.length}</strong> lançamento(s)</p>

        <div className="flex items-center gap-3">
          <button onClick={handleGerarFechamento} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium rounded-lg text-sm hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
            1️⃣ Gerar fechamento mensal ZIP
          </button>
          {closureGerado && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Fechamento baixado
            </span>
          )}
        </div>

        {closureGerado && (
          <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={checkBaixei} onChange={(e) => setCheckBaixei(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
              Confirmo que já baixei e guardei o ZIP
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={checkQueroFechar} onChange={(e) => setCheckQueroFechar(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
              Confirmo que quero fechar o mês
            </label>
            <button onClick={handleLimparELancarNovoMes} disabled={!checkBaixei || !checkQueroFechar}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> 2️⃣ Limpar lançamentos e iniciar novo mês
            </button>
          </div>
        )}
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Arquivos salvos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
                <th className="p-3 font-medium">Arquivo</th>
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {arquivosSalvos.length === 0 ? (
                <tr><td colSpan={3} className="p-6 text-center text-zinc-400">Nenhum backup salvo ainda.</td></tr>
              ) : (
                arquivosSalvos.slice().reverse().map((arq, i) => (
                  <tr key={i} className="border-b border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                    <td className="p-3">{arq.nome}</td>
                    <td className="p-3">{new Date(arq.data).toLocaleString('pt-BR')}</td>
                    <td className="p-3">{arq.tipo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Restaurar backup
        </h2>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="radio" name="restoreTipo" checked={restoreTipo === 'json'} onChange={() => setRestoreTipo('json')}
              className="border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
            <FileJson className="w-4 h-4" /> Backup JSON
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="radio" name="restoreTipo" checked={restoreTipo === 'zip'} onChange={() => setRestoreTipo('zip')}
              className="border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
            <FileArchive className="w-4 h-4" /> Backup/Fechamento ZIP
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Selecionar arquivo</label>
          <input type="file" ref={fileInputRef} onChange={handleRestoreArquivo} accept=".json"
            className="w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-900 dark:file:bg-zinc-100 file:text-zinc-100 dark:file:text-zinc-900 hover:file:bg-zinc-700 dark:hover:file:bg-zinc-300 cursor-pointer file:cursor-pointer" />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={restoreSubstituir} onChange={(e) => setRestoreSubstituir(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
            Substituir registros atuais
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={restoreCadastros} onChange={(e) => setRestoreCadastros(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
            Restaurar também cadastros (vias, equipe, usuários)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={restoreConfirmado} onChange={(e) => setRestoreConfirmado(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-500" />
            Confirmo que desejo restaurar este backup
          </label>
        </div>

        <button onClick={handleRestaurar} disabled={!restoreConfirmado || !restoreArquivo}
          className="px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <Upload className="w-4 h-4" /> Restaurar backup
        </button>
      </div>
    </div>
  )
}
