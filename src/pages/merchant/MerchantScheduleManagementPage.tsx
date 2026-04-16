import { useState, useEffect } from "react";
import {
    Plus, MapPin, Clock, ArrowRight,
    Edit3, Trash2,
    ChevronLeft, ChevronRight, X, Loader2, Save,
    Navigation, User, Building, Info, Search, Activity, MoreHorizontal
} from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { getAccessToken, parseJwt } from "../../utils/auth";

interface RoutePoint {
    id?: string;
    operationOrder: string;
    routeId?: string;
    plannedArrivalTime: string;
    plannedDepartureTime: string;
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
    id: string;
    routeId: string;
    routeCode?: string;
    origin: string;
    destination: string;
    plannedStartTime: string;
    plannedEndTime: string;
    pickupBranch: string;
    status: string;
    creator: string;
    operationPoints?: RoutePoint[];
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

    // Form states matching create payload
    const [formData, setFormData] = useState({
        creator: "",
        pickupBranch: "",
        origin: "",
        destination: "",
        plannedStartTime: "",
        plannedEndTime: "",
        operationPoints: [] as RoutePoint[]
    });

    const formatWithOffset = (date: Date) => {
        const tzo = -date.getTimezoneOffset();
        const dif = tzo >= 0 ? '+' : '-';
        const pad = (num: number, digits = 2) => String(num).padStart(digits, '0');

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            '.' + pad(date.getMilliseconds(), 3) +
            dif + pad(Math.floor(Math.abs(tzo) / 60)) +
            ':' + pad(Math.abs(tzo) % 60);
    };

    const fetchRoutes = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/routes/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setRoutes(result.data.items);
                setTotalItems(result.data.totalCount || 0);
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

