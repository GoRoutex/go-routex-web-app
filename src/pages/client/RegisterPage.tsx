import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";
import { createRequestMeta } from "../../utils/requestMeta";
import { API_BASE_URL, REGISTER_URL } from "../../utils/api";

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getTodayYyyyMmDd = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractToken = (body: unknown) => {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  const data = record.data;
  const direct =
    (typeof record.token === "string" && record.token) ||
    (typeof record.verificationToken === "string" &&
      record.verificationToken) ||
    (typeof record.verifyToken === "string" && record.verifyToken) ||
    (data && typeof data === "object"
      ? (typeof (data as Record<string, unknown>).token === "string" &&
          (data as Record<string, unknown>).token) ||
        (typeof (data as Record<string, unknown>).verificationToken ===
          "string" &&
          (data as Record<string, unknown>).verificationToken) ||
        (typeof (data as Record<string, unknown>).verifyToken === "string" &&
          (data as Record<string, unknown>).verifyToken)
      : "");

  return typeof direct === "string" ? direct : "";
};

const extractUserId = (body: unknown) => {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  const data = record.data;
  const direct =
    (typeof record.userId === "string" && record.userId) ||
    (typeof record.id === "string" && record.id) ||
    (typeof record.user_id === "string" && record.user_id) ||
    (data && typeof data === "object"
      ? (typeof (data as Record<string, unknown>).userId === "string" &&
          (data as Record<string, unknown>).userId) ||
        (typeof (data as Record<string, unknown>).id === "string" &&
          (data as Record<string, unknown>).id) ||
        (typeof (data as Record<string, unknown>).user_id === "string" &&
          (data as Record<string, unknown>).user_id)
      : "");

  return typeof direct === "string" ? direct : "";
};

const InputField = ({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  rightIcon,
  onRightIconClick,
}: {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}) => (
  <div className="space-y-1.5">
    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
      {label}
    </label>
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition-all group-focus-within:bg-brand-primary/10">
        <Icon className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-[14px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[15px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {rightIcon && (
        <button
          onClick={onRightIconClick}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
          type="button"
        >
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRegister =
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    dob.trim().length > 0 &&
    password.trim().length > 0;

  const handleRegister = async () => {
    setError("");
    if (!canRegister) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
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

    const payload = {
      ...createRequestMeta(),
      data: {
        email: email.trim(),
        password,
        phoneNumber: phone.trim(),
        dob,
      },
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(API_BASE_URL + REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `Đăng ký thất bại (${response.status})`;
        try {
          const body = await response.json();
          message =
            body?.message ||
            body?.error ||
            body?.detail ||
            body?.title ||
            message;
        } catch {
          // Ignore non-JSON error responses and keep the fallback message.
        }
        setError(message);
        return;
      }

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = null;
      }

      const userId = extractUserId(responseBody);
      const token = extractToken(responseBody);
      if (userId) {
        localStorage.setItem("userId", userId);
      }
      const verifySearchParams = new URLSearchParams();
      verifySearchParams.set("email", email.trim());
      if (userId) verifySearchParams.set("userId", userId);
      if (token) verifySearchParams.set("token", token);

      navigate(`/verify-email?${verifySearchParams.toString()}`);
    } catch {
      setError("Không thể kết nối tới máy chủ đăng ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      activeTab="register"
      title="Tạo tài khoản mới"
      subtitle="Điền thông tin để bắt đầu hành trình và đồng bộ lịch sử đặt vé của bạn trên Go Routex."
    >
      <div className="rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              Thông tin đăng ký
            </h3>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
              Điền 4 trường cần thiết để tạo tài khoản mới.
            </p>
          </div>
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-brand-primary/10 text-brand-primary sm:flex">
            <Mail className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            label="Email"
            icon={Mail}
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            label="Số điện thoại"
            icon={Phone}
            placeholder="Nhập số điện thoại"
            type="tel"
            value={phone}
            onChange={setPhone}
          />
          <InputField
            label="Mật khẩu"
            icon={Lock}
            placeholder="Tạo mật khẩu an toàn"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            rightIcon={
              showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            onRightIconClick={() => setShowPassword((v) => !v)}
          />
          <InputField
            label="Ngày sinh (yyyy-MM-dd)"
            icon={CalendarDays}
            placeholder="YYYY-MM-DD"
            type="date"
            value={dob}
            onChange={setDob}
          />
        </div>

        {error && (
          <div className="mt-3.5 flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={!canRegister || isSubmitting}
          className={`mt-4 w-full rounded-[1.15rem] py-3.5 text-[14px] font-black uppercase tracking-[0.18em] transition-all shadow-xl ${
            canRegister && !isSubmitting
              ? "bg-brand-primary text-white shadow-brand-primary/25 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-brand-dark/25"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký tài khoản"}
        </button>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-sm text-slate-500">
          Bạn đã có tài khoản rồi?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-black text-brand-primary transition-colors hover:text-brand-dark"
          >
            Đăng nhập tại đây
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
