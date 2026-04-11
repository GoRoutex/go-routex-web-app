import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

export function DashboardFinancePage() {
  const revenueTrendData = [
    { name: 'T2', revenue: 14500, target: 12000 },
    { name: 'T3', revenue: 16200, target: 12000 },
    { name: 'T4', revenue: 15800, target: 12000 },
    { name: 'T5', revenue: 17100, target: 12000 },
    { name: 'T6', revenue: 19500, target: 15000 },
    { name: 'T7', revenue: 24600, target: 20000 },
    { name: 'CN', revenue: 26800, target: 20000 },
  ]

  const revenueByMerchant = [
    { name: 'Phương Trang', value: 45000 },
    { name: 'Thành Bưởi', value: 38000 },
    { name: 'Hoa Mai', value: 25000 },
    { name: 'Toàn Thắng', value: 18000 },
  ]

  const kpis = [
    { label: 'Doanh thu sàn (Tuần)', value: '134,5tr VND', delta: '+12.4%', positive: true, bg: 'bg-[#E5ECF6]' },
    { label: 'Merchant mới phát sinh GD', value: '18', delta: '+2', positive: true, bg: 'bg-[#E3F5FF]' },
    { label: 'Tỉ suất hoa hồng TB', value: '8.5%', delta: '+0.2%', positive: true, bg: 'bg-emerald-50' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Đối soát & Tài chính Sàn</h2>
          <span className="text-[12px] text-gray-400 font-medium">Theo dõi doanh thu toàn hệ thống, đối soát hoa hồng và hiệu quả kinh doanh của đối tác.</span>
        </div>
        <div className="flex items-center gap-3">
           <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2 outline-none cursor-pointer">
             <option>Tuần này</option>
             <option>Tuần trước</option>
             <option>Tháng này</option>
             <option>Năm nay</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-6 rounded-2xl space-y-2 shadow-sm border border-black/5`}>
            <p className="text-[13px] font-medium text-black/80">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
              <div className="flex items-center gap-1 text-[11px] font-medium">
                <span className={`${kpi.positive ? 'text-black/80' : 'text-red-600'}`}>{kpi.delta}</span>
                {kpi.positive ? (
                  <ArrowUpRight size={12} className="text-black/60" />
                ) : (
                  <ArrowDownRight size={12} className="text-red-600" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#F7F9FB] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" />
              Xu hướng doanh thu
            </h3>
            <div className="flex items-center gap-4 text-[11px]">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-gray-900 font-medium">Doanh thu thực tế</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-gray-400">Mục tiêu</span>
               </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val) => `${val.toLocaleString()}tr`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="target" stroke="#ADADAD" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fill="#000" fillOpacity={0.03} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Doanh thu theo Nhà xe</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={revenueByMerchant} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val) => `${val.toLocaleString()}tr`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563' }} width={90} />
                <Tooltip 
                   cursor={{fill: '#F3F4F6'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {revenueByMerchant.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1C1C1C' : '#9CA3AF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
