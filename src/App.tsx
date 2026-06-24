import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { AdminLayout } from './Components/AdminLayout'
import { DashboardAnalyticsPage } from './pages/admin/DashboardAnalyticsPage'
import { FleetManagementPage } from './pages/admin/FleetManagementPage'
import { OperationPointManagementPage } from './pages/admin/OperationPointManagementPage'
import { VehicleManagementPage } from './pages/admin/VehicleManagementPage'
import { TicketingPage } from './pages/admin/TicketingPage'
import { MaintenancePage } from './pages/admin/MaintenancePage'
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage'
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage'
import { AdminProfileOverviewPage } from './pages/admin/AdminProfileOverviewPage'
import { RouteManagementPage } from './pages/admin/RouteManagementPage'
import AdminMerchantManagementPage from './pages/admin/AdminMerchantManagementPage'
import { AdminUserManagementPage } from './pages/admin/AdminUserManagementPage'
import MerchantApplicationFormsPage from './pages/admin/MerchantApplicationFormsPage'

import { MerchantLayout } from './Components/merchant/MerchantLayout'
import { MerchantVehicleManagementPage } from './pages/merchant/MerchantVehicleManagementPage'
import { MerchantScheduleManagementPage } from './pages/merchant/MerchantScheduleManagementPage'
import { MerchantTicketManagementPage } from './pages/merchant/MerchantTicketManagementPage'
import { MerchantFeedbackPage } from './pages/merchant/MerchantFeedbackPage'
import { MerchantStaffManagementPage } from './pages/merchant/MerchantStaffManagementPage'
import { MerchantLocationManagementPage } from './pages/merchant/MerchantLocationManagementPage'
import { MerchantMaintenancePage } from './pages/merchant/MerchantMaintenancePage'
import { MerchantOperationPointPage } from './pages/merchant/MerchantOperationPointPage'
import { MerchantVehicleTemplatePage } from './pages/merchant/MerchantVehicleTemplatePage'
import { MerchantTripManagementPage } from './pages/merchant/MerchantTripManagementPage'
import { MerchantCampaignManagementPage } from './pages/merchant/MerchantCampaignManagementPage'
import { MerchantQuickBookingPage } from './pages/merchant/MerchantQuickBookingPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { NotificationProvider } from './contexts/NotificationContext'
import { NotificationDetailPage } from './pages/common/NotificationDetailPage'


// Lazy loaded dashboard/heavy chart pages (fixes react-doctor/prefer-dynamic-import for recharts)
const DashboardOverviewPage = lazy(() => import('./pages/admin/DashboardOverviewPage').then(m => ({ default: m.DashboardOverviewPage })))
const DashboardFinancePage = lazy(() => import('./pages/admin/DashboardFinancePage').then(m => ({ default: m.DashboardFinancePage })))
const MerchantPortalPage = lazy(() => import('./pages/merchant/MerchantPortalPage').then(m => ({ default: m.MerchantPortalPage })))

// Client pages
import LandingPage from './pages/client/LandingPage'
import LoginPage from './pages/client/LoginPage'
import ForgotPasswordPage from './pages/client/ForgotPasswordPage'
import RegisterPage from './pages/client/RegisterPage'
import VerifyEmailPage from './pages/client/VerifyEmailPage'
import CompleteProfilePage from './pages/client/CompleteProfilePage'
import ClientProfilePage from './pages/client/ClientProfilePage'
import UpdateProfilePage from './pages/client/UpdateProfilePage'
import ResetPasswordPage from './pages/client/ResetPasswordPage'
import ResetPasswordSuccessPage from './pages/client/ResetPasswordSuccessPage'
import ClientSettingsPage from './pages/client/ClientSettingsPage'
import HomePage from './pages/client/HomePage'
import SearchResultPage from './pages/client/SearchResultPage'
import BookingPage from './pages/client/BookingPage'
import ClientSchedulesPage from './pages/client/ClientSchedulesPage'
import ClientSupportPage from './pages/client/ClientSupportPage'
// SeatSelectionPage removed as merged into BookingPage
import PaymentPage from './pages/client/PaymentPage'
import PrivacyPolicyPage from './pages/client/PrivacyPolicyPage'
import TermsOfServicePage from './pages/client/TermsOfServicePage'
import ContactUsPage from './pages/client/ContactUsPage'
import PartnerProgramPage from './pages/client/PartnerProgramPage'
import PartnerRegisterPage from './pages/client/PartnerRegisterPage'
import PaymentResultPage from './pages/client/PaymentResultPage'
import { ClientLayout } from './Components/client/ClientLayout'
// import { hasAdminRole, hasMerchantRole } from './utils/auth'

