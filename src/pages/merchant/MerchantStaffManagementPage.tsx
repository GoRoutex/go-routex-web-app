import { Users, Plus, Search, MoreHorizontal, UserCheck, ShieldCheck, Mail, Phone } from "lucide-react";

export function MerchantStaffManagementPage() {
  const staff = [
    { id: 1, name: "Trần Thế Vinh", role: "Tài xế chính", email: "vinh.tt@phuongtrang.com", phone: "0901234xxx", status: "Đang làm việc", vehicle: "51B-123.45" },
    { id: 2, name: "Nguyễn Văn Hùng", role: "Tài xế phụ", email: "hung.nv@phuongtrang.com", phone: "0905555xxx", status: "Nghỉ phép", vehicle: "51B-678.90" },
    { id: 3, name: "Lê Thị Lan", role: "Nhân viên phòng vé", email: "lan.lt@phuongtrang.com", phone: "0908888xxx", status: "Đang làm việc", vehicle: "-" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Tài xế & Nhân sự</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Quản lý đội ngũ nhân viên, tài xế và phân quyền hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Thêm nhân sự
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary"><Users size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng nhân sự</p>
                <p className="text-2xl font-black text-slate-900">45</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500"><UserCheck size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang trực</p>
                <p className="text-2xl font-black text-slate-900">28</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500"><ShieldCheck size={28} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quản lý</p>
                <p className="text-2xl font-black text-slate-900">4</p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-50">
            <div className="relative max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo tên, email, số điện thoại..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20" />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nhân viên</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Xe đảm nhận</th>
                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {staff.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                                <span className="text-sm font-black text-slate-900">{s.name}</span>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{s.role}</span>
                            </td>
                            <td className="px-6 py-5">
                                <div className="space-y-0.5">
                                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {s.email}</div>
                                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {s.phone}</div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-xs font-bold text-slate-600">{s.vehicle}</span>
                            </td>
                            <td className="px-6 py-5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'Đang làm việc' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {s.status}
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
