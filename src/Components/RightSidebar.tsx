import { AlertTriangle, UserCheck, Wrench } from 'lucide-react'

const notifications = [
  { icon: AlertTriangle, title: 'Bus #104: Engine Temp Warning', time: 'Just now', bg: 'bg-red-50', color: 'text-red-500' },
  { icon: UserCheck, title: 'Driver Alex shift started', time: '14 minutes ago', bg: 'bg-green-50', color: 'text-green-500' },
  { icon: AlertTriangle, title: 'Route B5: 15min delay expected', time: '42 minutes ago', bg: 'bg-orange-50', color: 'text-orange-500' },
  { icon: Wrench, title: 'Maintenance scheduled: Bus #208', time: 'Today, 08:30 AM', bg: 'bg-blue-50', color: 'text-blue-500' },
]

const activities = [
  { icon: '🚍', title: 'New route Airport-Exp added', time: 'Just now' },
  { icon: '🛠️', title: 'Bus #082 maintenance completed', time: '59 minutes ago' },
  { icon: '📝', title: 'Shift schedule Q2 published', time: '12 hours ago' },
  { icon: '⛽', title: 'Fuel report for Feb generated', time: 'Today, 11:59 AM' },
  { icon: '👨‍✈️', title: 'New driver "John Smith" approved', time: 'Feb 2, 2026' },
]

const team = [
  { name: 'Michael Chen', role: 'Operations Mgr', avatar: 'https://i.pravatar.cc/150?u=1' },
  { name: 'Sarah Miller', role: 'Dispatch Lead', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Robert King', role: 'Fleet Maintenance', avatar: 'https://i.pravatar.cc/150?u=3' },
  { name: 'Linda Wilson', role: 'HR Coordinator', avatar: 'https://i.pravatar.cc/150?u=4' },
  { name: 'David Lee', role: 'Safety Officer', avatar: 'https://i.pravatar.cc/150?u=5' },
]

export function RightSidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen py-8 px-6 overflow-y-auto space-y-10 border-l border-gray-100 bg-white hidden 2xl:block">
      <div>
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-6">Critical Alerts</h3>
        <div className="space-y-6">
          {notifications.map((n, i) => (
            <div key={i} className="flex gap-4">
              <div className={`w-9 h-9 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                <n.icon size={16} className={n.color} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-tight text-gray-900">{n.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-6">Recent Activity</h3>
        <div className="space-y-5">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0 z-10 border border-gray-100">
                {a.icon}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[12px] font-medium leading-tight text-gray-700">{a.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-6">Operations Team</h3>
        <div className="space-y-5">
          {team.map((c, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-pointer">
              <img src={c.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-black transition-all" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-900">{c.name}</p>
                <p className="text-[10px] text-gray-400">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