    useEffect(() => {
        fetchRoutes(page);
    }, [page]);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedRoute(null);
        setFormData({
            creator: localStorage.getItem("userName") || "",
            pickupBranch: "",
            origin: "",
            destination: "",
            plannedStartTime: "",
            plannedEndTime: "",
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
            const routeId = route.routeId || route.id;

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
                // Helper to format ISO date to YYYY-MM-DDTHH:mm
                const formatToInputDate = (isoStr: string) => isoStr ? isoStr.slice(0, 16) : "";

                setFormData({
                    creator: detailedRoute.creator || "",
                    pickupBranch: detailedRoute.pickupBranch || "",
                    origin: detailedRoute.origin || "",
                    destination: detailedRoute.destination || "",
                    plannedStartTime: formatToInputDate(detailedRoute.plannedStartTime),
                    plannedEndTime: formatToInputDate(detailedRoute.plannedEndTime),
                    operationPoints: (detailedRoute.routePoints || detailedRoute.operationPoints || []).map((p: any) => ({
                        ...p,
                        // Ensure we have the real UUID for later update/save
                        realOperationPointId: p.operationPointId || p.id,
                        // Set formatted times for point inputs
                        plannedArrivalTime: formatToInputDate(p.plannedArrivalTime),
                        plannedDepartureTime: formatToInputDate(p.plannedDepartureTime)
                    }))
                });
            } else {
                // Fallback to list data if data is null but response was ok
                const formatToInputDate = (isoStr: string) => isoStr ? isoStr.slice(0, 16) : "";
                setFormData({
                    creator: route.creator || "",
                    pickupBranch: route.pickupBranch || "",
                    origin: route.origin,
                    destination: route.destination,
                    plannedStartTime: formatToInputDate(route.plannedStartTime),
                    plannedEndTime: formatToInputDate(route.plannedEndTime),
                    operationPoints: (route.operationPoints || route.routePoints || []).map((p: any) => ({
                        ...p,
                        realOperationPointId: p.operationPointId || p.id,
                        plannedArrivalTime: formatToInputDate(p.plannedArrivalTime),
                        plannedDepartureTime: formatToInputDate(p.plannedDepartureTime)
                    }))
                });
            }
        } catch (err: any) {
            toast.error("Lỗi khi tải chi tiết: " + err.message);
            // Fallback to list data on error
            setFormData({
                creator: route.creator || "",
                pickupBranch: route.pickupBranch || "",
                origin: route.origin,
                destination: route.destination,
                plannedStartTime: route.plannedStartTime || "",
                plannedEndTime: route.plannedEndTime || "",
                operationPoints: route.operationPoints || route.routePoints || []
            });
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleAddPoint = () => {
        const newPoint: RoutePoint = {
            operationOrder: (formData.operationPoints.length + 1).toString(),
            plannedArrivalTime: "",
            plannedDepartureTime: "",
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
                data: {
                    creator: formData.creator,
                    pickupBranch: formData.pickupBranch,
                    origin: formData.origin,
                    destination: formData.destination,
                    plannedStartTime: formatWithOffset(new Date(formData.plannedStartTime)),
                    plannedEndTime: formatWithOffset(new Date(formData.plannedEndTime)),
                    status: isEditing ? (selectedRoute?.status || "PLANNED") : "PLANNED",
                    [isEditing ? "routePoints" : "operationPoints"]: formData.operationPoints.map(p => ({
                        ...p,
                        // Use the real UUID for the backend, fallback to the input value if no search was done
                        operationPointId: p.realOperationPointId || p.operationPointId,
                        plannedArrivalTime: p.plannedArrivalTime ? formatWithOffset(new Date(p.plannedArrivalTime)) : "",
                        plannedDepartureTime: p.plannedDepartureTime ? formatWithOffset(new Date(p.plannedDepartureTime)) : ""
                    }))
                }
            };

            if (isEditing && selectedRoute) {
                body.routeId = selectedRoute.routeId || selectedRoute.id;
                body.creator = formData.creator || selectedRoute.creator;
                body.channel = "OFF";
            }

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/routes/${endpoint}`, {
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
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến đường ${route.routeCode || route.routeId || "này"}?`)) {
            return;
        }

        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                data: {
                    creator: localStorage.getItem("userName") || "System",
                    routeId: route.routeId || route.id
                }
            };

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/routes/delete`, {
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 leading-tight">Quản lý Tuyến Đường</h2>
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
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng tuyến đường</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">{totalItems}</h3>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all">
                                <Navigation size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Active Routes */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuyến dự kiến</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-700">
                                {routes.filter(r => r.status === 'ACTIVE' || r.status === 'PLANNED').length}
                            </h3>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <Activity size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Total Stops */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạm dừng</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-700">
                                {routes.reduce((acc, current) => acc + ((current.operationPoints || current.routePoints)?.length || 0), 0)}
                            </h3>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <MapPin size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 4: Daily Plan */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chuyến xe hôm nay</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">24</h3>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <Clock size={18} />
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
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tuyến đường</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Lộ trình</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hạ tầng</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {routes.map((route) => (
                                    <tr 
                                        key={route.id} 
                                        onClick={() => handleOpenEdit(route)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white">
                                                    <Navigation size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none mb-1">{route.routeCode || route.routeId || "N/A"}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã tuyến</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700">{route.origin}</span>
                                                <ArrowRight size={12} className="text-slate-300" />
                                                <span className="text-sm font-bold text-slate-700">{route.destination}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                                                <Clock size={12} className="text-slate-300" />
                                                {route.plannedStartTime ? route.plannedStartTime.split('T')[1]?.substring(0, 5) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <MapPin size={12} className="text-slate-300" />
                                                {(route.operationPoints || route.routePoints)?.length || 0} Trạm
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                                                route.status === 'ACTIVE' || route.status === 'PLANNED' 
                                                ? 'bg-slate-100 text-slate-700' 
                                                : 'bg-slate-50 text-slate-400'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    route.status === 'ACTIVE' || route.status === 'PLANNED' ? 'bg-emerald-500' : 'bg-slate-300'
                                                }`} />
                                                {route.status || 'PLANNED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
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

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-7xl h-full max-h-[92vh] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-8 md:p-12 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[2rem] bg-brand-primary text-white flex items-center justify-center shadow-xl shadow-brand-primary/20">
                                    {isEditing ? <Edit3 size={24} /> : <Plus size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                                        {isEditing ? "Cập nhật Tuyến đường" : "Thiết kế Vùng vận hành"}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {isEditing ? `ID: ${selectedRoute?.routeId}` : "Khởi tạo mạng lưới logistics"}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-1">
                                            <User size={10} /> {formData.creator || "System"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-12 bg-white relative">
                            {fetchingDetail && (
                                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang truy xuất dữ liệu chi tiết...</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Section 1: Basic & Entity Info */}
                                <div className="lg:col-span-4 space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Building size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Đơn vị & Người tạo</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Chi nhánh khai thác (Pickup Branch)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                    value={formData.pickupBranch}
                                                    onChange={(e) => setFormData({ ...formData, pickupBranch: e.target.value })}
                                                    placeholder="Tên bến xe hoặc chi nhánh"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên nhân viên tạo (Creator)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                    value={formData.creator}
                                                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                                                    placeholder="Tên quản trị viên"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thời gian dự tính</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Bắt đầu hoạch định</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none cursor-pointer hover:bg-slate-100/50 transition-all"
                                                    value={formData.plannedStartTime}
                                                    onChange={(e) => setFormData({ ...formData, plannedStartTime: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Kết thúc hoạch định</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none cursor-pointer hover:bg-slate-100/50 transition-all"
                                                    value={formData.plannedEndTime}
                                                    onChange={(e) => setFormData({ ...formData, plannedEndTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Journey & Transit Points */}
                                <div className="lg:col-span-8 space-y-12">
                                    <div className="space-y-8 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100/50 pb-2">
                                            <MapPin size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Lộ trình vận chuyển</h4>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="flex-1 w-full relative">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thành phố đi (Origin)</label>
                                                <select
                                                    required
                                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-900 shadow-sm outline-none focus:border-brand-primary appearance-none cursor-pointer"
                                                    value={formData.origin}
                                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                                >
                                                    <option value="">Chọn điểm đi</option>
                                                    {provinces.map(p => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="pt-6 hidden md:block">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-lg">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block text-right">Thành phố đến (Destination)</label>
                                                <select
                                                    required
                                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-900 shadow-sm outline-none focus:border-brand-primary appearance-none cursor-pointer text-right"
                                                    value={formData.destination}
                                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                                >
                                                    <option value="">Chọn điểm đến</option>
                                                    {provinces.map(p => (
                                                        <option key={p.id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                            <div className="flex items-center gap-2 text-slate-900">
                                                <MapPin size={16} className="text-slate-400" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Trạm dừng (Operation Points)</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddPoint}
                                                className="flex items-center gap-2 text-[10px] font-black text-white px-6 py-3 bg-brand-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                                            >
                                                <Plus size={14} /> THÊM TRẠM DỪNG
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formData.operationPoints.length === 0 ? (
                                                <div className="md:col-span-2 py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 opacity-30">
                                                    <MapPin size={32} />
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 text-center">
                                                        Cần ít nhất 1 trạm dừng chân<br />để thiết lập hành trình
                                                    </p>
                                                </div>
                                            ) : (
                                                formData.operationPoints.map((point, index) => (
                                                    <div key={index} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative group/point hover:border-brand-primary/10 transition-all">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-xl bg-slate-950 text-white text-[11px] font-black flex items-center justify-center shadow-lg">
                                                                    {index + 1}
                                                                </span>
                                                                <h5 className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Trạm dừng</h5>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemovePoint(index)}
                                                                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover/point:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-5">
                                                            <div className="grid grid-cols-1 gap-5">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="col-span-1">
                                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Mã trạm</label>
                                                                        <div className="relative">
                                                                            <input
                                                                                className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-[10px] font-black pr-8"
                                                                                value={point.operationPointId}
                                                                                onChange={(e) => updatePoint(index, 'operationPointId', e.target.value)}
                                                                                onBlur={() => handleFetchPointDetail(index, 'code')}
                                                                                placeholder="Code"
                                                                            />
                                                                            <button onClick={() => handleFetchPointDetail(index, 'code')} type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300">
                                                                                <Search size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-span-1">
                                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Thành phố</label>
                                                                        <input
                                                                            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-[10px] font-black"
                                                                            value={point.stopCity}
                                                                            onChange={(e) => updatePoint(index, 'stopCity', e.target.value)}
                                                                            placeholder="TP"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Tên / Điểm dừng</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-[10px] font-black pr-8"
                                                                            value={point.stopName}
                                                                            onChange={(e) => updatePoint(index, 'stopName', e.target.value)}
                                                                            onBlur={() => handleFetchPointDetail(index, 'name')}
                                                                            placeholder="Bến xe..."
                                                                        />
                                                                        <button onClick={() => handleFetchPointDetail(index, 'name')} type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300">
                                                                            <Search size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4">
                                                                    <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl">
                                                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Dự kiến đến</p>
                                                                        <input
                                                                            type="datetime-local"
                                                                            className="w-full bg-transparent text-[11px] font-black text-emerald-700 outline-none cursor-pointer"
                                                                            value={point.plannedArrivalTime}
                                                                            onChange={(e) => updatePoint(index, 'plannedArrivalTime', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl">
                                                                        <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Dự kiến đi</p>
                                                                        <input
                                                                            type="datetime-local"
                                                                            className="w-full bg-transparent text-[11px] font-black text-blue-700 outline-none cursor-pointer"
                                                                            value={point.plannedDepartureTime}
                                                                            onChange={(e) => updatePoint(index, 'plannedDepartureTime', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                                    <div>
                                                                        <label className="text-[7px] font-black text-slate-300 uppercase mb-1 block">Vĩ độ (Lat)</label>
                                                                        <input
                                                                            type="number" step="any"
                                                                            className="w-full bg-slate-50 px-3 py-2 rounded-lg text-[9px] font-black"
                                                                            value={point.stopLatitude}
                                                                            onChange={(e) => updatePoint(index, 'stopLatitude', parseFloat(e.target.value))}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[7px] font-black text-slate-300 uppercase mb-1 block">Kinh độ (Long)</label>
                                                                        <input
                                                                            type="number" step="any"
                                                                            className="w-full bg-slate-50 px-3 py-2 rounded-lg text-[9px] font-black"
                                                                            value={point.stopLongitude}
                                                                            onChange={(e) => updatePoint(index, 'stopLongitude', parseFloat(e.target.value))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-8 md:p-12 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-slate-400">
                                <Info size={16} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Toàn bộ dữ liệu được mã hóa chuẩn RT-MANAGEMENT</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Hủy lệnh
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-12 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isEditing ? "Lưu thay đổi tuyến" : "Tạo tuyến khai thác"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Container */}
            <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Phân trang hệ thống: <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{Math.ceil(totalItems / pageSize)}</span>
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
