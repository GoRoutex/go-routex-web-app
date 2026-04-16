import { Link } from "react-router-dom"
import { Bus, LayoutDashboard, TrendingUp } from "lucide-react"

export const Footer = () => {
    return (
        <footer className="mt-auto bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                                <Bus className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-900">
                                GO ROUTEX
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Hệ thống đặt vé xe công nghệ hàng đầu Việt Nam. Mang lại trải
                            nghiệm di chuyển hiện đại, an toàn và thông minh.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                            Về chúng tôi
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Tuyển dụng", to: "#" },
                                { label: "Tin tức", to: "#" },
                                { label: "Liên hệ chúng tôi", to: "/lien-he-chung-toi" },
                                { label: "Quy định chung", to: "#" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-slate-500 text-sm hover:text-brand-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                            Hỗ trợ khách hàng
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Chính sách bảo mật", to: "/chinh-sach-bao-mat" },
                                { label: "Điều khoản dịch vụ", to: "/dieu-khoan-dich-vu" },
                                { label: "Hướng dẫn thanh toán", to: "/support" },
                                { label: "Câu hỏi thường gặp", to: "/support" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-slate-500 text-sm hover:text-brand-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-6 font-bold uppercase tracking-widest text-xs">
                            Tải ứng dụng
                        </h4>
                        <div className="flex flex-col gap-3">
                            <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 font-bold leading-none mb-1">
                                        Tải trên
                                    </p>
                                    <p className="text-sm text-white font-black leading-none">
                                        App Store
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 font-bold leading-none mb-1">
                                        Tải trên
                                    </p>
                                    <p className="text-sm text-white font-black leading-none">
                                        Google Play
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="text-slate-400 text-sm font-medium">
                        © 2026 Go Routex JSC. Mọi quyền được bảo lưu.
                    </span>
                    <div className="flex gap-8">
                        {["Facebook", "LinkedIn", "Instagram"].map((s) => (
                            <a
                                key={s}
                                href="#"
                                className="text-slate-400 hover:text-brand-primary transition-colors text-sm font-bold"
                            >
                                {s}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
