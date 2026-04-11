import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'

const kpis = [
  { label: 'Doanh thu toàn sàn', value: '142,8tr VND', delta: '+12.5%', positive: true, bg: 'bg-brand-primary/10' },
  { label: 'Đối tác hoạt động', value: '115/128', delta: '+4 mới', positive: true, bg: 'bg-brand-secondary/10' },
  { label: 'Tỉ lệ lấp đầy TB', value: '88.4%', delta: '+2.1%', positive: true, bg: 'bg-brand-accent/10' },
  { label: 'Khiếu nại đang xử lý', value: '12', delta: '-15%', positive: true, bg: 'bg-rose-50' },
]

const occupancyData = [
  { name: 'Thứ 2', current: 14200, capacity: 16000 },
  { name: 'Thứ 3', current: 15900, capacity: 18000 },
  { name: 'Thứ 4', current: 16500, capacity: 18000 },
  { name: 'Thứ 5', current: 17200, capacity: 19000 },
  { name: 'Thứ 6', current: 21800, capacity: 22000 },
  { name: 'Thứ 7', current: 24500, capacity: 25000 },
  { name: 'CN', current: 19500, capacity: 22000 },
]

const merchantPerformance = [
  { name: 'Phương Trang', value: 94 },
  { name: 'Thành Bưởi', value: 92 },
  { name: 'Hoa Mai', value: 88 },
  { name: 'Toàn Thắng', value: 85 },
  { name: 'Kumho Samco', value: 82 },
  { name: 'Hải Vân', value: 78 },
]

const merchantDistribution = [
  { name: 'Đang hoạt động', value: 115 },
  { name: 'Đang thử nghiệm', value: 8 },
  { name: 'Tạm dừng', value: 3 },
  { name: 'Mới đăng ký', value: 2 },
]

const regionalDemand = [
  { name: 'TP. Hồ Chí Minh', value: 45.2, color: '#0EA5E9' },
  { name: 'Hà Nội', value: 24.8, color: '#6366F1' },
  { name: 'Đà Nẵng', value: 18.2, color: '#A1A7FF' },
  { name: 'Khác', value: 11.8, color: '#CBD5E1' },
]

export function DashboardOverviewPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Tổng quan vận hành
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            Chào mừng quay trở lại, đây là những gì đang diễn ra hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm self-start md:self-end">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cập nhật: 5 phút trước</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-3 rounded-xl space-y-1 shadow-sm border border-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/40 group`}>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.12em]">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-[1.4rem] font-bold text-slate-900 tracking-tight">{kpi.value}</h3>
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${kpi.positive ? 'bg-white text-brand-secondary shadow-sm' : 'bg-white text-red-500 shadow-sm'}`}>
                <span>{kpi.delta}</span>
                {kpi.positive ? (
                  <ArrowUpRight size={10} />
                ) : (
                  <ArrowDownRight size={10} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-8 text-[13px] font-black">
              <span className="text-brand-primary border-b-2 border-brand-primary pb-2 cursor-pointer uppercase tracking-wider">Lưu lượng khách</span>
              <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-wider">Tiêu thụ nhiên liệu</span>
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

        {/* Merchant Performance */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Hiệu suất Nhà xe đối tác</h3>
          <div className="space-y-7">
            {merchantPerformance.map((item) => (
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
        {/* Merchant Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Phân bổ trạng thái Đối tác</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merchantDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {merchantDistribution.map((entry, index) => (
                    <Cell
                       key={`cell-${index}`}
                       fill={entry.name === 'Đang hoạt động' ? '#0EA5E9' : entry.name === 'Tạm dừng' ? '#F43F5E' : '#6366F1'}
                       fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Demand */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Nhu cầu theo khu vực</h3>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
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
