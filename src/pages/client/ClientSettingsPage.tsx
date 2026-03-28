import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BellRing, ShieldCheck, Smartphone, Globe } from "lucide-react";

export default function ClientSettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/25 hover:text-brand-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Về trang chủ
        </button>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-primary">
              Cài đặt tài khoản
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tùy chỉnh trải nghiệm
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Một số thiết lập cơ bản để bạn quản lý thông báo, bảo mật và phiên đăng nhập thuận tiện hơn.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Bảo mật",
                desc: "Quản lý mật khẩu và xác thực hai lớp.",
                icon: ShieldCheck,
              },
              {
                title: "Thông báo",
                desc: "Nhận cập nhật vé và nhắc nhở kịp thời.",
                icon: BellRing,
              },
              {
                title: "Thiết bị",
                desc: "Theo dõi các phiên đăng nhập gần đây.",
                icon: Smartphone,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-white text-brand-primary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={() => setNotifications((value) => !value)}
              className={`flex w-full items-center justify-between rounded-[1.4rem] border px-5 py-4 text-left transition-colors ${
                notifications
                  ? "border-brand-primary/25 bg-brand-primary/5"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <div>
                <p className="text-sm font-black text-slate-900">Thông báo email</p>
                <p className="mt-1 text-sm text-slate-500">
                  Nhận thông tin đặt vé và thay đổi lịch trình qua email.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                {notifications ? "Bật" : "Tắt"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSessionAlerts((value) => !value)}
              className={`flex w-full items-center justify-between rounded-[1.4rem] border px-5 py-4 text-left transition-colors ${
                sessionAlerts
                  ? "border-brand-primary/25 bg-brand-primary/5"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <div>
                <p className="text-sm font-black text-slate-900">Cảnh báo đăng nhập</p>
                <p className="mt-1 text-sm text-slate-500">
                  Nhận thông báo khi có phiên đăng nhập mới.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                {sessionAlerts ? "Bật" : "Tắt"}
              </span>
            </button>

            <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-brand-primary" />
                <div>
                  <p className="text-sm font-black text-slate-900">Ngôn ngữ & khu vực</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sẵn sàng mở rộng nếu bạn cần thêm tùy chọn hiển thị trong tương lai.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
