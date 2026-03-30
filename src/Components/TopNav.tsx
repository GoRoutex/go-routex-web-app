import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, History, Bell, PanelRightClose } from 'lucide-react'

type TopNavProps = {
  isSidebarCollapsed: boolean
  isRightSidebarVisible: boolean
  isDarkMode: boolean
  onToggleSidebar: () => void
  onToggleRightSidebar: () => void
  onToggleTheme: () => void
}

const searchTargets = [
  { terms: ['dashboard', 'overview', 'tong quan'], to: '/admin/dashboard' },
  { terms: ['vehicle', 'vehicles', 'fleet', 'xe', 'doi xe', 'phuong tien'], to: '/admin/vehicles' },
  { terms: ['routes', 'route', 'trip', 'chuyen xe', 'chuyen', 'journey', 'tuyen'], to: '/admin/routes' },
  { terms: ['location', 'province', 'city', 'tinh', 'thanh pho'], to: '/admin/locations' },
  { terms: ['schedule', 'lich', 'lich trinh', 'lich chuyen'], to: '/admin/schedules' },
  { terms: ['ticket', 've', 'dat cho'], to: '/admin/tickets' },
  { terms: ['maintenance', 'bao tri', 'bảo tri'], to: '/admin/maintenance' },
  { terms: ['staff', 'nhan su', 'tai xe', 'drivers'], to: '/admin/staff' },
  { terms: ['health', 'system health', 'suc khoe'], to: '/admin/health' },
  { terms: ['feedback', 'phan hoi'], to: '/admin/feedback' },
  { terms: ['revenue', 'doanh thu'], to: '/admin/reports/revenue' },
  { terms: ['expenses', 'chi phi'], to: '/admin/reports/expenses' },
  { terms: ['salary', 'luong', 'payroll'], to: '/admin/reports/salaries' },
  { terms: ['profile overview', 'overview profile', 'tổng quan hồ sơ'], to: '/admin/profile/overview' },
  { terms: ['settings', 'cài dat', 'cai dat', 'profile'], to: '/admin/profile/settings' },
]

export function TopNav({
  isSidebarCollapsed,
  isRightSidebarVisible,
  isDarkMode,
  onToggleSidebar,
  onToggleRightSidebar,
  onToggleTheme,
}: TopNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const breadcrumbs = useMemo(() => {
    const path = location.pathname

    const base = (label: string) => (
      <div className="flex items-center gap-2">
        <Link to="/admin/dashboard" className="text-slate-400 font-bold hover:text-brand-primary transition-colors">
          Bảng điều khiển
        </Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900 font-bold">{label}</span>
      </div>
    )

    const map: Record<string, ReactNode> = {
      '/admin/dashboard': <span className="text-slate-900 font-bold">Tổng quan vận hành</span>,
      '/admin/staff': base('Nhân sự & Tài xế'),
      '/admin/vehicles': base('Phương tiện'),
      '/admin/routes': base('Tuyến đường'),
      '/admin/locations': base('Location'),
      '/admin/schedules': base('Lịch chuyến'),
      '/admin/tickets': base('Vé & Đặt chỗ'),
      '/admin/maintenance': base('Bảo trì'),
      '/admin/profile/overview': base('Tổng quan hồ sơ'),
      '/admin/health': base('System Health'),
      '/admin/feedback': base('Feedback'),
      '/admin/profile/settings': base('Cài đặt hồ sơ'),
    }

    return map[path] ?? (
      <div className="flex items-center gap-2">
        <Link to="/admin/dashboard" className="text-slate-400 font-bold hover:text-brand-primary transition-colors">
          Quản trị
        </Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900 font-bold">Chi tiết</span>
      </div>
    )
  }, [location.pathname])

  const performSearch = () => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return

    const match = searchTargets.find((item) =>
      item.terms.some((term) => normalized.includes(term)),
    )

    if (match) {
      navigate(match.to)
      setQuery('')
      return
    }

    if (normalized.includes('analytics') || normalized.includes('phân tích')) {
      navigate('/admin/dashboard/analytics')
      setQuery('')
      return
    }

    window.alert('Không tìm thấy mục phù hợp. Hãy thử: xe, tuyến, vé, bảo trì, nhân sự, doanh thu.')
  }

  return (
    <header className={`h-20 flex items-center justify-between px-8 border-b backdrop-blur-sm shrink-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/50 border-slate-100'
    }`}>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-primary cursor-pointer transition-colors border border-slate-100"
          title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
        >
          <PanelRightClose size={20} className="rotate-180" />
        </button>
        <div className="flex items-center gap-2 text-[14px]">
          {breadcrumbs}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                performSearch()
              }
            }}
            placeholder="Tìm kiếm nhanh..."
            className={`rounded-xl pl-11 pr-12 py-2.5 text-[13px] w-64 outline-none transition-all border focus:ring-4 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-brand-primary/20 focus:border-brand-primary/40'
                : 'bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-brand-primary/10 focus:border-brand-primary/40 focus:bg-white'
            }`}
          />
          <button
            type="button"
            onClick={performSearch}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded shadow-sm border font-bold hover:text-brand-primary transition-colors ${
              isDarkMode
                ? 'text-slate-400 bg-slate-900 border-slate-700'
                : 'text-slate-400 bg-white border-slate-100'
            }`}
            title="Tìm kiếm"
          >
            ⌘ K
          </button>
        </div>

        <div className={`flex items-center gap-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
                : 'hover:bg-slate-50 hover:text-brand-primary border-transparent hover:border-slate-100'
            }`}
            title={isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/analytics')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-transparent ${
              isDarkMode ? 'hover:bg-slate-800 hover:text-brand-primary hover:border-slate-700' : 'hover:bg-slate-50 hover:text-brand-primary hover:border-slate-100'
            }`}
            title="Mở báo cáo phân tích"
          >
            <History size={20} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/feedback')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-transparent ${
              isDarkMode ? 'hover:bg-slate-800 hover:text-brand-primary hover:border-slate-700' : 'hover:bg-slate-50 hover:text-brand-primary hover:border-slate-100'
            }`}
            title="Xem phản hồi"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            onClick={onToggleRightSidebar}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-transparent ${
              isDarkMode ? 'hover:bg-slate-800 hover:text-brand-primary hover:border-slate-700' : 'hover:bg-slate-50 hover:text-brand-primary hover:border-slate-100'
            }`}
            title={isRightSidebarVisible ? 'Đóng khu thông báo' : 'Mở khu thông báo'}
          >
            <PanelRightClose size={20} />
          </button>
        </div>

        <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

        <button
          type="button"
          onClick={() => navigate('/admin/profile/settings')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Cài đặt hồ sơ"
        >
          <div className="text-right hidden sm:block">
            <p className={`text-sm font-black leading-none ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Admin User</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black group-hover:scale-105 transition-transform">
            AD
          </div>
        </button>
      </div>
    </header>
  )
}
