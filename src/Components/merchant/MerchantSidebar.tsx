import { Link, NavLink, useLocation } from "react-router-dom";
import {
    MapPin,
    Calendar,
    Users,
    Wrench,
    Ticket,
    ClipboardList,
    Settings,
    MessageSquare,
    ChevronRight,
    type LucideIcon,
    Bus,
    LayoutDashboard,
    Store,
    Copy,
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

const merchantNavGroups: NavGroup[] = [
    {
        title: "Overview",
        items: [
            { label: "Bảng điều khiển", to: "/merchant/portal", icon: LayoutDashboard },
        ],
    },
    {
        title: "Management",
        items: [
            { label: "Đội xe của tôi", to: "/merchant/vehicles", icon: Bus },
            { label: "Mẫu cấu hình xe", to: "/merchant/vehicle-templates", icon: Copy },
            { label: "Chi nhánh", to: "/merchant/departments", icon: MapPin },
            { label: "Quản lý Tuyến đường", to: "/merchant/schedules", icon: MapPin },
            { label: "Quản lý Chuyến xe", to: "/merchant/trips", icon: Calendar },
            { label: "Quản lý vé", to: "/merchant/tickets", icon: Ticket },
        ],
    },
    {
        title: "Operations",
        items: [
            { label: "Phản hồi khách hàng", to: "/merchant/feedback", icon: MessageSquare },
            { label: "Tài xế & Phụ xe", to: "/merchant/staff", icon: Users },
            { label: "Bảo trì xe", to: "/merchant/maintenance", icon: Wrench },
        ],
    },
    {
        title: "Clients & System",
        items: [
            { label: "Doanh thu", to: "/merchant/reports/revenue", icon: ClipboardList },
            {
                label: "Cấu hình",
                icon: Settings,
                subItems: [
                    { label: "Thông tin nhà xe", to: "/merchant/profile" },
                    { label: "Cài đặt hệ thống", to: "/merchant/settings" },
                ],
            },
        ],
    },
];

interface MerchantSidebarProps {
    collapsed?: boolean;
    isDarkMode?: boolean;
    merchantName?: string;
    merchantLogo?: string;
}

export function MerchantSidebar({
    collapsed = false,
    isDarkMode = false,
    merchantName,
    merchantLogo,
}: MerchantSidebarProps) {
    const location = useLocation();

    const isActiveRoute = (route?: string) =>
        Boolean(route && location.pathname === route);

    return (
        <aside
            className={`flex flex-col h-screen py-6 shrink-0 overflow-y-auto border-r transition-all duration-300 ${collapsed ? "w-20 px-3" : "w-64 px-4"
                } ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
        >
            {/* Branding - Consistent with user request */}
            <Link
                to="/home"
                className={`flex items-center hover:opacity-80 transition-opacity group ${collapsed ? "justify-center mb-10 px-0" : "gap-3 mb-10 px-2"
                    }`}
            >
                <div className={`rounded-2xl overflow-hidden flex items-center justify-center transition-all ${collapsed ? "w-12 h-12" : "w-14 h-14"
                    } ${!merchantLogo ? "bg-brand-primary/10 p-2.5 shadow-sm" : ""}`}>
                    {merchantLogo ? (
                        <img
                            src={merchantLogo}
                            alt="Logo"
                            className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                    ) : (
                        <Store className="w-full h-full text-brand-primary" />
                    )}
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className={`font-black text-[16px] leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                            Merchant Hub
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {merchantName || "Đang tải..."}
                        </span>
                    </div>
                )}
            </Link>

            <div className="space-y-8">
                {merchantNavGroups.map((group) => (
                    <div key={group.title}>
                        {!collapsed && (
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] mb-3 px-3 text-slate-400/80">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isItemActive = isActiveRoute(item.to) || (item.subItems?.some(s => isActiveRoute(s.to)));

                                return (
                                    <div key={item.label}>
                                        <NavLink
                                            to={item.to || "#"}
                                            onClick={(e) => { if (!item.to) e.preventDefault(); }}
                                            className={`flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"
                                                } py-2.5 rounded-xl text-[13px] font-bold transition-all ${isItemActive
                                                    ? "bg-black text-white shadow-md shadow-black/10"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            {item.icon && (
                                                <item.icon
                                                    size={18}
                                                    strokeWidth={isItemActive ? 2.5 : 2}
                                                />
                                            )}
                                            {!collapsed && (
                                                <span className="flex-1">{item.label}</span>
                                            )}
                                            {!collapsed && (item.subItems || isItemActive) && (
                                                <ChevronRight
                                                    size={14}
                                                    className={`${isItemActive ? "rotate-0 text-white" : "text-slate-300"}`}
                                                />
                                            )}
                                        </NavLink>

                                        {!collapsed && item.subItems && (
                                            <div className="mt-1 ml-4 border-l border-slate-100 pl-4 space-y-1">
                                                {item.subItems.map((sub) => {
                                                    const isSubActive = isActiveRoute(sub.to);
                                                    return (
                                                        <NavLink
                                                            key={sub.label}
                                                            to={sub.to}
                                                            className={`flex items-center gap-2 py-1.5 text-[12px] font-bold transition-colors ${isSubActive
                                                                ? "text-slate-900"
                                                                : "text-slate-400 hover:text-slate-600"
                                                                }`}
                                                        >
                                                            {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                                                            {sub.label}
                                                        </NavLink>
                                                    );
                                                })}
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
