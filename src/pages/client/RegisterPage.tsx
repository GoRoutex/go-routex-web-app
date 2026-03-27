import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  Bus,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";

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
  <div className="space-y-2.5">
    <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
      {label}
    </label>
    <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
        <Icon className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {rightIcon && (
        <button
          onClick={onRightIconClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] text-slate-400 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
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
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canRegister =
    fullName.trim().length > 0 &&
    username.trim().length > 0 &&
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  const handleRegister = () => {
    setError("");
    if (!canRegister) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    setSuccess(true);
  };

  return (
    <AuthLayout
      activeTab="register"
      title="Tạo tài khoản mới"
      subtitle="Điền thông tin để bắt đầu hành trình và đồng bộ lịch sử đặt vé của bạn trên Go Routex."
    >
      {success ? (
        <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-brand-primary shadow-lg shadow-brand-primary/25">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            Đăng ký thành công!
          </h3>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            Tài khoản của bạn đã sẵn sàng. Hãy đăng nhập để tiếp tục.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full rounded-[1.25rem] bg-brand-primary py-[1.05rem] text-lg font-black text-white shadow-xl shadow-brand-primary/30 transition-all hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
          >
            Đăng nhập ngay
          </button>
        </div>
      ) : (
        <div className="space-y-[1.125rem]">
          <InputField
            label="Họ và tên"
            icon={User}
            placeholder="Nhập đầy đủ họ tên"
            value={fullName}
            onChange={setFullName}
          />
          <InputField
            label="Tên đăng nhập"
            icon={User}
            placeholder="Chọn tên đăng nhập"
            value={username}
            onChange={setUsername}
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
            label="Email"
            icon={Mail}
            placeholder="Nhập địa chỉ email"
            type="email"
            value={email}
            onChange={setEmail}
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
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )
            }
            onRightIconClick={() => setShowPassword((v) => !v)}
          />
          <InputField
            label="Xác nhận mật khẩu"
            icon={Lock}
            placeholder="Nhập lại mật khẩu"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            rightIcon={
              showConfirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )
            }
            onRightIconClick={() => setShowConfirm((v) => !v)}
          />

          {error && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-black uppercase tracking-wider text-red-500 sm:text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={!canRegister}
            className={`mt-2 w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
              canRegister
                ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
                : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
            }`}
          >
            Đăng ký tài khoản
          </button>

          <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
            Bạn đã có tài khoản rồi?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-black text-brand-primary transition-colors hover:text-brand-dark"
            >
              Đăng nhập tại đây
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
