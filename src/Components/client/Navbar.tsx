import { useNavigate, useLocation } from "react-router-dom"
import { Bus } from "lucide-react"
import { useState } from "react"
import { ClientAccountMenu } from "./ClientAccountMenu"
import { RoleBasedNav } from "./RoleBasedNav"
import { getClientHomeRoute } from "../../utils/auth"

export const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname

    const [isLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true")
    const [userName] = useState(() => localStorage.getItem("profileFullName") || localStorage.getItem("userName") || "")
    const [userEmail] = useState(() => localStorage.getItem("userEmail") || "")
    const [userAvatarUrl] = useState(() => localStorage.getItem("profileAvatarUrl") || "")

    const navItems = [
        { label: "Trang chủ", path: getClientHomeRoute() },
        { label: "Tuyến đường", path: "/routes" },
        { label: "Lịch trình", path: "/schedules" },
        { label: "Hỗ trợ", path: "/support" },
        { label: "Đối tác", path: "/partner" },
    ]

    const isActive = (path: string) => {
        if (path === "/" || path === "/home") {
            return currentPath === "/" || currentPath === "/home"
        }
        return currentPath.startsWith(path)
    }

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(getClientHomeRoute())}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                        <Bus className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
                        GO <span className="text-brand-primary">ROUTEX</span>
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-10">
                    {navItems.map((item) => {
                        const active = isActive(item.path)
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`text-sm font-semibold transition-all relative py-2 ${
                                    active ? "text-brand-primary" : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                {item.label}
                                {active && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full animate-in fade-in zoom-in duration-300" />
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Auth */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <RoleBasedNav />
                            <ClientAccountMenu
                                fullName={userName || "Chào bạn"}
                                avatarUrl={userAvatarUrl}
                                email={userEmail}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-lg transition-all"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => navigate("/register")}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                            >
                                Đăng ký ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
