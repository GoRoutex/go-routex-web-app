import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

const profileItems = [
  { label: "Họ và tên", value: localStorage.getItem("profileFullName") || localStorage.getItem("userName") || "Chưa cập nhật", icon: UserRound },
  { label: "Email", value: localStorage.getItem("userEmail") || "Chưa cập nhật", icon: Mail },
  { label: "Số CCCD / CMND", value: localStorage.getItem("profileCccdNumber") || "Chưa cập nhật", icon: BadgeCheck },
  { label: "Ngày sinh", value: localStorage.getItem("profileDob") || "Chưa cập nhật", icon: CalendarDays },
  { label: "Số điện thoại", value: localStorage.getItem("userPhoneNumber") || "Chưa cập nhật", icon: Phone },
];

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const displayName =
    localStorage.getItem("profileFullName") ||
    localStorage.getItem("userName") ||
    "Tài khoản của bạn";

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-primary">
                Hồ sơ cá nhân
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Đây là nơi bạn xem nhanh thông tin tài khoản và đi tới trang cập
                nhật hồ sơ khi cần.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/complete-profile")}
              className="inline-flex items-center justify-center rounded-[1.15rem] bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Cập nhật hồ sơ
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-white text-brand-primary shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        {item.label}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {item.value}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
