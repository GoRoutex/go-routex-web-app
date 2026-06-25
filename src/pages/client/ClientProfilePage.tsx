import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Ticket,
    Lock,
    LogOut,
    Camera,
    Search,
    ChevronRight,
    Loader2,
    X,
    MapPin,
    Calendar,
    CreditCard,
    CheckCircle,
} from "lucide-react";
import { ClientAvatar } from "../../Components/client/ClientAvatar";
import { API_BASE_URL, PROFILE_ME_URL } from "../../utils/api";
import {
    extractMyProfileSnapshot,
    type GetMyProfileSnapshot,
} from "../../utils/responseExtractors";
import { logout } from "../../utils/auth";

type TabType = "account" | "history" | "wallet" | "password";

export default function ClientProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("account");
    const [profile, setProfile] = useState<GetMyProfileSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [tickets, setTickets] = useState<any[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [searchCode, setSearchCode] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal states
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [ticketDetail, setTicketDetail] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                navigate("/login");
                return;
            }
            try {
                const token = localStorage.getItem("authToken");
                const headers: Record<string, string> = {};
                if (token && token.trim().length > 0) {
                    headers["Authorization"] = `Bearer ${token.trim()}`;
                }
                const response = await fetch(`${API_BASE_URL}${PROFILE_ME_URL}?userId=${userId}`, {
                    headers
                });
                if (response.ok) {
                    const body = await response.json();
                    setProfile(extractMyProfileSnapshot(body));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        void logout();
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchTickets();
        }
    }, [activeTab, page]);

    const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
            const token = localStorage.getItem("authToken");
            let url = `${API_BASE_URL}merchant-service/client/tickets?page=${page}&size=10`;
            if (searchCode.trim()) {
                url += `&ticketCode=${encodeURIComponent(searchCode.trim())}`;
            }
            if (filterDate) {
                const fromDate = `${filterDate}T00:00:00+07:00`;
                const toDate = `${filterDate}T23:59:59+07:00`;
                url += `&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
            }

            const headers: Record<string, string> = {
                "accept": "application/json",
            };
            if (token && token.trim().length > 0) {
                headers["Authorization"] = `Bearer ${token.trim()}`;
            }

            const response = await fetch(url, {
                headers
            });
            
            if (response.ok) {
                const result = await response.json();
                const payload = result.data || result;
                if (payload.items) {
                    setTickets(payload.items);
                    setTotalPages(payload.pagination?.totalPages || 1);
                } else if (payload.content) {
                    setTickets(payload.content);
                    setTotalPages(payload.totalPages || 1);
                } else if (Array.isArray(payload)) {
                    setTickets(payload);
                    setTotalPages(1);
                } else {
                    setTickets([]);
                }
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const fetchTicketDetail = async (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setLoadingDetail(true);
        setTicketDetail(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers: Record<string, string> = {
                "accept": "application/json",
            };
            if (token && token.trim().length > 0) {
                headers["Authorization"] = `Bearer ${token.trim()}`;
            }

            const response = await fetch(`${API_BASE_URL}merchant-service/client/tickets/${ticketId}`, {
                headers
            });
            if (response.ok) {
                const result = await response.json();
                setTicketDetail(result.data || result);
            }
        } catch (error) {
            console.error("Error fetching ticket detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50" data-loading={isLoading}>
            <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans pb-20 pt-8 lg:pt-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-2 space-y-1">
                                {[
                                    { id: "account", label: "Thông tin tài khoản", icon: User },
                                    { id: "history", label: "Lịch sử mua vé", icon: Ticket },
                                    { id: "password", label: "Đặt lại mật khẩu", icon: Lock },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as TabType)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                                            activeTab === item.id 
                                                ? "bg-brand-primary/5 text-brand-primary" 
                                                : "text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        <item.icon size={20} className={`transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-brand-primary" : "text-slate-400"}`} />
                                        <span className={`text-[15px] font-medium ${activeTab === item.id ? "font-bold" : ""}`}>
                                            {item.label}
                                        </span>
                                        {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
                                    </button>
                                ))}

                                <div className="h-[1px] bg-slate-100 my-2 mx-4"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-rose-50 text-slate-500 hover:text-rose-600 group"
                                >
                                    <LogOut size={20} className="text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[15px] font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 min-h-[600px]">

                            {/* ACCOUNT INFO TAB */}
                            {activeTab === "account" && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="mb-10">
                                        <h2 className="text-2xl font-black text-slate-900 mb-1">Thông tin tài khoản</h2>
                                        <p className="text-slate-400 text-sm font-medium">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                                    </div>

                                    <div className="flex flex-col items-center mb-12">
                                        <div className="relative group">
                                            <ClientAvatar
                                                name={profile?.fullName}
                                                avatarUrl={profile?.avatarUrl}
                                                size="lg"
                                                className="w-32 h-32 ring-4 ring-slate-50 shadow-sm"
                                            />
                                            <button className="absolute bottom-1 right-1 w-9 h-9 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center text-slate-500 hover:text-brand-primary transition-colors">
                                                <Camera size={18} />
                                            </button>
                                        </div>
                                        <button className="mt-6 px-6 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                            Chọn ảnh
                                        </button>
                                        <p className="mt-3 text-[11px] text-slate-400 font-medium text-center">Dụng lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG</p>
                                    </div>

                                    <div className="max-w-2xl mx-auto space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Họ và tên :</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.fullName}
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Số điện thoại :</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.phone || profile?.phoneNumber}
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Giới tính :</label>
                                            <select className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all appearance-none">
                                                <option value="MALE">Nam</option>
                                                <option value="FEMALE">Nữ</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Email :</label>
                                            <input
                                                type="email"
                                                defaultValue={profile?.email}
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Ngày sinh :</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    defaultValue={profile?.dob?.split('T')[0]}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Địa chỉ :</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.address}
                                                placeholder="Nhập địa chỉ"
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white outline-none font-semibold text-slate-800 transition-all"
                                            />
                                        </div>

                                        <div className="pt-8 flex justify-center">
                                            <button className="px-16 py-4 bg-brand-primary hover:bg-brand-accent text-white font-black rounded-full shadow-lg shadow-brand-primary/25 transition-all active:scale-95">
                                                Cập nhật
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* HISTORY TAB */}
                            {activeTab === "history" && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-slate-900 mb-1">Lịch sử mua vé</h2>
                                            <p className="text-slate-500 text-sm font-medium">Theo dõi và quản lý quá trình lịch sử mua vé của bạn</p>
                                        </div>
                                        <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                                            <Ticket size={18} />
                                            Đặt vé mới
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Mã vé</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    type="text" 
                                                    value={searchCode}
                                                    onChange={(e) => setSearchCode(e.target.value)}
                                                    placeholder="Nhập mã vé" 
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-brand-primary transition-all text-sm outline-none shadow-sm" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Thời gian</label>
                                            <input 
                                                type="date" 
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-brand-primary transition-all text-sm outline-none shadow-sm" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Tuyến đường</label>
                                            <select className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-brand-primary transition-all text-sm outline-none shadow-sm appearance-none">
                                                <option>Tất cả tuyến</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                onClick={() => { setPage(1); fetchTickets(); }}
                                                className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                {loadingTickets ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                                Tìm kiếm
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-2xl border border-slate-100 relative">
                                        {loadingTickets && (
                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-brand-primary" size={32} />
                                            </div>
                                        )}
                                        <table className="w-full text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mã vé</th>
                                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tuyến đường</th>
                                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ngày đi</th>
                                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Số tiền</th>
                                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {tickets.length > 0 ? tickets.map((item) => {
                                                    let routeName = "Chưa có thông tin tuyến";
                                                    if (item.originName && item.destinationName) {
                                                        routeName = `${item.originName} - ${item.destinationName}`;
                                                    } else if (item.pickupAddress && item.dropOffAddress) {
                                                        routeName = `${item.pickupAddress} - ${item.dropOffAddress}`;
                                                    } else if (item.routeInfo || item.route) {
                                                        routeName = item.routeInfo || `${item.route.originName || ''} - ${item.route.destinationName || ''}`;
                                                    }
                                                    
                                                    const departureStr = item.issuedAt || item.departureTime || item.departureDate || "N/A";
                                                    const price = item.price ?? item.totalPrice ?? item.amount ?? 0;
                                                    
                                                    let statusColors = "bg-slate-100 text-slate-700";
                                                    let statusText = item.status || "N/A";
                                                    if (item.status === "ISSUED" || item.status === "CHECKED_IN" || item.status === "BOARDED" || item.status === "COMPLETED" || item.status === "PAID") {
                                                        statusColors = "bg-emerald-50 text-emerald-600 border border-emerald-200/50";
                                                        statusText = "Thành công";
                                                    } else if (item.status === "PENDING" || item.status === "UNPAID") {
                                                        statusColors = "bg-amber-50 text-amber-600 border border-amber-200/50";
                                                        statusText = "Chờ thanh toán";
                                                    } else if (item.status === "CANCELLED") {
                                                        statusColors = "bg-rose-50 text-rose-600 border border-rose-200/50";
                                                        statusText = "Đã hủy";
                                                    }

                                                    return (
                                                        <tr 
                                                            key={item.id || item.ticketCode} 
                                                            onClick={() => fetchTicketDetail(item.id || item.ticketId)}
                                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                                        >
                                                            <td className="px-5 py-4 font-mono text-sm font-semibold text-brand-primary group-hover:underline">{item.ticketCode}</td>
                                                            <td className="px-5 py-4 font-medium text-slate-700 text-sm max-w-[200px] truncate">{routeName}</td>
                                                            <td className="px-5 py-4 font-medium text-slate-500 text-sm">{departureStr !== "N/A" ? new Date(departureStr).toLocaleString("vi-VN") : "N/A"}</td>
                                                            <td className="px-5 py-4 font-semibold text-slate-900 text-sm">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${statusColors}`}>
                                                                    {statusText}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                                                            Không tìm thấy vé nào phù hợp.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination (Simple) */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-6 gap-2">
                                            <button 
                                                disabled={page <= 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                            >
                                                Trước
                                            </button>
                                            <span className="px-4 py-2 text-sm font-bold text-slate-900 flex items-center">
                                                Trang {page} / {totalPages}
                                            </span>
                                            <button 
                                                disabled={page >= totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PASSWORD TAB */}
                            {activeTab === "password" && (
                                <div className="animate-in fade-in duration-500 max-w-xl mx-auto py-10">
                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Đặt lại mật khẩu</h2>
                                        <p className="text-slate-500 text-sm font-medium italic">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                                    </div>

                                    <div className="text-center mb-12">
                                        <p className="text-slate-900 font-semibold text-2xl tracking-tighter">
                                            (+84) {profile?.phone?.slice(-9) || "0707071118"}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 px-1">Mật khẩu cũ <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập mật khẩu cũ" className="w-full px-5 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-semibold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 px-1">Mật khẩu mới <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập mật khẩu mới" className="w-full px-5 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-semibold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 px-1">Xác nhận mật khẩu <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full px-5 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-semibold" />
                                        </div>

                                        <div className="pt-10 flex gap-4">
                                            <button className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-all">Hủy</button>
                                            <button className="flex-1 py-3.5 bg-brand-primary text-white font-semibold rounded-lg shadow-sm hover:bg-brand-accent transition-all">Xác nhận</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicketId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Chi Tiết Vé</h3>
                                {ticketDetail && (
                                    <p className="text-sm font-mono font-semibold text-brand-primary mt-1">{ticketDetail.ticketCode}</p>
                                )}
                            </div>
                            <button 
                                onClick={() => setSelectedTicketId(null)}
                                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                            {loadingDetail ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                                    <p className="text-sm font-bold text-slate-500">Đang tải thông tin vé...</p>
                                </div>
                            ) : ticketDetail ? (
                                <div className="space-y-6">
                                    {/* Route Info */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Thông tin tuyến</h4>
                                                <p className="text-xs font-medium text-slate-500">
                                                    {(ticketDetail.originName && ticketDetail.destinationName) 
                                                        ? `${ticketDetail.originName} - ${ticketDetail.destinationName}` 
                                                        : (ticketDetail.pickupAddress && ticketDetail.dropOffAddress)
                                                            ? `${ticketDetail.pickupAddress} - ${ticketDetail.dropOffAddress}`
                                                            : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Khởi hành</p>
                                                <p className="font-semibold text-slate-800 text-sm">
                                                    {(ticketDetail.issuedAt || ticketDetail.departureTime) 
                                                        ? new Date(ticketDetail.issuedAt || ticketDetail.departureTime).toLocaleString("vi-VN") 
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Thời gian di chuyển</p>
                                                <p className="font-semibold text-slate-800 text-sm">
                                                    {ticketDetail.duration 
                                                        ? `${Math.floor(ticketDetail.duration / 60)}h ${ticketDetail.duration % 60}m` 
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Điểm đón</p>
                                                <p className="font-semibold text-slate-800 text-sm">{ticketDetail.originDepartmentName || ticketDetail.pickupAddress || ticketDetail.pickupLocation || ticketDetail.boardingPoint || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Điểm trả</p>
                                                <p className="font-semibold text-slate-800 text-sm">{ticketDetail.destinationDepartmentName || ticketDetail.dropOffAddress || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Passenger & Seats */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Thông tin hành khách</h4>
                                                <p className="text-xs font-medium text-slate-500">Người đặt vé & Vị trí ghế</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                            <div className="col-span-2 sm:col-span-1">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Họ tên</p>
                                                <p className="font-semibold text-slate-800 text-sm">{ticketDetail.customerName || ticketDetail.passengerName || "N/A"}</p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                                                <p className="font-semibold text-slate-800 text-sm">{ticketDetail.customerPhone || ticketDetail.passengerPhone || "N/A"}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="font-semibold text-slate-800 text-sm">{ticketDetail.customerEmail || ticketDetail.passengerEmail || "N/A"}</p>
                                            </div>
                                            <div className="col-span-2 pt-2">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Số ghế</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {ticketDetail.seatNumber ? (
                                                        <span className="px-3 py-1 bg-slate-100 rounded-md text-sm font-semibold text-slate-700">
                                                            {ticketDetail.seatNumber}
                                                        </span>
                                                    ) : Array.isArray(ticketDetail.seats) ? ticketDetail.seats.map((seat: any) => (
                                                        <span key={seat.id || seat} className="px-3 py-1 bg-slate-100 rounded-md text-sm font-semibold text-slate-700">
                                                            {seat.seatNumber || seat}
                                                        </span>
                                                    )) : (
                                                        <span className="px-3 py-1 bg-slate-100 rounded-md text-sm font-semibold text-slate-700">
                                                            N/A
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">Thông tin thanh toán</h4>
                                                <p className="text-xs font-medium text-slate-500">Trạng thái & Giá vé</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                                                <p className="font-bold text-brand-primary text-2xl">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketDetail.price ?? ticketDetail.totalPrice ?? 0)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                                                <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide border ${
                                                    (ticketDetail.status === "ISSUED" || ticketDetail.status === "CHECKED_IN" || ticketDetail.status === "BOARDED" || ticketDetail.status === "COMPLETED") 
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" 
                                                        : (ticketDetail.status === "CANCELLED") 
                                                            ? "bg-rose-50 text-rose-600 border-rose-200/50" 
                                                            : "bg-amber-50 text-amber-600 border-amber-200/50"
                                                }`}>
                                                    {(ticketDetail.status === "ISSUED" || ticketDetail.status === "CHECKED_IN" || ticketDetail.status === "BOARDED" || ticketDetail.status === "COMPLETED") ? "Thành công" :
                                                     ticketDetail.status === "CANCELLED" ? "Đã hủy" : "Chờ thanh toán"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <p className="text-sm font-bold text-slate-500">Không thể tải thông tin vé.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
