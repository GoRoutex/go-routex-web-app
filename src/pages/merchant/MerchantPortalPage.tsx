import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import { DASHBOARD_ENDPOINTS } from '../../utils/api-constants'
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta"
import { getMerchantId } from '../../utils/auth'
import { ArrowDownRight, ArrowUpRight, Bus, Loader2, Ticket, TrendingUp, Users, Clock, Hash, AlertCircle } from 'lucide-react'

interface DashboardData {
    stats: {
        ticketsSold: number;
        totalRevenue: number;
        merchantShare: number;
        ticketGrowthRate: number;
        revenueGrowthRate: number;
    };
    revenueChart: Array<{
        label: string;
        revenue: number;
        date: string;
    }>;
    popularRoutes: Array<{
        routeId: string | null;
        routeName: string;
        ticketCount: number;
        occupancyRate: number;
    }>;
    recentTrips: Array<{
        tripId: string;
        routeName: string;
        vehiclePlate: string;
        departureTime: string;
        status: string;
        bookedSeats: number;
    }>;
}

export function MerchantPortalPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const merchantId = getMerchantId();

                if (!merchantId) {
                    setError("Không tìm thấy thông tin nhà xe. Vui lòng đăng nhập lại.");
                    setLoading(false);
                    return;
                }

                const meta = createRequestMeta();

                const url = new URL(DASHBOARD_ENDPOINTS.GET);
                url.searchParams.append("merchantId", merchantId);
                url.searchParams.append("filterType", timeFilter.toUpperCase());

                const response = await fetch(url.toString(), {
                    headers: {
                        ...createXAuthorizedHeaders(meta),
                        'accept': '*/*'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.data) {
                        setDashboardData(result.data);
                    } else {
                        setError("Dữ liệu trả về không hợp lệ.");
                    }
                } else {
                    setError("Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.");
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu dashboard:", error);
                setError("Có lỗi xảy ra khi kết nối tới hệ thống.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [timeFilter]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const filterLabels = { day: 'ngày', week: 'tuần', month: 'tháng', year: 'năm' };

    const dynamicKpis = [
        {
            label: `Vé bán trong ${filterLabels[timeFilter]}`,
            value: dashboardData?.stats?.ticketsSold?.toString() || '0',
            delta: `${(dashboardData?.stats?.ticketGrowthRate || 0).toFixed(2)}%`,
            positive: (dashboardData?.stats?.ticketGrowthRate || 0) >= 0,
            bg: 'bg-emerald-50',
            icon: Ticket,
            iconColor: 'text-emerald-500'
        },
        {
            label: 'Tổng doanh thu',
            value: dashboardData?.stats ? formatCurrency(dashboardData.stats.totalRevenue) : '0 VNĐ',
            delta: `${(dashboardData?.stats?.revenueGrowthRate || 0).toFixed(2)}%`,
            positive: (dashboardData?.stats?.revenueGrowthRate || 0) >= 0,
            bg: 'bg-blue-50',
            icon: TrendingUp,
            iconColor: 'text-blue-500'
        },
        {
            label: 'Thực nhận (Merchant)',
            value: dashboardData?.stats ? formatCurrency(dashboardData.stats.merchantShare) : '0 VNĐ',
            delta: '80.00%', // Static placeholder or calculate if needed
            positive: true,
            bg: 'bg-orange-50',
            icon: Bus,
            iconColor: 'text-orange-500'
        },
        {
            label: 'Tài xế sẵn sàng',
            value: '8', // Mocked as not in current dashboard API
            delta: '+2',
            positive: true,
            bg: 'bg-purple-50',
            icon: Users,
            iconColor: 'text-purple-500'
        },
    ];
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
                            Bảng điều khiển Nhà xe
                        </h2>
                        <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
                            Chào mừng bạn trở lại! Đây là báo cáo hiệu quả hoạt động của nhà xe.
                        </p>
                    </div>

                    {/* Time Range Filter */}
                    <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
                        {[
                            { id: 'day', label: 'Ngày' },
                            { id: 'week', label: 'Tuần' },
                            { id: 'month', label: 'Tháng' },
                            { id: 'year', label: 'Năm' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setTimeFilter(f.id as any)}
                                className={`px-4 py-1.5 rounded-xl text-[11px] font-black transition-all ${timeFilter === f.id
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trực tiếp</span>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="p-12 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 shadow-sm">
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
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 animate-pulse h-32 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-slate-200 animate-spin" />
                                </div>
                            ))
                        ) : (
                            dynamicKpis.map((kpi) => (
                                <div key={kpi.label} className={`relative overflow-hidden ${kpi.bg} p-5 rounded-2xl shadow-sm border border-white transition-all hover:shadow-xl group`}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                                            <h3 className="text-[1.25rem] font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                                        </div>
                                        <div className={`p-2 rounded-xl bg-white shadow-sm ${kpi.iconColor}`}>
                                            <kpi.icon size={20} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1.5">
                                        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${kpi.positive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            <span>{kpi.delta}</span>
                                        </div>
                                        <span className={`text-[10px] text-slate-400 font-bold`}>so với {filterLabels[timeFilter]} trước</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Biểu đồ doanh thu</h3>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dữ liệu theo tuần</p>
                                </div>
                                <select className="bg-slate-50 border-none text-[11px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-brand-primary/20">
                                    <option>7 ngày qua</option>
                                    <option>30 ngày qua</option>
                                </select>
                            </div>

                            <div className="relative h-[350px] min-w-0">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <AreaChart data={dashboardData?.revenueChart || []}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                                                tickFormatter={(val) => `${val / 1000000}M`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                                formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#0EA5E9"
                                                strokeWidth={4}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Top Routes */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Tuyến xe đông khách</h3>
                            <div className="space-y-8">
                                {loading ? (
                                    [1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-3 animate-pulse">
                                            <div className="flex justify-between">
                                                <div className="h-3 bg-slate-50 rounded w-1/2" />
                                                <div className="h-3 bg-slate-50 rounded w-12" />
                                            </div>
                                            <div className="h-2.5 bg-slate-50 rounded-full w-full" />
                                        </div>
                                    ))
                                ) : (
                                    (dashboardData?.popularRoutes || []).map((route, idx) => (
                                        <div key={`${route.routeName}-${idx}`} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[12px] font-black text-slate-700 uppercase tracking-wide">{route.routeName}</span>
                                                <span className="text-[12px] font-black text-brand-primary">{route.occupancyRate.toFixed(2)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${route.occupancyRate.toFixed(2)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold">{route.ticketCount} vé đã bán</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-12 p-6 rounded-2xl bg-slate-950 text-white relative overflow-hidden group cursor-pointer">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Thông báo</p>
                                    <h4 className="text-[13px] font-bold leading-relaxed">Bạn có 5 chuyến xe cần xác nhận trong ngày mai.</h4>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Bus size={100} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trips Table Placeholder */}
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Danh sách chuyến gần đây</h3>
                            <button className="text-[11px] font-black text-brand-primary uppercase tracking-widest hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã chuyến</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuyến đường</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giờ chạy</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Biển số xe</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(dashboardData?.recentTrips || []).map((trip, idx) => (
                                        <tr key={`${trip.tripId}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={14} className="text-slate-300" />
                                                    <span className="text-[12px] font-bold text-slate-900">{trip.tripId.substring(0, 8).toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[12px] font-bold text-slate-600">{trip.routeName}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={14} />
                                                    <span className="text-[12px] font-bold">{new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(trip.departureTime).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[12px] font-bold text-slate-500">{trip.vehiclePlate}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${trip.status === 'ISSUED' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{trip.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
