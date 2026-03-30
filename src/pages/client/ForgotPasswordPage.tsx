import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";
import { API_BASE_URL, FORGOT_PASSWORD_URL } from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";
import { extractUserId } from "../../utils/responseExtractors";

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0;

  const handleSubmit = async () => {
    setError("");

    if (!canSubmit) {
      setError("Vui lòng nhập email của bạn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_BASE_URL + FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...createRequestMeta(),
          data: {
            email: email.trim(),
          },
        }),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Gửi yêu cầu khôi phục thất bại (${response.status})`,
        );
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
      if (userId) {
        localStorage.setItem("resetPasswordUserId", userId);
      }
      localStorage.setItem("resetPasswordEmail", email.trim());

      const resetPasswordParams = new URLSearchParams();
      resetPasswordParams.set("email", email.trim());
      if (userId) {
        resetPasswordParams.set("userId", userId);
      }

      navigate(`/reset-password?${resetPasswordParams.toString()}`, {
        replace: true,
      });
    } catch {
      setError("Không thể kết nối tới máy chủ khôi phục mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Khôi phục mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận mã khôi phục và tiếp tục đặt lại mật khẩu."
      showTabs={false}
      showBadge={false}
      panelTitle="Khôi phục mật khẩu"
      panelSubtitle="Nhập email đã đăng ký để nhận mã khôi phục và tiếp tục đặt lại mật khẩu."
    >
      <div className="space-y-5">
        <div className="space-y-2.5">
          <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Email đăng ký
          </label>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-brand-primary/10 bg-brand-primary/5 px-4 py-3 text-sm text-slate-600">
          <span className="font-black text-brand-primary">Lưu ý:</span> sau khi
          gửi thành công, bạn sẽ được chuyển sang màn hình đặt lại mật khẩu.
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
              Đang gửi yêu cầu...
            </span>
          ) : (
            "Gửi yêu cầu khôi phục"
          )}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Quay lại đăng nhập
        </button>
      </div>
    </AuthLayout>
  );
}
