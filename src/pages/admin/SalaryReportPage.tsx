import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

export function SalaryReportPage() {
  const salaryData = [
    { name: 'Jan', drivers: 35000, admin: 12000, maintenance: 8000 },
    { name: 'Feb', drivers: 36000, admin: 12000, maintenance: 8200 },
    { name: 'Mar', drivers: 35500, admin: 12500, maintenance: 8200 },
    { name: 'Apr', drivers: 38000, admin: 12500, maintenance: 8500 },
    { name: 'May', drivers: 40000, admin: 13000, maintenance: 9000 },
    { name: 'Jun', drivers: 42000, admin: 13000, maintenance: 9500 },
  ]

  const salaryDistribution = [
    { name: 'Senior Drivers', value: 45 },
    { name: 'Junior Drivers', value: 25 },
    { name: 'Admin Staff', value: 15 },
    { name: 'Mechanics', value: 15 },
  ]

  const kpis = [
    { label: 'Total Payroll (Jun)', value: '$64.5K', icon: Users, bg: 'bg-[#F7F9FB]' },
    { label: 'Avg Salary / Driver', value: '$3.2K', icon: UserCheck, bg: 'bg-[#E3F5FF]' },
    { label: 'New Hires YTD', value: '14', icon: UserPlus, bg: 'bg-[#E5ECF6]' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Salary & Payroll Reports</h2>
          <span className="text-[12px] text-gray-400 font-medium">Tracking personnel compensation</span>
        </div>
        <div className="flex items-center gap-3">
           <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2 outline-none cursor-pointer">
             <option>First Half 2026</option>
             <option>Second Half 2025</option>
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
              <TrendingUp size={16} className="text-gray-400" />
              Monthly Payroll by Department
            </h3>
            <div className="flex items-center gap-4 text-[11px]">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-gray-900 font-medium">Drivers</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span className="text-gray-400">Admin</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                  <span className="text-gray-400">Maintenance</span>
               </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#A1A7FF" fill="#A1A7FF" fillOpacity={0.8} />
                <Area type="monotone" dataKey="admin" stackId="1" stroke="#B1E3FF" fill="#B1E3FF" fillOpacity={0.8} />
                <Area type="monotone" dataKey="drivers" stackId="1" stroke="#1C1C1C" fill="#1C1C1C" fillOpacity={0.9} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Role Distribution</h3>
          <div className="h-[280px] flex items-end">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={15} interval={0} angle={-30} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {salaryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1C1C1C' : index === 1 ? '#4B5563' : '#9CA3AF'} />
                  ))}
                </Bar>
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
