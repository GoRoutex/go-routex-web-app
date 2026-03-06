import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './Components/AdminLayout'
import { DashboardAnalyticsPage } from './pages/admin/DashboardAnalyticsPage'
import { DashboardFinancePage } from './pages/admin/DashboardFinancePage'
import { DashboardOverviewPage } from './pages/admin/DashboardOverviewPage'
import { UserProfileOverviewPage } from './pages/admin/UserProfileOverviewPage'

// Client pages
import LandingPage from './pages/client/LandingPage'
import LoginPage from './pages/client/LoginPage'
import RegisterPage from './pages/client/RegisterPage'
import HomePage from './pages/client/HomePage'
import SearchResultPage from './pages/client/SearchResultPage'
import RouteDetailPage from './pages/client/RouteDetailPage'
import BookingPage from './pages/client/BookingPage'

function App() {
  return (
    <Routes>
      {/* ─── Client / Public Routes ─── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/search-results" element={<SearchResultPage />} />
      <Route path="/route-detail" element={<RouteDetailPage />} />
      <Route path="/booking" element={<BookingPage />} />

      {/* ─── Admin Routes ─── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverviewPage />} />
        <Route path="dashboard/analytics" element={<DashboardAnalyticsPage />} />
        <Route path="dashboard/finance" element={<DashboardFinancePage />} />
        <Route path="staff" element={<UserProfileOverviewPage />} />
      </Route>

      {/* ─── Fallback ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
