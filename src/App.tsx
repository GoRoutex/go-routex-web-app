import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './Components/AdminLayout'
import { DashboardAnalyticsPage } from './pages/admin/DashboardAnalyticsPage'
import { DashboardFinancePage } from './pages/admin/DashboardFinancePage'
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage'
import { UserProfileOverviewPage } from './pages/admin/UserProfileOverviewPage'
import { RouteManagementPage } from './pages/admin/RouteManagementPage'
import { FleetManagementPage } from './pages/admin/FleetManagementPage'
import { ExpensesReportPage } from './pages/admin/ExpensesReportPage'
import { SalaryReportPage } from './pages/admin/SalaryReportPage'
import { SchedulesPage } from './pages/admin/SchedulesPage'
import { TicketingPage } from './pages/admin/TicketingPage'
import { MaintenancePage } from './pages/admin/MaintenancePage'

// Client pages
import LandingPage from './pages/client/LandingPage'
import LoginPage from './pages/client/LoginPage'
import RegisterPage from './pages/client/RegisterPage'
import HomePage from './pages/client/HomePage'
import SearchResultPage from './pages/client/SearchResultPage'
import BookingPage from './pages/client/BookingPage'
import ClientRoutesPage from './pages/client/ClientRoutesPage'
import ClientSchedulesPage from './pages/client/ClientSchedulesPage'
import ClientSupportPage from './pages/client/ClientSupportPage'
import SeatSelectionPage from './pages/client/SeatSelectionPage'
import PaymentPage from './pages/client/PaymentPage'

function App() {
  return (
    <Routes>
      {/* ─── Client / Public Routes ─── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/search-results" element={<SearchResultPage />} />
      <Route path="/route-detail" element={<SeatSelectionPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/routes" element={<ClientRoutesPage />} />
      <Route path="/schedules" element={<ClientSchedulesPage />} />
      <Route path="/support" element={<ClientSupportPage />} />

      {/* ─── Admin Routes ─── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverviewPage />} />
        <Route path="fleet" element={<FleetManagementPage />} />
        <Route path="routes" element={<RouteManagementPage />} />

        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="tickets" element={<TicketingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />

        <Route path="dashboard/analytics" element={<DashboardAnalyticsPage />} />
        <Route path="reports/revenue" element={<DashboardFinancePage />} />
        <Route path="reports/expenses" element={<ExpensesReportPage />} />
        <Route path="reports/salaries" element={<SalaryReportPage />} />

        <Route path="staff" element={<UserProfileOverviewPage />} />
      </Route>

      {/* ─── Fallback ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
