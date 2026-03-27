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
    customerPhone = "",
    totalAmount = 320000,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "bank">(
    "card",
  );
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-40">
      {/* ══════════════════  HEADER  ══════════════════ */}
      <header
        className="bg-brand-dark pt-8 pb-20 px-8 relative overflow-hidden"
        style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="max-w-screen-md mx-auto relative z-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl tracking-tight">
              Thanh toán
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
              Xác nhận đơn hàng
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/20">
            <ShieldCheck className="w-6 h-6 text-brand-primary" />
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-6 -mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Payment Methods */}
        <div className="md:col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Phương thức thanh toán
              </h2>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <Clock className="w-4 h-4 text-brand-primary animate-pulse" />
                <span className="text-[12px] font-black text-slate-600 font-mono tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {[
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
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`w-full flex items-center gap-5 p-6 rounded-[28px] border-2 transition-all duration-300 ${
                    paymentMethod === method.id
                      ? "border-brand-primary bg-brand-primary/5 shadow-inner"
                      : "border-slate-50 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      paymentMethod === method.id
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <method.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`font-black tracking-tight text-base ${paymentMethod === method.id ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {method.label}
                    </p>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                      {method.sub}
                    </p>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === method.id
                        ? "border-brand-primary bg-brand-primary"
                        : "border-slate-200"
                    }`}
                  >
                    {paymentMethod === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-slate-50 rounded-[2rem] p-8 border border-white">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Số thẻ
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 font-black outline-none focus:border-brand-primary/30 focus:shadow-lg focus:shadow-brand-primary/5 transition-all font-mono"
                    placeholder="•••• •••• •••• ••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 font-black outline-none focus:border-brand-primary/30 transition-all font-mono"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Mã CVV
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 font-black outline-none focus:border-brand-primary/30 transition-all font-mono"
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
          <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-dark/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/30 transition-colors" />
            <h3 className="text-xl font-black mb-10 tracking-tight">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                  <User className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Hành khách
                  </p>
                  <p className="font-black text-base mt-0.5">{customerName}</p>
                  <p className="text-slate-400 text-xs font-bold tracking-tight">
                    {customerPhone}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                    Số ghế
                  </span>
                  <span className="font-black text-base">
                    {selectedSeats.length} Ghế
                  </span>
                </div>
                <div className="flex justify-between items-start mb-5">
                  <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">
                    Vị trí ghế
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[150px]">
                    {selectedSeats.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 bg-white/10 rounded-xl text-[11px] font-black border border-white/5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-8 border-t border-white/10">
                  <span className="text-xl font-black text-brand-primary tracking-tight">
                    Tổng tiền
                  </span>
                  <span className="text-3xl font-black tracking-tighter">
                    {new Intl.NumberFormat("vi-VN").format(totalAmount)} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary border border-brand-secondary/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <p className="text-[12px] text-slate-400 font-bold leading-relaxed">
              Giao dịch của bạn được bảo mật bằng mã hóa SSL. Chúng tôi không
              bao giờ lưu trữ chi tiết thẻ tín dụng của bạn.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-8 border-t border-slate-100 z-50 bg-white/80 backdrop-blur-2xl">
        <div className="max-w-screen-md mx-auto">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl ${
              isProcessing
                ? "bg-slate-800 text-white cursor-wait"
                : "bg-brand-primary hover:bg-brand-accent text-white shadow-brand-primary/30 hover:shadow-brand-accent/30 hover:-translate-y-1"
            }`}
          >
            {isProcessing ? (
              <>Vui lòng đợi...</>
            ) : (
              <>
                Xác nhận Thanh toán <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
