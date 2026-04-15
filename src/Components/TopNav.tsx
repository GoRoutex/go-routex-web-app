import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";

type TopNavProps = {
  isDarkMode: boolean;
  onToggleSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  onToggleTheme?: () => void;
  isSidebarCollapsed?: boolean;
  isRightSidebarVisible?: boolean;
};

const searchTargets = [
  { terms: ["dashboard", "overview", "tong quan"], to: "/admin/dashboard" },
  { terms: ["vehicle", "vehicles", "fleet", "xe", "doi xe", "phuong tien"], to: "/admin/vehicles" },
  { terms: ["schedule", "schedules", "route", "routes", "trip", "chuyen xe", "chuyen", "journey", "tuyen", "lich chuyen"], to: "/admin/schedules" },
  { terms: ["location", "province", "city", "tinh", "thanh pho"], to: "/admin/locations" },
  { terms: ["operation point", "operation points", "diem van hanh", "diem khai thac", "diem"], to: "/admin/operation-points" },
  { terms: ["merchant", "merchants", "nha xe", "doi tac"], to: "/admin/merchants" },
  { terms: ["ticket", "ve", "dat cho"], to: "/admin/tickets" },
  { terms: ["maintenance", "bao tri", "bảo tri"], to: "/admin/maintenance" },
  { terms: ["staff", "nhan su", "tai xe", "drivers"], to: "/admin/staff" },
  { terms: ["health", "system health", "suc khoe"], to: "/admin/health" },
  { terms: ["feedback", "phan hoi"], to: "/admin/feedback" },
  { terms: ["revenue", "doanh thu"], to: "/admin/reports/revenue" },
  { terms: ["expenses", "chi phi"], to: "/admin/reports/expenses" },
  { terms: ["salary", "luong", "payroll"], to: "/admin/reports/salaries" },
  { terms: ["profile overview", "overview profile", "tổng quan hồ sơ", "profile", "hồ sơ"], to: "/admin/profile/overview" },
];

export function TopNav({
  isDarkMode,
  onToggleSidebar,
  onToggleRightSidebar,
  onToggleTheme,
  isSidebarCollapsed,
  isRightSidebarVisible
}: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    const isMerchant = path.startsWith("/merchant");
    const baseLabel = isMerchant ? "Merchant" : "Admin";
    const basePath = isMerchant ? "/merchant/portal" : "/admin/dashboard";

    return (
      <div className="flex items-center gap-2 text-[11px] font-bold">
        <Link
            to={basePath}
            className="text-slate-400 hover:text-brand-primary transition-colors"
        >
            {baseLabel}
        </Link>
        {segments.slice(1).map((segment, index) => {
            const segmentPath = `/${segments.slice(0, index + 2).join("/")}`;
            const isLast = index === segments.length - 2;
            const label = segment.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

            return (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={10} className="text-slate-300" />
                    {isLast ? (
                        <span className="text-slate-900 font-black">{label}</span>
                    ) : (
                        <Link
                            to={segmentPath}
                            className="text-slate-400 hover:text-brand-primary transition-colors"
                        >
                            {label}
                        </Link>
                    )}
                </div>
            );
        })}
      </div>
    );
  }, [location.pathname]);

  const performSearch = () => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    const match = searchTargets.find((item) =>
      item.terms.some((term) => normalized.includes(term)),
    );

    if (match) {
      navigate(match.to);
      setQuery("");
      return;
    }

    window.alert("Không tìm thấy mục phù hợp. Hãy thử: xe, lịch chuyến, vé, bảo trì, nhân sự, doanh thu.");
  };

  return (
    <header
      className={`h-16 flex items-center justify-between px-8 border-b transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-center gap-6">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all active:scale-95"
          >
            <Search size={16} className={isSidebarCollapsed ? "rotate-180" : ""} />
          </button>
        )}
        <div className="flex items-center gap-4 text-slate-300">
            <button onClick={() => navigate(-1)} className="hover:text-brand-primary transition-colors">
                <ChevronRight size={14} className="rotate-180" />
            </button>
            <button onClick={() => window.history.forward()} className="hover:text-brand-primary transition-colors">
                <ChevronRight size={14} />
            </button>
        </div>
        {breadcrumbs}
      </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performSearch()}
              placeholder="Tìm kiếm..."
              className={`rounded-xl pl-10 pr-12 py-1.5 text-[12px] w-64 outline-none transition-all border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all active:scale-95"
              >
                <div className={`w-4 h-4 rounded-full border-2 ${isDarkMode ? 'bg-slate-900 border-white' : 'bg-white border-slate-900'}`} />
              </button>
            )}
            {onToggleRightSidebar && (
              <button 
                onClick={onToggleRightSidebar}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                  isRightSidebarVisible 
                    ? "bg-black text-white border-black" 
                    : "bg-slate-50 border-slate-100 text-slate-400 hover:text-brand-primary"
                }`}
              >
                <Search size={16} />
              </button>
            )}
          </div>
        </div>
    </header>
  );
}
