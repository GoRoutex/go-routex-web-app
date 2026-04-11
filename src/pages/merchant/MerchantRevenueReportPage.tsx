import { TrendingUp, DollarSign, Calendar, ArrowUpRight, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, bookings: 2400 },
  { name: 'Feb', revenue: 3000, bookings: 1398 },
  { name: 'Mar', revenue: 2000, bookings: 9800 },
  { name: 'Apr', revenue: 2780, bookings: 3908 },
  { name: 'May', revenue: 1890, bookings: 4800 },
  { name: 'Jun', revenue: 2390, bookings: 3800 },
];

export function MerchantRevenueReportPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Báo cáo doanh thu</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Phân tích hiệu quả kinh doanh của nhà xe theo thời gian.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold">Tháng này</button>
            <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">Tháng trước</button>
            <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">Năm nay</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-2xl bg-white/10">
                    <DollarSign size={20} className="text-brand-primary" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} /> +12.5%
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tổng doanh thu</p>
                <h3 className="text-2xl font-black mt-1">1.250.000.000 VNĐ</h3>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
                <BarChart3 size={120} />
            </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-2xl bg-blue-50">
                    <TrendingUp size={20} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} /> +8.2%
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Lợi nhuận ròng</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">450.000.000 VNĐ</h3>
            </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-2xl bg-purple-50">
                    <Calendar size={20} className="text-purple-500" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    Giữ ổn định
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Giá trị trung bình vé</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">285.000 VNĐ</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Doanh thu theo thời gian</h3>
                <PieChartIcon size={20} className="text-slate-300" />
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={4} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Tỉ lệ lắp đầy chuyến</h3>
                <TrendingUp size={20} className="text-slate-300" />
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                        <Tooltip />
                        <Bar dataKey="bookings" radius={[6, 6, 0, 0]} barSize={40}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index === 5 ? '#0EA5E9' : '#E2E8F0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
