import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  MapPin,
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
const formatDateDDMMYYYY = (iso?: string) => {
  if (!iso) return "--/--/----";
  const d = new Date(iso);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-64">
      {/* Header */}
      <div
        className="bg-brand-dark pt-12 pb-20 px-8 relative overflow-hidden"
        style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl tracking-tight">
              Đặt vé
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
              Nhập thông tin hành khách
            </p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-8 py-12 -mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-8">
          {/* Customer Information */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              Thông tin hành khách
            </h3>
            <InputField
              label="Họ và tên"
              icon={User}
              placeholder="Nhập đầy đủ họ tên"
              value={customerName}
              onChange={setCustomerName}
            />
            <InputField
              label="Số điện thoại"
              icon={Phone}
              placeholder="Nhập số điện thoại liện hệ"
              type="tel"
              value={customerPhone}
              onChange={setCustomerPhone}
            />
            <InputField
              label="Email"
              icon={Mail}
              placeholder="Nhập địa chỉ email nhận vé"
              type="email"
              value={customerEmail}
              onChange={setCustomerEmail}
            />
            <InputField
              label="Ghi chú"
              icon={StickyNote}
              placeholder="Yêu cầu đặc biệt hoặc ghi chú thêm..."
              value={note}
              onChange={setNote}
              multiline
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          {/* Route Summary */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
            <span className="text-brand-primary text-[11px] font-black uppercase tracking-[0.2em] mb-4 bg-brand-primary/10 px-3 py-1 rounded-lg border border-brand-primary/10 inline-block">
              {routeData.routeCode}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">
              {routeData.origin} <span className="text-slate-300 mx-1">→</span>{" "}
              {routeData.destination}
            </h2>

            <div className="flex items-center gap-8 mb-8">
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatTimeHHmm(routeData.plannedStartTime)}
                </div>
                <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                  Đi
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">
                  {durationText(
                    routeData.plannedStartTime,
                    routeData.plannedEndTime,
                  )}
                </div>
                <div className="w-full h-[2px] bg-slate-100 rounded-full relative">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                </div>
                <div className="text-[11px] text-slate-400 font-black mt-2 tracking-tighter">
                  {formatDateDDMMYYYY(routeData.plannedStartTime)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatTimeHHmm(routeData.plannedEndTime)}
                </div>
                <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                  Đến
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Điểm đón
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <span className="font-black text-slate-900 text-sm tracking-tight">
                    {routeData.pickupBranch || "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Xe vận hành
                </p>
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-brand-secondary" />
                  <span className="font-black text-slate-900 text-sm tracking-tight">
                    {formatVehicleType(routeData.vehicleType)} •{" "}
                    {routeData.vehiclePlate || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center justify-between">
              Vị trí ghế đã chọn
              <span className="text-brand-primary text-sm font-black bg-brand-primary/10 px-3 py-1 rounded-lg">
                {selectedSeats.length} Ghế
              </span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {selectedSeats.length === 0 ? (
                <p className="text-slate-400 font-bold">Chưa chọn chỗ ngồi</p>
              ) : (
                selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="px-5 py-2.5 bg-brand-primary/10 text-brand-primary font-black rounded-xl border border-brand-primary/10 text-base shadow-sm"
                  >
                    {seat}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-brand-dark rounded-[2.5rem] p-10 shadow-2xl shadow-brand-dark/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/30 transition-colors" />
            <h3 className="text-xl font-black mb-8 tracking-tight">
              Chi tiết thanh toán
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold text-sm uppercase tracking-widest">
                  Số lượng ghế
                </span>
                <span className="font-black text-white text-base">
                  x {selectedSeats.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold text-sm uppercase tracking-widest">
                  Đơn giá
                </span>
                <span className="font-black text-white text-base">
                  {formatVnd(unitPrice)}
                </span>
              </div>
              <div className="pt-6 mt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xl font-black text-slate-300 tracking-tight">
                  Tổng cộng
                </span>
                <span className="text-4xl font-black text-brand-primary tracking-tighter">
                  {formatVnd(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-8 border-t border-slate-100 z-50 bg-white/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl px-8 py-4 flex-1 w-full md:w-auto flex justify-between items-center shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <User className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Hành khách
                </p>
                <p className="text-slate-900 font-black text-lg mt-0.5 tracking-tight">
                  {customerName.trim().length > 0
                    ? customerName
                    : "Chưa nhập tên"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tổng thanh toán
              </p>
              <p className="text-brand-primary font-black text-2xl mt-0.5 tracking-tighter">
                {formatVnd(totalAmount)}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canContinue}
            className={`w-full md:w-80 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl ${
              canContinue
                ? "bg-brand-primary hover:bg-brand-accent text-white shadow-brand-primary/30 hover:shadow-brand-accent/30 hover:-translate-y-1"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            Tiếp tục thanh toán <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
