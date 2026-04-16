import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Landmark,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";

type PaymentMethod = "card" | "momo" | "bank";

const paymentMethods: Array<{
  id: PaymentMethod
  label: string
  icon: typeof CreditCard
  sub: string
}> = [
  {
    id: "card",
    label: "Thẻ Tín dụng / Ghi nợ",
    icon: CreditCard,
    sub: "Visa, Mastercard, JCB",
  },
  {
    id: "momo",
    label: "Ví điện tử MoMo",
    icon: Wallet,
    sub: "Xử lý ngay lập tức",
  },
  {
    id: "bank",
    label: "Chuyển khoản Ngân hàng",
    icon: Landmark,
    sub: "Xác nhận thủ công",
  },
]

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from BookingPage - Defensive destructuring with defaults
  const {
    routeData = {
      origin: "Hà Nội",
      destination: "Hải Phòng",
      routeCode: "HAN-HPH-01",
      price: 320000,
    },
    selectedSeats = ["A1"],
    customerName = "Khách hàng",
    totalAmount = 320000,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total for payment
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 text-center shadow-2xl shadow-brand-primary/10 border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-brand-secondary flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-secondary/20 relative">
            <CheckCircle2 className="w-12 h-12 text-white" />
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 text-balance">
            Thanh toán thành công!
          </h2>
          <p className="text-slate-400 font-bold mb-8">
            Vé của bạn đã được xác nhận và gửi tới email.
          </p>

          <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 mb-8 border border-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Mã đơn hàng
              </span>
              <span className="text-slate-900 font-black font-mono">
                GRX-99812
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Lộ trình
              </span>
              <span className="text-slate-900 font-black text-sm">
                {routeData.origin} → {routeData.destination}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Chỗ ngồi
              </span>
              <span className="text-slate-900 font-black text-sm">
                {selectedSeats.join(", ")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                Đã thanh toán
              </span>
              <span className="text-brand-primary font-black text-lg">
                {new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-brand-dark hover:bg-brand-primary text-white py-4 rounded-2xl font-black transition-all shadow-lg hover:shadow-brand-primary/20"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-40">
      {/* Header - Refined & Slimmer */}
      <div
        className="bg-slate-950 pt-4 pb-10 px-6 relative overflow-hidden"
        style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 translate-x-1/4 -translate-y-1/4" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 group backdrop-blur-md"
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-white font-black text-2xl tracking-tight">Thanh toán</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Bước cuối: Xác nhận & Trả tiền</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md">
              <Clock className="w-4 h-4 text-brand-primary animate-pulse" />
              <span className="text-[12px] font-black text-white font-mono tracking-tighter">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-screen-lg mx-auto px-6 -mt-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Left: Payment Methods */}
        <div className="md:col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20 border border-slate-100">
            <h2 className="text-xl font-black text-slate-950 tracking-tight mb-8">Phương thức thanh toán</h2>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-5 p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                    paymentMethod === method.id
                      ? "border-brand-primary bg-brand-primary/5 shadow-inner"
                      : "border-slate-50 hover:border-slate-100 bg-white"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    paymentMethod === method.id
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-black tracking-tight text-sm ${paymentMethod === method.id ? "text-slate-950" : "text-slate-500"}`}>
                      {method.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{method.sub}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === method.id ? "border-brand-primary bg-brand-primary" : "border-slate-200"
                  }`}>
                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </div>
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-slate-50 rounded-[2rem] p-8 border border-white">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số thẻ tín dụng</label>
                  <input
                    type="text"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 font-black outline-none focus:border-brand-primary/30 transition-all font-mono text-sm"
                    placeholder="•••• •••• •••• ••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hết hạn</label>
                    <input
                      type="text"
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 font-black outline-none focus:border-brand-primary/30 transition-all font-mono text-sm"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC/CVV</label>
                    <input
                      type="text"
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 font-black outline-none focus:border-brand-primary/30 transition-all font-mono text-sm"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="md:col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
            <h3 className="text-lg font-black mb-10 tracking-tight">Chi tiết đơn hàng</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <User className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Khách hàng</p>
                  <p className="font-black text-sm mt-0.5">{customerName}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span>Chuyến đi</span>
                  <span className="text-white">{routeData.routeCode}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span>Số ghế ({selectedSeats.length})</span>
                  <span className="text-brand-primary">{selectedSeats.join(", ")}</span>
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1.5">Tổng thanh toán</span>
                  <span className="text-3xl font-black text-brand-primary tracking-tighter">
                    {new Intl.NumberFormat("vi-VN").format(totalAmount)} <span className="text-xs">₫</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              Dữ liệu của bạn được bảo mật tuyệt đối. Chúng tôi không lưu trữ thông tin thẻ.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Bottom Pay Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-screen-md z-50 animate-in slide-in-from-bottom-5 duration-700">
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className={`w-full md:h-16 py-5 md:py-0 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ${
            isProcessing
              ? "bg-slate-800 text-white cursor-wait"
              : "bg-brand-primary hover:bg-brand-accent text-slate-950 shadow-brand-primary/20 hover:scale-[1.02]"
          }`}
        >
          {isProcessing ? (
             <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
             </div>
          ) : (
            <>Xác nhận Thanh toán <ChevronRight size={22} /></>
          )}
        </button>
      </div>
    </div>
  );
}
