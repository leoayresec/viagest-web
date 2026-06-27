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

const navGroups = [
  {
    label: 'CENTRAL',
    items: [
      { to: '/', label: 'Dashboard', icon: Home, permission: 'dashboard:view' },
      { to: '/lancamentos', label: 'Lançar atividade', icon: ClipboardList, permission: 'records:create' },
    ],
  },
  {
    label: 'OPERAÇÃO',
    items: [
      { to: '/historico-via', label: 'Histórico da Via', icon: Eye, permission: 'analysis:historico' },
      { to: '/controle-relatorios', label: 'Controle de Relatórios', icon: BarChart3, permission: 'reports:controle' },
    ],
  },
  {
    label: 'RELATÓRIOS',
    items: [
      { to: '/relatorio-whatsapp', label: 'Relatório WhatsApp', icon: MessageSquare, permission: 'reports:whatsapp' },
      { to: '/relatorio-pdf', label: 'Relatório PDF', icon: File, permission: 'reports:pdf' },
      { to: '/relatorios-cadastros', label: 'Relatórios de Cadastros', icon: Database, permission: 'reports:cadastros' },
      { to: '/planilha-medicao', label: 'Planilha Medição', icon: Sheet, permission: 'reports:planilha' },
    ],
  },
  {
    label: 'GESTÃO',
    items: [
      { to: '/correcoes', label: 'Central de Correções', icon: AlertTriangle, permission: 'corrections:view' },
      { to: '/cadastros', label: 'Cadastros', icon: Settings, permission: 'settings:read' },
      { to: '/usuarios', label: 'Usuários', icon: Users, permission: 'users:read' },
    ],
  },
  {
    label: 'ANÁLISE',
    items: [
      { to: '/estimativa', label: 'Estimativa Financeira', icon: DollarSign, permission: 'analysis:estimativa' },
      { to: '/avanco-obra', label: 'Avanço da Obra', icon: TrendingUp, permission: 'analysis:avanco' },
      { to: '/prateleira', label: 'Prateleira', icon: Archive, permission: 'analysis:prateleira' },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { to: '/sistema', label: 'Sistema', icon: HardDriveDownload, permission: 'system:backup' },
      { to: '/perfil', label: 'Meu Perfil', icon: UserCircle, permission: null },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  function hasPermission(permission: string | null) {
    if (!permission) return true
    return user?.permissions?.includes(permission) ?? false
  }

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
        <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.permission))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 pt-3 pb-1">
                {group.label}
              </p>
              {visibleItems.map((item) => (
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
          )
        })}
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
