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

    // Mock data for History
    const [history] = useState([
        { id: "BK123456", route: "Sài Gòn - Đà Lạt", date: "20/05/2024", amount: "320.000đ", status: "Đã thanh toán" },
        { id: "BK789012", route: "Đà Lạt - Sài Gòn", date: "15/05/2024", amount: "320.000đ", status: "Hoàn thành" },
    ]);

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

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50" data-loading={isLoading}>
            <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F3F3F3] font-sans">
            {/* Top Banner (Optional, keeping it clean like Futa) */}
            <div className="h-48 bg-gradient-to-r from-brand-primary to-brand-accent relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-24 pb-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-2 space-y-1">
                                {[
                                    { id: "account", label: "Thông tin tài khoản", icon: User, color: "bg-orange-500" },
                                    { id: "history", label: "Lịch sử mua vé", icon: Ticket, color: "bg-blue-500" },
                                    { id: "password", label: "Đặt lại mật khẩu", icon: Lock, color: "bg-rose-500" },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as TabType)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${activeTab === item.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className={`text-[15px] font-bold ${activeTab === item.id ? "text-slate-900" : "text-slate-500"}`}>
                                            {item.label}
                                        </span>
                                        {activeTab === item.id && <ChevronRight size={16} className="ml-auto text-slate-400" />}
                                    </button>
                                ))}

                                <div className="h-[1px] bg-slate-100 my-2 mx-4"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:bg-rose-50 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-sm group-hover:scale-110">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="text-[15px] font-bold text-rose-600">Đăng xuất</span>
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
                                                className="w-36 h-36 ring-8 ring-slate-50 shadow-md"
                                            />
                                            <button className="absolute bottom-1 right-1 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary transition-colors">
                                                <Camera size={20} />
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
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Số điện thoại :</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.phone || profile?.phoneNumber}
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Giới tính :</label>
                                            <select className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all appearance-none">
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
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Ngày sinh :</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    defaultValue={profile?.dob?.split('T')[0]}
                                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-4">
                                            <label className="text-slate-500 font-bold text-sm md:text-right">Địa chỉ :</label>
                                            <input
                                                type="text"
                                                defaultValue={profile?.address}
                                                placeholder="Nhập địa chỉ"
                                                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-800 transition-all"
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
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">Lịch sử mua vé</h2>
                                            <p className="text-slate-400 text-sm font-medium">Theo dõi và quản lý quá trình lịch sử mua vé của bạn</p>
                                        </div>
                                        <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                                            <Ticket size={18} />
                                            Đặt vé mới
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Mã vé</label>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input type="text" placeholder="Nhập mã vé" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white transition-all text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Thời gian</label>
                                            <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white transition-all text-sm font-bold outline-none" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Tuyến đường</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white transition-all text-sm font-bold outline-none">
                                                <option>Tất cả tuyến</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Tìm kiếm</button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Mã vé</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Tuyến đường</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Ngày đi</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Số tiền</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {history.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-5 font-mono text-sm font-bold text-brand-primary">{item.id}</td>
                                                        <td className="px-6 py-5 font-bold text-slate-700 text-sm">{item.route}</td>
                                                        <td className="px-6 py-5 font-bold text-slate-500 text-sm">{item.date}</td>
                                                        <td className="px-6 py-5 font-black text-slate-900 text-sm">{item.amount}</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* PASSWORD TAB */}
                            {activeTab === "password" && (
                                <div className="animate-in fade-in duration-500 max-w-xl mx-auto py-10">
                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-black text-slate-900 mb-2">Đặt lại mật khẩu</h2>
                                        <p className="text-slate-400 text-sm font-medium italic">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                                    </div>

                                    <div className="text-center mb-12">
                                        <p className="text-slate-900 font-black text-2xl tracking-tighter">
                                            (+84) {profile?.phone?.slice(-9) || "0707071118"}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 px-1">Mật khẩu cũ <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập mật khẩu cũ" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 px-1">Mật khẩu mới <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập mật khẩu mới" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 px-1">Xác nhận mật khẩu <span className="text-rose-500">*</span></label>
                                            <input type="password" placeholder="Nhập lại mật khẩu mới" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-primary outline-none transition-all font-bold" />
                                        </div>

                                        <div className="pt-10 flex gap-4">
                                            <button className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">Hủy</button>
                                            <button className="flex-1 py-4 bg-brand-primary text-white font-black rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Xác nhận</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
