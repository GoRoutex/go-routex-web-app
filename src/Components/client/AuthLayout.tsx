import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Sparkles } from "lucide-react";

type AuthMode = "login" | "register";

type AuthLayoutProps = {
  activeTab: AuthMode;
  title: string;
  subtitle: string;
  children: ReactNode;
  showTabs?: boolean;
  panelTitle?: string;
  panelSubtitle?: string;
};

export function AuthLayout({
  activeTab,
  title,
  subtitle,
  children,
  showTabs = true,
  panelTitle,
  panelSubtitle,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  const tabBase =
    "flex-1 inline-flex items-center justify-center gap-2 rounded-t-2xl py-4 text-sm sm:text-base font-black uppercase tracking-[0.18em] transition-all";

  return (
    <div className="min-h-screen bg-brand-surface text-slate-900 overflow-hidden font-sans">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-60 sm:h-70 bg-[linear-gradient(135deg,#0EA5E9_0%,#10B981_55%,#6366F1_100%)]" />
        <div className="absolute inset-x-0 top-0 h-60 sm:h-70 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.11),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-3 text-white/90 text-sm font-black uppercase tracking-[0.22em]">
              <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                <Bus className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div>Go Routex</div>
                <div className="text-[10px] text-white/70 tracking-[0.24em]">
                  Vận tải thông minh
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-brand-secondary" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                Đăng nhập / Đăng ký
              </span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] sm:px-4 sm:py-2.5 sm:text-sm font-black text-slate-600 shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:text-brand-primary"
            >
              <span className="text-lg leading-none">←</span>
              Trang chủ
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14 -mt-16 sm:-mt-20">
        <div className="rounded-4xl sm:rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-brand-primary/10 blur-3xl" />
                <div className="absolute bottom-0 -right-16 w-72 h-72 rounded-full bg-brand-secondary/10 blur-3xl" />
              </div>

              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="max-w-xl">
                  <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white px-4 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-brand-primary shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    Hành trình gọn gàng, tinh tế
                  </p>
                  <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                    {title}
                  </h1>
                  <p className="mt-4 max-w-lg text-base sm:text-lg leading-relaxed text-slate-500 font-medium">
                    {subtitle}
                  </p>
                </div>

                <div className="relative mx-auto w-full max-w-150 min-h-90 sm:min-h-107.5">
                  <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />
                    <svg
                      viewBox="0 0 800 560"
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-[2.08]"
                    >
                      <defs>
                        <linearGradient
                          id="roadLine"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0EA5E9"
                            stopOpacity="0.28"
                          />
                          <stop
                            offset="100%"
                            stopColor="#10B981"
                            stopOpacity="0.18"
                          />
                        </linearGradient>
                        <linearGradient
                          id="mapGlow"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0EA5E9"
                            stopOpacity="0.16"
                          />
                          <stop
                            offset="100%"
                            stopColor="#10B981"
                            stopOpacity="0.05"
                          />
                        </linearGradient>
                      </defs>

                      <g opacity="0.9">
                        <path
                          d="M120 110 C210 80, 300 130, 360 108 S520 78, 620 120"
                          fill="none"
                          stroke="url(#roadLine)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          className="route-line route-line-slow"
                        />
                        <path
                          d="M90 320 C180 260, 290 282, 380 238 S560 182, 710 270"
                          fill="none"
                          stroke="url(#roadLine)"
                          strokeWidth="12"
                          strokeLinecap="round"
                          className="route-line route-line-medium"
                        />
                        <path
                          d="M150 470 C240 390, 330 430, 430 396 S610 340, 740 412"
                          fill="none"
                          stroke="url(#roadLine)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className="route-line route-line-slow"
                        />
                        <path
                          d="M170 150 C250 220, 320 220, 400 176 S560 120, 660 170"
                          fill="none"
                          stroke="rgba(14,165,233,0.12)"
                          strokeWidth="4"
                          strokeDasharray="8 14"
                          strokeLinecap="round"
                          className="route-line route-dash route-line-medium"
                        />
                        <path
                          d="M180 400 C260 340, 340 334, 430 368 S600 450, 700 366"
                          fill="none"
                          stroke="rgba(16,185,129,0.12)"
                          strokeWidth="4"
                          strokeDasharray="8 14"
                          strokeLinecap="round"
                          className="route-line route-dash route-line-slow"
                        />
                        <circle cx="240" cy="114" r="22" fill="url(#mapGlow)" />
                        <circle cx="385" cy="232" r="18" fill="url(#mapGlow)" />
                        <circle cx="510" cy="386" r="20" fill="url(#mapGlow)" />
                      </g>

                      <g opacity="0.18" stroke="#94A3B8" strokeWidth="2">
                        <path d="M80 60V500" />
                        <path d="M220 40V520" />
                        <path d="M360 40V520" />
                        <path d="M500 40V520" />
                        <path d="M640 40V520" />
                        <path d="M760 70V500" />
                        <path d="M40 90H760" />
                        <path d="M40 210H760" />
                        <path d="M40 330H760" />
                        <path d="M40 450H760" />
                      </g>

                      <g>
                        <circle
                          cx="240"
                          cy="114"
                          r="16"
                          fill="#0EA5E9"
                          opacity="0.2"
                        />
                        <circle cx="240" cy="114" r="9" fill="#0EA5E9" />
                        <circle
                          cx="385"
                          cy="232"
                          r="14"
                          fill="#10B981"
                          opacity="0.2"
                        />
                        <circle cx="385" cy="232" r="8" fill="#10B981" />
                        <circle
                          cx="510"
                          cy="386"
                          r="15"
                          fill="#0EA5E9"
                          opacity="0.18"
                        />
                        <circle cx="510" cy="386" r="8" fill="#0F172A" />
                      </g>
                    </svg>
                  </div>

                  <div className="absolute inset-x-6 bottom-10 h-40 rounded-full bg-brand-primary/10 blur-3xl" />
                  <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-brand-primary/10 blur-2xl" />
                  <div className="absolute right-8 top-12 h-32 w-32 rounded-full bg-brand-secondary/10 blur-2xl" />

                  <div className="absolute left-1/2 top-1/2 w-90 -translate-x-1/2 -translate-y-1/2 rounded-4xl border border-slate-100 bg-white/92 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-brand-primary shadow-lg shadow-brand-primary/20">
                        <Bus className="h-8 w-8 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-black text-slate-900 tracking-tight">
                          Go Routex
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Hành trình rõ ràng
                        </div>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-brand-primary" />
                            <div className="h-2.5 flex-1 rounded-full bg-brand-primary/15" />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-brand-secondary" />
                            <div className="h-2.5 flex-1 rounded-full bg-brand-secondary/15" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Điểm đi
                        </div>
                        <div className="mt-1 text-sm font-black text-slate-700">
                          TP. HCM
                        </div>
                      </div>
                      <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Điểm đến
                        </div>
                        <div className="mt-1 text-sm font-black text-slate-700">
                          Nha Trang
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[calc(50%+7.5rem)] -translate-x-1/2 flex items-center gap-3">
                    <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary shadow-sm">
                      Đặt vé nhanh
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary shadow-sm">
                      Đồng bộ tức thời
                    </span>
                  </div>
                </div>

                <style>{`
                  .route-line {
                    stroke-dashoffset: 0;
                    animation: routeFlow 18s linear infinite;
                  }
                  .route-line-medium {
                    animation-duration: 14s;
                  }
                  .route-line-slow {
                    animation-duration: 22s;
                  }
                  .route-dash {
                    stroke-dashoffset: 0;
                  }
                  @keyframes routeFlow {
                    from {
                      stroke-dashoffset: 0;
                    }
                    to {
                      stroke-dashoffset: -120;
                    }
                  }
                `}</style>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl">
                  {[
                    "Đặt vé nhanh",
                    "Giao diện tinh gọn",
                    "Kết nối rõ ràng",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-center shadow-sm"
                    >
                      <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="max-w-130 mx-auto">
                {showTabs ? (
                  <div className="flex items-stretch overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-1 shadow-inner shadow-slate-200/40">
                    <button
                      onClick={() => navigate("/login")}
                      className={`${tabBase} ${
                        activeTab === "login"
                          ? "bg-white text-slate-900 shadow-lg shadow-slate-200/60"
                          : "text-slate-400 hover:text-brand-primary"
                      }`}
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className={`${tabBase} ${
                        activeTab === "register"
                          ? "bg-white text-brand-primary shadow-lg shadow-slate-200/60"
                          : "text-slate-400 hover:text-brand-primary"
                      }`}
                    >
                      Đăng ký
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-brand-primary">
                    <Sparkles className="w-4 h-4" />
                    Hoàn thiện hồ sơ
                  </div>
                )}

                <div className="mt-8">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    {panelTitle ||
                      (activeTab === "login"
                        ? "Đăng nhập tài khoản"
                        : "Tạo tài khoản")}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                    {panelSubtitle ||
                      (activeTab === "login"
                        ? "Nhập thông tin để tiếp tục hành trình và quản lý đặt vé."
                        : "Tạo tài khoản mới để lưu lịch sử và theo dõi hành trình dễ dàng hơn.")}
                  </p>
                </div>

                <div className="mt-8">{children}</div>

                <button
                  onClick={() => navigate("/")}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 transition-all hover:border-brand-primary/25 hover:text-brand-primary"
                >
                  <span className="text-base leading-none">←</span>
                  Về trang chủ
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
