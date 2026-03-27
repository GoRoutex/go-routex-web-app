import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Armchair,
  CheckCircle2,
  ArrowRightLeft,
  User,
  LayoutDashboard,
  Search,
  TrendingUp,
  History as HistoryIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const POPULAR_ROUTES = [
  {
    from: "Hà Nội",
    to: "Hải Phòng",
    info: "Limousine • Up to 8 trips/day",
    price: "320,000 ₫",
  },
  {
    from: "Sài Gòn",
    to: "Nha Trang",
    info: "Sleeper bus • Overnight route",
    price: "280,000 ₫",
  },
  {
    from: "Đà Lạt",
    to: "Sài Gòn",
    info: "Premium coach • Morning departures",
    price: "240,000 ₫",
  },
  {
    from: "Hà Nội",
    to: "Đà Nẵng",
    info: "Express • Limited seats",
    price: "450,000 ₫",
  },
];

const GUIDELINES = [
  "Selected seats are held for 15 minutes before payment confirmation.",
  "Seat availability is synchronized in real time across all platforms.",
  "Vehicle assignment is managed automatically based on trip demand.",
];

const STATS = [
  { value: "120+", label: "Active Routes" },
  { value: "24/7", label: "Live Monitoring" },
  { value: "50k+", label: "Trips Completed" },
];

type FieldProps = {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}

