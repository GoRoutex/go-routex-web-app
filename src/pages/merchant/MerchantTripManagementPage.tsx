import React, { useState, useEffect, useMemo } from "react";
import {
    Plus, ArrowRight,
    X, Loader2, Save, Search,
    Navigation, Calendar, Activity, Timer,
    User, Truck, Trash2, Edit3, ListPlus, Layers
} from "lucide-react";

import { toast } from "react-toastify";
import { ROUTE_ENDPOINTS, TRIP_ENDPOINTS, VEHICLE_ENDPOINTS, STAFF_ENDPOINTS } from "../../utils/api-constants";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import { Pagination } from "../../Components/common/Pagination";

const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
};

const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
};

const getFormattedTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch {
        return "--:--";
    }
};

const getFormattedDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return "";
    }
};

interface TripItem {
    tripId: string;
    merchantId: string;
    creator: string | null;
    tripCode: string;
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

interface BatchTripInput {
    id: string;
    departureTime: string;
    rawDepartureTime: string;
    rawDepartureDate: string;
}

export function MerchantTripManagementPage() {
    const [trips, setTrips] = useState<TripItem[]>([]);
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
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
        departureTime: toLocalISOString(new Date()),
        rawDepartureTime: "",
        rawDepartureDate: ""
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

    // Batch create states
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchRouteId, setBatchRouteId] = useState("");
    const [batchTrips, setBatchTrips] = useState<BatchTripInput[]>([]);
    const [batchSubmitting, setBatchSubmitting] = useState(false);

    const sortedTrips = useMemo(() => {
        return [...trips].sort((a, b) => {
            const timeA = new Date(a.departureTime).getTime();
            const timeB = new Date(b.departureTime).getTime();
            return timeA - timeB;
        });
    }, [trips]);

