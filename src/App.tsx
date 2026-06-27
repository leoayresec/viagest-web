import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './core/layout/AppLayout'
import { ProtectedRoute } from './core/layout/ProtectedRoute'
import { RoleRoute } from './core/layout/RoleRoute'
import { LoginPage } from './domains/auth/pages/LoginPage'
import { DashboardPage } from './domains/dashboard/pages/DashboardPage'
import { RecordsPage } from './domains/records/pages/RecordsPage'
import { CorrectionsPage } from './domains/corrections/pages/CorrectionsPage'
import { SettingsPage } from './domains/settings/pages/SettingsPage'
import { UsersPage } from './domains/users/pages/UsersPage'
import { BackupPage } from './domains/backup/pages/BackupPage'
import { ProfilePage } from './domains/profile/pages/ProfilePage'
import { HistoricoViaPage } from './domains/historico-via/pages/HistoricoViaPage'
import { ControleRelatoriosPage } from './domains/controle-relatorios/pages/ControleRelatoriosPage'
import { RelatorioWhatsAppPage } from './domains/relatorio-whatsapp/pages/RelatorioWhatsAppPage'
import { RelatorioPDFPage } from './domains/relatorio-pdf/pages/RelatorioPDFPage'
import { RelatoriosCadastrosPage } from './domains/relatorios-cadastros/pages/RelatoriosCadastrosPage'
import { PlanilhaMedicaoPage } from './domains/planilha-medicao/pages/PlanilhaMedicaoPage'
import { EstimativaFinanceiraPage } from './domains/estimativa-financeira/pages/EstimativaFinanceiraPage'
import { AvancObraPage } from './domains/avanco-obra/pages/AvancObraPage'
import { PrateleiraPage } from './domains/prateleira/pages/PrateleiraPage'
import { SistemaPage } from './domains/sistema/pages/SistemaPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/lancamentos" element={<RecordsPage />} />
            <Route path="/correcoes" element={<CorrectionsPage />} />
            <Route path="/relatorio-whatsapp" element={<RelatorioWhatsAppPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route element={<RoleRoute requiredPermissions={['settings:read']} />}>
              <Route path="/cadastros" element={<SettingsPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['users:read']} />}>
              <Route path="/usuarios" element={<UsersPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['system:backup']} />}>
              <Route path="/backup" element={<BackupPage />} />
              <Route path="/sistema" element={<SistemaPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['analysis:historico']} />}>
              <Route path="/historico-via" element={<HistoricoViaPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['reports:controle']} />}>
              <Route path="/controle-relatorios" element={<ControleRelatoriosPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['reports:pdf']} />}>
              <Route path="/relatorio-pdf" element={<RelatorioPDFPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['reports:cadastros']} />}>
              <Route path="/relatorios-cadastros" element={<RelatoriosCadastrosPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['reports:planilha']} />}>
              <Route path="/planilha-medicao" element={<PlanilhaMedicaoPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['analysis:estimativa']} />}>
              <Route path="/estimativa" element={<EstimativaFinanceiraPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['analysis:avanco']} />}>
              <Route path="/avanco-obra" element={<AvancObraPage />} />
            </Route>
            <Route element={<RoleRoute requiredPermissions={['analysis:prateleira']} />}>
              <Route path="/prateleira" element={<PrateleiraPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
