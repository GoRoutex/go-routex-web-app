import React, { useState, useEffect } from "react";
import {
    Plus, Clock, ArrowRight,
    X, Loader2, Save, Search,
    Navigation, Building, Calendar, Activity, MoreHorizontal, Timer,
    User, Truck, Trash2, Edit3
} from "lucide-react";

import { toast } from "react-toastify";
import { ROUTE_ENDPOINTS, TRIP_ENDPOINTS, VEHICLE_ENDPOINTS, STAFF_ENDPOINTS } from "../../utils/api-constants";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";

interface TripItem {
    tripId: string;
    merchantId: string;
    creator: string | null;
    tripCode: string;
    pickupBranch: string | null;
    departureTime: string;
    rawDepartureTime: string;
    rawDepartureDate: string;
    rawArrivalTime?: string;
    status: string;
    route: {
        routeId: string;
        originName: string;
        destinationName: string;
        duration: number;
    };
}

interface RouteItem {
    id: string;
    originName: string;
    destinationName: string;
    duration: number;
}

export function MerchantTripManagementPage() {
    const [trips, setTrips] = useState<TripItem[]>([]);
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [tripDetail, setTripDetail] = useState<TripItem | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [formData, setFormData] = useState({
        routeId: "",
        departureTime: new Date().toISOString(),
        rawDepartureTime: "",
        rawDepartureDate: "",
        pickupBranch: ""
    });

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [assignData, setAssignData] = useState({
        tripId: "",
        vehicleId: "",
        driverId: "",
        creator: localStorage.getItem("userName") || "System"
    });

    useEffect(() => {
        fetchTrips(page);
    }, [page, statusFilter, searchTerm]);

    useEffect(() => {
        fetchRoutes();
        fetchVehicles();
        fetchDrivers();
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
                setIsAssignModalOpen(false);
                setIsDetailModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchTrips = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${TRIP_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${statusFilter}&search=${searchTerm}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setTrips(result.data.items);
                setTotalItems(result.data.pagination?.totalElements || result.data.items.length);
                setTotalPages(result.data.pagination?.totalPages || 1);
            }
        } catch (err) {
            toast.error("Không thể tải danh sách chuyến xe");
        } finally {
            setLoading(false);
        }
    };

    const fetchTripDetail = async (tripId: string) => {
        setLoadingDetail(true);
        try {
            const response = await fetch(`${TRIP_ENDPOINTS.DETAIL}?tripId=${tripId}`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const result = await response.json();
            if (result.data) {
                setTripDetail(result.data);
                setIsDetailModalOpen(true);
            } else {
                toast.error("Không tìm thấy thông tin chi tiết");
            }
        } catch (err) {
            toast.error("Lỗi khi tải chi tiết chuyến xe");
        } finally {
            setLoadingDetail(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${ROUTE_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100&status=ACTIVE`, {
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

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${VEHICLE_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const result = await response.json();
            if (result.data && result.data.items) {
                setVehicles(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách xe:", err);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${STAFF_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100`, {
                headers: createAuthorizedEnvelopeHeaders()
            });
            const result = await response.json();
            if (result.data && result.data.items) {
                // Filter only drivers if possible, or just keep all staff
                setDrivers(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách nhân viên:", err);
        }
    };

    const handleOpenCreate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        setIsEditing(false);
        setFormData({
            routeId: "",
            departureTime: now.toISOString(),
            rawDepartureDate: `${day}/${month}/${year}`,
            rawDepartureTime: `${hours}:${minutes}`,
            pickupBranch: ""
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (trip: TripItem) => {
        setIsEditing(true);
        setSelectedTrip(trip);
        setFormData({
            routeId: trip.route?.routeId || "",
            departureTime: trip.departureTime,
            rawDepartureTime: trip.rawDepartureTime,
            rawDepartureDate: trip.rawDepartureDate,
            pickupBranch: trip.pickupBranch || ""
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
                    tripId: isEditing ? selectedTrip?.tripId : undefined
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

    const handleOpenAssign = (trip: TripItem) => {
        setAssignData({
            tripId: trip.tripId,
            vehicleId: "",
            driverId: "",
            creator: localStorage.getItem("userName") || "System"
        });
        setIsAssignModalOpen(true);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssigning(true);
        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                data: assignData
            };

            const response = await fetch(TRIP_ENDPOINTS.ASSIGN, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Điều phối thành công");
                setIsAssignModalOpen(false);
                fetchTrips(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi khi điều phối");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setAssigning(false);
        }
    };

    const handleDeleteTrip = async (trip: TripItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyến xe ${trip.tripCode}?`)) {
            return;
        }

        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                data: {
                    tripId: trip.tripId
                }
            };

            const response = await fetch(TRIP_ENDPOINTS.DELETE, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Xóa chuyến xe thành công");
                fetchTrips(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi khi xóa chuyến xe");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
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

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyến xe..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-100 flex-1 md:flex-none">
                        <Activity size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-2 mr-1 hidden sm:block">Trạng thái</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer pr-2 py-2 min-w-[150px]"
                        >
                            <option value="">Tất cả (ALL)</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="DEPARTED">DEPARTED</option>
                            <option value="BOARDING">BOARDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                </div>
            </div>

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
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Điểm đón</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {trips.map((trip) => (
                                    <tr key={trip.tripId} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => fetchTripDetail(trip.tripId)}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                                    <Navigation size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900">{trip.route?.originName || "Tuyến đường"}</span>
                                                        <ArrowRight size={12} className="text-slate-300" />
                                                        <span className="text-sm font-black text-slate-900">{trip.route?.destinationName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Activity size={10} className="text-brand-primary" /> {trip.tripCode}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Clock size={10} /> {new Date(trip.departureTime).toLocaleString('vi-VN')}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Timer size={10} /> {trip.route?.duration} phút
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Building size={14} className="text-slate-300" />
                                                <span className="text-sm font-bold">{trip.pickupBranch || "Chưa xác định"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">
                                                {trip.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {trip.status === 'SCHEDULED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenAssign(trip);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                                                    >
                                                        <Truck size={14} /> ĐIỀU PHỐI
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTrip(trip);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                                                >
                                                    <Trash2 size={14} /> XÓA
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEdit(trip);
                                                    }}
                                                    className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </div>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Văn phòng đón khách (Pickup Branch)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.pickupBranch}
                                        onChange={(e) => setFormData({ ...formData, pickupBranch: e.target.value })}
                                        placeholder="VD: Văn phòng Hàng Xanh"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chọn Tuyến đường mẫu</label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                        value={formData.routeId}
                                        onChange={(e) => {
                                            const routeId = e.target.value;
                                            setFormData({
                                                ...formData,
                                                routeId,
                                            });
                                        }}
                                    >
                                        <option value="">-- Chọn tuyến đường --</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.originName} → {r.destinationName} ({r.duration || 0} phút)</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thời gian khởi hành</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white"
                                        value={formData.departureTime ? (() => {
                                            const d = new Date(formData.departureTime);
                                            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        })() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value; // YYYY-MM-DDTHH:mm
                                            if (!val) return;

                                            const [datePart, timePart] = val.split('T');
                                            const [year, month, day] = datePart.split('-');

                                            setFormData({
                                                ...formData,
                                                departureTime: new Date(val).toISOString(),
                                                rawDepartureDate: `${day}/${month}/${year}`,
                                                rawDepartureTime: timePart
                                            });
                                        }}
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
            {/* Assign Vehicle/Driver Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsAssignModalOpen(false)} />
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tight">Điều phối vận hành</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gán phương tiện & tài xế cho chuyến xe</p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAssignSubmit} className="p-8 space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                        <Truck size={14} /> Chọn Phương tiện (Xe)
                                    </label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                        value={assignData.vehicleId}
                                        onChange={(e) => setAssignData({ ...assignData, vehicleId: e.target.value })}
                                    >
                                        <option value="">-- Chọn xe vận hành --</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.licensePlate} ({v.type || 'N/A'})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                        <User size={14} /> Chọn Tài xế (Driver)
                                    </label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                        value={assignData.driverId}
                                        onChange={(e) => setAssignData({ ...assignData, driverId: e.target.value })}
                                    >
                                        <option value="">-- Chọn tài xế điều phối --</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.userInfo?.fullName || "Chưa đặt tên"} ({d.userInfo?.phone || 'Không có SĐT'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                                    Hủy
                                </button>
                                <button type="submit" disabled={assigning} className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    {assigning ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Xác nhận Điều phối
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Trip Detail Modal */}
            {isDetailModalOpen && tripDetail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tight">Chi tiết chuyến xe</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{tripDetail.tripCode}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tripDetail.status}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Route Journey */}
                            <div className="relative pl-8 border-l-2 border-dashed border-slate-100 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-brand-primary border-4 border-white shadow-md" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm đi</p>
                                    <h4 className="text-lg font-black text-slate-900">{tripDetail.route?.originName}</h4>
                                    <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                                        <Building size={12} /> {tripDetail.pickupBranch || "Chưa gán chi nhánh"}
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-md" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Điểm đến</p>
                                    <h4 className="text-lg font-black text-slate-900">{tripDetail.route?.destinationName}</h4>
                                </div>
                            </div>

                            {/* Schedule Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Calendar size={12} /> Lịch trình khởi hành
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">{tripDetail.rawDepartureTime}</p>
                                        <p className="text-xs font-bold text-slate-500">{tripDetail.rawDepartureDate}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Timer size={12} /> Dự kiến kết thúc
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">{tripDetail.rawArrivalTime || "Chưa tính toán"}</p>
                                        <p className="text-xs font-bold text-slate-500">Thời gian đi: {tripDetail.route?.duration} phút</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Hệ thống</p>
                                        <p className="text-xs font-mono opacity-80">{tripDetail.tripId}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-2xl">
                                        <Activity size={20} className="text-brand-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người tạo</p>
                                    <p className="text-sm font-black tracking-tight">{tripDetail.creator || "Hệ thống"}</p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Navigation size={120} />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 italic">* Thông tin được cập nhật theo thời gian thực từ hệ thống GPS</p>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        handleOpenEdit(tripDetail);
                                    }}
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Sửa chuyến xe
                                </button>
                                <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading detail overlay */}
            {loadingDetail && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                </div>
            )}

            {/* Pagination Container */}
            {!loading && trips.length > 0 && (
                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tổng số chuyến xe: <span className="text-slate-900">{totalItems}</span> · Trang <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all shadow-sm bg-white"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                                        page === p 
                                        ? "bg-slate-900 text-white shadow-lg" 
                                        : "bg-white text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all shadow-sm bg-white"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ChevronLeft({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}

function ChevronRight({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;
}
