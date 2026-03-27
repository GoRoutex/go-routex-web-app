import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
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
  Navigation,
} from 'lucide-react'

interface NavItem {
  label: string
  to?: string
  icon?: LucideIcon | null
  subItems?: { label: string; to: string }[]
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
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Schedules', to: '/admin/schedules', icon: Calendar },
      { label: 'Ticketing', to: '/admin/tickets', icon: Ticket },
      { label: 'Drivers & Staff', to: '/admin/staff', icon: Users },
      { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
    ],
  },
  {
    title: 'Performance',
    items: [
      {
        label: 'Reports',
        to: '/admin/reports/revenue',
        icon: ClipboardList,
        subItems: [
          { label: 'Revenue Analysis', to: '/admin/reports/revenue' },
          { label: 'Fleet Expenses', to: '/admin/reports/expenses' },
          { label: 'Payroll & Salaries', to: '/admin/reports/salaries' },
        ],
      },
      { label: 'System Health', to: '/admin/health', icon: Settings },
      { label: 'Feedback', to: '/admin/feedback', icon: MessageSquare },
    ],
  },
  {
    title: 'Profile',
    items: [
      {
        label: 'User Profile',
        to: '/admin/profile/overview',
        icon: Users,
        subItems: [
          { label: 'Overview', to: '/admin/profile/overview' },
          { label: 'Settings', to: '/admin/profile/settings' },
        ],
      },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  isDarkMode?: boolean
}

export function Sidebar({ collapsed = false, isDarkMode = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActiveRoute = (route?: string) => Boolean(route && location.pathname === route)
  const isActiveBranch = (prefix?: string) => Boolean(prefix && location.pathname.startsWith(prefix))

  return (
    <aside
      className={`flex flex-col h-screen py-8 shrink-0 overflow-y-auto border-r transition-all duration-300 ${
        collapsed ? 'w-20 px-3' : 'w-64 px-5'
      } ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
    >
      <Link
        to="/admin/dashboard"
        className={`flex items-center hover:opacity-80 transition-opacity group ${
          collapsed ? 'justify-center mb-10 px-0' : 'gap-3 mb-12 px-2'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
          <Bus size={22} />
        </div>
        <div className={collapsed ? 'hidden' : ''}>
          <span className={`font-black text-lg block leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Go Routex
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            Management
          </span>
        </div>
      </Link>

      <div className="space-y-10">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3
              className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 ${
                collapsed ? 'hidden' : 'px-3'
              } ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
            >
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const subActive = item.subItems?.some((sub) => isActiveRoute(sub.to))
                const parentActive = isActiveRoute(item.to) || Boolean(subActive) || isActiveBranch(item.to?.replace(/\/overview|\/revenue$/, ''))

                const itemClass = `flex items-center ${
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } py-3 rounded-2xl text-[13.5px] font-bold transition-all duration-300 ${
                  parentActive
                    ? 'bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`

                const iconColor = parentActive
                  ? 'text-brand-primary'
                  : isDarkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'

                return (
                  <div key={item.label}>
                    {item.to ? (
                      <NavLink to={item.to} className={itemClass}>
                        {({ isActive }) => (
                          <>
                            {item.icon && <item.icon size={18} className={`transition-colors ${isActive || parentActive ? 'text-brand-primary' : iconColor}`} />}
                            {!item.icon && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-0.5" />}
                            {!collapsed && <span className="flex-1">{item.label}</span>}
                            {!collapsed && item.subItems && <ChevronRight size={14} className={`transition-transform ${subActive ? 'rotate-90 opacity-70' : 'opacity-40'}`} />}
                          </>
                        )}
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        onClick={() => item.subItems?.[0] && navigate(item.subItems[0].to)}
                        className={itemClass}
                      >
                        {item.icon && <item.icon size={18} className={`transition-colors ${iconColor}`} />}
                        {!item.icon && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-0.5" />}
                        {!collapsed && <span className="flex-1">{item.label}</span>}
                        {!collapsed && item.subItems && <ChevronRight size={14} className={`transition-transform ${subActive ? 'rotate-90 opacity-70' : 'opacity-40'}`} />}
                      </button>
                    )}

                    {item.subItems && !collapsed && (
                      <div className={`ml-8 mt-2 space-y-1.5 border-l pl-4 py-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.to}
                            className={({ isActive }) =>
                              `block w-full text-left text-[12.5px] py-1.5 font-semibold transition-colors ${
                                isActive
                                  ? 'text-brand-primary'
                                  : isDarkMode
                                    ? 'text-slate-400 hover:text-slate-200'
                                    : 'text-slate-400 hover:text-brand-primary'
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
