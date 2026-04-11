import { Wrench, Plus, Search, AlertCircle, CheckCircle } from "lucide-react";

export function MerchantMaintenancePage() {
  const records = [
    { id: 1, vehicle: "51B-123.45", date: "10/04/2026", cost: "5.500.000 VNĐ", description: "Thay nhớt, kiểm tra phanh, bảo dưỡng định kỳ 50.000km", status: "Hoàn thành" },
    { id: 2, vehicle: "51B-678.90", date: "15/04/2026", cost: "-", description: "Thay lốp mới, kiểm tra hệ thống điều hòa", status: "Sắp tới" },
    { id: 3, vehicle: "51B-555.55", date: "12/04/2026", cost: "2.000.000 VNĐ", description: "Sửa chữa đèn tín hiệu phía sau", status: "Đang thực hiện" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Bảo trì & Sửa chữa</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi lịch sử bảo trì và lập kế hoạch sửa chữa định kỳ cho đội xe.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Ghi nhận bảo trì
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-sm"><AlertCircle size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest">Cần bảo trì</p>
                <p className="text-2xl font-black text-orange-700">3 xe</p>
            </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm"><Wrench size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">Đang sửa chữa</p>
                <p className="text-2xl font-black text-blue-700">1 xe</p>
            </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm"><CheckCircle size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Hoàn thành tháng này</p>
                <p className="text-2xl font-black text-emerald-700">12 xe</p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50">
            <div className="relative max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo biển số, nội dung bảo trì..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20" />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phương tiện</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung thực hiện</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Chi phí</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-sm font-black text-slate-900">{r.vehicle}</td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-500">{r.date}</td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-600 max-w-md truncate">{r.description}</td>
                            <td className="px-6 py-5 text-sm font-black text-slate-900">{r.cost}</td>
                            <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    r.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-600' : 
                                    r.status === 'Sắp tới' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                    {r.status}
                                </span>
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
