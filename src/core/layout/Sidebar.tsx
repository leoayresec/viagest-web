import { useState } from 'react'
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
  ChevronsLeft,
  ChevronsRight,
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar_collapsed', String(next))
  }

  function hasPermission(permission: string | null) {
    if (!permission) return true
    return user?.permissions?.includes(permission) ?? false
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-200`}>
      <div className={`border-b border-zinc-200 dark:border-zinc-800 flex items-center ${collapsed ? 'justify-center p-3' : 'justify-between p-5'}`}>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">ViaGest</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Sistema de Gestão de Obras</p>
          </div>
        )}
        <button onClick={toggleCollapse} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">{user?.name}</p>
          <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
        </div>
      )}

      {collapsed && (
        <div className="py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-center" title={user?.name}>
          <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasPermission(item.permission))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 pt-3 pb-1">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                      collapsed ? 'justify-center px-2 py-2' : 'px-3 py-1.5'
                    } ${
                      isActive
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      <div className={`border-t border-zinc-200 dark:border-zinc-800 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
        <button
          onClick={toggle}
          title={collapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full transition-colors ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro')}
        </button>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full transition-colors ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  )
}
