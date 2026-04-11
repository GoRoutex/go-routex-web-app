import { Calendar, Plus, MapPin, Clock, ArrowRight } from "lucide-react";

const schedules = [
  { id: "SCH-001", route: "Sài Gòn - Đà Lạt", departure: "08:00", arrival: "14:00", frequency: "Hàng ngày", activeTrips: 3 },
  { id: "SCH-002", route: "Sài Gòn - Phan Thiết", departure: "09:30", arrival: "13:30", frequency: "Hàng ngày", activeTrips: 2 },
  { id: "SCH-003", route: "Sài Gòn - Vũng Tàu", departure: "07:00", arrival: "09:00", frequency: "Mỗi 30 phút", activeTrips: 12 },
  { id: "SCH-004", route: "Đà Lạt - Sài Gòn", departure: "23:00", arrival: "05:00", frequency: "Hàng ngày", activeTrips: 5 },
];

export function MerchantScheduleManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Lịch trình chạy</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Thiết lập và quản lý các tuyến đường, giờ chạy cố định.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Tạo lịch trình
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Calendar size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                {s.id}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="font-black text-lg text-slate-900">{s.route.split(' - ')[0]}</div>
                <ArrowRight size={16} className="text-slate-300" />
                <div className="font-black text-lg text-slate-900">{s.route.split(' - ')[1]}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock size={12} /> Khởi hành
                  </div>
                  <div className="text-sm font-black text-slate-700">{s.departure}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MapPin size={12} /> Tần suất
                  </div>
                  <div className="text-sm font-black text-slate-700">{s.frequency}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                {s.activeTrips} chuyến đang chạy
              </div>
              <button className="text-sm font-black text-brand-primary hover:underline">
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
