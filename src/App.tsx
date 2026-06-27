import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './core/layout/AppLayout'
import { ProtectedRoute } from './core/layout/ProtectedRoute'
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
            <Route path="/cadastros" element={<SettingsPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/historico-via" element={<HistoricoViaPage />} />
            <Route path="/controle-relatorios" element={<ControleRelatoriosPage />} />
            <Route path="/relatorio-whatsapp" element={<RelatorioWhatsAppPage />} />
            <Route path="/relatorio-pdf" element={<RelatorioPDFPage />} />
            <Route path="/relatorios-cadastros" element={<RelatoriosCadastrosPage />} />
            <Route path="/planilha-medicao" element={<PlanilhaMedicaoPage />} />
            <Route path="/estimativa" element={<EstimativaFinanceiraPage />} />
            <Route path="/avanco-obra" element={<AvancObraPage />} />
            <Route path="/prateleira" element={<PrateleiraPage />} />
            <Route path="/sistema" element={<SistemaPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
