import { MessageSquare, Star, Search, User, CheckCircle2, Clock } from "lucide-react";

export function MerchantFeedbackPage() {
  const feedbacks = [
    { id: 1, user: "Nguyễn Trung Kiên", rating: 5, comment: "Xe sạch sẽ, tài xế lái rất êm và đúng giờ. Rất hài lòng với nhà xe Phương Trang.", date: "10/04/2026", trip: "Sài Gòn - Đà Lạt", status: "Đã phản hồi" },
    { id: 2, user: "Hoàng Thảo Vy", rating: 4, comment: "Chất lượng ổn, tuy nhiên trạm dừng nghỉ hơi đông đúc.", date: "09/04/2026", trip: "Sài Gòn - Vũng Tàu", status: "Đang chờ" },
    { id: 3, user: "Phạm Minh Hoàng", rating: 5, comment: "Dịch vụ tuyệt vời, nhân viên hỗ trợ nhiệt tình.", date: "08/04/2026", trip: "Sài Gòn - Phan Thiết", status: "Đã phản hồi" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Phản hồi khách hàng</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Lắng nghe ý kiến từ hành khách để cải thiện dịch vụ của nhà xe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Đánh giá trung bình</p>
            <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-slate-900">4.8</h3>
                <div className="flex mb-1.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-medium">Dựa trên 1,250 lượt đánh giá</p>
        </div>
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm"><CheckCircle2 size={24} /></div>
                <div>
                    <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Tích cực</p>
                    <p className="text-xl font-black text-emerald-700">92%</p>
                </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-50 shadow-sm"><MessageSquare size={24} className="text-blue-500" /></div>
                <div>
                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">Tổng phản hồi</p>
                    <p className="text-xl font-black text-blue-700">1,250</p>
                </div>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-50 shadow-sm"><Clock size={24} className="text-orange-500" /></div>
                <div>
                    <p className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest">Chờ xử lý</p>
                    <p className="text-xl font-black text-orange-700">12</p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50">
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm kiếm phản hồi..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20" />
            </div>
        </div>
        <div className="divide-y divide-slate-50">
            {feedbacks.map(f => (
                <div key={f.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={20} /></div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">{f.user}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex">
                                        {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold tracking-tight">{f.date} · {f.trip}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${f.status === 'Đã phản hồi' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {f.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">{f.comment}</p>
                    <div className="mt-4 pl-[52px] flex items-center gap-4">
                        <button className="text-xs font-black text-brand-primary hover:underline">Phản hồi</button>
                        <button className="text-xs font-black text-slate-400 hover:text-slate-600">Ghim đánh giá</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
