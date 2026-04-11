import { Bell, Lock, CreditCard, ChevronRight, Globe, Share2 } from "lucide-react";

export function MerchantSettingsPage() {
  const sections = [
    { title: "Cài đặt chung", items: [
        { icon: Bell, label: "Thông báo & Email", desc: "Quản lý cách hệ thống gửi thông báo cho bạn.", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Globe, label: "Ngôn ngữ & Vùng", desc: "Tiếng Việt (Việt Nam)", color: "text-emerald-500", bg: "bg-emerald-50" },
    ]},
    { title: "Bảo mật", items: [
        { icon: Lock, label: "Mật khẩu & Đăng nhập", desc: "Thay đổi mật khẩu và quản lý thiết bị.", color: "text-purple-500", bg: "bg-purple-50" },
        { icon: Share2, label: "Quản lý quyền truy cập", desc: "Phân quyền cho nhân viên quản lý.", color: "text-orange-500", bg: "bg-orange-50" },
    ]},
    { title: "Thanh toán", items: [
        { icon: CreditCard, label: "Phương thức nhận tiền", desc: "Quản lý tài khoản ngân hàng nhận doanh thu.", color: "text-black", bg: "bg-slate-100" },
    ]},
  ];

  return (
    <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Cài đặt hệ thống</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Tùy chỉnh cấu hình vận hành và bảo mật cho tài khoản nhà xe.</p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{section.title}</h3>
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-50">
              {section.items.map((item) => (
                <button key={item.label} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 font-bold">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10 border-t border-slate-100">
        <button className="text-sm font-black text-red-500 hover:text-red-700 transition-colors">Đăng xuất khỏi tài khoản nhà xe</button>
      </div>
    </div>
  );
}
