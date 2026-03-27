import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canLogin = username.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!canLogin) return;
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", username);
    navigate("/home");
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Đăng nhập nhanh, bắt đầu hành trình"
      subtitle="Nhập thông tin tài khoản để tiếp tục đặt vé, theo dõi chuyến đi và quản lý lịch trình của bạn."
    >
      <div className="space-y-5">
        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Tên đăng nhập
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Mật khẩu
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] text-slate-400 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          <span>Giữ kết nối an toàn</span>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-brand-primary transition-colors hover:text-brand-dark"
          >
            Quên mật khẩu
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={!canLogin}
          className={`w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
            canLogin
              ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          Đăng nhập ngay
        </button>

        <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-black text-brand-primary transition-colors hover:text-brand-dark"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
