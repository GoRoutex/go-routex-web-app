import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'

const kpis = [
  { label: 'Hành khách hôm nay', value: '12.8K', delta: '+8.2%', positive: true, bg: 'bg-brand-primary/10' },
  { label: 'Đội xe đang chạy', value: '86/92', delta: '93.4%', positive: true, bg: 'bg-brand-secondary/10' },
  { label: 'Tỉ lệ đúng giờ', value: '96.2%', delta: '+1.5%', positive: true, bg: 'bg-brand-accent/10' },
  { label: 'Doanh thu ngày', value: '$24.6K', delta: '+12.4%', positive: true, bg: 'bg-orange-50' },
]

const occupancyData = [
  { name: '06:00', current: 420, capacity: 500 },
  { name: '08:00', current: 890, capacity: 950 },
  { name: '10:00', current: 650, capacity: 800 },
  { name: '12:00', current: 720, capacity: 900 },
  { name: '14:00', current: 580, capacity: 850 },
  { name: '16:00', current: 950, capacity: 1000 },
  { name: '18:00', current: 1100, capacity: 1200 },
  { name: '20:00', current: 450, capacity: 600 },
]

const routeEfficiency = [
  { name: 'Route A1 (North)', value: 94 },
  { name: 'Route B5 (Downtown)', value: 82 },
  { name: 'Airport Express', value: 98 },
  { name: 'Cross-Town 10', value: 76 },
  { name: 'Coastal Line', value: 89 },
  { name: 'Suburb Link', value: 65 },
]

const fleetStatus = [
  { name: 'Active', value: 780 },
  { name: 'Maintenance', value: 45 },
  { name: 'Idle', value: 62 },
  { name: 'Out of Order', value: 12 },
]

const regionalDemand = [
  { name: 'City Center', value: 45.2, color: '#1C1C1C' },
  { name: 'Suburban North', value: 24.8, color: '#B1E3FF' },
  { name: 'Industrial East', value: 18.2, color: '#A1A7FF' },
  { name: 'Airport / Transit', value: 11.8, color: '#A8FFD2' },
]

export function DashboardOverviewPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan vận hành</h2>
          <p className="text-slate-500 font-medium mt-1">Chào mừng quay trở lại, đây là những gì đang diễn ra hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
           <span className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">Cập nhật: 5 phút trước</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-8 rounded-[2rem] space-y-4 shadow-sm border border-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50 group`}>
            <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${kpi.positive ? 'bg-white text-brand-secondary' : 'bg-white text-red-500'}`}>
                <span>{kpi.delta}</span>
                {kpi.positive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-8 text-[13px] font-black">
              <span className="text-brand-primary border-b-2 border-brand-primary pb-2 cursor-pointer uppercase tracking-wider">Lưu lượng khách</span>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-wider">Tiên thụ nhiên liệu</span>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-wider">Doanh thu</span>
            </div>
            <div className="flex items-center gap-6 text-[11px] font-bold">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                <span className="text-slate-600 uppercase tracking-widest">Thực tế</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="text-slate-400 uppercase tracking-widest">Kế hoạch</span>
              </div>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
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
                  dy={15}
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
                  itemStyle={{ color: '#0EA5E9' }}
                />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="#E2E8F0"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#0EA5E9"
                  strokeWidth={4}
                  fill="url(#colorCurrent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Efficiency */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Hiệu suất tuyến đường</h3>
          <div className="space-y-7">
            {routeEfficiency.map((item) => (
              <div key={item.name} className="flex flex-col gap-2.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">{item.name}</span>
                  <span className="text-brand-primary">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fleet Distribution */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Trạng thái đội xe</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  dy={15}
                />
                <YAxis
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {fleetStatus.map((entry, index) => (
                    <Cell
                       key={`cell-${index}`}
                       fill={entry.name === 'Active' ? '#0EA5E9' : entry.name === 'Maintenance' ? '#6366F1' : '#CBD5E1'}
                       fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Demand */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Nhu cầu theo khu vực</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 h-[280px]">
            <div className="w-full h-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalDemand}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {regionalDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color === '#1C1C1C' ? '#0EA5E9' : entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-5 shrink-0">
              {regionalDemand.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-12 text-[13px] font-bold">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color === '#1C1C1C' ? '#0EA5E9' : item.color }} />
                      <span className="text-slate-500">{item.name}</span>
                   </div>
                   <span className="text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
