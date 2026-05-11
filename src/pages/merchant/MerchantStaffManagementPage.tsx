import { useState, useEffect } from "react";
import {
    Users, Plus, Search, MoreHorizontal, UserCheck, ShieldCheck,
    Phone, Loader2, X, Save, Edit3, Info,
    AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_MERCHANT_ACTION_BASE_URL, USER_MANAGEMENT_SERVICE_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";


interface Driver {
    id: string;
    driverId?: string; // Fallback for some APIs
    userInfo?: {
        userId: string;
        fullName: string;
        email: string;
        phone: string;
    };
    merchantInfo?: {
        merchantId: string;
        merchantName: string;
    };
    userId: string; // Flattened for form/logic compatibility
    employeeCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    status: string;
    operationStatus: string;
    rating: number | string;
    totalTrips: number | string;
    licenseClass: string;
    licenseNumber: string;
    licenseIssueDate: string;
    licenseExpiryDate: string;
    pointsDelta?: number | string;
    pointsReason?: string | null;
    kycVerified: boolean;
    trainingCompleted: boolean;
    note: string;
    userName?: string; // Derived from userInfo.fullName
    email?: string; // Derived from userInfo.email
    phone?: string; // Derived from userInfo.phone
}

export function MerchantStaffManagementPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // System users for selection
    const [systemUsers, setSystemUsers] = useState<any[]>([]);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);


    // Form states
    const [formData, setFormData] = useState<Partial<Driver>>({
        userId: "",
        employeeCode: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        status: "ACTIVE",
        operationStatus: "AVAILABLE",
        rating: "5.0",
        totalTrips: "0",
        licenseClass: "",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
        kycVerified: false,
        trainingCompleted: false,
        note: ""
    });

    const fetchDrivers = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/drivers/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                {
                    headers: createAuthorizedEnvelopeHeaders(createRequestMeta())
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                const mappedDrivers = result.data.items.map((d: any) => ({
                    ...d,
                    userId: d.userInfo?.userId || d.userId,
                    userName: d.userInfo?.fullName || d.userName,
                    email: d.userInfo?.email || d.email,
                    phone: d.userInfo?.phone || d.phone
                }));
                setDrivers(mappedDrivers);

                // Handle new pagination structure
                const total = result.data.pagination?.totalElements ??
                    result.data.totalItems ??
                    result.data.totalCount ?? 0;
                setTotalItems(total);
            }
        } catch (err: any) {
            toast.error("Không thể tải danh sách tài xế: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemUsers = async (search?: string) => {

        setUserSearchLoading(true);
        try {
            const meta = createRequestMeta();
            const headers = createXAuthorizedHeaders(meta);
            // Using page 1, size 50 as default to get a good list for selection
            const url = `${USER_MANAGEMENT_SERVICE_BASE_URL}/fetch?pageNumber=1&pageSize=50${search ? `&fullName=${search}` : ''}`;
            const response = await fetch(url, { headers });
            const result = await response.json();
            if (result.data && result.data.items) {
                setSystemUsers(result.data.items);
            }
        } catch (err: any) {
            console.error("Fetch system users error:", err);
        } finally {
            setUserSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers(page);
    }, [page]);

    useEffect(() => {
        if (!isEditing && showUserDropdown && userSearchTerm) {
            const timer = setTimeout(() => {
                fetchSystemUsers(userSearchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [userSearchTerm, isEditing, showUserDropdown]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
                setShowUserDropdown(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);



    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedDriver(null);
        setUserSearchTerm("");
        setFormData({
            userId: "",
            employeeCode: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            status: "ACTIVE",
            operationStatus: "AVAILABLE",
            rating: "5.0",
            totalTrips: "0",
            licenseClass: "",
            licenseNumber: "",
            licenseIssueDate: "",
            licenseExpiryDate: "",
            kycVerified: false,
            trainingCompleted: false,
            note: ""
        });
        setIsModalOpen(true);
        fetchSystemUsers(); // Load users for selection
    };


    const fetchDriverDetail = async (driverId: string, userId: string, employeeCode: string) => {
        setDetailLoading(true);
        try {
            const url = `${ADMIN_MERCHANT_ACTION_BASE_URL}/drivers/detail?driverId=${driverId}&userId=${userId}&employeeCode=${employeeCode}`;
            const meta = createRequestMeta();
            const response = await fetch(url, {
                headers: createAuthorizedEnvelopeHeaders(meta)
            });

            if (!response.ok) throw new Error("Không thể tải chi tiết nhân sự");

            const body = await response.json();
            const data = body.data || body.payload || body;

            // Normalize data similar to list fetch
            const normalized = {
                ...data,
                userId: data.userInfo?.userId || data.userId,
                userName: data.userInfo?.fullName || data.userName,
                email: data.userInfo?.email || data.email,
                phone: data.userInfo?.phone || data.phone
            };

            setSelectedDriver(normalized);
            const { userInfo, merchantInfo, ...cleanFormData } = normalized;
            setFormData({
                ...cleanFormData,
                licenseIssueDate: normalized.licenseIssueDate ? normalized.licenseIssueDate.split('T')[0] : "",
                licenseExpiryDate: normalized.licenseExpiryDate ? normalized.licenseExpiryDate.split('T')[0] : "",
            });
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenEdit = (driver: Driver) => {
        setIsEditing(true);
        setIsModalOpen(true);
        setUserSearchTerm(driver.userName || "");

        // Use IDs from the list item to fetch fresh details

        const driverId = driver.id || driver.driverId || "";
        const userId = driver.userInfo?.userId || driver.userId || "";
        const employeeCode = driver.employeeCode || "";

        fetchDriverDetail(driverId, userId, employeeCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const endpoint = isEditing ? "update" : "create";
            const body = {
                ...meta,
                data: {
                    ...formData,
                    creator: localStorage.getItem("userName") || "System",
                    ...(isEditing && { driverId: selectedDriver?.driverId || selectedDriver?.id })
                }
            };

            const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/drivers/${endpoint}`, {
                method: 'POST',
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(isEditing ? "Cập nhật thành công" : "Thêm tài xế thành công");
                setIsModalOpen(false);
                fetchDrivers(page);
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

    const statusColors: Record<string, string> = {
        'ACTIVE': 'bg-slate-100 text-slate-700 border-slate-200',
        'SUSPENDED': 'bg-slate-50 text-slate-500 border-slate-100',
        'DELETED': 'bg-slate-50 text-slate-400 border-slate-100',
        'INACTIVE': 'bg-slate-50 text-slate-300 border-slate-100'
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Tài xế & Nhân sự</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Đội ngũ vận hành Routex Core</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all self-start"
                >
                    <Plus size={14} />
                    Thêm nhân sự
                </button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-950">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tổng nhân sự</p>
                        <p className="text-xl font-black text-slate-950">{totalItems}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sẵn sàng</p>
                        <p className="text-xl font-black text-slate-950">
                            {drivers.filter(d => d.operationStatus === 'AVAILABLE').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Xác minh KYC</p>
                        <p className="text-xl font-black text-slate-950">
                            {drivers.filter(d => d.kycVerified).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã, tên hoặc số điện thoại..."
                            className="w-full pl-11 pr-5 py-2 bg-slate-50 border-none rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-brand-primary/5 transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nhân sự</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Bằng lái</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Kinh nghiệm</th>
                                <th className="px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-4 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-300">
                                        <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={24} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Đang tải...</p>
                                    </td>
                                </tr>
                            ) : drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center text-slate-300">
                                        <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Chưa có dữ liệu</p>
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((d) => (
                                    <tr key={d.id || d.driverId} onClick={() => handleOpenEdit(d)} className="hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                                    <Users size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900">{d.userName || d.employeeCode}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{d.employeeCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="space-y-0.5">
                                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">Hạng {d.licenseClass}</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {d.licenseNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-[11px] font-black text-slate-900">{d.phone || "N/A"}</p>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[11px] font-black text-slate-900">{d.totalTrips} Chuyến</p>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <p className="text-[10px] font-black text-amber-500">★ {d.rating}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[d.status] || statusColors['INACTIVE']}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="text-slate-300 hover:text-black p-1">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/50">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
                                    {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-950 tracking-tight">
                                        {isEditing ? "Hồ sơ Nhân sự" : "Thêm Nhân sự mới"}
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Asset Registry · Fleet Team</p>
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
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
                            {detailLoading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Đang tải chi tiết nhân sự...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Section 1: Basic Info */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                                <Users size={16} className="text-slate-400" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Thông tin cơ bản</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-2 relative">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tài khoản hệ thống (User ID)</label>
                                                    <div className="relative">
                                                        <input
                                                            required
                                                            className={`w-full px-4 py-3 border rounded-2xl text-sm font-black transition-all outline-none ${isEditing
                                                                ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                                                                : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-brand-primary/20"
                                                                }`}
                                                            value={isEditing ? formData.userId : userSearchTerm || formData.userId}
                                                            onChange={(e) => {
                                                                if (!isEditing) {
                                                                    setUserSearchTerm(e.target.value);
                                                                    setShowUserDropdown(true);
                                                                    // Optional: Debounce fetchSystemUsers(e.target.value) if needed
                                                                }
                                                            }}
                                                            onFocus={() => !isEditing && setShowUserDropdown(true)}
                                                            placeholder={isEditing ? "UUID của tài khoản" : "Tìm theo tên hoặc số điện thoại..."}
                                                            readOnly={isEditing}
                                                        />
                                                        {!isEditing && (
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                                {userSearchLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                                                <Search size={16} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!isEditing && showUserDropdown && (
                                                        <>
                                                            <div className="fixed inset-0 z-[105]" onClick={() => setShowUserDropdown(false)} />
                                                            <div className="absolute z-[110] left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] max-h-72 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                                                                {systemUsers.length === 0 ? (
                                                                    <div className="px-6 py-10 text-center">
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Không tìm thấy người dùng</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="py-2">
                                                                        {systemUsers
                                                                            .filter(u =>
                                                                                !userSearchTerm ||
                                                                                u.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                                                                u.phoneNumber?.includes(userSearchTerm)
                                                                            )
                                                                            .map((user) => (
                                                                                <div
                                                                                    key={user.id}
                                                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors group"
                                                                                    onClick={() => {
                                                                                        setFormData({ ...formData, userId: user.id });
                                                                                        setUserSearchTerm(`${user.fullName} - ${user.phoneNumber}`);
                                                                                        setShowUserDropdown(false);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <p className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors">{user.fullName || "Không có email"}</p>
                                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.phoneNumber || "N/A"}</p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <p className="text-[9px] font-mono text-slate-300 group-hover:text-slate-400 transition-colors">{user.id}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Mã nhân viên</label>
                                                    <input
                                                        required
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                        value={formData.employeeCode}
                                                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                                                        placeholder="VD: NV-001"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Xếp hạng (Rating)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none"
                                                        value={formData.rating}
                                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Contact Info */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                                <Phone size={16} className="text-slate-400" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Liên hệ khẩn cấp</h4>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên người thân</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                        value={formData.emergencyContactName}
                                                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Số điện thoại khẩn</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                        value={formData.emergencyContactPhone}
                                                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 3: Driver License */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                                <ShieldCheck size={16} className="text-slate-400" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Giấy phép lái xe</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Hạng bằng</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none"
                                                        value={formData.licenseClass}
                                                        onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                                                        placeholder="E, D, FC..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Số hiệu bằng</label>
                                                    <input
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none"
                                                        value={formData.licenseNumber}
                                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Ngày cấp</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black"
                                                        value={formData.licenseIssueDate}
                                                        onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Ngày hết hạn</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black"
                                                        value={formData.licenseExpiryDate}
                                                        onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 4: Operational Status */}
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                                <AlertCircle size={16} className="text-slate-400" />
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Trạng thái vận hành</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Trạng thái hồ sơ</label>
                                                    <select
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black"
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    >
                                                        <option value="ACTIVE">Hoạt động</option>
                                                        <option value="SUSPENDED">Tạm đình chỉ</option>
                                                        <option value="DELETED">Đã xóa</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Trạng thái công việc</label>
                                                    <select
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black"
                                                        value={formData.operationStatus}
                                                        onChange={(e) => setFormData({ ...formData, operationStatus: e.target.value })}
                                                    >
                                                        <option value="AVAILABLE">Sẵn sàng</option>
                                                        <option value="BUSY">Đang bận</option>
                                                        <option value="OFFLINE">Ngoại tuyến</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2 flex gap-8 pt-4">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-6 h-6 rounded-lg border-2 border-slate-200 checked:bg-brand-primary transition-all"
                                                            checked={formData.kycVerified}
                                                            onChange={(e) => setFormData({ ...formData, kycVerified: e.target.checked })}
                                                        />
                                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-brand-primary">Xác minh KYC</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-6 h-6 rounded-lg border-2 border-slate-200 checked:bg-brand-primary transition-all"
                                                            checked={formData.trainingCompleted}
                                                            onChange={(e) => setFormData({ ...formData, trainingCompleted: e.target.checked })}
                                                        />
                                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-brand-primary">Đã qua đào tạo</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Ghi chú nội bộ</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-brand-primary/20 transition-all resize-none"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            placeholder="Nhập ghi chú thêm về nhân sự này..."
                                        />
                                    </div>
                                </>
                            )}
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Info size={14} />
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Security Standard · RT-MANAGEMENT</p>
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
                                    {isEditing ? "Lưu hồ sơ" : "Tạo nhân sự"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Container */}
            {!loading && drivers.length > 0 && (
                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Trang hệ thống: <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{Math.ceil(totalItems / pageSize) || 1}</span>
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

function ChevronLeft({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
}

function ChevronRight({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;
}
