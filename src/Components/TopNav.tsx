import { Link, useLocation } from 'react-router-dom'
import { Search, Sun, History, Bell, PanelRightClose } from 'lucide-react'

export function TopNav() {
  const location = useLocation()

  // Dynamic breadcrumb logic
  const getBreadcrumbs = () => {
    const path = location.pathname

    if (path === '/admin/dashboard') {
      return (
        <span className="text-slate-900 font-bold">Tổng quan vận hành</span>
      )
    }

    if (path === '/admin/staff') {
      return (
        <div className="flex items-center gap-2">
          <Link to="/admin/dashboard" className="text-slate-400 font-bold hover:text-brand-primary transition-colors">Bảng điều khiển</Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900 font-bold">Nhân sự & Tài xế</span>
        </div>
      )
    }

    // Default fallback
    return (
      <div className="flex items-center gap-2">
        <Link to="/admin/dashboard" className="text-slate-400 font-bold hover:text-brand-primary transition-colors">Quản trị</Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900 font-bold">Chi tiết</span>
      </div>
    )
  }

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-primary cursor-pointer transition-colors border border-slate-100">
           <PanelRightClose size={20} className="rotate-180" />
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          {getBreadcrumbs()}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-12 py-2.5 text-[13px] w-64 focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/40 focus:bg-white outline-none transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100 font-bold">⌘ K</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          {[Sun, History, Bell, PanelRightClose].map((Icon, i) => (
            <div key={i} className="w-10 h-10 rounded-xl hover:bg-slate-50 hover:text-brand-primary flex items-center justify-center cursor-pointer transition-all border border-transparent hover:border-slate-100">
              <Icon size={20} />
            </div>
          ))}
        </div>

        <div className="h-8 w-px bg-slate-100 mx-2" />

        <div className="flex items-center gap-3 cursor-pointer group">
           <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">Admin User</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Super Admin</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black group-hover:scale-105 transition-transform">
              AD
           </div>
        </div>
      </div>
    </header>
  )
}
