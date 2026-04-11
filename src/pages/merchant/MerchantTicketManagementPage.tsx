import { Ticket, Search, Filter, Download, MoreHorizontal, User, Smartphone } from "lucide-react";

const tickets = [
  { id: "TK-8821", passenger: "Lê Thị Hồng", phone: "0901234xxx", trip: "Sài Gòn - Đà Lạt", seat: "A12", price: "350.000đ", status: "Đã thanh toán", time: "10/04/2026 08:30" },
  { id: "TK-8822", passenger: "Nguyễn Minh Quân", phone: "0908888xxx", trip: "Sài Gòn - Phan Thiết", seat: "B05", price: "220.000đ", status: "Chờ thanh toán", time: "10/04/2026 09:15" },
  { id: "TK-8823", passenger: "Trần Bảo Anh", phone: "0934567xxx", trip: "Sài Gòn - Vũng Tàu", seat: "08", price: "180.000đ", status: "Đã thanh toán", time: "10/04/2026 07:45" },
  { id: "TK-8824", passenger: "Phạm Hải Đăng", phone: "0912345xxx", trip: "Đà Lạt - Sài Gòn", seat: "A01", price: "350.000đ", status: "Đã hủy", time: "09/04/2026 22:00" },
];

export function MerchantTicketManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Quản lý vé & Đặt chỗ</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi danh sách vé bán ra và trạng thái đặt chỗ của khách hàng.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-2xl font-bold border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                <Download size={18} />
                Xuất báo cáo
            </button>
            <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all">
                <Ticket size={18} />
                Bán vé tại chỗ
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
            { label: 'Tổng vé hôm nay', value: '1,240', color: 'text-slate-900' },
            { label: 'Đã thanh toán', value: '1,150', color: 'text-emerald-500' },
            { label: 'Chờ xử lý', value: '65', color: 'text-orange-500' },
            { label: 'Đã hủy', value: '25', color: 'text-red-500' },
        ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm tên khách, số điện thoại, mã vé..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20" />
            </div>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"><Filter size={18} /> Bộ lọc</button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã vé</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tuyến / Ghế</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Giá tiền</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-sm font-black text-brand-primary">{t.id}</td>
                            <td className="px-6 py-5">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-slate-900 flex items-center gap-1.5"><User size={12} className="text-slate-400" /> {t.passenger}</div>
                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><Smartphone size={12} className="text-slate-300" /> {t.phone}</div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-slate-700">{t.trip}</div>
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ghế: {t.seat}</div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-black text-slate-900">{t.price}</td>
                            <td className="px-6 py-5 text-xs font-bold text-slate-500">{t.time}</td>
                            <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    t.status === 'Đà thanh toán' || t.status === 'Đã thanh toán' ? 'bg-emerald-50 text-emerald-600' : 
                                    t.status === 'Chờ thanh toán' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
