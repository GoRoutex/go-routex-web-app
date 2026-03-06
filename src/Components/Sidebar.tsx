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
          { label: 'Daily Operations', to: '/admin/reports/daily' },
          { label: 'Fleet Efficiency', to: '/admin/reports/fleet' },
          { label: 'Revenue Analysis', to: '/admin/reports/revenue' },
          { label: 'Fuel Tracking', to: '/admin/reports/fuel' }
        ]
      },
      { label: 'System Health', icon: Settings },
      { label: 'Feedback', icon: MessageSquare },
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
    <aside className="w-56 flex flex-col h-screen py-6 px-4 shrink-0 overflow-y-auto bg-white">
      <Link to="/admin/dashboard" className="flex items-center gap-3 mb-8 px-2 mt-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] flex items-center justify-center text-white">
          <Bus size={20} />
        </div>
        <div>
           <span className="font-bold text-[15px] block text-gray-900 leading-none">Go Routex</span>
           <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Bus Operations</span>
        </div>
      </Link>

      <div className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider px-2 mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.label}>
                  <NavLink
                    to={item.to || '#'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-2 rounded-xl text-[13px] transition-all duration-200 ${
                        isActive && item.to && item.to !== '#' ? 'bg-black text-white font-medium shadow-md shadow-black/10' : 'text-gray-600 hover:bg-black/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.icon && (
                          <item.icon
                            size={16}
                            className={`transition-colors ${isActive && item.to && item.to !== '#' ? 'text-white' : 'text-gray-400'}`}
                          />
                        )}
                        {!item.icon && <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1.5 mr-0.5" />}
                        <span className="flex-1">{item.label}</span>
                        {item.subItems && <ChevronRight size={14} className="text-gray-400" />}
                      </>
                    )}
                  </NavLink>
                  {item.subItems && (
                     <div className="ml-6 mt-1 space-y-1 border-l border-gray-100 pl-3 py-1">
                        {item.subItems.map((sub) => (
                           <div
                             key={sub.label}
                             onClick={() => navigate(sub.to)}
                             className="text-[12px] text-gray-400 py-1.5 hover:text-black cursor-pointer transition-colors"
                           >
                              {sub.label}
                           </div>
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
