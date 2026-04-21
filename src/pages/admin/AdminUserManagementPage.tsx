import { useState, useEffect } from "react";
import {
    Users, Search, Loader2, AlertCircle, X, Info,
    Mail, Phone, Calendar, Clock, Shield, Globe, User,
    ChevronLeft, ChevronRight
} from "lucide-react";

import { toast } from "react-toastify";
import { USER_MANAGEMENT_SERVICE_BASE_URL } from "../../utils/api";
import { createXAuthorizedHeaders, createRequestMeta } from "../../utils/requestMeta";

interface UserItem {
    id: string;
    email: string;
    fullName?: string;
    phoneNumber: string;
    avatarUrl: string;
    dob: string;
    gender: string;
    phoneVerified: boolean;
    profileCompleted: boolean;
    emailVerified: boolean;
    status: string;
    language: string;

    timezone: string;
    createdAt: string;
    updatedAt: string;
}


export function AdminUserManagementPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // Detail Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

    const fetchUsers = async (pageNumber: number) => {

        setLoading(true);
        try {
            const meta = createRequestMeta();
            const headers = createXAuthorizedHeaders(meta);
            const response = await fetch(
                `${USER_MANAGEMENT_SERVICE_BASE_URL}/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                { headers }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setUsers(result.data.items);
                // Handle pagination from the structure provided: result.data.pagination.totalElements
                const total = result.data.pagination?.totalElements ?? 
                             result.data.totalCount ?? 
                             result.data.items.length;
                setTotalItems(total);
            }

        } catch (err: any) {
            toast.error("Không thể tải danh sách người dùng: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (userId: string) => {
        setDetailLoading(true);
        setLoadingUserId(userId);
        try {
            const meta = createRequestMeta();
            const headers = createXAuthorizedHeaders(meta);
            const response = await fetch(
                `${USER_MANAGEMENT_SERVICE_BASE_URL}/detail?userId=${userId}`,
                { headers }
            );

            if (!response.ok) throw new Error("Không thể tải chi tiết người dùng");

            const body = await response.json();
            const data = body.data || body.payload || body;
            setSelectedUser(data);
            setIsDetailModalOpen(true);
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setDetailLoading(false);
            setLoadingUserId(null);
        }
    };


    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'INACTIVE': return 'bg-slate-50 text-slate-400 border-slate-100';
            case 'SUSPENDED': return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 leading-tight">Quản lý người dùng</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                        Người dùng hệ thống · System Users
                    </p>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm Email hoặc Số điện thoại..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin cơ bản</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-300">
                                        <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={24} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Đang tải danh sách người dùng...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-32 text-center text-slate-300">
                                        <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Chưa có người dùng nào</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        onClick={() => fetchUserDetail(user.id)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.email} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors">{user.fullName || "N/A"}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-600">{user.phoneNumber || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span className="text-[11px] font-bold text-slate-400">{user.dob || "N/A"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border w-fit ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                                <div className="flex gap-1">
                                                    {user.emailVerified && <div title="Email Verified" className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                                    {user.phoneVerified && <div title="Phone Verified" className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                                    {user.profileCompleted && <div title="Profile Completed" className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={14} />
                                                <p className="text-[11px] font-bold">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:opacity-100 transition-all">
                                                {detailLoading && loadingUserId === user.id ? (
                                                    <Loader2 size={16} className="animate-spin text-brand-primary" />
                                                ) : (
                                                    <Info size={16} />
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-slate-50 bg-slate-50/20">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Hệ thống: <span className="text-slate-900">{totalItems}</span> người dùng
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: Math.ceil(totalItems / pageSize) || 1 }).map((_, i) => {
                                const p = i + 1;
                                // Simple logic: show all if pages < 8, else show a subset (optional but good)
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${
                                            p === page 
                                            ? "bg-slate-900 text-white shadow-lg shadow-black/10" 
                                            : "border border-slate-100 text-slate-400 bg-white hover:text-black shadow-sm"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                disabled={totalItems === 0 || page * pageSize >= totalItems}
                                onClick={() => setPage(page + 1)}
                                className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all bg-white shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>


            {/* Detail Modal */}
            {isDetailModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/50">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-brand-primary/10 overflow-hidden flex items-center justify-center shadow-xl shadow-brand-primary/5 p-1 border-4 border-white">
                                    {selectedUser.avatarUrl ? (
                                        <img src={selectedUser.avatarUrl} alt={selectedUser.email} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <User size={32} className="text-brand-primary" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">{selectedUser.fullName || selectedUser.email}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedUser.email}</p>
                                </div>

                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {/* Profile Info */}
                                <div className="md:col-span-2 space-y-10">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Mail size={14} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Địa chỉ Email</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">{selectedUser.email}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone size={14} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Số điện thoại</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">{selectedUser.phoneNumber || "Chưa cập nhật"}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={14} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Ngày sinh & Giới tính</p>
                                            </div>
                                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 flex items-center justify-between">
                                                <p className="text-sm font-black text-slate-900">{selectedUser.dob || "N/A"}</p>
                                                <span className="text-[10px] font-black uppercase text-slate-400">{selectedUser.gender}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Globe size={14} />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Ngôn ngữ & Múi giờ</p>
                                            </div>
                                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 flex items-center justify-between">
                                                <p className="text-sm font-black text-slate-900 uppercase">{selectedUser.language}</p>
                                                <span className="text-[10px] font-black uppercase text-slate-400">{selectedUser.timezone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security & Verification */}
                                    <div className="space-y-6 pt-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-b border-slate-50 pb-2">Bảo mật & Xác minh</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${selectedUser.emailVerified ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                <Shield size={20} />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Email Verified</p>
                                            </div>
                                            <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${selectedUser.phoneVerified ? 'bg-blue-50/50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                <Shield size={20} />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Phone Verified</p>
                                            </div>
                                            <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${selectedUser.profileCompleted ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                <Shield size={20} />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Profile Ready</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Info */}
                                <div className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem]">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-b border-slate-100 pb-2">Hệ thống</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">User ID</p>
                                            <p className="text-[12px] font-mono font-bold text-slate-600 break-all">{selectedUser.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tham gia vào</p>

                                            <p className="text-[12px] font-bold text-slate-900">{new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cập nhật cuối</p>
                                            <p className="text-[12px] font-bold text-slate-900">{new Date(selectedUser.updatedAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border text-center ${getStatusColor(selectedUser.status)}`}>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedUser.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Info size={16} />
                                <p className="text-[9px] font-black uppercase tracking-widest">Tra cứu hồ sơ người dùng tuân thủ chính sách bảo mật dữ liệu Routex</p>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                            >
                                Đóng hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
