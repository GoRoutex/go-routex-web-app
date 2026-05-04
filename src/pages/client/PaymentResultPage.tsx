import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, Home, Calendar, ArrowRight, Download, Share2 } from "lucide-react";

export default function PaymentResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    // Status can be passed via state or query params
    const status = location.state?.status || queryParams.get("status") || "PAID";
    const bookingCode = location.state?.bookingCode || queryParams.get("bookingCode") || "N/A";
    const amount = location.state?.amount || queryParams.get("amount") || 0;

    const isSuccess = status === "PAID";

    const formatVnd = (val: number | string) => {
        const num = typeof val === 'string' ? parseInt(val) : val;
        return new Intl.NumberFormat("vi-VN").format(num) + "đ";
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans">
            <div className="max-w-[500px] w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                    {/* Header Section */}
                    <div className={`pt-12 pb-8 px-8 text-center ${isSuccess ? 'bg-gradient-to-b from-emerald-50/50 to-transparent' : 'bg-gradient-to-b from-rose-50/50 to-transparent'}`}>
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform hover:scale-105 duration-300 ${isSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                            {isSuccess ? (
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            ) : (
                                <XCircle className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h1 className={`text-2xl font-black mb-2 tracking-tight ${isSuccess ? 'text-emerald-900' : 'text-rose-900'}`}>
                            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {isSuccess 
                                ? 'Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của GoRoutex' 
                                : 'Đã có lỗi xảy ra trong quá trình xử lý giao dịch'}
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 pb-10">
                        <div className="bg-slate-50/50 rounded-2xl p-6 mb-8 border border-slate-100">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Mã đơn hàng</span>
                                    <span className="text-slate-900 font-bold font-mono">{bookingCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Số tiền thanh toán</span>
                                    <span className={`font-black text-lg ${isSuccess ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {formatVnd(amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-medium">Thời gian</span>
                                    <span className="text-slate-700 font-semibold text-sm">
                                        {new Date().toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Trạng thái</span>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                        isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {isSuccess ? 'Đã thanh toán' : 'Thất bại'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 gap-3">
                            {isSuccess ? (
                                <>
                                    <button 
                                        onClick={() => navigate("/profile")}
                                        className="w-full bg-brand-primary hover:bg-brand-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/25 active:scale-[0.98]"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Xem vé của tôi
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                                            <Download className="w-4 h-4" />
                                            Tải hóa đơn
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            Chia sẻ
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    Thử lại thanh toán
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                            
                            <button 
                                onClick={() => navigate("/")}
                                className="w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Quay về trang chủ
                            </button>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="h-2 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary opacity-20"></div>
                </div>
                
                <p className="mt-8 text-center text-slate-400 text-xs font-medium px-4 leading-relaxed">
                    Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ <span className="text-brand-primary font-bold">1900 1234</span> hoặc gửi email tới <span className="text-brand-primary font-bold">support@routex.vn</span>
                </p>
            </div>
        </div>
    );
}
