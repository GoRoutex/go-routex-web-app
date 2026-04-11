import { Bus, Plus, Search, Filter, MoreHorizontal } from "lucide-react";

const vehicles = [
  { id: "V-001", plate: "51B-123.45", type: "Giường nằm 40 chỗ", status: "Hoạt động", year: "2023", nextMaintenance: "15/05/2026" },
  { id: "V-002", plate: "51B-678.90", type: "Limousine 9 chỗ", status: "Đang chạy", year: "2024", nextMaintenance: "20/04/2026" },
  { id: "V-003", plate: "51B-555.55", type: "Ghế ngồi 29 chỗ", status: "Bảo trì", year: "2022", nextMaintenance: "10/04/2026" },
  { id: "V-004", plate: "51B-999.99", type: "Giường nằm 40 chỗ", status: "Hoạt động", year: "2023", nextMaintenance: "30/05/2026" },
];

export function MerchantVehicleManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Quản lý đội xe</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Danh sách phương tiện đang hoạt động của nhà xe.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Thêm xe mới
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo biển số, loại xe..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Lọc
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Biển số</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại xe</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Đời xe</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Bảo trì kế tiếp</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <Bus size={20} />
                    </div>
                    <span className="text-sm font-black text-slate-900">{v.plate}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.type}</td>
                <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.year}</td>
                <td className="px-6 py-5 text-sm font-bold text-slate-500">{v.nextMaintenance}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    v.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-600' : 
                    v.status === 'Đang chạy' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {v.status}
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
  );
}
