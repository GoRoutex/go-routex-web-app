import { CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../Components/client/AuthLayout";

export default function ResetPasswordSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <AuthLayout
      activeTab="login"
      title="Khôi phục mật khẩu thành công"
      subtitle="Mật khẩu của bạn đã được cập nhật. Giờ bạn có thể đăng nhập lại bằng mật khẩu mới."
      showTabs={false}
      showBadge={false}
      panelTitle="Khôi phục mật khẩu thành công"
      panelSubtitle="Mật khẩu của bạn đã được cập nhật. Giờ bạn có thể đăng nhập lại bằng mật khẩu mới."
    >
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            Khôi phục mật khẩu thành công
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {email
              ? `Tài khoản ${email} đã được đặt lại mật khẩu.`
              : "Mật khẩu của bạn đã được đặt lại thành công."}
          </p>
        </div>

        <button
          onClick={() => navigate("/login", { replace: true })}
          className="w-full rounded-[1.25rem] bg-brand-primary py-[1.05rem] text-lg font-black text-white shadow-xl shadow-brand-primary/30 transition-all hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
        >
          Quay lại đăng nhập
        </button>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Về trang chủ
        </button>
      </div>
    </AuthLayout>
  );
}
