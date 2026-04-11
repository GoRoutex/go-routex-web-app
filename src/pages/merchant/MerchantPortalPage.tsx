import { ArrowUpRight, ArrowDownRight, Bus, Ticket, Users, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const kpis = [
  { label: 'Vé bán hôm nay', value: '342', delta: '+12.5%', positive: true, bg: 'bg-emerald-50', icon: Ticket, iconColor: 'text-emerald-500' },
  { label: 'Doanh thu ngày', value: '42.5M VNĐ', delta: '+8.2%', positive: true, bg: 'bg-blue-50', icon: TrendingUp, iconColor: 'text-blue-500' },
  { label: 'Xe đang chạy', value: '12/15', delta: '80%', positive: true, bg: 'bg-orange-50', icon: Bus, iconColor: 'text-orange-500' },
  { label: 'Tài xế sẵn sàng', value: '8', delta: '+2', positive: true, bg: 'bg-purple-50', icon: Users, iconColor: 'text-purple-500' },
]

const bookingData = [
  { name: 'Thứ 2', bookings: 120, revenue: 15 },
  { name: 'Thứ 3', bookings: 150, revenue: 18 },
  { name: 'Thứ 4', bookings: 180, revenue: 22 },
  { name: 'Thứ 5', bookings: 140, revenue: 17 },
  { name: 'Thứ 6', bookings: 210, revenue: 28 },
  { name: 'Thứ 7', bookings: 350, revenue: 45 },
  { name: 'Chủ nhật', bookings: 300, revenue: 40 },
]

const topRoutes = [
  { name: 'Sài Gòn - Đà Lạt', value: 92 },
  { name: 'Sài Gòn - Phan Thiết', value: 85 },
  { name: 'Sài Gòn - Vũng Tàu', value: 78 },
  { name: 'Sài Gòn - Nha Trang', value: 65 },
]

export function MerchantPortalPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Bảng điều khiển Nhà xe
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            Chào mừng bạn trở lại! Đây là báo cáo hiệu quả hoạt động của nhà xe trong hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-brand-primary text-white rounded-xl text-[12px] font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Tạo chuyến mới
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trực tiếp</span>
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`relative overflow-hidden ${kpi.bg} p-5 rounded-2xl shadow-sm border border-white transition-all hover:shadow-xl group`}>
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                    <h3 className="text-[1.5rem] font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-xl bg-white shadow-sm ${kpi.iconColor}`}>
                    <kpi.icon size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${kpi.positive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    <span>{kpi.delta}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">so với hôm qua</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Biểu đồ doanh thu</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dữ liệu theo tuần</p>
                </div>
                <select className="bg-slate-50 border-none text-[11px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-primary/20">
                    <option>7 ngày qua</option>
                    <option>30 ngày qua</option>
                </select>
            </div>

            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookingData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#0EA5E9" 
                            strokeWidth={4} 
                            fill="url(#colorRevenue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
             <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Tuyến xe đông khách</h3>
             <div className="space-y-8">
                {topRoutes.map((route) => (
                    <div key={route.name} className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[12px] font-black text-slate-700 uppercase tracking-wide">{route.name}</span>
                            <span className="text-[12px] font-black text-brand-primary">{route.value}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-full transition-all duration-1000"
                                style={{ width: `${route.value}%` }}
                            />
                        </div>
                    </div>
                ))}
             </div>
             
             <div className="mt-12 p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Thông báo</p>
                    <h4 className="text-[13px] font-bold leading-relaxed">Bạn có 5 chuyến xe cần xác nhận trong ngày mai.</h4>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Bus size={100} />
                </div>
             </div>
        </div>
      </div>

      {/* Recent Trips Table Placeholder */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Danh sách chuyến gần đây</h3>
            <button className="text-[11px] font-black text-brand-primary uppercase tracking-widest hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã chuyến</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuyến đường</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giờ chạy</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Biển số xe</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {[
                        { id: 'TRP001', route: 'Sài Gòn - Đà Lạt', time: '08:00 - 10/04', bus: '51B-123.45', status: 'Đang chạy', statusColor: 'bg-blue-500' },
                        { id: 'TRP002', route: 'Sài Gòn - Vũng Tàu', time: '09:30 - 10/04', bus: '51B-678.90', status: 'Đã hoàn thành', statusColor: 'bg-emerald-500' },
                        { id: 'TRP003', route: 'Sài Gòn - Phan Thiết', time: '13:00 - 10/04', bus: '51B-555.55', status: 'Sắp khởi hành', statusColor: 'bg-orange-500' },
                    ].map((trip) => (
                        <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-[12px] font-bold text-slate-900">{trip.id}</td>
                            <td className="px-8 py-5 text-[12px] font-bold text-slate-600">{trip.route}</td>
                            <td className="px-8 py-5 text-[12px] font-bold text-slate-500">{trip.time}</td>
                            <td className="px-8 py-5 text-[12px] font-bold text-slate-500">{trip.bus}</td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${trip.statusColor}`} />
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{trip.status}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
