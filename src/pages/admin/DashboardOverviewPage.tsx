import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { createRequestMeta, createXAuthorizedHeaders } from '../../utils/requestMeta'

// Color map for charts
const COLORS = ['#0EA5E9', '#6366F1', '#A1A7FF', '#CBD5E1', '#F43F5E', '#10B981', '#F59E0B']

interface PlatformOverviewData {
  summary: {
    totalRevenue: number;
    activeMerchants: number;
    totalMerchants: number;
    averageOccupancyRate: number;
    openComplaints: number;
    ticketsSold: number;
    revenueGrowthRate: number;
    trafficGrowthRate: number;
  };
  customerTrafficSeries: { label: string; date: string; value: number }[];
  revenueSeries: { label: string; date: string; value: number }[];
  merchantPerformance: { merchantId: string; merchantName: string; revenue: number; ticketsSold: number; occupancyRate: number; performanceRate: number }[];
  regionDemand: { regionId: string; regionName: string; ticketsSold: number; percentage: number }[];
  partnerStatusDistribution: { status: string; count: number; percentage: number }[];
}

export function DashboardOverviewPage() {
  const [granularity, setGranularity] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PlatformOverviewData | null>(null)
  const [activeChartTab, setActiveChartTab] = useState<'TRAFFIC' | 'REVENUE'>('TRAFFIC')

  const fetchDashboardData = async (g: string) => {
    setLoading(true)
    try {
      const meta = createRequestMeta()
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/analytics-service/admin/platform-overview?granularity=${g}`, {
        method: "GET",
        headers: createXAuthorizedHeaders(meta)
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data as PlatformOverviewData)
      } else {
        console.error("Failed to fetch overview data")
      }
    } catch (error) {
      console.error("Error fetching overview data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData(granularity)
  }, [granularity])

  const formatCurrency = (val: number | string | unknown[]) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'tỷ'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'tr'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const kpis = data?.summary ? [
    { label: 'Doanh thu toàn sàn', value: `${formatCurrency(data.summary.totalRevenue || 0)} đ`, delta: `${data.summary.revenueGrowthRate >= 0 ? '+' : ''}${data.summary.revenueGrowthRate || 0}%`, positive: data.summary.revenueGrowthRate >= 0, bg: 'bg-brand-primary/10' },
    { label: 'Đối tác hoạt động', value: `${data.summary.activeMerchants || 0}/${data.summary.totalMerchants || 0}`, delta: '', positive: true, bg: 'bg-brand-secondary/10' },
    { label: 'Tỉ lệ lấp đầy TB', value: `${(data.summary.averageOccupancyRate || 0).toFixed(1)}%`, delta: `${data.summary.trafficGrowthRate >= 0 ? '+' : ''}${data.summary.trafficGrowthRate || 0}%`, positive: data.summary.trafficGrowthRate >= 0, bg: 'bg-brand-accent/10' },
    { label: 'Khiếu nại đang xử lý', value: `${data.summary.openComplaints || 0}`, delta: '', positive: true, bg: 'bg-rose-50' },
  ] : []

  const chartData = activeChartTab === 'TRAFFIC' 
    ? (data?.customerTrafficSeries || []).map((s) => ({ name: s.label, value: s.value }))
    : (data?.revenueSeries || []).map((s) => ({ name: s.label, value: s.value }))

  const merchantPerformance = (data?.merchantPerformance || []).slice(0, 6).map((m) => ({
    name: m.merchantName,
    value: Math.round(m.performanceRate || 0)
  }))

  const merchantDistribution = (data?.partnerStatusDistribution || []).map((d) => ({
    name: d.status,
    value: d.count
  }))

  const regionalDemand = (data?.regionDemand || []).map((r, idx: number) => ({
    name: r.regionName,
    value: r.percentage,
    color: COLORS[idx % COLORS.length]
  }))

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Tổng quan nền tảng
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            Xem báo cáo chi tiết về hoạt động của toàn sàn.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${granularity === g ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {g === 'DAY' ? 'Hôm nay' : g === 'WEEK' ? 'Tuần này' : g === 'MONTH' ? 'Tháng này' : 'Năm nay'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            {loading ? <Loader2 size={12} className="animate-spin text-brand-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />}
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {loading ? 'Đang cập nhật...' : 'Đã cập nhật mới nhất'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-3 rounded-xl space-y-1 shadow-sm border border-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/40 group`}>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.12em]">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-[1.4rem] font-bold text-slate-900 tracking-tight">{loading ? '-' : kpi.value}</h3>
              {kpi.delta && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${kpi.positive ? 'bg-white text-brand-secondary shadow-sm' : 'bg-white text-red-500 shadow-sm'}`}>
                  <span>{kpi.delta}</span>
                  {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-8 text-[13px] font-black">
              <span onClick={() => setActiveChartTab('TRAFFIC')} className={`${activeChartTab === 'TRAFFIC' ? 'text-brand-primary border-b-2 border-brand-primary pb-2' : 'text-slate-400 hover:text-slate-600'} cursor-pointer uppercase tracking-wider transition-colors`}>Lưu lượng khách</span>
              <span onClick={() => setActiveChartTab('REVENUE')} className={`${activeChartTab === 'REVENUE' ? 'text-brand-primary border-b-2 border-brand-primary pb-2' : 'text-slate-400 hover:text-slate-600'} cursor-pointer uppercase tracking-wider transition-colors`}>Doanh thu</span>
            </div>
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: activeChartTab === 'REVENUE' ? 0 : -20, bottom: 0 }}>
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
                     tickFormatter={(val: number | string | unknown[]) => activeChartTab === 'REVENUE' ? formatCurrency(val) : val as string}
                  />
                  <Tooltip
                    formatter={(val: number | string | unknown[]) => activeChartTab === 'REVENUE' ? `${formatCurrency(val)} đ` : val as string}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#0EA5E9' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={4} fill="url(#colorCurrent)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Merchant Performance */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Hiệu suất Nhà xe đối tác</h3>
          <div className="space-y-7">
            {loading ? (
              <div className="h-full flex items-center justify-center min-h-[200px]"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : merchantPerformance.map((item) => (
              <div key={item.name} className="flex flex-col gap-2.5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                  <span className="text-slate-500 truncate max-w-[150px]">{item.name}</span>
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
            {!loading && merchantPerformance.length === 0 && <p className="text-slate-400 text-sm">Chưa có dữ liệu.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Phân bổ trạng thái Đối tác</h3>
          <div className="h-[280px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : merchantDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchantDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                    {merchantDistribution.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center"><p className="text-slate-400 text-sm">Chưa có dữ liệu.</p></div>}
          </div>
        </div>

        {/* Regional Demand */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Nhu cầu theo khu vực</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 h-[280px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : regionalDemand.length > 0 ? (
              <>
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
                        {regionalDemand.map((entry, index: number) => (
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
                          <span className="text-slate-500 truncate max-w-[100px]">{item.name}</span>
                       </div>
                       <span className="text-slate-900">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="w-full h-full flex items-center justify-center"><p className="text-slate-400 text-sm">Chưa có dữ liệu.</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
