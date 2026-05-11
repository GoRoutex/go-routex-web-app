import { useState, useEffect } from "react";
import {
    Plus, MapPin,
    ChevronLeft, ChevronRight, X, Loader2, Save,
    Info, MoreHorizontal, Edit3, Navigation, Search, Clock, Activity
} from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";

interface Department {
    id: string;
    name: string;
    type: string;
    address: string;
    wardId: string;
    wardName?: string;
    provinceId: string;
    provinceName?: string;
    openingTime: string;
    closingTime: string;
    onlineOpeningTime: string;
    onlineClosingTime: string;
    latitude: number;
    longitude: number;
    status: string;
}

interface Province {
    id: string;
    name: string;
}

interface Ward {
    id: string;
    name: string;
}

export function MerchantOperationPointPage() {
    const [points, setPoints] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Location data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Ward search
    const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
    const [wardSearchQuery, setWardSearchQuery] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<Department | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        merchantId: localStorage.getItem("merchantId") || "",
        name: "",
        type: "DEPARTMENT",
        address: "",
        provinceId: "",
        wardId: "",
        openingTime: "08:00",
        closingTime: "23:00",
        onlineOpeningTime: "08:00",
        onlineClosingTime: "23:00",
        latitude: 0,
        longitude: 0,
        status: "ACTIVE"
    });


    const fetchPoints = async (pageNumber: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                pageNumber: pageNumber.toString(),
                pageSize: pageSize.toString(),
                search: searchTerm,
                status: statusFilter
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?${params.toString()}`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setPoints(result.data.items);
                setTotalItems(result.data.pagination?.totalElements || result.data.totalCount || 0);
            }
        } catch (err: any) {
            toast.error("Không thể tải danh sách chi nhánh: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        setLoadingLocations(true);
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/provinces/fetch?pageNumber=1&pageSize=100`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                const sortedProvinces = [...result.data.items].sort((a, b) =>
                    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
                );
                setProvinces(sortedProvinces);
            }
        } catch (err: any) {
            console.error("Fetch provinces error:", err);
        } finally {
            setLoadingLocations(false);
        }
    };

    const fetchWards = async (provinceId: string) => {
        if (!provinceId) {
            setWards([]);
            return;
        }
        setLoadingLocations(true);
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/wards/fetch?provinceId=${provinceId}&pageNumber=1&pageSize=200`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setWards(result.data.items);
            }
        } catch (err: any) {
            console.error("Fetch wards error:", err);
        } finally {
            setLoadingLocations(false);
        }
    };

    const searchWards = async (provinceId: string, keyword: string) => {
        if (!provinceId) return;
        if (!keyword) {
            fetchWards(provinceId);
            return;
        }
        setLoadingLocations(true);
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/wards/search?keyword=${encodeURIComponent(keyword)}&provinceId=${provinceId}&page=0&size=50`,
                {
                    headers: createAuthorizedEnvelopeHeaders()
                }
            );
            const result = await response.json();
            if (Array.isArray(result.data)) {
                setWards(result.data);
            } else if (result.data && result.data.items) {
                setWards(result.data.items);
            } else {
                setWards([]);
            }
        } catch (err: any) {
            console.error("Search wards error:", err);
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchPoints(page);
    }, [page, searchTerm, statusFilter]);

    useEffect(() => {
        fetchProvinces();
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
        setSelectedPoint(null);
        setFormData({
            merchantId: localStorage.getItem("merchantId") || "",
            name: "",
            type: "DEPARTMENT",
            address: "",
            provinceId: "",
            wardId: "",
            openingTime: "08:00",
            closingTime: "23:00",
            onlineOpeningTime: "08:00",
            onlineClosingTime: "23:00",
            latitude: 0,
            longitude: 0,
            status: "ACTIVE"
        });
        setWards([]);
        setWardSearchQuery("");
        setIsWardDropdownOpen(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (point: any) => {
        setIsEditing(true);
        setSelectedPoint(point);
        setIsModalOpen(true);
        setFetchingDetail(true);

        try {
            const meta = createRequestMeta();
            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/department/detail?departmentId=${point.id}`, {
                headers: createAuthorizedEnvelopeHeaders(meta)
            });

            if (response.ok) {
                const result = await response.json();
                const detail = result.data || point;

                setFormData({
                    merchantId: detail.merchantId || localStorage.getItem("merchantId") || "",
                    name: detail.name,
                    type: detail.type || "DEPARTMENT",
                    address: detail.address,
                    provinceId: detail.provinceId || "",
                    wardId: detail.wardId || "",
                    openingTime: detail.openingTime || "08:00",
                    closingTime: detail.closingTime || "23:00",
                    onlineOpeningTime: detail.onlineOpeningTime || "08:00",
                    onlineClosingTime: detail.onlineClosingTime || "23:00",
                    latitude: detail.latitude || 0,
                    longitude: detail.longitude || 0,
                    status: detail.status || "ACTIVE"
                });

                if (detail.provinceId) {
                    fetchWards(detail.provinceId);
                } else {
                    setWards([]);
                }
            }
        } catch (err) {
            toast.error("Không thể lấy thông tin chi tiết");
        } finally {
            setFetchingDetail(false);
        }

        setWardSearchQuery("");
        setIsWardDropdownOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const endpoint = isEditing ? "update" : "create";
            const body = {
                ...meta,
                data: isEditing ? { ...formData, id: selectedPoint?.id } : formData
            };

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/department/${endpoint}`, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(isEditing ? "Cập nhật thành công" : "Thêm chi nhánh thành công");
                setIsModalOpen(false);
                fetchPoints(page);
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Quản lý Chi nhánh</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                        Mạng lưới hạ tầng · Logistics Hub
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all self-start md:self-auto"
                >
                    <Plus size={18} />
                    Thêm chi nhánh
                </button>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chi nhánh, địa chỉ..."
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-2 mr-1 hidden sm:block">Trạng thái</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer pr-2 py-2 min-w-[120px]"
                        >
                            <option value="">Tất cả</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Tạm ngưng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang tải...</p>
                </div>
            ) : points.length === 0 ? (
                <div className="h-[450px] flex flex-col items-center justify-center gap-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                        <MapPin size={48} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Chưa có chi nhánh</h3>
                        <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Thiết lập mạng lưới các chi nhánh để bắt đầu khai thác tuyến đường.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                    >
                        Thiết lập ngay
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Chi nhánh</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vị trí & Địa chỉ</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hoạt động (Offline)</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trực tuyến (Online)</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {points.map((point) => (
                                    <tr key={point.id} onClick={() => handleOpenEdit(point)} className="hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                    <MapPin size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">{point.name}</p>
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {point.type === 'DEPARTMENT' ? 'CHI NHÁNH' :
                                                            point.type === 'OFFICE' ? 'VĂN PHÒNG' :
                                                                point.type === 'BUS_STATION' ? 'BẾN XE' :
                                                                    point.type === 'BUS_STOP' ? 'ĐIỂM DỪNG' : point.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[11px] font-bold text-slate-900 leading-snug max-w-[200px]">
                                                    {point.address}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {point.wardName || '---'}, {point.provinceName || '---'}
                                                </p>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 mt-1">
                                                    <Navigation size={10} />
                                                    <span>{point.latitude}, {point.longitude}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                    <Clock size={12} className="text-slate-400" />
                                                    {point.openingTime} - {point.closingTime}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Giờ phục vụ trực tiếp</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                    <Activity size={12} className="text-brand-primary" />
                                                    {point.onlineOpeningTime} - {point.onlineClosingTime}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tiếp nhận đơn Online</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${point.status === 'ACTIVE'
                                                ? 'bg-slate-100 text-slate-700'
                                                : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${point.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`} />
                                                {point.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                    <Edit3 size={14} /> Sửa
                                                </button>
                                                <button className="text-slate-300 hover:text-black p-2 rounded-xl hover:bg-slate-100">
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

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/50">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center">
                                    {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-950 tracking-tight">
                                        {isEditing ? "Cập nhật Chi nhánh" : "Thêm Chi nhánh mới"}
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                        Expand operational network
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                            {fetchingDetail && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin text-slate-900" size={32} />
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Đang tải chi tiết...</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên hiển thị</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Bến xe Miền Đông"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Loại hình</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="DEPARTMENT">Chi nhánh (Department)</option>
                                        <option value="OFFICE">Văn phòng (Office)</option>
                                        <option value="BUS_STATION">Bến xe (Station)</option>
                                        <option value="BUS_STOP">Điểm dừng (Stop)</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Địa chỉ chi tiết</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Số nhà, tên đường..."
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thành phố / Tỉnh</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none"
                                            value={formData.provinceId}
                                            onChange={(e) => {
                                                const pId = e.target.value;
                                                setFormData({ ...formData, provinceId: pId, wardId: "" });
                                                fetchWards(pId);
                                            }}
                                        >
                                            <option value="">Chọn Tỉnh/Thành</option>
                                            {provinces.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        {loadingLocations && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 size={14} className="animate-spin text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Phường / Xã</label>
                                    <div className="relative">
                                        <div
                                            className={`w-full px-4 py-3 bg-slate-50 border ${isWardDropdownOpen ? 'border-brand-primary/40 ring-4 ring-brand-primary/5' : 'border-slate-100'} rounded-xl text-sm font-black text-slate-900 cursor-pointer flex items-center justify-between transition-all ${!formData.provinceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => formData.provinceId && setIsWardDropdownOpen(!isWardDropdownOpen)}
                                        >
                                            <span className={formData.wardId ? 'text-slate-900' : 'text-slate-400 font-bold'}>
                                                {formData.wardId ? (wards.find(w => w.id === formData.wardId)?.name || "Đã chọn") : "Chọn Phường/Xã"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {loadingLocations && <Loader2 size={12} className="animate-spin text-slate-300" />}
                                                <ChevronRight size={14} className={`text-slate-300 transition-transform ${isWardDropdownOpen ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        {isWardDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-[110]" onClick={() => setIsWardDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[120] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                    <div className="p-3 border-b border-slate-50">
                                                        <div className="relative">
                                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                                            <input
                                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-900 outline-none placeholder:text-slate-300"
                                                                placeholder="Tìm kiếm..."
                                                                value={wardSearchQuery}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    const query = e.target.value;
                                                                    setWardSearchQuery(query);
                                                                    searchWards(formData.provinceId, query);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                                                        {wards.length === 0 && !loadingLocations && (
                                                            <div className="py-8 text-center">
                                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Không tìm thấy kết quả</p>
                                                            </div>
                                                        )}
                                                        {wards.map(w => (
                                                            <div
                                                                key={w.id}
                                                                className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all ${formData.wardId === w.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}`}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, wardId: w.id });
                                                                    setIsWardDropdownOpen(false);
                                                                }}
                                                            >
                                                                {w.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Trạng thái</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Tạm ngưng</option>
                                    </select>
                                </div>

                                <div className="col-span-2 border-t border-slate-50 pt-4 mt-2">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Giờ hoạt động (Offline)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Giờ mở cửa</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white transition-all"
                                                value={formData.openingTime}
                                                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Giờ đóng cửa</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white transition-all"
                                                value={formData.closingTime}
                                                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 border-t border-slate-50 pt-4">
                                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Giờ hoạt động trực tuyến (Online)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Online Mở cửa</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white transition-all"
                                                value={formData.onlineOpeningTime}
                                                onChange={(e) => setFormData({ ...formData, onlineOpeningTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Online Đóng cửa</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white transition-all"
                                                value={formData.onlineClosingTime}
                                                onChange={(e) => setFormData({ ...formData, onlineClosingTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Vĩ độ (Latitude)</label>
                                    <input
                                        type="number" step="any"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Kinh độ (Longitude)</label>
                                    <input
                                        type="number" step="any"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Info size={14} />
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Global Network Sync · Verified</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Lưu chi nhánh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Container */}
            {!loading && (
                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tổng cộng: <span className="text-slate-900">{totalItems}</span> · Trang <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{Math.ceil(totalItems / pageSize) || 1}</span>
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
                            disabled={page * pageSize >= totalItems}
                            onClick={() => setPage(page + 1)}
                            className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
