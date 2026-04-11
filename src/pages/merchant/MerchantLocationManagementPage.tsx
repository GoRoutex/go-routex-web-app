import { MapPin, Plus, Map as MapIcon, Navigation, MoreVertical } from "lucide-react";

export function MerchantLocationManagementPage() {
  const locations = [
    { id: 1, name: "Văn phòng Lê Hồng Phong", address: "233 Lê Hồng Phong, P.4, Q.5, TP.HCM", type: "Văn phòng chính", city: "Hồ Chí Minh" },
    { id: 2, name: "Bến xe Miền Đông", address: "Quầy vé số 14, 292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh", type: "Điểm đón/trả", city: "Hồ Chí Minh" },
    { id: 3, name: "Văn phòng Đà Lạt", address: "01 Tô Hiến Thành, P.3, TP. Đà Lạt", type: "Văn phòng / Kho", city: "Lâm Đồng" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Điểm đón & Trả khách</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Hệ thống các văn phòng, bến xe và điểm đón trả của nhà xe trên toàn quốc.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Thêm địa điểm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <MapPin size={24} />
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1.5 focus:bg-slate-50 rounded-lg">
                    <MoreVertical size={18} />
                </button>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 leading-tight">{loc.name}</h3>
                <div className="flex items-start gap-2">
                    <Navigation size={14} className="text-slate-300 mt-1 shrink-0" />
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{loc.address}</p>
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loc.type}</span>
                <span className="flex items-center gap-1.5 text-xs font-black text-brand-primary">
                    <MapIcon size={14} /> Xem bản đồ
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
