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
    <aside className="w-64 shrink-0 h-screen py-8 px-6 overflow-y-auto space-y-12 border-l border-slate-100 bg-white hidden 2xl:block">
      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Thông báo quan trọng</h3>
        <div className="space-y-6">
          {notifications.map((n, i) => (
            <div key={i} className="flex gap-4 group cursor-pointer">
              <div className={`w-10 h-10 rounded-2xl ${n.bg} flex items-center justify-center shrink-0 border border-transparent group-hover:scale-110 transition-transform`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[12.5px] font-bold leading-snug text-slate-900 group-hover:text-brand-primary transition-colors">{n.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Hoạt động gần đây</h3>
        <div className="space-y-6">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-4 relative group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shrink-0 z-10 border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-100 transition-all">
                {a.icon}
              </div>
              <div className="min-w-0 pt-0.5 flex flex-col justify-center">
                <p className="text-[12.5px] font-bold leading-snug text-slate-700 group-hover:text-slate-900 transition-colors">{a.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Đội ngũ vận hành</h3>
        <div className="space-y-5">
          {team.map((c, i) => (
            <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-slate-50 transition-all">
              <img src={c.avatar} alt="" className="w-10 h-10 rounded-xl border-2 border-transparent group-hover:border-brand-primary transition-all object-cover shadow-sm" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
