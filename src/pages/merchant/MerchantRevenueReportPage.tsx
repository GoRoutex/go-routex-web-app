import  { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, Calendar, BarChart3, PieChart as PieChartIcon, Loader2, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../utils/api-constants";
import { createXAuthorizedHeaders } from "../../utils/requestMeta";
import { getMerchantId } from "../../utils/auth";

export const TICKET_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/tickets/fetch`,
    DETAIL: `${API_BASE_URL}/tickets/detail`,
    UPDATE: `${API_BASE_URL}/tickets/update`,
};

export const REVENUE_ENDPOINTS = {
    MERCHANT: `${API_BASE_URL}/finance/revenue/merchant`,
};

export function MerchantRevenueReportPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'MONTH' | 'PREVIOUS_MONTH' | 'YEAR'>('MONTH');
    const [revenueData, setRevenueData] = useState<any>(null);

    const fetchRevenue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                setError("Không tìm thấy thông tin nhà xe. Vui lòng đăng nhập lại.");
                setLoading(false);
                return;
            }

            const now = new Date();
            let startDate = "";
            let endDate = "";

            if (filter === 'MONTH') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01T00:00:00+07:00`;
                endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59+07:00`;
            } else if (filter === 'PREVIOUS_MONTH') {
                const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01T00:00:00+07:00`;
                endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59+07:00`;
            } else if (filter === 'YEAR') {
                startDate = `${now.getFullYear()}-01-01T00:00:00+07:00`;
                endDate = `${now.getFullYear()}-12-31T23:59:59+07:00`;
            }

            const url = `${REVENUE_ENDPOINTS.MERCHANT}?merchantId=${merchantId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

            const response = await fetch(url, {
                headers: {
                    ...createXAuthorizedHeaders(),
                    'accept': '*/*'
                }
            });
            const result = await response.json();
            if (result.data) {
                setRevenueData(result.data);
            }
        } catch (error) {
            toast.error("Không thể tải báo cáo doanh thu");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchRevenue();
    }, [fetchRevenue]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const chartData = revenueData?.chartData || [
        { name: 'Jan', revenue: 0, bookings: 0 },
        { name: 'Feb', revenue: 0, bookings: 0 },
        { name: 'Mar', revenue: 0, bookings: 0 },
        { name: 'Apr', revenue: 0, bookings: 0 },
        { name: 'May', revenue: 0, bookings: 0 },
        { name: 'Jun', revenue: 0, bookings: 0 },
    ];
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Báo cáo doanh thu</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Phân tích hiệu quả kinh doanh của nhà xe theo thời gian.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setFilter('MONTH')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'MONTH' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Tháng này
                    </button>
                    <button
                        onClick={() => setFilter('PREVIOUS_MONTH')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'PREVIOUS_MONTH' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Tháng trước
                    </button>
                    <button
                        onClick={() => setFilter('YEAR')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'YEAR' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Năm nay
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-12 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                        <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Lỗi truy cập dữ liệu</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                        Tải lại trang
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-4 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 rounded-2xl bg-white/10">
                                    <DollarSign size={20} className="text-brand-primary" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tổng doanh thu</p>
                                <h3 className="text-2xl font-black mt-1">
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : formatCurrency(revenueData?.totalRevenue || 0)}
                                </h3>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                <BarChart3 size={120} />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 rounded-2xl bg-emerald-50">
                                    <TrendingUp size={20} className="text-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thực nhận (Merchant Share)</p>
                                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : formatCurrency(revenueData?.merchantShare || 0)}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 rounded-2xl bg-orange-50">
                                    <PieChartIcon size={20} className="text-orange-500" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hoa hồng hệ thống</p>
                                <h3 className="text-2xl font-black text-orange-600 mt-1">
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : formatCurrency(revenueData?.systemCommission || 0)}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 rounded-2xl bg-purple-50">
                                    <Calendar size={20} className="text-purple-500" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Số lượng vé</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">
                                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : `${revenueData?.ticketCount || 0} vé`}
                                </h3>
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
                                {loading ? (
                                    <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={4} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Số lượng vé bán ra</h3>
                                <TrendingUp size={20} className="text-slate-300" />
                            </div>
                            <div className="h-[300px]">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                                            <Tooltip />
                                            <Bar dataKey="bookings" radius={[6, 6, 0, 0]} barSize={40}>
                                                {chartData.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0EA5E9' : '#E2E8F0'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
