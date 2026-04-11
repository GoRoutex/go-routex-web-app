import { CircleDollarSign, Wrench, BusFront, PieChart as PieChartIcon } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export function ExpensesReportPage() {
  const expenseData = [
    { name: 'T1', fuel: 4000, maintenance: 2400 },
    { name: 'T2', fuel: 3000, maintenance: 1398 },
    { name: 'T3', fuel: 2000, maintenance: 9800 },
    { name: 'T4', fuel: 2780, maintenance: 3908 },
    { name: 'T5', fuel: 1890, maintenance: 4800 },
    { name: 'T6', fuel: 2390, maintenance: 3800 },
  ]

  const expenseBreakdown = [
    { name: 'Chi phí nhiên liệu', value: 45 },
    { name: 'Bảo trì định kỳ', value: 30 },
    { name: 'Sửa chữa khẩn cấp', value: 15 },
    { name: 'Phụ tùng', value: 10 },
  ]
  const COLORS = ['#1C1C1C', '#A1A7FF', '#B1E3FF', '#A8FFD2']

  const kpis = [
    { label: 'Tổng chi phí (từ đầu năm)', value: '84,5tr VND', icon: CircleDollarSign, bg: 'bg-[#F7F9FB]' },
    { label: 'Nhiên liệu trung bình / tháng', value: '12,4tr VND', icon: BusFront, bg: 'bg-[#E3F5FF]' },
    { label: 'Chi phí bảo trì', value: '34,2tr VND', icon: Wrench, bg: 'bg-[#E5ECF6]' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Báo cáo chi phí đội xe</h2>
          <span className="text-[12px] text-gray-400 font-medium">Theo dõi chi phí nhiên liệu và bảo trì</span>
        </div>
        <div className="flex items-center gap-3">
           <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2 outline-none cursor-pointer">
             <option>Năm hiện tại</option>
             <option>Năm trước</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-6 rounded-2xl space-y-4 shadow-sm border border-black/5`}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-black/80">{kpi.label}</p>
              <kpi.icon size={16} className="text-black/40" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#F7F9FB] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <Wrench size={16} className="text-gray-400" />
              So sánh nhiên liệu và bảo trì
            </h3>
            <div className="flex items-center gap-4 text-[11px]">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-gray-900 font-medium">Nhiên liệu</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-gray-400">Bảo trì</span>
               </div>
            </div>
          </div>
          <div className="h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={expenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val) => `${(val/1000).toLocaleString()}tr`} />
                  <Tooltip 
                     cursor={{fill: '#F3F4F6'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="fuel" stackId="a" fill="#1C1C1C" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="maintenance" stackId="a" fill="#B1E3FF" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8 flex items-center gap-2">
            <PieChartIcon size={16} className="text-gray-400" />
            Cơ cấu chi phí
          </h3>
          <div className="flex flex-col items-center justify-center gap-8 h-[280px]">
            <div className="w-full h-full max-h-[180px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={expenseBreakdown}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                   >
                     {expenseBreakdown.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 shrink-0 w-full px-2">
               {expenseBreakdown.map((item, index) => (
                 <div key={item.name} className="flex items-center gap-2 text-[10px]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-gray-600 font-medium truncate">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
