import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bus,
  Map,
  Calendar,
  Users,
  Wrench,
  Ticket,
  ClipboardList,
  Settings,
  MessageSquare,
  ChevronRight,
  type LucideIcon,
  Navigation
} from 'lucide-react'

interface NavItem {
  label: string
  to?: string
  icon?: LucideIcon | null
  subItems?: { label: string, to: string }[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Live Overview', to: '/admin/dashboard', icon: Navigation },
      { label: 'Fleet Status', to: '/admin/fleet', icon: Bus },
      { label: 'Route Mapping', to: '/admin/routes', icon: Map },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Schedules', to: '/admin/schedules', icon: Calendar },
      { label: 'Ticketing', to: '/admin/tickets', icon: Ticket },
      { label: 'Drivers & Staff', to: '/admin/staff', icon: Users },
      { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
    ]
  },
  {
    title: 'Performance',
    items: [
      {
        label: 'Reports',
        icon: ClipboardList,
        subItems: [
          { label: 'Revenue Analysis', to: '/admin/reports/revenue' },
          { label: 'Fleet Expenses', to: '/admin/reports/expenses' },
          { label: 'Payroll & Salaries', to: '/admin/reports/salaries' },
        ]
      },
      { label: 'System Health', to: '/admin/health', icon: Settings },
      { label: 'Feedback', to: '/admin/feedback', icon: MessageSquare },
    ]
  },
  {
    title: 'Profile',
    items: [
      {
        label: 'User Profile',
        icon: Users,
        subItems: [
          { label: 'Overview', to: '/admin/staff' },
          { label: 'Settings', to: '/admin/profile/settings' }
        ]
      },
    ]
  }
]

export function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="w-64 flex flex-col h-screen py-8 px-5 shrink-0 overflow-y-auto bg-white border-r border-slate-100">
      <Link to="/admin/dashboard" className="flex items-center gap-3 mb-12 px-2 hover:opacity-80 transition-opacity group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
          <Bus size={22} />
        </div>
        <div>
           <span className="font-black text-lg block text-slate-900 leading-none tracking-tight">Go Routex</span>
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Management</span>
        </div>
      </Link>

      <div className="space-y-10">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] px-3 mb-4">
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <div key={item.label}>
                  <NavLink
                    to={item.to || '#'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-2xl text-[13.5px] font-bold transition-all duration-300 ${
                        isActive && item.to && item.to !== '#' 
                          ? 'bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.icon && (
                          <item.icon
                            size={18}
                            className={`transition-colors ${isActive && item.to && item.to !== '#' ? 'text-brand-primary' : 'text-slate-400'}`}
                          />
                        )}
                        {!item.icon && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-0.5" />}
                        <span className="flex-1">{item.label}</span>
                        {item.subItems && <ChevronRight size={14} className="opacity-40" />}
                      </>
                    )}
                  </NavLink>
                  {item.subItems && (
                     <div className="ml-8 mt-2 space-y-1.5 border-l border-slate-100 pl-4 py-1">
                        {item.subItems.map((sub) => (
                           <button
                             key={sub.label}
                             onClick={() => navigate(sub.to)}
                             className="text-[12.5px] text-slate-400 py-1.5 hover:text-brand-primary font-semibold block w-full text-left transition-colors"
                           >
                              {sub.label}
                           </button>
                        ))}
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
