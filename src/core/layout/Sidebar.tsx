import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  AlertTriangle,
  Settings,
  Users,
  HardDriveDownload,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Home,
  Eye,
  BarChart3,
  Archive,
  DollarSign,
  TrendingUp,
  MessageSquare,
  File,
  Sheet,
  Database,
} from 'lucide-react'
import { useAuthStore } from '../../domains/auth/auth.store'
import { useTheme } from '../theme/ThemeContext'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: Home, adminOnly: true },
  { to: '/lancamentos', label: 'Lançar atividade', icon: ClipboardList, adminOnly: false },
]

const operacaoNav = [
  { to: '/historico-via', label: 'Histórico da Via', icon: Eye, adminOnly: true },
  { to: '/controle-relatorios', label: 'Controle de Relatórios', icon: BarChart3, adminOnly: true },
]

const relatoriosNav = [
  { to: '/relatorio-whatsapp', label: 'Relatório WhatsApp', icon: MessageSquare, adminOnly: false },
  { to: '/relatorio-pdf', label: 'Relatório PDF', icon: File, adminOnly: true },
  { to: '/relatorios-cadastros', label: 'Relatórios de Cadastros', icon: Database, adminOnly: true },
  { to: '/planilha-medicao', label: 'Planilha Medição', icon: Sheet, adminOnly: true },
]

const gestaoNav = [
  { to: '/correcoes', label: 'Central de Correções', icon: AlertTriangle, adminOnly: false },
  { to: '/cadastros', label: 'Cadastros', icon: Settings, adminOnly: true },
  { to: '/usuarios', label: 'Usuários', icon: Users, adminOnly: true },
]

const analiseNav = [
  { to: '/estimativa', label: 'Estimativa Financeira', icon: DollarSign, adminOnly: true },
  { to: '/avanco-obra', label: 'Avanço da Obra', icon: TrendingUp, adminOnly: true },
  { to: '/prateleira', label: 'Prateleira', icon: Archive, adminOnly: true },
]

const sistemaNav = [
  { to: '/sistema', label: 'Sistema', icon: HardDriveDownload, adminOnly: true },
  { to: '/perfil', label: 'Alterar senha', icon: UserCircle, adminOnly: false },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">ViaGest</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Sistema de Gestão de Obras</p>
      </div>

      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">{user?.name}</p>
        <p className="text-xs text-zinc-500 capitalize">{user?.profile}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {[
          { label: 'CENTRAL', items: mainNav },
          ...(user?.profile === 'admin' ? [{ label: 'OPERAÇÃO', items: operacaoNav }] : []),
          ...(user?.profile === 'admin' ? [{ label: 'RELATÓRIOS', items: relatoriosNav }] : []),
          { label: user?.profile === 'admin' ? 'GESTÃO' : 'MENU', items: gestaoNav },
          ...(user?.profile === 'admin' ? [{ label: 'ANÁLISE', items: analiseNav }] : []),
          { label: 'SISTEMA', items: sistemaNav },
        ].map((group) => (
          <div key={group.label}>
            {user?.profile === 'admin' && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 pt-3 pb-1">
                {group.label}
              </p>
            )}
            {group.items
              .filter((item) => !item.adminOnly || user?.profile === 'admin')
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
