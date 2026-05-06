import { useState, useEffect } from "react";
import {
    Plus, MapPin, Clock, ArrowRight,
    Edit3,
    ChevronLeft, ChevronRight, X, Loader2, Save,
    Navigation, Building, Info, Search, Activity, MoreHorizontal
} from "lucide-react";

import { toast } from "react-toastify";
import { ROUTE_ENDPOINTS } from "../../utils/api-constants";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";


import { getAccessToken, parseJwt } from "../../utils/auth";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";

interface RoutePoint {
    id?: string;
    operationOrder: string;
    routeId?: string;
    note: string;
    operationPointId: string; // This will now store the Code for display
    realOperationPointId?: string; // This will store the actual UUID for the backend
    code?: string;
    stopName: string;
    stopAddress: string;
    stopCity: string;
    stopLatitude: number;
    stopLongitude: number;
}

interface RouteItem {
    id: string; // Fallback
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    duration: number;
    status: string;
    creator: string;
    routePoints?: RoutePoint[];
}

interface Province {
    id: string;
    code: string;
    name: string;
    slug: string;
}

export function MerchantScheduleManagementPage() {
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
    const [allOperationPoints, setAllOperationPoints] = useState<any[]>([]);
    const [fetchingResources, setFetchingResources] = useState(false);

    // Form states matching create payload
    const [formData, setFormData] = useState({
        creator: "",
        originName: "",
        destinationName: "",
        duration: 0,
        operationPoints: [] as RoutePoint[]
    });

    const fetchRoutes = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ROUTE_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setRoutes(result.data.items);
                setTotalItems(result.data.pagination?.totalElements || 0);
            }
        } catch (err: any) {
            toast.error("Không thể tải danh sách tuyến đường: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/provinces/master/fetch?pageNumber=1&pageSize=100`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setProvinces(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi fetch provinces:", err);
        }
    };

    const fetchOperationPoints = async () => {
        try {
            const params = new URLSearchParams({
                pageNumber: "1",
                pageSize: "100"
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/fetch?${params.toString()}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setAllOperationPoints(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi fetch operation points:", err);
        }
    };

    const fetchAllResources = async () => {
        setFetchingResources(true);
        await fetchOperationPoints();
        setFetchingResources(false);
    };



    useEffect(() => {
        fetchRoutes(page);
    }, [page]);

    useEffect(() => {
        fetchProvinces();
        fetchAllResources();
    }, []);



    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedRoute(null);
        setFormData({
            creator: localStorage.getItem("userName") || "",
            originName: "",
            destinationName: "",
            duration: 0,
            operationPoints: []
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (route: RouteItem) => {
        setIsEditing(true);
        setSelectedRoute(route);
        setIsModalOpen(true);
        setFetchingDetail(true);

        try {
            const token = getAccessToken();
            const decoded = token ? parseJwt(token) : null;
            const merchantId = decoded?.merchantId;
            const routeId = route.id;

            if (!merchantId) {
                toast.error("Không tìm thấy thông tin nhà xe trong phiên đăng nhập");
                setFetchingDetail(false);
                return;
            }

            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/routes/fetch/detail?routeId=${routeId}&merchantId=${merchantId}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );

            if (!response.ok) throw new Error("Không thể tải thông tin chi tiết tuyến đường");

            const result = await response.json();
            const detailedRoute = result.data;

            if (detailedRoute) {
                setFormData({
                    creator: detailedRoute.creator || "",
                    originName: detailedRoute.originName || detailedRoute.origin || "",
                    destinationName: detailedRoute.destinationName || detailedRoute.destination || "",
                    duration: detailedRoute.duration || 0,
                    operationPoints: (detailedRoute.routePoints || detailedRoute.operationPoints || []).map((p: any) => ({
                        ...p,
                        // Ensure we have the real UUID for later update/save
                        realOperationPointId: p.operationPointId || p.id,
                    }))
                });
            } else {
                setFormData({
                    creator: route.creator || "",
                    originName: route.originName || "",
                    destinationName: route.destinationName,
                    duration: route.duration || 0,
                    operationPoints: (route.routePoints || []).map((p: any) => ({
                        ...p,
                        realOperationPointId: p.operationPointId || p.id,
                    }))
                });
            }
        } catch (err: any) {
            toast.error("Lỗi khi tải chi tiết: " + err.message);
            // Fallback to list data on error
            setFormData({
                creator: route.creator || "",
                originName: route.originName || "",
                destinationName: route.destinationName || "",
                duration: route.duration || 0,
                operationPoints: route.routePoints || []
            });
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleAddPoint = () => {
        const newPoint: RoutePoint = {
            operationOrder: (formData.operationPoints.length + 1).toString(),
            note: "",
            operationPointId: "",
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: 0,
            stopLongitude: 0
        };
        setFormData({
            ...formData,
            operationPoints: [...formData.operationPoints, newPoint]
        });
    };

    const handleRemovePoint = (index: number) => {
        const updated = formData.operationPoints.filter((_, i) => i !== index);
        const reordered = updated.map((p, i) => ({ ...p, operationOrder: (i + 1).toString() }));
        setFormData({ ...formData, operationPoints: reordered });
    };

    const updatePoint = (index: number, field: keyof RoutePoint, value: any) => {
        const updated = [...formData.operationPoints];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, operationPoints: updated });
    };

    const handleFetchPointDetail = async (index: number, type: 'code' | 'name') => {
        const point = formData.operationPoints[index];
        const searchValue = type === 'code' ? point.operationPointId : point.stopName;

        if (!searchValue.trim()) return;

        try {
            const queryParam = type === 'code'
                ? `code=${encodeURIComponent(searchValue)}`
                : `name=${encodeURIComponent(searchValue)}`;

            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/detail?${queryParam}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );

            if (!response.ok) {
                // If code search fails, try searching by ID as fallback
                if (type === 'code') {
                    const fallbackResponse = await fetch(
                        `${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/detail?operationPointId=${encodeURIComponent(searchValue)}`,
                        { headers: createAuthorizedEnvelopeHeaders() }
                    );
                    if (fallbackResponse.ok) {
                        const result = await fallbackResponse.json();
                        populatePointData(index, result.data);
                        return;
                    }
                }
                toast.error("Không tìm thấy thông điểm dừng này");
                return;
            }

            const result = await response.json();
            populatePointData(index, result.data);
        } catch (err) {
            toast.error("Lỗi khi tìm kiếm điểm dừng");
        }
    };

    const populatePointData = (index: number, data: any) => {
        if (!data) return;
        const updated = [...formData.operationPoints];
        updated[index] = {
            ...updated[index],
            // Use the code for display in the input field
            operationPointId: data.code || updated[index].operationPointId,
            // Store the real internal ID (UUID) for the backend
            realOperationPointId: data.operationPointId || data.id,
            code: data.code || "",
            stopName: data.name || updated[index].stopName,
            stopAddress: data.address || updated[index].stopAddress,
            stopCity: data.city || updated[index].stopCity,
            stopLatitude: data.latitude || updated[index].stopLatitude,
            stopLongitude: data.longitude || updated[index].stopLongitude,
        };
        setFormData({ ...formData, operationPoints: updated });
        toast.success(`Đã tìm thấy: ${data.name} (${data.code || 'N/A'})`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const endpoint = isEditing ? "update" : "create";

            const body: any = {
                ...meta,
                channel: "OFF", // Match curl examples
            };

            if (isEditing && selectedRoute) {
                body.routeId = selectedRoute.id;
                body.creator = formData.creator || selectedRoute.creator;
                body.data = {
                    originName: formData.originName,
                    destinationName: formData.destinationName,
                    status: selectedRoute?.status || "ACTIVE",
                    duration: formData.duration,
                    routePoints: formData.operationPoints.map(p => ({
                        id: p.id || p.realOperationPointId,
                        operationOrder: p.operationOrder,
                        routeId: selectedRoute.id,
                        note: p.note || ""
                    }))
                };
            } else {
                body.data = {
                    creator: formData.creator,
                    originName: formData.originName,
                    destinationName: formData.destinationName,
                    duration: formData.duration,
                    operationPoints: formData.operationPoints.map(p => ({
                        operationOrder: p.operationOrder,
                        note: p.note,
                        operationPointId: p.realOperationPointId || p.operationPointId,
                        stopName: p.stopName,
                        stopAddress: p.stopAddress,
                        stopCity: p.stopCity,
                        stopLatitude: p.stopLatitude,
                        stopLongitude: p.stopLongitude
                    }))
                };
            }

            const response = await fetch(isEditing ? ROUTE_ENDPOINTS.UPDATE : ROUTE_ENDPOINTS.CREATE, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(isEditing ? "Cập nhật thành công" : "Tạo tuyến đường thành công");
                setIsModalOpen(false);
                fetchRoutes(page);
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

    const handleDelete = async (route: RouteItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến đường template này?`)) {
            return;
        }

        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                data: {
                    creator: localStorage.getItem("userName") || "System",
                    routeId: route.id
                }
            };

            const response = await fetch(ROUTE_ENDPOINTS.DELETE, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Xóa tuyến đường thành công");
                fetchRoutes(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi khi xóa tuyến đường");
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
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Quản lý Tuyến Đường</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                        Hạng mục vận hành · Lộ trình cố định
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} />
                        Tạo tuyến mới
                    </button>
                </div>
            </div>

            {/* KPI Panels Section */}
            {!loading && routes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Panel 1: Total Routes */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng tuyến đường</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{totalItems}</h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all">
                                <Navigation size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Active Routes */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuyến dự kiến</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-700">
                                {routes.filter(r => r.status === 'ACTIVE' || r.status === 'PLANNED').length}
                            </h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <Activity size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Total Stops */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạm dừng</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-700">
                                {routes.reduce((acc, current) => acc + ((current.routePoints)?.length || 0), 0)}
                            </h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <MapPin size={16} />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Main Content */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang kết nối cơ sở dữ liệu...</p>
                </div>
            ) : routes.length === 0 ? (
                <div className="h-[450px] flex flex-col items-center justify-center gap-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                        <Navigation size={48} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Vùng vận hành đang trống</h3>
                        <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Thiết lập tuyến đường đầu tiên để khởi tạo các chuyến xe trong hệ thống.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                    >
                        Bắt đầu ngay
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tuyến vận hành</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời lượng</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hạ tầng</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {routes.map((route) => (
                                    <tr
                                        key={route.id}
                                        onClick={() => handleOpenEdit(route)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                    <Navigation size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900">{route.originName}</span>
                                                        <ArrowRight size={12} className="text-slate-300" />
                                                        <span className="text-sm font-black text-slate-900">{route.destinationName}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Người tạo: {route.creator || "Quản trị viên"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                    <Clock size={12} className="text-brand-primary" />
                                                    {route.duration || 0} phút
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400">
                                                    Ước tính di chuyển
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <MapPin size={12} className="text-slate-300" />
                                                    {(route.routePoints)?.length || 0} Trạm
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${route.status === 'ACTIVE' || route.status === 'PLANNED'
                                                ? 'bg-slate-100 text-slate-700'
                                                : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${route.status === 'ACTIVE' || route.status === 'PLANNED' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`} />
                                                {route.status || 'PLANNED'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(route);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                                    title="Xóa template này"
                                                >
                                                    <X size={14} /> Xóa
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                                                    <MoreHorizontal size={18} />
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

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-7xl h-full max-h-[92vh] rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-[1.5rem] bg-brand-primary text-white flex items-center justify-center shadow-xl shadow-brand-primary/20">
                                    {isEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 tracking-tight">
                                        {isEditing ? "Cập nhật Tuyến đường" : "Tuyến Đường Vận Hành"}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {isEditing ? `Mã tuyến: ${selectedRoute?.id}` : "Tạo mới lộ trình chạy xe"}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-1">
                                            Người tạo: {formData.creator || "Chưa rõ"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10 bg-white relative">
                            {fetchingDetail && (
                                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang truy xuất dữ liệu chi tiết...</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Section 1: Basic & Entity Info */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Building size={14} className="text-slate-400" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em]">Thông tin hoạch định</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên nhân viên tạo (Creator)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                    value={formData.creator}
                                                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                                                    placeholder="Tên quản trị viên"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thời gian di chuyển (Phút)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all pr-12"
                                                        value={formData.duration}
                                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                                        placeholder="VD: 360"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MIN</div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                                                <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest leading-relaxed">
                                                    <Info size={10} className="inline mr-1" />
                                                    Lưu ý: Tuyến đường này sẽ là mẫu cố định. Sau này bạn sẽ dùng mẫu này để tạo các chuyến xe chạy hàng ngày.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Journey & Transit Points */}
                                <div className="lg:col-span-8 space-y-10">
                                    {/* Section 2: Journey & Designer */}
                                    <div className="lg:col-span-8 space-y-8">
                                        <div className="bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                                        <Navigation size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Chi tiết lộ trình</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thứ tự các điểm xe sẽ ghé qua</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddPoint}
                                                    className="flex items-center gap-2 text-[9px] font-black text-white px-5 py-2.5 bg-brand-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                                                >
                                                    <Plus size={14} /> THÊM TRẠM DỪNG
                                                </button>
                                            </div>

                                            {/* Vertical Timeline Designer */}
                                            <div className="relative pl-10 space-y-12">
                                                {/* Vertical Line */}
                                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-primary via-slate-200 to-slate-900 rounded-full" />

                                                {/* Node 1: Origin */}
                                                <div className="relative">
                                                    <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-brand-primary border-4 border-white shadow-lg z-10 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    </div>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                            <div className="flex-1">
                                                                <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Điểm xuất phát (Tỉnh/Thành)</label>
                                                                <select
                                                                    required
                                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                    value={formData.originName}
                                                                    onChange={(e) => setFormData({ ...formData, originName: e.target.value })}
                                                                >
                                                                    <option value="">-- Chọn tỉnh/thành đi --</option>
                                                                    {provinces.map(p => (
                                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hidden md:block">
                                                                <Navigation className="text-slate-200" size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Intermediate Nodes: Transit Points */}
                                                <div className="space-y-8">
                                                    {formData.operationPoints.length === 0 ? (
                                                        <div className="bg-white/40 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center">
                                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chưa có trạm trung chuyển nào được gán</p>
                                                        </div>
                                                    ) : (
                                                        formData.operationPoints.map((point, index) => (
                                                            <div key={index} className="relative group/node">
                                                                <div className="absolute -left-[31px] top-8 w-6 h-6 rounded-full bg-white border-2 border-slate-200 shadow-md z-10 flex items-center justify-center group-hover/node:border-brand-primary transition-colors">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/node:bg-brand-primary transition-colors" />
                                                                </div>

                                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 group-hover/node:border-brand-primary/10 transition-all relative">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemovePoint(index)}
                                                                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/node:opacity-100 transition-all hover:scale-110 active:scale-95"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>

                                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                                                        {/* Left Part: ID & Search */}
                                                                        <div className="md:col-span-4 space-y-4">
                                                                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                                                                    <Info size={10} /> Mã Trạm (ID)
                                                                                </label>
                                                                                <input
                                                                                    className="w-full bg-white px-4 py-2.5 rounded-xl text-[11px] font-black border border-slate-100 focus:border-brand-primary/20 outline-none shadow-sm"
                                                                                    value={point.operationPointId}
                                                                                    onChange={(e) => updatePoint(index, 'operationPointId', e.target.value)}
                                                                                    onBlur={() => handleFetchPointDetail(index, 'code')}
                                                                                    placeholder="VD: HCM-OP-001"
                                                                                />
                                                                            </div>
                                                                            <div className="relative group/search">
                                                                                <select
                                                                                    className="w-full bg-white px-4 py-2.5 rounded-xl text-[10px] font-black appearance-none cursor-pointer border border-slate-100 hover:border-brand-primary/20 transition-all outline-none pr-10 shadow-sm"
                                                                                    onChange={(e) => {
                                                                                        const selected = allOperationPoints.find(p => (p.operationPointId || p.id) === e.target.value);
                                                                                        if (selected) populatePointData(index, selected);
                                                                                    }}
                                                                                    value=""
                                                                                >
                                                                                    <option value="" disabled>Tìm nhanh...</option>
                                                                                    {allOperationPoints.map(p => (
                                                                                        <option key={p.id} value={p.operationPointId || p.id}>{p.name} ({p.code})</option>
                                                                                    ))}
                                                                                </select>
                                                                                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover/search:text-brand-primary transition-colors" />
                                                                            </div>
                                                                        </div>

                                                                        {/* Right Part: Details */}
                                                                        <div className="md:col-span-8 bg-slate-50/30 p-5 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-5">
                                                                            <div className="col-span-2">
                                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                                                                                    <MapPin size={10} /> Tên Trạm Dừng
                                                                                </label>
                                                                                <input
                                                                                    className="w-full bg-white px-4 py-3 rounded-xl text-[11px] font-black border border-slate-100 focus:border-brand-primary/20 transition-all shadow-sm"
                                                                                    value={point.stopName}
                                                                                    onChange={(e) => updatePoint(index, 'stopName', e.target.value)}
                                                                                    placeholder="Nhập tên bến bãi..."
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Khu Vực</label>
                                                                                <input
                                                                                    className="w-full bg-white px-4 py-3 rounded-xl text-[11px] font-black border border-slate-100 focus:border-brand-primary/20 shadow-sm"
                                                                                    value={point.stopCity}
                                                                                    onChange={(e) => updatePoint(index, 'stopCity', e.target.value)}
                                                                                    placeholder="Tỉnh / Thành"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thứ tự ghé</label>
                                                                                <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-[11px] font-black text-center shadow-lg shadow-black/10 uppercase tracking-widest">
                                                                                    STOP #{point.operationOrder}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Node 3: Destination */}
                                                <div className="relative pt-4">
                                                    <div className="absolute -left-[31px] top-6 w-6 h-6 rounded-full bg-slate-900 border-4 border-white shadow-lg z-10 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    </div>
                                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                            <div className="flex-1">
                                                                <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Điểm kết thúc (Tỉnh/Thành)</label>
                                                                <select
                                                                    required
                                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                    value={formData.destinationName}
                                                                    onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                                                                >
                                                                    <option value="">-- Chọn tỉnh/thành đến --</option>
                                                                    {provinces.map(p => (
                                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hidden md:block shadow-xl">
                                                                <MapPin className="text-white" size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Hủy lệnh
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {isEditing ? "Lưu thay đổi" : "Tạo tuyến mới"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Container */}
            <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tổng số tuyến đường: <span className="text-slate-900">{totalItems}</span> · Trang <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{Math.ceil(totalItems / pageSize) || 1}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg">
                        {page}
                    </div>
                    <button
                        disabled={page * pageSize >= totalItems}
                        onClick={() => setPage(page + 1)}
                        className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

