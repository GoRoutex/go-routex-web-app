import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { createRequestMeta, createXAuthorizedHeaders } from '../../utils/requestMeta'

interface RevenueData {
  summary: {
    grossRevenue: number;
    platformRevenue: number;
    merchantRevenue: number;
    discountAmount: number;
    commissionRate: number;
    ticketsSold: number;
    platformRevenueGrowthRate: number;
    merchantRevenueGrowthRate: number;
  };
  revenueTrend: {
    label: string;
    date: string;
    grossRevenue: number;
    platformRevenue: number;
    merchantRevenue: number;
    commissionRate: number;
  }[];
  merchantRevenueBars: {
    merchantId: string;
    merchantName: string;
    grossRevenue: number;
    platformRevenue: number;
    merchantRevenue: number;
    commissionRate: number;
    ticketsSold: number;
  }[];
}

export function DashboardFinancePage() {
  const [filter, setFilter] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('WEEK')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RevenueData | null>(null)

  const fetchRevenueData = async (f: string) => {
    setLoading(true)
    try {
      const meta = createRequestMeta()
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/analytics-service/admin/revenue-reconciliation?filter=${f}&granularity=${f}&topMerchants=10`, {
        method: "GET",
        headers: createXAuthorizedHeaders(meta)
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data as RevenueData)
      } else {
        console.error("Failed to fetch revenue data")
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRevenueData(filter)
  }, [filter])

  const formatCurrency = (val: number | string | unknown[]) => {
    const num = Number(val);
    if (isNaN(num)) return val as string;
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'tỷ'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'tr'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`

  const kpis = data?.summary ? [
    { 
      label: 'Tổng GMV (Gross)', 
      value: `${formatCurrency(data.summary.grossRevenue || 0)} đ`, 
      delta: `${data.summary.platformRevenueGrowthRate >= 0 ? '+' : ''}${data.summary.platformRevenueGrowthRate || 0}%`, 
      positive: data.summary.platformRevenueGrowthRate >= 0, 
      bg: 'bg-[#E5ECF6]' 
    },
    { 
      label: 'Doanh thu Sàn (Platform)', 
      value: `${formatCurrency(data.summary.platformRevenue || 0)} đ`, 
      delta: `${data.summary.platformRevenueGrowthRate >= 0 ? '+' : ''}${data.summary.platformRevenueGrowthRate || 0}%`, 
      positive: data.summary.platformRevenueGrowthRate >= 0, 
      bg: 'bg-[#E3F5FF]' 
    },
    { 
      label: 'Tỉ suất hoa hồng TB', 
      value: formatPercent(data.summary.commissionRate || 0), 
      delta: '', 
      positive: true, 
      bg: 'bg-emerald-50' 
    },
  ] : []

  const revenueTrendData = (data?.revenueTrend || []).map(r => ({
    name: r.label,
    grossRevenue: r.grossRevenue,
    platformRevenue: r.platformRevenue,
  }))

  const revenueByMerchant = (data?.merchantRevenueBars || []).map(m => ({
    name: m.merchantName,
    value: m.grossRevenue,
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Đối soát & Tài chính Sàn</h2>
          <span className="text-[12px] text-gray-400 font-medium">Theo dõi doanh thu toàn hệ thống, đối soát hoa hồng và hiệu quả kinh doanh của đối tác.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${filter === f ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f === 'DAY' ? 'Hôm nay' : f === 'WEEK' ? 'Tuần này' : f === 'MONTH' ? 'Tháng này' : 'Năm nay'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            {loading ? <Loader2 size={12} className="animate-spin text-black" /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} p-6 rounded-2xl space-y-2 shadow-sm border border-black/5 transition-all hover:scale-[1.02]`}>
            <p className="text-[13px] font-medium text-black/80">{kpi.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">{loading ? '-' : kpi.value}</h3>
              {kpi.delta && (
                <div className="flex items-center gap-1 text-[11px] font-medium">
                  <span className={`${kpi.positive ? 'text-black/80' : 'text-red-600'}`}>{kpi.delta}</span>
                  {kpi.positive ? (
                    <ArrowUpRight size={12} className="text-black/60" />
                  ) : (
                    <ArrowDownRight size={12} className="text-red-600" />
                  )}
                </div>
              )}
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
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-gray-400">Doanh thu hệ thống (Gross)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-gray-900 font-medium">Doanh thu sàn (Platform)</span>
               </div>
            </div>
          </div>
          <div className="h-[280px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val: number | string | unknown[]) => formatCurrency(val)} />
                  <Tooltip 
                    formatter={(val: number | string | unknown[], name: string) => [`${formatCurrency(val)} đ`, name === 'grossRevenue' ? 'Hệ thống (Gross)' : 'Sàn (Platform)']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="grossRevenue" stroke="#ADADAD" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                  <Area type="monotone" dataKey="platformRevenue" stroke="#000" strokeWidth={2} fill="#000" fillOpacity={0.03} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#F7F9FB] rounded-3xl p-8">
          <h3 className="text-[14px] font-semibold mb-8">Doanh thu theo Nhà xe</h3>
          <div className="h-[280px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
            ) : revenueByMerchant.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={revenueByMerchant} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(val: number | string | unknown[]) => formatCurrency(val)} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563' }} width={90} />
                  <Tooltip 
                     formatter={(val: number | string | unknown[]) => [`${formatCurrency(val)} đ`, 'Doanh thu']}
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
            ) : <div className="w-full h-full flex items-center justify-center"><p className="text-gray-400 text-sm">Chưa có dữ liệu.</p></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
