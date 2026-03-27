import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [useEmail, setUseEmail] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = identifier.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Khôi phục mật khẩu"
      subtitle="Nhập email hoặc số điện thoại để nhận hướng dẫn đặt lại mật khẩu."
    >
      {submitted ? (
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-brand-primary shadow-lg shadow-brand-primary/25">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">
              Đã gửi hướng dẫn
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Vui lòng kiểm tra {useEmail ? "email" : "điện thoại"} của bạn để
              xem liên kết hoặc mã khôi phục.
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-[1.25rem] bg-brand-primary py-[1.05rem] text-lg font-black text-white shadow-xl shadow-brand-primary/30 transition-all hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
          >
            Quay lại đăng nhập
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-1 shadow-inner shadow-slate-200/40">
            <button
              type="button"
              onClick={() => setUseEmail(true)}
              className={`rounded-[1.15rem] px-4 py-3 text-sm font-black transition-all ${
                useEmail
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200/60"
                  : "text-slate-400 hover:text-brand-primary"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setUseEmail(false)}
              className={`rounded-[1.15rem] px-4 py-3 text-sm font-black transition-all ${
                !useEmail
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200/60"
                  : "text-slate-400 hover:text-brand-primary"
              }`}
            >
              Số điện thoại
            </button>
          </div>

          <div className="space-y-2.5">
            <label className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {useEmail ? "Email đăng ký" : "Số điện thoại đăng ký"}
            </label>
            <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
                {useEmail ? (
                  <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                ) : (
                  <Phone className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                )}
              </div>
              <input
                type={useEmail ? "email" : "tel"}
                placeholder={
                  useEmail ? "Nhập email của bạn" : "Nhập số điện thoại của bạn"
                }
                className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-brand-primary/10 bg-brand-primary/5 px-4 py-3 text-sm text-slate-600">
            <span className="font-black text-brand-primary">Lưu ý:</span> liên
            kết khôi phục sẽ hết hạn sau một thời gian ngắn.
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
              canSubmit
                ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
                : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
            }`}
          >
            Gửi hướng dẫn khôi phục
          </button>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Quay lại đăng nhập
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