const Field = ({ label, icon: Icon, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
      {label}
    </span>
    <div
      className="flex items-center gap-3 px-4 py-4 bg-slate-50 border border-slate-100
                      focus-within:border-brand-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-primary/5
                      rounded-2xl transition-all group cursor-text"
    >
      <Icon className="w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
      {children}
    </div>
  </div>
)

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [userName] = useState(() => localStorage.getItem("userName") || "");
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [searchData, setSearchData] = useState({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    seats: 1,
  });

  const handleSearch = () => {
    if (
      !searchData.originCity ||
      !searchData.destinationCity ||
      !searchData.departureDate
    ) {
      alert("Hãy nhập đủ thông tin tìm kiếm.");
      return;
    }
    navigate("/search-results", { state: { searchData } });
  };

  const patchRoute = (from: string, to: string) => {
    setSearchData((s) => ({ ...s, originCity: from, destinationCity: to }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-brand-primary/10">
      {/* ══════════════════  TOP NAV BAR  ══════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
              GO <span className="text-brand-primary">ROUTEX</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {["Trang chủ", "Tuyến đường", "Lịch trình", "Hỗ trợ"].map(
              (l, i) => (
                <button
                  key={l}
                  onClick={() => {
                    if (i === 0) navigate("/");
                    if (i === 1) navigate("/routes");
                    if (i === 2) navigate("/schedules");
                    if (i === 3) navigate("/support");
                  }}
                  className={`text-sm font-semibold transition-all relative py-2 ${i === 0 ? "text-brand-primary" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {l}
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />
                  )}
                </button>
              ),
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors px-4 py-2 rounded-xl hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" /> Quản lý hệ thống
                </button>
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 flex items-center justify-center overflow-hidden border-2 border-white">
                    <User className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-slate-900 text-sm font-bold">
                    {userName || "Chào bạn"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════  HERO SECTION  ══════════════════ */}
      <section className="relative pt-12 pb-24 px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16 px-4">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 px-4 py-1.5 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-brand-primary text-xs font-black uppercase tracking-wider">
                Hơn 1,000+ chuyến xe mỗi ngày
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Khám phá hành trình mới
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                Cùng Go Routex
              </span>
            </h1>

            <p className="text-slate-500 text-lg lg:text-xl max-w-2xl leading-relaxed">
              Dịch vụ đặt vé xe liên tỉnh hiện đại nhất.{" "}
              <br className="hidden md:block" />
              Nhanh chóng - Tiện lợi - An toàn trong từng chuyến đi.
            </p>
          </div>

          {/* ─── MODERN SEARCH BAR ─── */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-white p-2 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-2 p-4">
                {/* Search Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-[4]">
                  <Field label="Điểm đi" icon={Bus}>
                    <input
                      type="text"
                      placeholder="Tỉnh, thành phố..."
                      className="bg-transparent border-none focus:outline-none text-base font-bold text-slate-900 w-full placeholder:text-slate-300 placeholder:font-normal"
                      value={searchData.originCity}
                      onChange={(e) =>
                        setSearchData((s) => ({
                          ...s,
                          originCity: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field label="Điểm đến" icon={MapPin}>
                    <input
                      type="text"
                      placeholder="Tỉnh, thành phố..."
                      className="bg-transparent border-none focus:outline-none text-base font-bold text-slate-900 w-full placeholder:text-slate-300 placeholder:font-normal"
                      value={searchData.destinationCity}
                      onChange={(e) =>
                        setSearchData((s) => ({
                          ...s,
                          destinationCity: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field label="Ngày đi" icon={Calendar}>
                    <input
                      type="date"
                      className="bg-transparent border-none focus:outline-none text-base font-bold text-slate-900 w-full"
                      value={searchData.departureDate}
                      onChange={(e) =>
                        setSearchData((s) => ({
                          ...s,
                          departureDate: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field label="Hành khách" icon={Users}>
                    <input
                      type="number"
                      min="1"
                      className="bg-transparent border-none focus:outline-none text-base font-bold text-slate-900 w-full"
                      value={searchData.seats}
                      onChange={(e) =>
                        setSearchData((s) => ({
                          ...s,
                          seats: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </Field>
                </div>

                {/* Submt Button */}
                <div className="flex items-end flex-1">
                  <button
                    onClick={handleSearch}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-[66px] rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 group active:scale-[0.98]"
                  >
                    <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Tìm chuyến</span>
                  </button>
                </div>
              </div>

              {/* Trip Types toggle */}
              <div className="flex items-center gap-8 px-8 py-3 bg-slate-50/50 rounded-b-[22px] border-t border-slate-50">
                <div className="flex items-center gap-6">
                  {(["one-way", "round-trip"] as const).map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="tripType"
                        checked={tripType === t}
                        onChange={() => setTripType(t)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tripType === t ? "border-brand-primary" : "border-slate-300 group-hover:border-slate-400"}`}
                      >
                        {tripType === t && (
                          <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold ${tripType === t ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {t === "one-way" ? "Một chiều" : "Khứ hồi"}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-brand-primary font-black">
                        {s.value}
                      </span>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════  MAIN CONTENT  ══════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* ─── LEFT / MAIN column (3/4 width for desktop) ─── */}
        <div className="lg:col-span-3 space-y-16">
          {/* Popular Routes */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Tuyến đường phổ biến
                </h2>
                <p className="text-slate-500 mt-2">
                  Được nhiều người dùng lựa chọn nhất
                </p>
              </div>
              <button className="flex items-center gap-2 text-brand-primary text-sm font-black hover:gap-3 transition-all px-4 py-2 rounded-xl hover:bg-brand-primary/5">
                Xem tất cả <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {POPULAR_ROUTES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => patchRoute(r.from, r.to)}
                  className="group bg-white border border-slate-100 rounded-[2rem] p-8 text-left hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 scale-150 rotate-12 transition-all">
                    <Bus className="w-32 h-32 text-brand-primary" />
                  </div>

                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="bg-slate-50 px-4 py-1.5 rounded-full">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Premium trip
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                      {r.price}
                    </span>
                  </div>

                  <h3 className="font-black text-2xl text-slate-900 mb-2 flex items-center gap-3">
                    {r.from}
                    <ArrowRightLeft className="w-5 h-5 text-brand-primary/40 group-hover:text-brand-primary transition-all group-hover:scale-110" />
                    {r.to}
                  </h3>
                  <p className="text-slate-400 font-medium mb-6">{r.info}</p>

                  <div className="flex items-center gap-2 text-sm font-black text-brand-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all">
                    Đặt vé ngay <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Value Props */}
          <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl shadow-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-10 text-center">
              Tại sao nên chọn Go Routex?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Clock,
                  title: "Đúng giờ",
                  desc: "Cam kết khởi hành đúng lịch trình, tối ưu thời gian của bạn.",
                },
                {
                  icon: Armchair,
                  title: "Ghế ngồi VIP",
                  desc: "Hệ thống ghế ngồi/giường nằm cao cấp, thoải mái nhất.",
                },
                {
                  icon: TrendingUp,
                  title: "Giá tốt nhất",
                  desc: "Luôn đảm bảo mức giá cạnh tranh nhất thị trường.",
                },
                {
                  icon: CheckCircle2,
                  title: "Xác nhận ngay",
                  desc: "Có vé ngay sau khi thanh toán, tiện lợi 24/7.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">
                    {title}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ─── RIGHT sidebar (1/4 width) ─── */}
        <aside className="space-y-8">
          {/* Step Guide */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

            <h3 className="font-black text-xl mb-8 relative z-10">
              Quy trình đặt vé
            </h3>
            <ol className="space-y-8 relative z-10">
              {[
                { step: "01", text: "Tìm kiếm chuyến đi phù hợp" },
                { step: "02", text: "Chọn giờ khởi hành mong muốn" },
                { step: "03", text: "Chọn chỗ ngồi yêu thích trên xe" },
                { step: "04", text: "Thanh toán & Nhận vé điện tử" },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-center gap-5">
                  <span className="text-xs font-black text-brand-primary bg-brand-primary/10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-brand-primary/20">
                    {step}
                  </span>
                  <p className="text-white/80 text-sm font-bold leading-snug">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Guidelines */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8">
            <h3 className="font-black text-slate-900 mb-6">Lưu ý đặt chỗ</h3>
            <ul className="space-y-5">
              {GUIDELINES.map((g, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-4 h-4 text-brand-secondary shrink-0" />
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{g}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats Bar (Mobile/Tablet visible) */}
          <div className="lg:hidden grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center"
              >
                <div className="text-brand-primary text-2xl font-black">
                  {s.value}
                </div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Promo Card */}
          {!isLoggedIn ? (
            <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-primary/20">
              <h3 className="font-black text-xl mb-3">
                Tham gia Go Routex ngay!
              </h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                Tích điểm mỗi chuyến đi, nhận hàng ngàn ưu đãi độc quyền dành
                riêng cho bạn.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="w-full bg-white text-brand-primary font-black py-4 rounded-2xl text-base hover:shadow-lg transition-all active:scale-95"
              >
                Đăng ký tài khoản
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-brand-primary/10 rounded-[2.5rem] p-8 text-center">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-2">
                Xem lịch sử đặt vé
              </h3>
              <p className="text-slate-500 text-xs mb-6">
                Quản lý các chuyến đi của bạn dễ dàng hơn bao giờ hết.
              </p>
              <button className="text-brand-primary font-black text-sm hover:underline">
                Khám phá ngay
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* ══════════════════  FOOTER  ══════════════════ */}
      <footer className="mt-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">
                  GO ROUTEX
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hệ thống đặt vé xe công nghệ hàng đầu Việt Nam. Mang lại trải
                nghiệm di chuyển hiện đại, an toàn và thông minh.
              </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                Về chúng tôi
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Tuyển dụng", to: "#" },
                  { label: "Tin tức", to: "#" },
                  { label: "Liên hệ chúng tôi", to: "/lien-he-chung-toi" },
                  { label: "Quy định chung", to: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-slate-500 text-sm hover:text-brand-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                Hỗ trợ khách hàng
              </h4>
              <ul className="space-y-4">
                {[
                  { label: "Chính sách bảo mật", to: "/chinh-sach-bao-mat" },
                  { label: "Điều khoản dịch vụ", to: "/dieu-khoan-dich-vu" },
                  { label: "Hướng dẫn thanh toán", to: "/support" },
                  { label: "Câu hỏi thường gặp", to: "/support" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-slate-500 text-sm hover:text-brand-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                Tải ứng dụng
              </h4>
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold leading-none mb-1">
                      Download on the
                    </p>
                    <p className="text-sm text-white font-black leading-none">
                      App Store
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold leading-none mb-1">
                      GET IT ON
                    </p>
                    <p className="text-sm text-white font-black leading-none">
                      Google Play
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-slate-400 text-sm font-medium">
              © 2026 Go Routex JSC. All rights reserved.
            </span>
            <div className="flex gap-8">
              {["Facebook", "LinkedIn", "Instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-slate-400 hover:text-brand-primary transition-colors text-sm font-bold"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
