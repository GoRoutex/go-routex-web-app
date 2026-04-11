import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import xLogo from "/x-logo.png";
import {
  MapPinned,
  Calendar,
  Users,
  Ticket,
  ClipboardList,
  Settings,
  MessageSquare,
  ChevronRight,
  type LucideIcon,
  Navigation,
  Store,
} from "lucide-react";

interface NavItem {
  label: string;
  to?: string;
  icon?: LucideIcon | null;
  subItems?: { label: string; to: string }[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Hệ sinh thái",
    items: [
      { label: "Tổng quan nền tảng", to: "/admin/dashboard", icon: Navigation },
      { 
        label: "Nhà xe đối tác", 
        to: "/admin/merchants", 
        icon: Store,
        subItems: [
          { label: "Danh sách đối tác", to: "/admin/merchants" },
          { label: "Đơn đăng ký mới", to: "/admin/merchants/applications" },
        ]
      },
    ],
  },
  {
    title: "Tài chính",
    items: [
      {
        label: "Đối soát & Báo cáo",
        to: "/admin/reports/revenue",
        icon: ClipboardList,
        subItems: [
          { label: "Đối soát doanh thu", to: "/admin/reports/revenue" },
          { label: "Phân tích chiết khấu", to: "/admin/reports/expenses" },
          { label: "Lương & Thưởng", to: "/admin/reports/salaries" },
        ],
      },
      { label: "Vé & Đặt chỗ", to: "/admin/tickets", icon: Ticket },
    ],
  },
  {
    title: "Vận hành nền tảng",
    items: [
      { label: "Mạng lưới lịch trình", to: "/admin/schedules", icon: Calendar },
      { label: "Quản lý Địa điểm", to: "/admin/locations", icon: MapPinned },
      { label: "Tình trạng hệ thống", to: "/admin/health", icon: Settings },
    ],
  },
  {
    title: "Hỗ trợ & Giao tiếp",
    items: [
      { label: "Khiếu nại & Hỗ trợ", to: "/admin/feedback", icon: MessageSquare },
      { label: "Hồ sơ cá nhân", to: "/admin/profile/overview", icon: Users },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  isDarkMode?: boolean;
}

export function Sidebar({
  collapsed = false,
  isDarkMode = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (route?: string) =>
    Boolean(route && location.pathname === route);
  const isActiveBranch = (prefix?: string) =>
    Boolean(prefix && location.pathname.startsWith(prefix));

  return (
    <aside
      className={`flex flex-col h-screen py-8 shrink-0 overflow-y-auto border-r transition-all duration-300 ${
        collapsed ? "w-20 px-3" : "w-64 px-5"
      } ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
    >
      <Link
        to="/admin/dashboard"
        className={`flex items-center hover:opacity-80 transition-opacity group ${
          collapsed ? "justify-center mb-10 px-0" : "gap-3 mb-12 px-2"
        }`}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-terransparent shadow-lg shadow-brand-primary/20 ring-1 ring-brand-primary/10 group-hover:scale-105 transition-transform flex items-center justify-center p-1">
          <img
            src={xLogo}
            alt="Go Routex"
            className="h-full w-full object-contain object-center block scale-[1.45] translate-x-1"
          />
        </div>
        <div className={collapsed ? "hidden" : ""}>
          <span
            className={`font-black text-[17px] block leading-none tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Go Routex
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            Quản trị
          </span>
        </div>
      </Link>

      <div className="space-y-10">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3
              className={`text-[9px] font-black uppercase tracking-[0.15em] mb-4 ${
                collapsed ? "hidden" : "px-3"
              } ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const subActive = item.subItems?.some((sub) =>
                  isActiveRoute(sub.to),
                );
                const parentActive =
                  isActiveRoute(item.to) ||
                  Boolean(subActive) ||
                  isActiveBranch(item.to?.replace(/\/overview|\/revenue$/, ""));

                const itemClass = `flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } py-3 rounded-2xl text-[12px] font-bold transition-all duration-300 ${
                  parentActive
                    ? "bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`;

                const iconColor = parentActive
                  ? "text-brand-primary"
                  : isDarkMode
                    ? "text-slate-500"
                    : "text-slate-400";

                return (
                  <div key={item.label}>
                    {item.to ? (
                      <NavLink to={item.to} className={itemClass}>
                        {({ isActive }) => (
                          <>
                            {item.icon && (
                              <item.icon
                                size={18}
                                className={`transition-colors ${isActive || parentActive ? "text-brand-primary" : iconColor}`}
                              />
                            )}
                            {!item.icon && (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-0.5" />
                            )}
                            {!collapsed && (
                              <span className="flex-1">{item.label}</span>
                            )}
                            {!collapsed && item.subItems && (
                              <ChevronRight
                                size={14}
                                className={`transition-transform ${subActive ? "rotate-90 opacity-70" : "opacity-40"}`}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          item.subItems?.[0] && navigate(item.subItems[0].to)
                        }
                        className={itemClass}
                      >
                        {item.icon && (
                          <item.icon
                            size={18}
                            className={`transition-colors ${iconColor}`}
                          />
                        )}
                        {!item.icon && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5 mr-0.5" />
                        )}
                        {!collapsed && (
                          <span className="flex-1">{item.label}</span>
                        )}
                        {!collapsed && item.subItems && (
                          <ChevronRight
                            size={14}
                            className={`transition-transform ${subActive ? "rotate-90 opacity-70" : "opacity-40"}`}
                          />
                        )}
                      </button>
                    )}

                    {item.subItems && !collapsed && (
                      <div
                        className={`ml-8 mt-2 space-y-1.5 border-l pl-4 py-1 ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
                      >
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.to}
                            className={({ isActive }) =>
                              `block w-full text-left text-[11px] py-1.5 font-semibold transition-colors ${
                                isActive
                                  ? "text-brand-primary"
                                  : isDarkMode
                                    ? "text-slate-400 hover:text-slate-200"
                                    : "text-slate-400 hover:text-brand-primary"
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
