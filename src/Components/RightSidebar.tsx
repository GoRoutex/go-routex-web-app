import { AlertTriangle, UserCheck, Wrench } from 'lucide-react'

const notifications = [
  { icon: AlertTriangle, title: 'Xe buýt #104: cảnh báo nhiệt độ động cơ', time: 'Vừa xong', bg: 'bg-red-50', color: 'text-red-500' },
  { icon: UserCheck, title: 'Tài xế Alex đã bắt đầu ca làm', time: '14 phút trước', bg: 'bg-green-50', color: 'text-green-500' },
  { icon: AlertTriangle, title: 'Tuyến B5: dự kiến trễ 15 phút', time: '42 phút trước', bg: 'bg-orange-50', color: 'text-orange-500' },
  { icon: Wrench, title: 'Đã lên lịch bảo trì: xe #208', time: 'Hôm nay, 08:30', bg: 'bg-blue-50', color: 'text-blue-500' },
]

const activities = [
  { icon: '🚍', title: 'Đã thêm tuyến mới Airport-Exp', time: 'Vừa xong' },
  { icon: '🛠️', title: 'Đã hoàn tất bảo trì xe #082', time: '59 phút trước' },
  { icon: '📝', title: 'Đã công bố lịch ca quý 2', time: '12 giờ trước' },
  { icon: '⛽', title: 'Đã tạo báo cáo nhiên liệu tháng 2', time: 'Hôm nay, 11:59' },
  { icon: '👨‍✈️', title: 'Đã duyệt tài xế mới "John Smith"', time: '02/02/2026' },
]

const team = [
  { name: 'Michael Chen', role: 'Quản lý vận hành', avatar: 'https://i.pravatar.cc/150?u=1' },
  { name: 'Sarah Miller', role: 'Trưởng điều phối', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Robert King', role: 'Bảo trì đội xe', avatar: 'https://i.pravatar.cc/150?u=3' },
  { name: 'Linda Wilson', role: 'Điều phối nhân sự', avatar: 'https://i.pravatar.cc/150?u=4' },
  { name: 'David Lee', role: 'Cán bộ an toàn', avatar: 'https://i.pravatar.cc/150?u=5' },
]

interface RightSidebarProps {
  visible?: boolean
  isDarkMode?: boolean
}

export function RightSidebar({ visible = true, isDarkMode = false }: RightSidebarProps) {
  if (!visible) return null

  return (
    <aside className={`w-60 shrink-0 h-screen py-8 px-6 overflow-y-auto space-y-12 border-l hidden 2xl:block transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div>
        <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Thông báo quan trọng</h3>
        <div className="space-y-6">
          {notifications.map((n, i) => (
            <div key={i} className="flex gap-4 group cursor-pointer">
              <div className={`w-10 h-10 rounded-2xl ${n.bg} flex items-center justify-center shrink-0 border border-transparent group-hover:scale-110 transition-transform`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className={`text-[12.5px] font-bold leading-snug group-hover:text-brand-primary transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{n.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hoạt động gần đây</h3>
        <div className="space-y-6">
          {activities.map((a, i) => (
            <div key={i} className="flex gap-4 relative group cursor-pointer">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 z-10 border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:bg-slate-700' : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-100'}`}>
                {a.icon}
              </div>
              <div className="min-w-0 pt-0.5 flex flex-col justify-center">
                <p className={`text-[12.5px] font-bold leading-snug transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>{a.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Đội ngũ vận hành</h3>
        <div className="space-y-5">
          {team.map((c, i) => (
            <div key={i} className={`flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
              <img src={c.avatar} alt="" className="w-10 h-10 rounded-xl border-2 border-transparent group-hover:border-brand-primary transition-all object-cover shadow-sm" />
              <div className="min-w-0">
                <p className={`text-[13px] font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{c.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