function AdminRouteGuard({ children }: { children: ReactNode }) {
  // Tạm thời bỏ qua kiểm tra đăng nhập để làm giao diện
  return children
}

function MerchantRouteGuard({ children }: { children: ReactNode }) {
  // Tạm thời bỏ qua kiểm tra đăng nhập để làm giao diện
  return children
}

function App() {
  return (
    <NotificationProvider>
    <>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        </div>
      }>
        <Routes>
        {/* ─── Client / Public Routes ─── */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<ClientProfilePage />} />
          <Route path="/profile/update" element={<UpdateProfilePage />} />
          <Route path="/settings" element={<ClientSettingsPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search-results" element={<SearchResultPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/schedules" element={<ClientSchedulesPage />} />
          <Route path="/support" element={<ClientSupportPage />} />
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
          <Route path="/dieu-khoan-dich-vu" element={<TermsOfServicePage />} />
          <Route path="/lien-he-chung-toi" element={<ContactUsPage />} />
          <Route path="/partner" element={<PartnerProgramPage />} />
          <Route path="/partner/register" element={<PartnerRegisterPage />} />
          <Route path="/notifications/:id" element={<NotificationDetailPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />

        {/* ─── Admin Routes ─── */}
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverviewPage />} />
          <Route path="fleet" element={<FleetManagementPage />} />
          <Route path="vehicles" element={<VehicleManagementPage />} />
          <Route path="schedules" element={<RouteManagementPage />} />
          <Route path="routes" element={<Navigate to="schedules" replace />} />
          <Route path="trips" element={<Navigate to="schedules" replace />} />
          <Route path="operation-points" element={<OperationPointManagementPage />} />
          <Route path="tickets" element={<TicketingPage />} />
          <Route path="merchants" element={<AdminMerchantManagementPage />} />
          <Route path="merchants/applications" element={<MerchantApplicationFormsPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />


          <Route path="dashboard/analytics" element={<DashboardAnalyticsPage />} />
          <Route path="reports/revenue" element={<DashboardFinancePage />} />
          <Route path="profile/overview" element={<AdminProfileOverviewPage />} />
          <Route path="health" element={<AdminSystemHealthPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="notifications/:id" element={<NotificationDetailPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ─── Merchant Routes ─── */}
        <Route
          path="/merchant"
          element={
            <MerchantRouteGuard>
              <MerchantLayout />
            </MerchantRouteGuard>
          }
        >
          <Route index element={<Navigate to="portal" replace />} />
          <Route path="portal" element={<MerchantPortalPage />} />
          <Route path="vehicles" element={<MerchantVehicleManagementPage />} />
          <Route path="vehicle-templates" element={<MerchantVehicleTemplatePage />} />
          <Route path="schedules" element={<MerchantScheduleManagementPage />} />
          <Route path="trips" element={<MerchantTripManagementPage />} />
          <Route path="tickets" element={<MerchantTicketManagementPage />} />
          <Route path="campaigns" element={<MerchantCampaignManagementPage />} />
          <Route path="feedback" element={<MerchantFeedbackPage />} />
          <Route path="staff" element={<MerchantStaffManagementPage />} />
          <Route path="locations" element={<MerchantLocationManagementPage />} />
          <Route path="departments" element={<MerchantOperationPointPage />} />
          <Route path="maintenance" element={<MerchantMaintenancePage />} />
          <Route path="quick-booking" element={<MerchantQuickBookingPage />} />
          <Route path="notifications/:id" element={<NotificationDetailPage />} />
          <Route path="*" element={<Navigate to="portal" replace />} />
        </Route>

        {/* ─── Fallback ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
    </NotificationProvider>
  )
}

export default App
