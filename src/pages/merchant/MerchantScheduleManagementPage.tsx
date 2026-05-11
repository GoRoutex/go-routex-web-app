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
    stopOrder: string;
    routeId?: string;
    note: string;
    departmentId: string;
    realOperationPointId?: string;
    provinceId?: string;
    stopName: string;
    stopAddress: string;
    stopCity: string;
    stopLatitude: number;
    stopLongitude: number;
    timeAtDepartment: number;
}

interface RouteItem {
    id: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    originProvinceId?: string;
    destinationProvinceId?: string;
    originDepartmentId?: string;
    destinationDepartmentId?: string;
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
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
    const [allOperationPoints, setAllOperationPoints] = useState<any[]>([]);
    const [originDepartments, setOriginDepartments] = useState<any[]>([]);
    const [destinationDepartments, setDestinationDepartments] = useState<any[]>([]);

    // Form states matching create payload
    const [formData, setFormData] = useState({
        creator: "",
        originName: "",
        destinationName: "",
        originProvinceId: "",
        originDepartmentId: "",
        destinationProvinceId: "",
        destinationDepartmentId: "",
        duration: 0,
        departments: [] as RoutePoint[]
    });

    const fetchRoutes = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ROUTE_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${statusFilter}&search=${searchTerm}`,
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
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/provinces/fetch?pageNumber=1&pageSize=100`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                const sorted = [...result.data.items].sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "", 'vi', { sensitivity: 'base' })
                );
                setProvinces(sorted);
            }
        } catch (err) {
            console.error("Lỗi fetch provinces:", err);
        }
    };

    const fetchOperationPoints = async () => {
        try {
            const params = new URLSearchParams({
                pageNumber: "1",
                pageSize: "200"
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?${params.toString()}`,
                { headers: createAuthorizedEnvelopeHeaders() }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setAllOperationPoints(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi fetch operation points:", err);
        }
    };

    const fetchDepartmentsByProvince = async (provinceId: string, type: 'origin' | 'destination') => {
        if (!provinceId) {
            if (type === 'origin') setOriginDepartments([]);
            else setDestinationDepartments([]);
            return;
        }

        try {
            const params = new URLSearchParams({
                pageNumber: "1",
                pageSize: "200",
                provinceId: provinceId
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?${params.toString()}`,
                { headers: createAuthorizedEnvelopeHeaders() }
            );
            const result = await response.json();
            const items = result.data?.items || [];
            if (type === 'origin') setOriginDepartments(items);
            else setDestinationDepartments(items);
        } catch (err) {
            console.error("Lỗi fetch departments:", err);
        }
    };

    const fetchAllResources = async () => {
        await Promise.all([
            fetchOperationPoints(),
            fetchProvinces()
        ]);
    };



    useEffect(() => {
        fetchRoutes(page);
    }, [page, statusFilter, searchTerm]);

    useEffect(() => {
        fetchAllResources();
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);



    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedRoute(null);
        setFormData({
            creator: localStorage.getItem("userName") || "",
            originName: "",
            destinationName: "",
            originProvinceId: "",
            originDepartmentId: "",
            destinationProvinceId: "",
            destinationDepartmentId: "",
            duration: 0,
            departments: []
        });
        setOriginDepartments([]);
        setDestinationDepartments([]);
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
                const originDeptId = detailedRoute.originDepartmentId || "";
                const destDeptId = detailedRoute.destinationDepartmentId || "";

                const originBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === originDeptId);
                const destBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === destDeptId);

                const originProvId = detailedRoute.originProvinceId || originBranch?.provinceId || "";
                const destProvId = detailedRoute.destinationProvinceId || destBranch?.provinceId || "";

                setFormData({
                    creator: detailedRoute.creator || "",
                    originName: detailedRoute.originName || detailedRoute.origin || "",
                    destinationName: detailedRoute.destinationName || detailedRoute.destination || "",
                    originProvinceId: originProvId,
                    originDepartmentId: originDeptId,
                    destinationProvinceId: destProvId,
                    destinationDepartmentId: destDeptId,
                    duration: detailedRoute.duration || 0,
                    departments: (detailedRoute.routePoints || detailedRoute.operationPoints || detailedRoute.departments || []).map((p: any) => {
                        const deptId = p.departmentId || p.operationPointId || p.id;
                        const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                        return {
                            ...p,
                            operationOrder: (p.stopOrder || p.operationOrder || "").toString(),
                            departmentId: deptId,
                            realOperationPointId: deptId,
                            provinceId: p.provinceId || deptInfo?.provinceId || "",
                            timeAtDepartment: p.timeAtDepartment || 0,
                        };
                    })
                });
                if (originProvId) fetchDepartmentsByProvince(originProvId, 'origin');
                if (destProvId) fetchDepartmentsByProvince(destProvId, 'destination');
            } else {
                const originDeptId = route.originDepartmentId || "";
                const destDeptId = route.destinationDepartmentId || "";

                const originBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === originDeptId);
                const destBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === destDeptId);

                const originProvId = route.originProvinceId || originBranch?.provinceId || "";
                const destProvId = route.destinationProvinceId || destBranch?.provinceId || "";

                setFormData({
                    creator: route.creator || "",
                    originName: route.originName || "",
                    destinationName: route.destinationName,
                    originProvinceId: originProvId,
                    originDepartmentId: originDeptId,
                    destinationProvinceId: destProvId,
                    destinationDepartmentId: destDeptId,
                    duration: route.duration || 0,
                    departments: (route.routePoints || []).map((p: any) => {
                        const deptId = p.departmentId || p.operationPointId || p.id;
                        const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                        return {
                            ...p,
                            operationOrder: (p.stopOrder || p.operationOrder || "").toString(),
                            departmentId: deptId,
                            realOperationPointId: deptId,
                            provinceId: p.provinceId || deptInfo?.provinceId || "",
                            timeAtDepartment: p.timeAtDepartment || 0,
                        };
                    })
                });
                if (originProvId) fetchDepartmentsByProvince(originProvId, 'origin');
                if (destProvId) fetchDepartmentsByProvince(destProvId, 'destination');
            }
        } catch (err: any) {
            toast.error("Lỗi khi tải chi tiết: " + err.message);
            // Fallback to list data on error
            setFormData({
                creator: route.creator || "",
                originName: route.originName || "",
                destinationName: route.destinationName || "",
                originProvinceId: route.originProvinceId || "",
                originDepartmentId: route.originDepartmentId || "",
                destinationProvinceId: route.destinationProvinceId || "",
                destinationDepartmentId: route.destinationDepartmentId || "",
                duration: route.duration || 0,
                departments: (route.routePoints || []).map((p: any) => {
                    const deptId = p.departmentId || p.operationPointId || p.id;
                    const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                    return {
                        ...p,
                        operationOrder: (p.stopOrder || p.operationOrder || "").toString(),
                        departmentId: deptId,
                        realOperationPointId: deptId,
                        provinceId: p.provinceId || deptInfo?.provinceId || "",
                        timeAtDepartment: p.timeAtDepartment || 0,
                    };
                })
            });
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleAddPoint = () => {
        const newPoint: RoutePoint = {
            stopOrder: (formData.departments.length + 1).toString(),
            note: "",
            departmentId: "",
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: 0,
            stopLongitude: 0,
            timeAtDepartment: 0
        };
        setFormData({
            ...formData,
            departments: [...formData.departments, newPoint]
        });
    };

    const handleRemovePoint = (index: number) => {
        const updated = formData.departments.filter((_, i) => i !== index);
        const reordered = updated.map((p, i) => ({ ...p, operationOrder: (i + 1).toString() }));
        setFormData({ ...formData, departments: reordered });
    };

    const updatePoint = (index: number, field: keyof RoutePoint, value: any) => {
        const updated = [...formData.departments];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, departments: updated });
    };

    const populatePointData = (index: number, data: any) => {
        if (!data) return;
        const updated = [...formData.departments];
        updated[index] = {
            ...updated[index],
            // Use the id for display in the input field
            departmentId: data.id || data.operationPointId || updated[index].departmentId,
            // Store the real internal ID (UUID) for the backend
            realOperationPointId: data.operationPointId || data.id,
            stopName: data.name || updated[index].stopName,
            stopAddress: data.address || updated[index].stopAddress,
            stopCity: data.city || updated[index].stopCity,
            stopLatitude: data.latitude || updated[index].stopLatitude,
            stopLongitude: data.longitude || updated[index].stopLongitude,
            provinceId: data.provinceId || updated[index].provinceId
        };
        setFormData({ ...formData, departments: updated });
        toast.success(`Đã tìm thấy: ${data.name}`);
    };

    const clearPointData = (index: number) => {
        const updated = [...formData.departments];
        updated[index] = {
            ...updated[index],
            departmentId: "",
            realOperationPointId: "",
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: 0,
            stopLongitude: 0,
        };
        setFormData({ ...formData, departments: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const body: any = {
                ...meta,
                channel: "OFF",
            };

            const dataPayload: any = {
                creator: formData.creator || (isEditing ? selectedRoute?.creator : ""),
                originName: formData.originName,
                destinationName: formData.destinationName,
                originDepartmentId: formData.originDepartmentId,
                destinationDepartmentId: formData.destinationDepartmentId,
                duration: formData.duration,
                routePoints: formData.departments.map(p => ({
                    stopOrder: p.stopOrder,
                    note: p.note || "",
                    departmentId: p.realOperationPointId || p.departmentId,
                    stopName: p.stopName,
                    stopAddress: p.stopAddress,
                    stopCity: p.stopCity,
                    stopLatitude: p.stopLatitude,
                    stopLongitude: p.stopLongitude,
                    timeAtDepartment: p.timeAtDepartment
                }))
            };

            if (isEditing && selectedRoute) {
                body.routeId = selectedRoute.id;
                body.data = {
                    ...dataPayload,
                    status: selectedRoute?.status || "ACTIVE"
                };
            } else {
                body.data = dataPayload;
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
            {!loading && (
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

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tuyến đường..."
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
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer pr-2 py-2 min-w-[120px]"
                        >
                            <option value="">Tất cả (ALL)</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang kết nối cơ sở dữ liệu...</p>
                </div>
            ) : totalItems === 0 ? (
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
                                                        value={formData.duration === 0 ? "" : formData.duration}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value === "" ? 0 : parseInt(e.target.value) })}
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
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Tỉnh/Thành xuất phát</label>
                                                            <select
                                                                required
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                value={formData.originProvinceId}
                                                                onChange={(e) => {
                                                                    const provId = e.target.value;
                                                                    const provName = provinces.find(p => p.id === provId)?.name || "";
                                                                    setFormData({
                                                                        ...formData,
                                                                        originProvinceId: provId,
                                                                        originDepartmentId: "",
                                                                        originName: provName
                                                                    });
                                                                    fetchDepartmentsByProvince(provId, 'origin');
                                                                }}
                                                            >
                                                                <option value="">-- Chọn Tỉnh/Thành đi --</option>
                                                                {provinces.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Chi nhánh xuất phát</label>
                                                            <select
                                                                required
                                                                disabled={!formData.originProvinceId}
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                                                value={formData.originDepartmentId}
                                                                onChange={(e) => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        originDepartmentId: e.target.value
                                                                    });
                                                                }}
                                                            >
                                                                <option value="">-- Chọn chi nhánh đi --</option>
                                                                {originDepartments.map(p => (
                                                                    <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Intermediate Nodes: Transit Points */}
                                            <div className="space-y-8">
                                                {formData.departments.length === 0 ? (
                                                    <div className="bg-white/40 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center">
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chưa có trạm trung chuyển nào được gán</p>
                                                    </div>
                                                ) : (
                                                    formData.departments.map((point, index) => (
                                                        <div key={index} className="relative group/node">
                                                            <div className="absolute -left-[31px] top-8 w-6 h-6 rounded-full bg-white border-2 border-slate-200 shadow-md z-10 flex items-center justify-center group-hover/node:border-brand-primary transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/node:bg-brand-primary transition-colors" />
                                                            </div>

                                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group-hover/node:border-brand-primary/20 transition-all relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePoint(index)}
                                                                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/node:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                                <div className="space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Tỉnh/Thành trạm dừng</label>
                                                                            <select
                                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                                value={point.provinceId || ""}
                                                                                onChange={(e) => {
                                                                                    const provId = e.target.value;
                                                                                    const updated = [...formData.departments];
                                                                                    updated[index] = {
                                                                                        ...updated[index],
                                                                                        provinceId: provId,
                                                                                        departmentId: "",
                                                                                        realOperationPointId: "",
                                                                                        stopName: "",
                                                                                        stopAddress: "",
                                                                                        stopCity: "",
                                                                                        stopLatitude: 0,
                                                                                        stopLongitude: 0,
                                                                                    };
                                                                                    setFormData({ ...formData, departments: updated });
                                                                                }}
                                                                            >
                                                                                <option value="">-- Chọn Tỉnh/Thành --</option>
                                                                                {provinces.map(p => (
                                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Chi nhánh tại trạm</label>
                                                                            <select
                                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                                value={point.departmentId}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (!val) {
                                                                                        clearPointData(index);
                                                                                    } else {
                                                                                        const selected = allOperationPoints.find(p => (p.id || p.operationPointId) === val);
                                                                                        if (selected) populatePointData(index, selected);
                                                                                        else updatePoint(index, 'departmentId', val);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <option value="">-- Chọn chi nhánh --</option>
                                                                                {allOperationPoints
                                                                                    .filter(p => !point.provinceId || p.provinceId === point.provinceId)
                                                                                    .map(p => (
                                                                                        <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                                    ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên hiển thị trạm dừng (Stop Name)</label>
                                                                            <div className="flex items-center gap-4">
                                                                                <input
                                                                                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                                                    value={point.stopName}
                                                                                    onChange={(e) => updatePoint(index, 'stopName', e.target.value)}
                                                                                    placeholder="VD: Trạm dừng chân ABC"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thời gian tại trạm (phút)</label>
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="relative flex-1">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all pr-12"
                                                                                        value={point.timeAtDepartment}
                                                                                        onChange={(e) => updatePoint(index, 'timeAtDepartment', parseInt(e.target.value) || 0)}
                                                                                        placeholder="VD: +45 hoặc -30"
                                                                                    />
                                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">MIN</div>
                                                                                </div>
                                                                                <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black min-w-[100px] text-center uppercase tracking-widest shadow-lg h-full flex items-center justify-center">
                                                                                    STOP #{point.stopOrder}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Node Last: Destination */}
                                            <div className="relative">
                                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-900 border-4 border-white shadow-lg z-10 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Tỉnh/Thành đích</label>
                                                            <select
                                                                required
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                value={formData.destinationProvinceId}
                                                                onChange={(e) => {
                                                                    const provId = e.target.value;
                                                                    const provName = provinces.find(p => p.id === provId)?.name || "";
                                                                    setFormData({
                                                                        ...formData,
                                                                        destinationProvinceId: provId,
                                                                        destinationDepartmentId: "",
                                                                        destinationName: provName
                                                                    });
                                                                    fetchDepartmentsByProvince(provId, 'destination');
                                                                }}
                                                            >
                                                                <option value="">-- Chọn Tỉnh/Thành đến --</option>
                                                                {provinces.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Chi nhánh đích</label>
                                                            <select
                                                                required
                                                                disabled={!formData.destinationProvinceId}
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                                                value={formData.destinationDepartmentId}
                                                                onChange={(e) => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        destinationDepartmentId: e.target.value
                                                                    });
                                                                }}
                                                            >
                                                                <option value="">-- Chọn chi nhánh đến --</option>
                                                                {destinationDepartments.map(p => (
                                                                    <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                ))}
                                                            </select>
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
                        className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.ceil(totalItems / pageSize) || 1 }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${page === p
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "bg-white text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={page * pageSize >= totalItems}
                        onClick={() => setPage(page + 1)}
                        className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

