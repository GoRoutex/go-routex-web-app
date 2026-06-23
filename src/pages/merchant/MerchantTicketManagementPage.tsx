import React, { useState, useEffect, useCallback } from "react";
import { Ticket as TicketIcon, Search, Filter, Download, MoreHorizontal, User, Smartphone, X, Loader2, Save, Mail, CreditCard, Calendar, MapPin, Hash } from "lucide-react";
import { toast } from "react-toastify";
import { TICKET_ENDPOINTS } from "../../utils/api-constants";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import { Pagination } from "../../Components/common/Pagination";
import { useNavigate } from "react-router-dom";

interface TicketItem {
    id: string;
    ticketId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    routeName: string;
    seatNumber: string;
    price: number;
    status: string;
    departureTime?: string;
    issuedAt?: string;
    bookingCode: string;
}

interface PaginationInfo {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export function MerchantTicketManagementPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const pageSize = 10;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        status: ""
    });

    const fetchTickets = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            const meta = createRequestMeta();
            
            const params = new URLSearchParams();
            params.append("page", pageNumber.toString());
            params.append("size", pageSize.toString());
            if (statusFilter) params.append("status", statusFilter);
            if (monthFilter) params.append("month", monthFilter);
            
            let url = "";
            if (searchTerm) {
                params.append("keyword", searchTerm);
                url = `${TICKET_ENDPOINTS.SEARCH}?${params.toString()}`;
            } else {
                url = `${TICKET_ENDPOINTS.FETCH}?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'accept': '*/*'
                }
            });
            const result = await response.json();
            if (result.data) {
                setTickets(result.data.items || []);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách vé");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, monthFilter, searchTerm]);

    useEffect(() => {
        fetchTickets(page);
    }, [page, fetchTickets]);

    const handleOpenEdit = async (ticketId: string) => {
        try {
            const meta = createRequestMeta();
            const response = await fetch(`${TICKET_ENDPOINTS.DETAIL}?ticketId=${ticketId}`, {
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'accept': '*/*'
                }
            });
            const result = await response.json();
            if (result.data) {
                setSelectedTicket(result.data);
                setEditFormData({
                    customerName: result.data.customerName || "",
                    customerPhone: result.data.customerPhone || "",
                    customerEmail: result.data.customerEmail || "",
                    status: result.data.status || ""
                });
                setIsEditModalOpen(true);
            }
        } catch (error) {
            toast.error("Không thể tải chi tiết vé");
        }
    };

    const handleUpdateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                data: {
                    ticketId: selectedTicket.ticketId,
                    ...editFormData
                }
            };

            const response = await fetch(TICKET_ENDPOINTS.UPDATE, {
                method: "POST",
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    "Content-Type": "application/json",
                    "accept": "*/*"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Cập nhật thông tin vé thành công");
                setIsEditModalOpen(false);
                fetchTickets(page);
            } else {
                toast.error("Cập nhật thất bại");
            }
        } catch (error) {
            toast.error("Lỗi hệ thống khi cập nhật vé");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-600';
            case 'ISSUED': return 'bg-blue-50 text-blue-600';
            case 'CANCELLED': return 'bg-red-50 text-red-600';
            case 'PENDING': return 'bg-orange-50 text-orange-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PAID': return 'Đã thanh toán';
            case 'ISSUED': return 'Đã xuất vé';
            case 'CANCELLED': return 'Đã hủy';
            case 'PENDING': return 'Chờ thanh toán';
            default: return status;
        }
    };
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Quản lý vé & Đặt chỗ</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi danh sách vé bán ra và trạng thái đặt chỗ của khách hàng.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-2xl font-bold border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                        <Download size={18} />
                        Xuất báo cáo
                    </button>
                    <button 
                        onClick={() => navigate("/merchant/quick-booking")}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <TicketIcon size={18} />
                        Bán vé tại chỗ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng số vé', value: pagination?.totalElements?.toString() || '0', color: 'text-slate-900' },
                    { label: 'Số trang', value: pagination?.totalPages?.toString() || '0', color: 'text-emerald-500' },
                    { label: 'Bản ghi trên trang', value: tickets.length.toString(), color: 'text-orange-500' },
                    { label: 'Trang hiện tại', value: page.toString(), color: 'text-brand-primary' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm tên khách, số điện thoại, mã vé..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <Calendar size={18} className="text-slate-400" />
                            <input
                                type="month"
                                className="bg-transparent border-none text-sm outline-none focus:ring-0 text-slate-600 font-bold p-0"
                                value={monthFilter}
                                onChange={(e) => {
                                    setMonthFilter(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <Filter size={18} className="text-slate-400" />
                            <select
                                className="bg-transparent border-none text-sm outline-none focus:ring-0 text-slate-600 font-bold p-0 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ISSUED">Đã xuất vé</option>
                                <option value="CHECKED_IN">Đã check-in</option>
                                <option value="BOARDED">Đã lên xe</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                                <option value="EXPIRED">Đã hết hạn</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã vé</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tuyến / Ghế</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Giá tiền</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold">Không có dữ liệu vé</td>
                                </tr>
                            ) : (
                                tickets.map((t, idx) => (
                                    <tr key={t.ticketId || t.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 text-sm font-black text-brand-primary">
                                            <div className="flex flex-col">
                                                <span>#{t.ticketId?.substring(0, 8).toUpperCase() || t.id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{t.bookingCode || 'No Code'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5"><User size={12} className="text-slate-400" /> {t.customerName}</div>
                                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><Smartphone size={12} className="text-slate-300" /> {t.customerPhone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-bold text-slate-700">{t.routeName}</div>
                                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ghế: {t.seatNumber}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-900">{formatCurrency(t.price)}</td>
                                        <td className="px-6 py-5 text-xs font-bold text-slate-500">
                                            {(t.departureTime || t.issuedAt)
                                                ? new Date(t.departureTime || t.issuedAt || '').toLocaleString('vi-VN')
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(t.status)}`}>
                                                {getStatusText(t.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleOpenEdit(t.ticketId)}
                                                className="text-slate-400 hover:text-brand-primary p-2 rounded-lg hover:bg-slate-100 transition-all"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalElements || 0}
                    onPageChange={setPage}
                    itemLabel="vé"
                />
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết & Cập nhật vé</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mã vé: {selectedTicket.ticketId || selectedTicket.id || 'N/A'}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTicket} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Tên khách hàng</label>
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-brand-primary/20 transition-all"
                                            value={editFormData.customerName}
                                            onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Số điện thoại</label>
                                    <div className="relative group">
                                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-brand-primary/20 transition-all"
                                            value={editFormData.customerPhone}
                                            onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-brand-primary/20 transition-all"
                                            value={editFormData.customerEmail}
                                            onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Trạng thái vé</label>
                                    <div className="relative group">
                                        <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                        <select
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-brand-primary/20 transition-all appearance-none"
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        >
                                            <option value="PENDING">Chờ thanh toán</option>
                                            <option value="PAID">Đã thanh toán</option>
                                            <option value="ISSUED">Đã xuất vé</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl grid grid-cols-2 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuyến đường</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                        <MapPin size={14} className="text-brand-primary" />
                                        {selectedTicket.routeName}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số ghế</p>
                                    <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
                                        <Hash size={14} className="text-brand-primary" />
                                        {selectedTicket.seatNumber}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giờ khởi hành / Phát hành</p>
                                    <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
                                        <Calendar size={14} className="text-brand-primary" />
                                        {(selectedTicket.departureTime || selectedTicket.issuedAt)
                                            ? new Date(selectedTicket.departureTime || selectedTicket.issuedAt || '').toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá vé</p>
                                    <div className="text-brand-primary font-black text-sm">
                                        {formatCurrency(selectedTicket.price)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <div className="flex items-center justify-center gap-2">
                                            <Save size={18} />
                                            Lưu thay đổi
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
