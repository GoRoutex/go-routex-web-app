import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CreditCard, Home, User } from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getTodayYyyyMmDd = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    cccdNumber.trim().length > 0 &&
    dob.trim().length > 0 &&
    address.trim().length > 0;

  const handleSubmit = () => {
    setError("");
    if (!canSubmit) {
      setError("Vui lòng điền đầy đủ thông tin cá nhân.");
      return;
    }

    if (!DOB_PATTERN.test(dob)) {
      setError("Ngày sinh phải đúng định dạng yyyy-MM-dd.");
      return;
    }

    if (dob > getTodayYyyyMmDd()) {
      setError("Ngày sinh không được lớn hơn ngày hiện tại.");
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem("profileCompleted", "true");
      localStorage.setItem("profileFullName", fullName.trim());
      localStorage.setItem("profileCccdNumber", cccdNumber.trim());
      localStorage.setItem("profileDob", dob);
      localStorage.setItem("profileAddress", address.trim());
      localStorage.setItem("userName", fullName.trim());
      navigate("/home", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Hoàn thiện hồ sơ"
      subtitle="Đây là bước đầu tiên sau khi đăng nhập. Điền thêm thông tin cá nhân để sử dụng đầy đủ các chức năng đặt vé."
      showTabs={false}
      panelTitle="Hoàn thiện hồ sơ"
      panelSubtitle="Điền thêm thông tin cá nhân để sử dụng đầy đủ các chức năng đặt vé."
    >
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-brand-primary/10 bg-brand-primary/5 px-4 py-3 text-sm text-slate-600">
          <span className="font-black text-brand-primary">Gợi ý:</span> thông
          tin này giúp xác thực danh tính khi đặt vé và hỗ trợ chăm sóc khách
          hàng tốt hơn.
        </div>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Họ và tên
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              placeholder="Nhập họ và tên"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </label>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Số CCCD / CMND
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <CreditCard className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số CCCD"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={cccdNumber}
              onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </label>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Ngày sinh
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <CalendarDays className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="date"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </label>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Địa chỉ liên hệ
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Home className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              placeholder="Nhập địa chỉ liên hệ"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </label>

        {error && (
          <div className="rounded-[1.15rem] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
            canSubmit && !isSubmitting
              ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          {isSubmitting ? "Đang lưu..." : "Hoàn thiện hồ sơ"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </AuthLayout>
  );
}
