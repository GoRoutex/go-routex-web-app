import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'

const kpis = [
  { label: 'Today Passengers', value: '12.8K', delta: '+8.2%', positive: true, bg: 'bg-[#E3F5FF]' },
  { label: 'Active Fleet', value: '86/92', delta: '93.4%', positive: true, bg: 'bg-[#E5ECF6]' },
  { label: 'On-Time Rate', value: '96.2%', delta: '+1.5%', positive: true, bg: 'bg-[#E3F5FF]' },
  { label: 'Daily Revenue', value: '$24.6K', delta: '+12.4%', positive: true, bg: 'bg-[#E5ECF6]' },
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Operational Summary</h2>
        <span className="text-[12px] text-gray-400 font-medium">Last updated: 5 minutes ago</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-6 rounded-2xl space-y-2 shadow-sm border border-black/5`}>
            <p className="text-[13px] font-medium text-black/80">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
              <div className="flex items-center gap-1 text-[11px] font-medium">
                <span className="text-black/80">{kpi.delta}</span>
                {kpi.positive ? (
                  <ArrowUpRight size={12} className="text-black/60" />
                ) : (
                  <ArrowDownRight size={12} className="text-black/60" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Line Chart */}
        <div className="lg:col-span-2 bg-[#F7F9FB] rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-6 text-[12px] font-semibold">
              <span className="text-gray-900 border-b-2 border-black pb-1 cursor-pointer">Live Occupancy</span>
              <span className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Fuel Consumption</span>
              <span className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Revenue Trend</span>
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-gray-900 font-medium">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-gray-400">Capacity</span>
              </div>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  dy={15}
                />
                <YAxis
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="#ADADAD"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#000"
                  strokeWidth={2}
                  fill="#000"
                  fillOpacity={0.03}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Efficiency */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Route Efficiency</h3>
          <div className="space-y-5">
            {routeEfficiency.map((item) => (
              <div key={item.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="text-black">{item.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, opacity: item.value / 100 * 0.8 + 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Distribution */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Fleet Assignment Status</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  dy={15}
                />
                <YAxis
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                  {fleetStatus.map((entry, index) => (
                    <Cell
                       key={`cell-${index}`}
                       fill={entry.name === 'Active' ? '#1C1C1C' : entry.name === 'Maintenance' ? '#A1A7FF' : '#B1E3FF'}
                       fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Demand */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Regional Demand Distribution</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 h-[240px]">
            <div className="w-full h-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalDemand}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {regionalDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4 shrink-0">
              {regionalDemand.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-12 text-[12px]">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-500 font-medium">{item.name}</span>
                   </div>
                   <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
