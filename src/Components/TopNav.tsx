import { Link, useLocation } from 'react-router-dom'
import { Search, Sun, History, Bell, PanelRightClose } from 'lucide-react'

export function TopNav() {
  const location = useLocation()

  // Dynamic breadcrumb logic
  const getBreadcrumbs = () => {
    const path = location.pathname

    if (path === '/admin/dashboard') {
      return (
        <span className="text-gray-900 font-medium">Dashboard</span>
      )
    }

    if (path === '/admin/staff') {
      return (
        <div className="flex items-center gap-2">
          <Link to="/admin/dashboard" className="text-gray-400 font-medium hover:text-black transition-colors">Dashboard</Link>
          <span className="text-gray-200">/</span>
          <span className="text-gray-900 font-medium">Drivers & Staff</span>
        </div>
      )
    }

    // Default fallback
    return (
      <div className="flex items-center gap-2">
        <Link to="/admin/dashboard" className="text-gray-400 font-medium hover:text-black transition-colors">Dashboards</Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-900 font-medium">Default</span>
      </div>
    )
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <PanelRightClose size={18} className="text-gray-400 rotate-180" />
        <div className="flex items-center gap-2 text-[13px]">
          {getBreadcrumbs()}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-100/50 border-none rounded-lg pl-9 pr-12 py-1.5 text-[13px] w-48 focus:ring-1 focus:ring-gray-200 outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-white px-1 rounded shadow-sm border border-gray-100">⌘/</span>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <Sun size={18} className="hover:text-gray-600 cursor-pointer" />
          <History size={18} className="hover:text-gray-600 cursor-pointer" />
          <Bell size={18} className="hover:text-gray-600 cursor-pointer" />
          <PanelRightClose size={18} className="hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </header>
  )
}