    useEffect(() => {
        fetchTrips(page);
    }, [page, statusFilter, searchTerm, dateFilter]);

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
                setIsBatchModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchTrips = async (pageNumber: number) => {
        setLoading(true);
        try {
            const rawDepartureDateParam = dateFilter ? `&rawDepartureDate=${formatDateToDDMMYYYY(dateFilter)}` : "";
            const response = await fetch(
                `${TRIP_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${statusFilter}&search=${searchTerm}${rawDepartureDateParam}`,
                {
                    headers: createXAuthorizedHeaders()
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
                headers: createXAuthorizedHeaders()
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
                headers: createXAuthorizedHeaders()
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
            const response = await fetch(`${VEHICLE_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100&status=AVAILABLE`, {
                headers: createXAuthorizedHeaders()
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
            const response = await fetch(`${STAFF_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100&status=AVAILABLE`, {
                headers: createXAuthorizedHeaders()
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
            departureTime: toLocalISOString(now),
            rawDepartureDate: `${day}/${month}/${year}`,
            rawDepartureTime: `${hours}:${minutes}`
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (trip: TripItem) => {
        setIsEditing(true);
        setSelectedTrip(trip);

        // Derive local raw fields from the ISO departureTime to ensure consistency
        const d = new Date(trip.departureTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        setFormData({
            routeId: trip.route?.routeId || "",
            departureTime: trip.departureTime,
            rawDepartureTime: `${hours}:${minutes}`,
            rawDepartureDate: `${day}/${month}/${year}`
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
                creator: localStorage.getItem("userName") || "System",
                data: {
                    ...formData,
                    tripId: isEditing ? selectedTrip?.tripId : undefined
                }
            };

            const response = await fetch(isEditing ? TRIP_ENDPOINTS.UPDATE : TRIP_ENDPOINTS.CREATE, {
                method: 'POST',
                headers: {
                    ...createXAuthorizedHeaders(meta),
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
                    ...createXAuthorizedHeaders(meta),
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
                    ...createXAuthorizedHeaders(meta),
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

    const createEmptyBatchTrip = (): BatchTripInput => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
            id: Math.random().toString(36).substring(7),
            departureTime: toLocalISOString(now),
            rawDepartureDate: `${day}/${month}/${year}`,
            rawDepartureTime: `${hours}:${minutes}`
        };
    };

    const handleOpenBatchCreate = () => {
        setBatchRouteId("");
        setBatchTrips([createEmptyBatchTrip()]);
        setIsBatchModalOpen(true);
    };

    const handleAddBatchTrip = () => {
        setBatchTrips(prev => [...prev, createEmptyBatchTrip()]);
    };

    const handleRemoveBatchTrip = (id: string) => {
        setBatchTrips(prev => prev.filter(t => t.id !== id));
    };

    const handleBatchTripChange = (id: string, field: keyof BatchTripInput, value: string) => {
        setBatchTrips(prev => prev.map(t => {
            if (t.id !== id) return t;

            if (field === 'departureTime') {
                const val = value; // YYYY-MM-DDTHH:mm
                if (!val) return t;
                const [datePart, timePart] = val.split('T');
                const [year, month, day] = datePart.split('-');

                return {
                    ...t,
                    departureTime: `${val}:00+07:00`,
                    rawDepartureDate: `${day}/${month}/${year}`,
                    rawDepartureTime: timePart
                };
            }

            return { ...t, [field]: value };
        }));
    };

    const handleBatchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchRouteId) {
            toast.error("Vui lòng chọn tuyến đường");
            return;
        }
        if (batchTrips.length === 0) {
            toast.error("Vui lòng thêm ít nhất một chuyến xe");
            return;
        }

        setBatchSubmitting(true);
        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                creator: localStorage.getItem("userName") || "System",
                data: {
                    routeId: batchRouteId,
                    trips: batchTrips.map(t => ({
                        departureTime: t.departureTime,
                        rawDepartureTime: t.rawDepartureTime,
                        rawDepartureDate: t.rawDepartureDate
                    }))
                }
            };

            const response = await fetch(TRIP_ENDPOINTS.BATCH_CREATE, {
                method: 'POST',
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(`Tạo lô ${batchTrips.length} chuyến xe thành công`);
                setIsBatchModalOpen(false);
                fetchTrips(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi hệ thống khi tạo lô");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setBatchSubmitting(false);
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
                        onClick={handleOpenBatchCreate}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-slate-950/20 hover:scale-[1.02] transition-all"
                    >
                        <ListPlus size={18} />
                        Tạo lô chuyến xe
                    </button>
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
                    {/* Date Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-100 flex-1 md:flex-none">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-2 mr-1 hidden sm:block">Ngày đi</span>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer pr-2 py-2 min-w-[130px] [color-scheme:light]"
                        />
                        {dateFilter && (
                            <button
                                onClick={() => {
                                    setDateFilter("");
                                    setPage(1);
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
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
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedTrips.map((trip) => (
                                    <tr key={trip.tripId} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => fetchTripDetail(trip.tripId)}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                {/* Prominent Time Capsule */}
                                                <div className="flex flex-col items-center justify-center w-24 h-12 bg-slate-950 text-white rounded-xl shadow-sm border border-slate-900 shrink-0">
                                                    <span className="text-sm font-black tracking-tight leading-none">{getFormattedTime(trip.departureTime)}</span>
                                                    <span className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-wider">{getFormattedDate(trip.departureTime)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-black text-slate-900">{trip.route?.originName || "Tuyến đường"}</span>
                                                        <ArrowRight size={12} className="text-slate-400" />
                                                        <span className="text-sm font-black text-slate-900">{trip.route?.destinationName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Activity size={10} className="text-brand-primary" /> {trip.tripCode}
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Timer size={10} /> {trip.route?.duration} phút
                                                        </p>
                                                    </div>
                                                </div>
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
                                            const gmt7Time = new Date(d.getTime() + 7 * 60 * 60 * 1000);
                                            return gmt7Time.toISOString().slice(0, 16);
                                        })() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) return;
                                            const [datePart, timePart] = val.split('T');
                                            const [year, month, day] = datePart.split('-');

                                            setFormData({
                                                ...formData,
                                                departureTime: `${val}:00+07:00`,
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
                                            <option key={v.id} value={v.id}>{v.vehiclePlate} - {v.type || 'N/A'} - {v.seatCapacity || 'N/A'} chỗ</option>
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
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    itemLabel="chuyến xe"
                />
            )}

            {/* Modal Create Batch */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsBatchModalOpen(false)} />
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                                    <Layers className="text-brand-primary" size={24} />
                                    Tạo lô Chuyến xe mới
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Thiết lập và tạo đồng loạt nhiều chuyến xe cho tuyến đường
                                </p>
                            </div>
                            <button onClick={() => setIsBatchModalOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBatchSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chọn Tuyến đường mẫu</label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                        value={batchRouteId}
                                        onChange={(e) => setBatchRouteId(e.target.value)}
                                    >
                                        <option value="">-- Chọn tuyến đường --</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.originName} → {r.destinationName} ({r.duration || 0} phút)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Batch Trips List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Danh sách chuyến xe ({batchTrips.length})</h4>
                                    <button
                                        type="button"
                                        onClick={() => setBatchTrips([])}
                                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>

                                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                                        {batchTrips.length === 0 ? (
                                            <div className="py-8 text-center text-slate-400 text-xs font-bold">
                                                Chưa có chuyến xe nào trong lô. Bấm nút bên dưới để thêm.
                                            </div>
                                        ) : (
                                            batchTrips.map((trip, index) => (
                                                <div key={trip.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center flex-shrink-0">
                                                        {index + 1}
                                                    </span>

                                                    <div className="flex-1 w-full">
                                                        <div>
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Thời gian khởi hành</label>
                                                            <input
                                                                type="datetime-local"
                                                                required
                                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white"
                                                                value={trip.departureTime ? (() => {
                                                                    const d = new Date(trip.departureTime);
                                                                    const gmt7Time = new Date(d.getTime() + 7 * 60 * 60 * 1000);
                                                                    return gmt7Time.toISOString().slice(0, 16);
                                                                })() : ""}
                                                                onChange={(e) => handleBatchTripChange(trip.id, 'departureTime', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <div>
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Ngày (Raw)</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                className="w-20 px-2 py-2 bg-slate-100 border-none rounded-xl text-[11px] font-bold text-slate-500 text-center outline-none"
                                                                value={trip.rawDepartureDate}
                                                                onChange={(e) => handleBatchTripChange(trip.id, 'rawDepartureDate', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Giờ (Raw)</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                className="w-16 px-2 py-2 bg-slate-100 border-none rounded-xl text-[11px] font-bold text-slate-500 text-center outline-none"
                                                                value={trip.rawDepartureTime}
                                                                onChange={(e) => handleBatchTripChange(trip.id, 'rawDepartureTime', e.target.value)}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBatchTrip(trip.id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all self-end"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddBatchTrip}
                                    className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-brand-primary hover:bg-brand-primary/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-all"
                                >
                                    <Plus size={16} />
                                    Thêm chuyến xe vào lô
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                                    Hủy
                                </button>
                                <button type="submit" disabled={batchSubmitting} className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    {batchSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Lưu lô chuyến xe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
