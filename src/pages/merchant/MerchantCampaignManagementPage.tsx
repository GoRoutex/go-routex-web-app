import React, { useState, useEffect, useCallback } from "react";
import {
    Tag, Gift, Search, Plus, Loader2, Calendar,
    Clock, Hash, Trash2, Edit2, Info,
    X, CheckCircle2, TrendingDown,
    Activity, ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import { CAMPAIGN_ENDPOINTS } from "../../utils/api-constants";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import { Pagination } from "../../Components/common/Pagination";
import { getMerchantId } from "../../utils/auth";

interface CampaignItem {
    id: string;
    name: string;
    description: string;
    promotionCode: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxDiscountAmount: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    status: string;
    createdAt: string;
}

interface PaginationInfo {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export function MerchantCampaignManagementPage() {
    const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 10;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        promotionCode: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderAmount: 0,
        startDate: "",
        endDate: "",
        usageLimit: 0,
    });

    const fetchCampaigns = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            const meta = createRequestMeta();
            const merchantId = getMerchantId();
            if (!merchantId) {
                toast.error("Không tìm thấy thông tin nhà xe");
                return;
            }

            const url = `${CAMPAIGN_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}&merchantId=${merchantId}${searchTerm ? `&search=${searchTerm}` : ""}`;

            const response = await fetch(url, {
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'accept': '*/*'
                }
            });
            const result = await response.json();
            if (result.data) {
                setCampaigns(result.data.items || []);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error("Fetch campaigns error:", error);
            toast.error("Không thể tải danh sách chương trình ưu đãi");
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchCampaigns(page);
    }, [page, fetchCampaigns]);

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const merchantId = getMerchantId();

            const body = {
                ...meta,
                channel: "ONL",
                data: {
                    ...formData,
                    merchantId,
                    creator: "Merchant Owner",
                    // Convert dates to ISO if needed, but the user's curl showed ISO strings
                    startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
                    endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
                }
            };

            const response = await fetch(CAMPAIGN_ENDPOINTS.CREATE, {
                method: "POST",
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    "Content-Type": "application/json",
                    "accept": "*/*"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Tạo chương trình ưu đãi thành công");
                setIsCreateModalOpen(false);
                setFormData({
                    name: "",
                    description: "",
                    promotionCode: "",
                    discountType: "PERCENTAGE",
                    discountValue: 0,
                    maxDiscountAmount: 0,
                    minOrderAmount: 0,
                    startDate: "",
                    endDate: "",
                    usageLimit: 0,
                });
                fetchCampaigns(1);
                setPage(1);
            } else {
                const err = await response.json();
                toast.error(err.message || "Tạo thất bại");
            }
        } catch (error) {
            toast.error("Lỗi hệ thống khi tạo chương trình");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Gift className="text-brand-primary" />
                        Quản lý Chương trình Ưu đãi
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Quản lý các mã giảm giá và chiến dịch khuyến mãi cho khách hàng của bạn.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={20} />
                        Tạo mã giảm giá mới
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng chiến dịch', value: pagination?.totalElements?.toString() || '0', icon: Hash, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Đang hoạt động', value: campaigns.filter(c => new Date(c.endDate) > new Date()).length.toString(), icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Tổng lượt đã dùng', value: campaigns.reduce((acc, c) => acc + (c.usedCount || 0), 0).toString(), icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Trang hiện tại', value: page.toString(), icon: ChevronRight, color: 'text-brand-primary', bg: 'bg-blue-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc mã giảm giá..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                            <Calendar size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã Ưu đãi</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên chiến dịch</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mức giảm</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Giới hạn/Đã dùng</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6 text-center">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag size={48} className="text-slate-200" />
                                            <p className="text-slate-500 font-bold">Chưa có chương trình ưu đãi nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                                                    <Tag size={14} className="text-brand-primary" />
                                                </div>
                                                <span className="font-black text-slate-900 tracking-wider uppercase">{campaign.promotionCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 line-clamp-1">{campaign.name}</span>
                                                <span className="text-[11px] text-slate-400 line-clamp-1">{campaign.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-emerald-600">
                                                    {campaign.discountType === 'PERCENTAGE'
                                                        ? `${campaign.discountValue}%`
                                                        : formatCurrency(campaign.discountValue)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    Đơn từ {formatCurrency(campaign.minOrderAmount)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[12px] text-slate-600 font-bold">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 font-black text-slate-900">
                                                    <span className="text-emerald-600">{campaign.usedCount || 0}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span>{campaign.usageLimit === 0 ? '∞' : campaign.usageLimit}</span>
                                                </div>
                                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                                                        style={{ width: `${campaign.usageLimit === 0 ? 0 : Math.min(100, (campaign.usedCount / campaign.usageLimit) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50">
                        <Pagination
                            currentPage={page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalElements}
                            onPageChange={(p) => setPage(p)}
                            itemLabel="chương trình"
                        />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all active:scale-90"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                                <Plus className="text-brand-primary" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Tạo mã giảm giá mới</h2>
                                <p className="text-sm text-slate-500 font-medium">Điền đầy đủ thông tin bên dưới để kích hoạt ưu đãi.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateCampaign} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <Info size={14} /> Tên chương trình
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        placeholder="VD: Ưu đãi Hè rực rỡ"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <Hash size={14} /> Mã giảm giá (Code)
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        placeholder="VD: SUMMERSALE"
                                        value={formData.promotionCode}
                                        onChange={(e) => setFormData({ ...formData, promotionCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                    Mô tả chương trình
                                </label>
                                <textarea
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all h-24"
                                    placeholder="Nội dung khuyến mãi chi tiết..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Loại giảm giá</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                    >
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Giá trị giảm</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                            {formData.discountType === 'PERCENTAGE' ? '%' : 'đ'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tối đa giảm</label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        placeholder="Dành cho %"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <Clock size={14} /> Ngày bắt đầu
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <Clock size={14} /> Ngày kết thúc
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Đơn hàng tối thiểu</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Giới hạn sử dụng</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                        placeholder="0 = Không giới hạn"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    Xác nhận & Kích hoạt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
