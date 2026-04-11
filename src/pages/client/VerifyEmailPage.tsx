import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL, VERIFY_URL } from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";

const OTP_LENGTH = 6;
const DEFAULT_MESSAGE =
  "Nhập mã OTP được gửi trong email của bạn để hoàn tất xác minh.";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastAutoSubmittedOtpRef = useRef("");

  const otp = otpDigits.join("");
  const canVerify = otp.length === OTP_LENGTH;
  const isSuccess = status === "success";
  const isLoading = status === "loading";

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const resetFeedback = () => {
    setStatus("idle");
    setMessage(DEFAULT_MESSAGE);
  };

  const handleVerify = useCallback(
    async (submittedOtp: string) => {
      if (!userId) {
        setStatus("error");
        setMessage("Thiếu userId xác minh từ bước đăng ký.");
        return;
      }

      if (submittedOtp.length !== OTP_LENGTH) {
        setStatus("error");
        setMessage(`Mã OTP phải đủ ${OTP_LENGTH} chữ số.`);
        return;
      }

      setStatus("loading");
      setMessage("Đang xác minh mã OTP...");

      try {
        const response = await fetch(`${API_BASE_URL}${VERIFY_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...createRequestMeta(),
            data: {
              userId,
              otpCode: submittedOtp,
            },
          }),
        });

        if (!response.ok) {
          let fallback = `Xác minh thất bại (${response.status})`;
          try {
            const body = await response.json();
            fallback =
              body?.message ||
              body?.error ||
              body?.detail ||
              body?.title ||
              fallback;
          } catch {
            // Ignore non-JSON error responses and keep the fallback text.
          }

          setStatus("error");
          setMessage(fallback);
          return;
        }

        setStatus("success");
        setMessage(
          "Tài khoản đã được xác minh thành công. Bạn có thể đăng nhập ngay.",
        );
      } catch {
        setStatus("error");
        setMessage("Không thể kết nối tới máy chủ xác minh. Vui lòng thử lại.");
      }
    },
    [userId],
  );

  useEffect(() => {
    if (otp.length !== OTP_LENGTH) {
      lastAutoSubmittedOtpRef.current = "";
      return;
    }

    if (!userId || status !== "idle") return;
    if (lastAutoSubmittedOtpRef.current === otp) return;

    lastAutoSubmittedOtpRef.current = otp;
    const timer = window.setTimeout(() => {
      void handleVerify(otp);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [handleVerify, otp, status, userId]);

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    resetFeedback();
    lastAutoSubmittedOtpRef.current = "";

    if (!digits) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    if (digits.length > 1) {
      const next = [...otpDigits];
      digits
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      setOtpDigits(next);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      focusIndex(nextIndex);
      return;
    }

    const next = [...otpDigits];
    next[index] = digits.slice(-1);
    setOtpDigits(next);

    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      resetFeedback();
      lastAutoSubmittedOtpRef.current = "";
      focusIndex(index - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    resetFeedback();
    lastAutoSubmittedOtpRef.current = "";

    const next = Array.from({ length: OTP_LENGTH }, () => "");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtpDigits(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="min-h-screen bg-brand-surface px-6 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <div className="w-full rounded-4xl border border-slate-100 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl shadow-lg ${
              isSuccess
                ? "bg-emerald-500 shadow-emerald-500/25"
                : isLoading
                  ? "bg-brand-primary shadow-brand-primary/25"
                  : "bg-slate-900 shadow-slate-900/20"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-white" />
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-primary">
              Xác minh email
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {isSuccess
                ? "Xác minh thành công."
                : "Nhập mã OTP để xác minh tài khoản."}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
              {message}
            </p>
          </div>

          <div className="mt-8 rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-white text-brand-primary shadow-sm">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Email
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {email || "Không có email đi kèm"}
                </div>
              </div>
            </div>
          </div>

          {!isSuccess && (
            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Mã OTP
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        inputRefs.current[index] = node;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      autoFocus={index === 0}
                      className="h-14 w-10 rounded-[0.85rem] border border-brand-primary/25 bg-white text-center text-2xl font-black tracking-[0.2em] text-slate-900 shadow-[0_0_0_1px_rgba(59,130,246,0.08)] outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_4px_rgba(14,165,233,0.12)] sm:h-14 sm:w-12"
                    />
                  ))}
                </div>
                <p className="ml-1 text-sm text-slate-400">
                  Mã OTP gồm 6 chữ số, bạn có thể nhập từng ô hoặc paste vào ô
                  đầu tiên.
                </p>
              </div>

              <button
                onClick={() => void handleVerify(otp)}
                disabled={!canVerify || isLoading}
                className={`mt-5 w-full rounded-[1.15rem] py-3.5 text-[14px] font-black uppercase tracking-[0.18em] transition-all shadow-xl ${
                  canVerify && !isLoading
                    ? "bg-brand-primary text-white shadow-brand-primary/25 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-brand-dark/25"
                    : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                }`}
              >
                {isLoading ? "Đang xác minh..." : "Xác minh tài khoản"}
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1.15rem] bg-brand-primary px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Về đăng nhập
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white px-5 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-600 transition-all hover:border-brand-primary/25 hover:text-brand-primary"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
