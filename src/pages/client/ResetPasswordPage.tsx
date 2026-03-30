import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";
import { API_BASE_URL, RESET_PASSWORD_URL } from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";

const extractErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return (
      body?.message || body?.error || body?.detail || body?.title || fallback
    );
  } catch {
    return fallback;
  }
};

const readJsonBody = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getResponseCode = (body: unknown) => {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  const result = record.result;
  const candidates = [
    record.responseCode,
    record.response_code,
    record.code,
    record.statusCode,
    record.status_code,
    result && typeof result === "object"
      ? (result as Record<string, unknown>).responseCode
      : undefined,
    result && typeof result === "object"
      ? (result as Record<string, unknown>).response_code
      : undefined,
    result && typeof result === "object"
      ? (result as Record<string, unknown>).code
      : undefined,
  ];

  const responseCode = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof responseCode === "string" ? responseCode.trim() : "";
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId =
    searchParams.get("userId") ||
    localStorage.getItem("resetPasswordUserId") ||
    "";
  const email =
    searchParams.get("email") ||
    localStorage.getItem("resetPasswordEmail") ||
    "";

  const canSubmit = useMemo(
    () =>
      otpCode.trim().length > 0 &&
      newPassword.trim().length > 0 &&
      confirmPassword.trim().length > 0 &&
      userId.trim().length > 0,
    [confirmPassword, newPassword, otpCode, userId],
  );

  const handleSubmit = async () => {
    setError("");

    if (!userId.trim()) {
      setError(
        "Thiếu userId. Vui lòng quay lại màn quên mật khẩu và gửi email lại.",
      );
      return;
    }

    if (!canSubmit) {
      setError("Vui lòng nhập đầy đủ OTP, mật khẩu mới và xác nhận mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_BASE_URL + RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          authorization: "Basic YWRtaW46YWRtaW4=",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...createRequestMeta(),
          data: {
            otpCode: otpCode.trim(),
            userId: userId.trim(),
            newPassword,
            confirmPassword,
          },
        }),
      });

      const responseBody = await readJsonBody(response);
      const responseCode = getResponseCode(responseBody);

      if (responseCode && responseCode !== "0000") {
        const message = await extractErrorMessage(
          response,
          `Đặt lại mật khẩu thất bại (${response.status})`,
        );
        setError(message);
        return;
      }

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Đặt lại mật khẩu thất bại (${response.status})`,
        );
        setError(message);
        return;
      }

      const successParams = new URLSearchParams();
      if (email.trim()) {
        successParams.set("email", email.trim());
      }
      localStorage.removeItem("resetPasswordEmail");
      localStorage.removeItem("resetPasswordUserId");
      navigate(
        successParams.toString()
          ? `/reset-password-success?${successParams.toString()}`
          : "/reset-password-success",
        { replace: true },
      );
    } catch {
      setError(
        "Không thể kết nối tới máy chủ đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Đặt lại mật khẩu"
      subtitle="Nhập mã OTP và mật khẩu mới để hoàn tất quá trình khôi phục."
      showTabs={false}
      showBadge={false}
      panelTitle="Đặt lại mật khẩu"
      panelSubtitle="Nhập mã OTP và mật khẩu mới để hoàn tất quá trình khôi phục."
    >
      <div className="space-y-5">
        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Mã OTP
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <ShieldCheck className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập OTP"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Mật khẩu mới
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] text-slate-400 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Xác nhận mật khẩu
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] text-slate-400 transition-all hover:bg-brand-primary/5 hover:text-brand-primary"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

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
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đặt lại mật khẩu...
            </span>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </button>

        <button
          onClick={() => navigate("/forgot-password")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Quay lại khôi phục mật khẩu
        </button>
      </div>
    </AuthLayout>
  );
}
