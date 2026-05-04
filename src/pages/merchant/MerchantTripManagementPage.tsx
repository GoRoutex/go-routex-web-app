import { useState, useEffect } from "react";
import {
    Plus, Clock, ArrowRight,
    Edit3,
    ChevronLeft, ChevronRight, X, Loader2, Save,
    Navigation, Building, Info, Calendar, MapPin, Search, Activity, MoreHorizontal, Timer
} from "lucide-react";

import { toast } from "react-toastify";
import { ROUTE_ENDPOINTS, TRIP_ENDPOINTS } from "../../utils/api-constants";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";

interface TripItem {
    id: string;
    routeId: string;
    departureTime: string;
    rawDepartureTime: string;
    rawDepartureDate: string;
    durationMinutes: number;
    status: string;
    originName?: string;
    destinationName?: string;
}

interface RouteItem {
    id: string;
    originName: string;
    destinationName: string;
}

export function MerchantTripManagementPage() {
    const [trips, setTrips] = useState<TripItem[]>([]);
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);

    const [formData, setFormData] = useState({
        routeId: "",
        departureTime: new Date().toISOString(),
        rawDepartureTime: "",
        rawDepartureDate: "",
        durationMinutes: 0
    });

    useEffect(() => {
        fetchTrips(page);
        fetchRoutes();
    }, [page]);

    const fetchTrips = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${TRIP_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setTrips(result.data.items);
                setTotalItems(result.data.pagination.totalElements || result.data.items.length);
                setTotalPages(result.data.pagination.totalPages || 1);
            }
        } catch (err) {
            toast.error("Không thể tải danh sách chuyến xe");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${ROUTE_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const result = await response.json();
            if (result.data && result.data.items) {
                setRoutes(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi tải tuyến đường:", err);
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({
            routeId: "",
            departureTime: new Date().toISOString(),
            rawDepartureTime: "",
            rawDepartureDate: "",
            durationMinutes: 0
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (trip: TripItem) => {
        setIsEditing(true);
        setSelectedTrip(trip);
        setFormData({
            routeId: trip.routeId,
            departureTime: trip.departureTime,
            rawDepartureTime: trip.rawDepartureTime,
            rawDepartureDate: trip.rawDepartureDate,
            durationMinutes: trip.durationMinutes
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const body: any = {
                ...meta,
                channel: "ONL",
                data: {
                    ...formData,
                    tripId: isEditing ? selectedTrip?.id : undefined
                }
            };

            const response = await fetch(isEditing ? TRIP_ENDPOINTS.UPDATE : TRIP_ENDPOINTS.CREATE, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(isEditing ? "Cập nhật chuyến xe thành công" : "Tạo chuyến xe thành công");
                setIsModalOpen(false);
                fetchTrips(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi hệ thống");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Quản lý Chuyến Xe</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                        Vận hành thực tế · Điều phối chuyến xe
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} />
                        Tạo chuyến xe
                    </button>
                </div>
            </div>

            {/* KPI Panels */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng chuyến xe</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{totalItems}</h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                                <Calendar size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Table */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang tải danh sách chuyến xe...</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="h-[450px] flex flex-col items-center justify-center gap-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                        <Calendar size={48} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Chưa có chuyến xe nào</h3>
                        <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Tạo chuyến xe dựa trên các tuyến đường mẫu đã thiết lập.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Lộ trình & Thời gian</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời lượng</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {trips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleOpenEdit(trip)}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                                    <Navigation size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900">{trip.originName || "Tuyến đường"}</span>
                                                        <ArrowRight size={12} className="text-slate-300" />
                                                        <span className="text-sm font-black text-slate-900">{trip.destinationName || trip.routeId}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={10} /> {new Date(trip.departureTime).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Timer size={14} className="text-slate-300" />
                                                <span className="text-sm font-bold">{trip.durationMinutes} phút</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">
                                                {trip.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                                    {isEditing ? "Cập nhật Chuyến xe" : "Tạo Chuyến xe mới"}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Thiết lập lịch trình vận hành thực tế
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chọn Tuyến đường mẫu</label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                        value={formData.routeId}
                                        onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                                    >
                                        <option value="">-- Chọn tuyến đường --</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.originName} → {r.destinationName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thời gian khởi hành</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.departureTime.slice(0, 16)}
                                        onChange={(e) => setFormData({ ...formData, departureTime: new Date(e.target.value).toISOString() })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thời lượng (Phút)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ngày chạy (Raw)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.rawDepartureDate}
                                        onChange={(e) => setFormData({ ...formData, rawDepartureDate: e.target.value })}
                                        placeholder="VD: 2026-05-04"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giờ chạy (Raw)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.rawDepartureTime}
                                        onChange={(e) => setFormData({ ...formData, rawDepartureTime: e.target.value })}
                                        placeholder="VD: 18:30"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting} className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isEditing ? "Cập nhật" : "Tạo chuyến xe"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
