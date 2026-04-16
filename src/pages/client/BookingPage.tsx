import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  StickyNote,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StopPoint = {
  id: string;
  stopOrder: string;
  routeId: string;
  plannedArrivalTime?: string;
  plannedDepartureTime?: string;
  note?: string;
};

type RouteItem = {
  id: string;
  pickupBranch?: string | null;
  origin: string;
  destination: string;
  availableSeats?: number | null;
  plannedStartTime: string;
  plannedEndTime: string;
  routeCode: string;
  vehiclePlate?: string | null;
  vehicleType?: string | null;
  seatCapacity?: number | null;
  stopPoints?: StopPoint[] | null;
  price?: number | null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatTimeHHmm = (iso?: string) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const durationText = (s?: string, e?: string) => {
  if (!s || !e) return "--";
  const diff = Math.max(0, new Date(e).getTime() - new Date(s).getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
const formatVnd = (v?: number | null) => {
  if (typeof v !== "number") return "—";
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫";
};

const formatVehicleType = (value?: string | null) => {
  if (!value) return "Xe khách";
  const normalized = value.trim().toUpperCase();
  if (normalized === "LIMOUSINE") return "Xe limousine";
  if (normalized === "SLEEPER") return "Xe giường nằm";
  if (normalized === "STANDARD" || normalized === "COACH") return "Xe tiêu chuẩn";
  if (normalized === "PREMIUM") return "Xe cao cấp";
  return value;
};

const mockRouteData: RouteItem = {
  id: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
  pickupBranch: "233 Điện Biên Phủ",
  origin: "Hà Nội",
  destination: "Hải Phòng",
  availableSeats: 32,
  plannedStartTime: "2026-03-04T07:30:00Z",
  plannedEndTime: "2026-03-04T13:30:00Z",
  routeCode: "HAN-HPH-06",
  vehiclePlate: "51B-123.45",
  vehicleType: "LIMOUSINE",
  seatCapacity: 34,
  price: 320000,
  stopPoints: [],
};

const InputField = ({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  multiline,
}: {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
      {label}
    </label>
    <div className="flex items-start gap-5 p-5 bg-slate-50 border-2 border-slate-50 focus-within:border-brand-primary/30 focus-within:bg-white rounded-[1.5rem] transition-all duration-300 shadow-sm focus-within:shadow-xl focus-within:shadow-brand-primary/10 group">
      <div className="w-12 h-12 rounded-[1rem] bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5 border border-slate-100 group-focus-within:border-brand-primary/20 transition-all">
        <Icon className="w-6 h-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
      </div>
      {multiline ? (
        <textarea
          className="bg-transparent border-none focus:outline-none focus:ring-0 font-black text-slate-900 w-full resize-none placeholder:text-slate-300 placeholder:font-normal text-lg pt-2.5"
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="bg-transparent border-none focus:outline-none focus:ring-0 font-black text-slate-900 w-full placeholder:text-slate-300 placeholder:font-normal text-lg pt-2.5"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  </div>
);

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedRoute: RouteItem | undefined = location.state?.routeData;
  const passedSeats: string[] = location.state?.selectedSeats ?? [];
  const routeData = passedRoute ?? mockRouteData;
  const selectedSeats = passedSeats.length > 0 ? passedSeats : ["A1", "A2"];

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");

  const unitPrice = routeData.price ?? 0;
  const totalAmount = unitPrice * selectedSeats.length;
  const canContinue =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    selectedSeats.length > 0;

  const handleConfirm = () => {
    if (!canContinue) return;
    navigate("/payment", {
      state: {
        routeData,
        selectedSeats,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        note,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-40">
      {/* Header - Refined & Slimmer */}
      <div
        className="bg-slate-950 pt-4 pb-10 px-6 relative overflow-hidden"
        style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 translate-x-1/4 -translate-y-1/4" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-6 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 group backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight">
                Hoàn tất đặt vé
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Bước 2: Thông tin hành khách
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 -mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-10">
          {/* Customer Information - Slimmer Inputs */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/20 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">Thông tin người đặt</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <InputField
                label="Họ và tên hành khách"
                icon={User}
                placeholder="Nguyễn Văn A"
                value={customerName}
                onChange={setCustomerName}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Số điện thoại"
                  icon={Phone}
                  placeholder="09xx xxx xxx"
                  type="tel"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                />
                <InputField
                  label="Địa chỉ Email"
                  icon={Mail}
                  placeholder="example@gmail.com"
                  type="email"
                  value={customerEmail}
                  onChange={setCustomerEmail}
                />
              </div>
              <InputField
                label="Ghi chú thêm (Nếu có)"
                icon={StickyNote}
                placeholder="Yêu cầu về vị trí đón, đồ đạc..."
                value={note}
                onChange={setNote}
                multiline
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          {/* Route Summary - Compact */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl transition-colors" />
            <div className="mb-6">
              <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/10">
                {routeData.routeCode}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-8">
              {routeData.origin} <span className="text-slate-300 mx-1">→</span>{" "}
              {routeData.destination}
            </h2>

            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-50">
              <div className="text-left">
                <div className="text-xl font-black text-slate-950 tracking-tighter">
                  {formatTimeHHmm(routeData.plannedStartTime)}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Xuất phát</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-px bg-slate-100 relative">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                </div>
                <div className="text-[9px] text-slate-400 font-black mt-2 tracking-widest uppercase">
                  {durationText(routeData.plannedStartTime, routeData.plannedEndTime)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-950 tracking-tighter">
                  {formatTimeHHmm(routeData.plannedEndTime)}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dự kiến đến</div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí đã chọn</p>
                <div className="flex gap-1.5">
                  {selectedSeats.map(id => (
                    <span key={id} className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">{id}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại phương tiện</p>
                <span className="font-bold text-slate-950 text-xs tracking-tight">{formatVehicleType(routeData.vehicleType)}</span>
              </div>
            </div>
          </div>

          {/* Payment Detail - Elegant Dark */}
          <div className="bg-slate-950 rounded-[3rem] p-10 shadow-2xl shadow-slate-900/40 text-white relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
            <h3 className="text-lg font-black mb-8 tracking-tight">Chi tiết thanh toán</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-bold text-[11px] uppercase tracking-widest">Tổng {selectedSeats.length} vé</span>
                <span className="font-black text-white text-base">{formatVnd(totalAmount)}</span>
              </div>
              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-1.5">Thanh toán cuối</span>
                <span className="text-4xl font-black text-brand-primary tracking-tighter">
                  {formatVnd(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 animate-in slide-in-from-bottom-5 duration-700">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-[2.5rem] p-5 pr-5 flex flex-col md:flex-row items-center gap-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]">
          <div className="flex-1 flex items-center gap-10 px-4">
            <div className="hidden sm:flex items-center gap-4">
               <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <User size={20} className="text-brand-primary" />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hành khách</p>
                  <p className="text-slate-950 font-black text-sm tracking-tight">{customerName || 'Nhập tên...'}</p>
               </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-100" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền vé</p>
              <p className="text-2xl font-black text-slate-950 tracking-tighter">{formatVnd(totalAmount)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canContinue}
            className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 ${
              canContinue
                ? "bg-brand-primary hover:bg-brand-accent text-slate-950 shadow-brand-primary/20"
                : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
            }`}
          >
            Tiếp tục thanh toán
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
