import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";
import { createRequestMeta } from "../../utils/requestMeta";

const LOGIN_ENDPOINT =
  "http://localhost:8080/api/v1/user-service/authentication/login";

const extractAuthToken = (body: unknown) => {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  const data = record.data;
  const candidates = [
    record.token,
    record.accessToken,
    record.jwt,
    record.authToken,
    data && typeof data === "object" ? (data as Record<string, unknown>).token : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).accessToken : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).jwt : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).authToken : undefined,
  ];

  const token = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  return typeof token === "string" ? token : "";
};

const extractDisplayName = (body: unknown, fallbackEmail: string) => {
  if (!body || typeof body !== "object") return fallbackEmail;
  const record = body as Record<string, unknown>;
  const data = record.data;
  const candidates = [
    record.fullName,
    record.name,
    record.username,
    record.email,
    data && typeof data === "object" ? (data as Record<string, unknown>).fullName : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).name : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).username : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).email : undefined,
  ];

  const displayName = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof displayName === "string" ? displayName : fallbackEmail;
};

const extractNeedsProfileCompletion = (body: unknown) => {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  const data = record.data;
  const candidates = [
    record.needsProfileCompletion,
    record.requireProfileCompletion,
    record.mustCompleteProfile,
    record.firstLogin,
    record.isFirstLogin,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).needsProfileCompletion
      : undefined,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).requireProfileCompletion
      : undefined,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).mustCompleteProfile
      : undefined,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).firstLogin
      : undefined,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).isFirstLogin
      : undefined,
  ];

  const flag = candidates.find((value) => typeof value === "boolean");
  return typeof flag === "boolean" ? flag : false;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canLogin = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    setError("");
    if (!canLogin) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createRequestMeta(),
          data: {
            email: email.trim(),
            password,
          },
        }),
      });

      if (!response.ok) {
        let message = `Đăng nhập thất bại (${response.status})`;
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

      const authToken = extractAuthToken(responseBody);
      const displayName = extractDisplayName(responseBody, email.trim());
      const needsProfileCompletion = extractNeedsProfileCompletion(responseBody);
      const profileCompleted = localStorage.getItem("profileCompleted") === "true";

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", displayName);
      localStorage.setItem("userEmail", email.trim());
      if (authToken) {
        localStorage.setItem("authToken", authToken);
      }

      if (needsProfileCompletion || !profileCompleted) {
        navigate("/complete-profile");
        return;
      }

      navigate("/home");
    } catch {
      setError("Không thể kết nối tới máy chủ đăng nhập. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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
            Email
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="email"
              placeholder="Nhập email"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {error && (
          <div className="rounded-[1.15rem] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={!canLogin || isSubmitting}
          className={`w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
            canLogin && !isSubmitting
              ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </span>
          ) : (
            "Đăng nhập ngay"
          )}
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
