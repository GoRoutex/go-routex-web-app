import { useState, useEffect } from "react";
import { Store, Plus, Search, Filter, MoreHorizontal, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Download, Loader2, Edit3, X, Save, Building } from "lucide-react";
import { MERCHANT_SERVICE_BASE_URL, MEDIA_UPLOAD_URL, API_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";
import { toast } from "react-toastify";

export default function AdminMerchantManagementPage() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalPartners: '0',
        totalRevenueShare: '0 VND',
        avgRating: '0',
        numberOfPendingApps: '0'
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editMerchant, setEditMerchant] = useState<any>(null);
    const [viewMerchant, setViewMerchant] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        legalName: '',
        taxCode: '',
        businessLicense: '',
        phone: '',
        email: '',
        address: '',
        representativeName: '',
        description: '',
        logoUrl: '',
        businessLicenseUrl: '',
        commissionRate: 0,
        status: 'ACTIVE'
    });

    const fetchMerchants = async () => {
        try {
            setLoading(true);
            const headers = createAuthorizedEnvelopeHeaders();
            const response = await fetch(`${MERCHANT_SERVICE_BASE_URL}/fetch?pageNumber=1&pageSize=10`, {
                method: 'GET',
                headers: headers as HeadersInit
            });

            if (!response.ok) throw new Error("Failed to fetch merchants");

            const body = await response.json();
            const data = extractArrayValue(body, ["content", "data", "merchants", "items"]);

            const dataSection = body?.data || body;
            setStats({
                totalPartners: String(dataSection?.totalPartners ?? '0'),
                totalRevenueShare: `${Number(dataSection?.totalRevenueShare ?? 0).toLocaleString()} VND`,
                avgRating: String(dataSection?.avgRating ?? '0'),
                numberOfPendingApps: String(dataSection?.numberOfPendingApps ?? '0')
            });

            const mappedData = data.map((m: any) => ({
                id: m.id || m.merchantId || "N/A",
                merchantId: m.merchantId || m.id,
                name: m.displayName || m.name || m.merchantName || "Unknown",
                logoUrl: m.logoUrl || null,
                email: m.email || "N/A",
                phone: m.phone || "N/A",
                address: m.address || "N/A",
                taxCode: m.taxCode || "",
                representativeName: m.representativeName || "",
                commissionRate: m.commissionRate || 0,
                status: m.status || 'ACTIVE',
                displayStatus: m.status === 'ACTIVE' || m.status === 'VERIFIED' ? 'Verified' : m.status || 'Pending',
                type: m.type || "Transport",
                fleetSize: m.fleetSize || 0,
                performance: m.performance || Math.floor(Math.random() * 20) + 80
            }));

            setMerchants(mappedData);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message);
            toast.error("Lỗi đồng bộ dữ liệu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantDetail = async (merchantId: string) => {
        setDetailLoading(true);
        setViewMerchant(null); // Clear previous or show shell
        try {
            const headers = {
                ...createAuthorizedEnvelopeHeaders(),
                'Accept': 'application/json'
            };

            const response = await fetch(`${MERCHANT_SERVICE_BASE_URL}/detail?merchantId=${merchantId}`, {
                method: 'GET',
                headers: headers as HeadersInit
            });

            if (!response.ok) throw new Error("Could not retrieve merchant profile.");

            const body = await response.json();
            const data = body.data || body;

            // Map the detailed data from the actual response structure
            const detail = {
                ...data,
                id: data.id || data.merchantId,
                name: data.displayName || data.name || "Unknown Merchant",
                taxCode: data.taxCode || "N/A",
                phone: data.phone || "N/A",
                email: data.email || "N/A",
                address: data.address || "No address provided",
                representativeName: data.representativeName || "N/A",
                commissionRate: data.commissionRate || 15,
                status: data.status || "ACTIVE",
                logoUrl: data.logoUrl && data.logoUrl.startsWith('http') ? data.logoUrl : null,
                createdAt: data.approvedAt || data.createdAt,
                createdBy: data.approvedBy || data.createdBy,
                // These are probably for internal stats, use mock if missing
                performance: data.performance || 95,
                fleetSize: data.fleetSize || 20,
                type: data.type || "Transport",
                // Banking details
                bankAccountName: data.bankAccountName || "N/A",
                bankAccountNumber: data.bankAccountNumber || "N/A",
                bankName: data.bankName || "N/A",
                bankBranch: data.bankBranch || "N/A",
                businessLicense: data.businessLicenseNumber || "N/A",
                businessLicenseUrl: data.businessLicenseUrl || null,
                legalName: data.legalName || data.displayName || "N/A",
                description: data.description || "No description."
            };

            setViewMerchant(detail);
        } catch (err: any) {
            toast.error("Không thể tải hồ sơ: " + err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const handleEditClick = (m: any) => {
        setEditMerchant(m);
        setFormData({
            name: m.name || m.displayName || '',
            legalName: m.legalName || m.displayName || m.name || '',
            taxCode: m.taxCode || '',
            businessLicense: m.businessLicenseNumber || m.businessLicense || '',
            phone: m.phone || '',
            email: m.email || '',
            address: m.address || '',
            representativeName: m.representativeName || '',
            description: m.description || '',
            logoUrl: m.logoUrl || m.profileImageUrl || '',
            businessLicenseUrl: m.businessLicenseUrl || '',
            commissionRate: m.commissionRate || 0,
            status: m.status || 'ACTIVE'
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'businessLicenseUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const meta = createRequestMeta();
            const formDataApi = new FormData();
            formDataApi.append('requestId', meta.requestId);
            formDataApi.append('requestDateTime', meta.requestDateTime);
            formDataApi.append('channel', meta.channel);
            formDataApi.append('data', JSON.stringify({
                folder: 'goroutex',
                publicId: `${field === 'logoUrl' ? 'logo' : 'license'}_${Date.now()}`
            }));
            formDataApi.append('file', file);

            const token = localStorage.getItem('authToken') || "";
            const response = await fetch(API_BASE_URL + MEDIA_UPLOAD_URL, {
                method: 'POST',
                headers: {
                    ...(token.trim() ? { 'Authorization': `Bearer ${token.trim()}` } : {})
                },
                body: formDataApi
            });

            if (!response.ok) throw new Error("Upload failed");

            const result = await response.json();
            const uploadedUrl = result.data?.url || '';
            setFormData(prev => ({ ...prev, [field]: uploadedUrl }));
            toast.success("Tải tệp lên thành công!");
        } catch (err: any) {
            toast.error("Lỗi tải tệp: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateMerchant = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await fetch(`${MERCHANT_SERVICE_BASE_URL}/update`, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestId: crypto.randomUUID(),
                    requestDateTime: new Date().toISOString(),
                    channel: "OFF",
                    data: {
                        merchantId: editMerchant.merchantId,
                        updatedBy: "Admin",
                        ...formData
                    }
                })
            });

            if (!response.ok) throw new Error("Update failed");

            setEditMerchant(null);
            fetchMerchants();
            toast.success("Cập nhật thông tin đối tác thành công!");
        } catch (err: any) {
            toast.error("Lỗi cập nhật: " + err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900">
                        Đối Tác Hệ Sinh Thái
                    </h2>
                    <p className="text-[13px] text-slate-500 font-medium max-w-xl leading-relaxed">
                        Theo dõi, quản lý và kiểm duyệt hiệu suất đối tác trong mạng lưới GoRoutex.
                        Đảm bảo chất lượng kết nối vượt trội giữa tất cả các nhà xe.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                        <Download size={16} />
                        Xuất Dữ Liệu
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[12px] font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
                        <Plus size={16} />
                        Mời Đối Tác
                    </button>
                </div>
            </div>

            {/* Global Loading Overlay for Detail Fetch */}
            {detailLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
                    <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in zoom-in-95 duration-200">
                        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang truy xuất hồ sơ thực thể...</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng số đối tác', value: stats.totalPartners, sub: 'Dấu ấn hoạt động' },
                    { label: 'Tổng DT chia sẻ', value: stats.totalRevenueShare, sub: 'Tính đến hiện tại' },
                    { label: 'Đánh giá TB', value: stats.avgRating, sub: 'Toàn hệ thống' },
                    { label: 'Đơn chờ duyệt', value: stats.numberOfPendingApps, sub: 'Đang đợi kiểm duyệt' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-slate-300 transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
                        <div className="flex items-end justify-between mt-3">
                            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.value}</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-3">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đối tác, địa điểm hoặc mã ID..."
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-[13px] font-medium focus:ring-0 outline-none placeholder:text-slate-400"
                    />
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                    <Filter size={16} />
                    Bộ Lọc
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Đang đồng bộ hóa với hệ thống...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] text-center">
                    <p className="text-rose-600 font-bold mb-2">Đồng Bộ Hóa Thất Bại</p>
                    <p className="text-rose-400 text-xs">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-xs font-black text-rose-600 uppercase tracking-widest hover:underline"
                    >
                        Thử Kết Nối Lại
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Thông Tin Đối Tác</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Liên Hệ & Loại Hình</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Quy Mô Đội Xe</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Hiệu Suất</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trạng Thái</th>
                                    <th className="px-8 py-5 border-b border-slate-100"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {merchants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-slate-400 text-sm font-medium">Không tìm thấy đối tác nào trên hệ thống.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => fetchMerchantDetail(m.merchantId || m.id)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 bg-white shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
                                                        {m.logoUrl ? (
                                                            <img src={m.logoUrl} alt={m.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Store size={20} strokeWidth={1.5} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[14px] font-black text-slate-900">{m.name}</span>
                                                            {m.status === 'Verified' && <ShieldCheck size={14} className="text-slate-900" />}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                                                            <MapPin size={12} />
                                                            <span className="text-[11px] font-medium truncate max-w-[200px]">{m.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                                                        <Mail size={12} className="text-slate-400" />
                                                        {m.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <span className="px-1.5 py-0.5 border border-slate-200 rounded">{m.type}</span>
                                                        <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-slate-900">{m.fleetSize} Xe</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{m.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                                        <div
                                                            className="h-full bg-slate-900 rounded-full"
                                                            style={{ width: `${m.performance}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[12px] font-black text-slate-900">{m.performance}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ring-1 ${m.status === 'Verified' ? 'ring-slate-900 text-slate-900 bg-slate-900/5' :
                                                    m.status === 'Pending' ? 'ring-slate-200 text-slate-500 bg-slate-50' : 'ring-rose-200 text-rose-600 bg-rose-50'
                                                    }`}>
                                                    {m.displayStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(m);
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Edit Merchant"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="View Portal"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="More Options"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Hiển thị <span className="text-slate-900">1-{merchants.length}</span> trong số {stats.totalPartners} đối tác
                        </span>
                        <div className="flex items-center gap-4">
                            <button className="text-[11px] font-black text-slate-300 cursor-not-allowed uppercase tracking-widest">Trước</button>
                            <button className="text-[11px] font-black text-slate-900 hover:text-slate-600 uppercase tracking-widest transition-colors">Trang Sau</button>
                        </div>
                    </div>
                </div>
            )}

            {editMerchant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl shadow-slate-900/40 relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] overflow-hidden">
                        {/* Header */}
                        <div className="p-10 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className={`w-20 h-20 rounded-3xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden transition-all group-hover:border-slate-900/20 ${isUploading ? "opacity-50" : ""}`}>
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Store size={32} className="text-slate-200" />
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                                                <Loader2 size={24} className="animate-spin text-slate-900" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="admin-logo-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                    />
                                    <label
                                        htmlFor="admin-logo-upload"
                                        className="absolute -bottom-2 -right-2 bg-white shadow-lg border border-slate-100 p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90 cursor-pointer"
                                    >
                                        <Edit3 size={14} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-950 tracking-tight">Cập Nhật Đối Tác</h3>
                                    <div className="flex items-center gap-2 mt-1.5 font-black text-[11px] text-slate-400 tracking-widest uppercase">
                                        Mã Đối Tác: {editMerchant.merchantId || editMerchant.id}
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        Sửa đổi thông tin hệ thống
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditMerchant(null)}
                                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateMerchant} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                            <div className="p-10 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Column 1: Core Identity */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Building size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thông Tin Pháp Lý</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Hiển Thị Hệ Thống</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Pháp Lý Doanh Nghiệp</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalName}
                                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    placeholder="Nhập tên pháp lý công ty"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã Số Thuế</label>
                                                    <input
                                                        type="text"
                                                        value={formData.taxCode}
                                                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đại Diện Pháp Luật</label>
                                                    <input
                                                        type="text"
                                                        value={formData.representativeName}
                                                        onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Licensing & Ops */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <ShieldCheck size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Giấy Phép & Vận Hành</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số Giấy Phép Kinh Doanh</label>
                                                <input
                                                    type="text"
                                                    value={formData.businessLicense}
                                                    onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tài Liệu Đính Kèm</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        id="admin-license-upload-modal"
                                                        className="hidden"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => handleFileUpload(e, 'businessLicenseUrl')}
                                                    />
                                                    <label
                                                        htmlFor="admin-license-upload-modal"
                                                        className="flex-1 px-5 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-900 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                                                    >
                                                        {formData.businessLicenseUrl ? "Thay Đổi Tài Liệu" : "Tải Lên Giấy Phép"}
                                                        <Download size={16} />
                                                    </label>
                                                    {formData.businessLicenseUrl && (
                                                        <a href={formData.businessLicenseUrl} target="_blank" rel="noreferrer" className="p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-slate-900/20">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hoa Hồng (%)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.commissionRate}
                                                        onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng Thái</label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                        className="w-full px-5 py-4 bg-slate-900 text-white border-none rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-slate-900/20 outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="ACTIVE">Verified & Online</option>
                                                        <option value="PENDING">Pending Review</option>
                                                        <option value="DISABLED">Suspended</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Width Sections */}
                                    <div className="md:col-span-2 space-y-8 pt-4">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Mail size={16} className="text-slate-400" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thông Tin Liên Hệ & Vị Trí</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Liên Hệ</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số Điện Thoại</label>
                                                <input
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa Chỉ Trụ Sở</label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô Tả Đối Tác</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all resize-none"
                                                placeholder="Viết giới thiệu ngắn gọn..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setEditMerchant(null)}
                                    className="px-10 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                                >
                                    Hủy Thay Đổi
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-12 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:scale-100"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {updating ? "Đang lưu..." : "Lưu Thông Tin Thực Thể"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Merchant Details Modal */}
            {viewMerchant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl shadow-slate-900/40 relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] overflow-hidden">
                        {/* Header */}
                        <div className="p-10 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden p-2">
                                    {viewMerchant.logoUrl ? (
                                        <img src={viewMerchant.logoUrl} alt={viewMerchant.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Store size={32} className="text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-950 tracking-tight">{viewMerchant.name}</h3>
                                    <div className="flex items-center gap-2 mt-1.5 font-black text-[11px] text-slate-400 tracking-widest uppercase">
                                        Mã Đối Tác: {viewMerchant.code}
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        Thực Thể {viewMerchant.type}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ring-1 ${viewMerchant.status === 'ACTIVE' || viewMerchant.status === 'VERIFIED' ? 'ring-slate-900 text-slate-900 bg-slate-900/5' : 'ring-rose-200 text-rose-600 bg-rose-50'}`}>
                                {viewMerchant.displayStatus}
                            </span>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                    { label: 'Quy Mô Đội Xe', value: `${viewMerchant.fleetSize} Xe`, icon: Store },
                                    { label: 'Điểm Kiểm Định', value: `${viewMerchant.performance}/100`, icon: ShieldCheck },
                                    { label: 'Điểm Liên Hệ', value: viewMerchant.phone || 'N/A', icon: Phone },
                                ].map((stat, i) => (
                                    <div key={i} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-50 hover:border-slate-200 transition-all group">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <stat.icon size={12} /> {stat.label}
                                        </p>
                                        <p className="text-[17px] font-black text-slate-900 tracking-tight">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Main Info Blocks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Entity Information */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <Building size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thông Tin Pháp Lý</h4>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Tên Pháp Lý Doanh Nghiệp</p>
                                            <p className="text-sm font-black text-slate-950 leading-relaxed">{viewMerchant.legalName || viewMerchant.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Mã Số Thuế</p>
                                                <p className="text-sm font-black text-slate-950">{viewMerchant.taxCode}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">GP Kinh Doanh</p>
                                                <p className="text-sm font-black text-slate-950">{viewMerchant.businessLicense || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Tỷ Lệ Hoa Hồng</p>
                                                <p className="text-sm font-black text-slate-950 leading-none">{viewMerchant.commissionRate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Tài Liệu Pháp Lý</p>
                                                {viewMerchant.businessLicenseUrl ? (
                                                    <a
                                                        href={viewMerchant.businessLicenseUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[11px] font-black text-slate-900 underline flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                    >
                                                        Xem Giấy Phép <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-black text-slate-400">Chưa tải lên</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Người Đại Diện Pháp Luật</p>
                                            <p className="text-sm font-black text-slate-950">{viewMerchant.representativeName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Settlement & Banking */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thanh Toán & Ngân Hàng</h4>
                                    </div>
                                    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-900/10">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Tài Khoản Giải Ngân Đối Tác</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Tên Ngân Hàng</p>
                                                <p className="text-sm font-black tracking-tight">{viewMerchant.bankName}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Số Tài Khoản</p>
                                                    <p className="text-lg font-black tracking-widest">{viewMerchant.bankAccountNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Chủ Tài Khoản</p>
                                                    <p className="text-sm font-black uppercase">{viewMerchant.bankAccountName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Chi Nhánh</p>
                                        <p className="text-sm font-black text-slate-900">{viewMerchant.bankBranch}</p>
                                    </div>
                                </div>

                                {/* Network & Contact */}
                                <div className="space-y-6 md:col-span-2">
                                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                        <Mail size={16} className="text-slate-400" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Mạng Lưới & Điểm Liên Hệ</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Địa Chỉ Trụ Sở</p>
                                            <div className="flex items-start gap-2.5">
                                                <MapPin size={16} className="text-slate-400 mt-0.5" />
                                                <p className="text-sm font-black text-slate-950 leading-relaxed">{viewMerchant.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-50">
                                                    <Mail size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Địa Chỉ Email</span>
                                                    <span className="text-[14px] font-black text-slate-800">{viewMerchant.email}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-50">
                                                    <Phone size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Số Điện Thoại</span>
                                                    <span className="text-[14px] font-black text-slate-800">{viewMerchant.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Audit Info Footer */}
                            <div className="pt-10 border-t border-slate-50 flex items-center justify-between opacity-50">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Ngày Duyệt: {viewMerchant.createdAt ? new Date(viewMerchant.createdAt).toLocaleString('vi-VN') : "N/A"}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Người Duyệt: {viewMerchant.createdBy || "Hệ thống"}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <button
                                onClick={() => setViewMerchant(null)}
                                className="px-10 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Đóng Chi Tiết
                            </button>
                            <button
                                onClick={() => {
                                    handleEditClick(viewMerchant);
                                    setViewMerchant(null);
                                }}
                                className="px-12 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                <Edit3 size={16} />
                                Chỉnh Sửa Đối Tác
                            </button>
                        </div>

                        {/* X Close */}
                        <button
                            onClick={() => setViewMerchant(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


