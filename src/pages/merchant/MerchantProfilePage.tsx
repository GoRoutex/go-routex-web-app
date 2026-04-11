import {
  Store, Camera, MapPin, Phone, Mail, Globe, Shield,
  Linkedin, Facebook, Instagram, Twitter,
  Wifi, Coffee, Wind, Tv, Accessibility,
  Trash2, Image as ImageIcon, ExternalLink, HelpCircle
} from "lucide-react";

export function MerchantProfilePage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Banner Section */}
      <div className="relative">
        <div className="h-64 md:h-[400px] w-full rounded-[3rem] overflow-hidden shadow-sm group bg-slate-100 relative">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <button className="absolute bottom-6 right-8 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-white/20 hover:bg-white/30 transition-all">
            <Camera size={14} /> Thay ảnh bìa
          </button>
        </div>

        {/* Avatar Overlap */}
        <div className="absolute bottom-0 left-12 translate-y-1/2 z-10">
            <div className="relative group/avatar">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] bg-white p-2 shadow-lg ring-1 ring-slate-100">
                    <div className="w-full h-full rounded-[2rem] bg-slate-50 flex items-center justify-center text-brand-primary border border-slate-100">
                        <Store size={48} />
                    </div>
                </div>
                <button className="absolute bottom-2 -right-1 p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:scale-110 transition-all border-4 border-white">
                    <Camera size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Profile Info Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center px-2">
        <div className="hidden md:block w-[180px] shrink-0" /> {/* Precise spacer for avatar alignment */}
        <div className="flex-1 ml-5">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Nhà Xe Phương Trang</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">
                    <Shield size={10} className="fill-emerald-600/10" /> Đã xác thực
                </div>
            </div>
            <p className="text-slate-500 font-bold mt-1 text-sm tracking-tight">FUTA Bus Lines · Đối tác hạng Diamond · 20 năm phục vụ</p>
        </div>
        <div className="pt-6">
            <button className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                Sửa hồ sơ
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng chuyến xe', value: '45.2K', sub: '+1.2K tháng này' },
                    { label: 'Đánh giá TB', value: '4.9/5', sub: '12K+ lượt xem' },
                    { label: 'Tỉ lệ đúng giờ', value: '98.5%', sub: 'Cực kì uy tín' },
                    { label: 'Năm hoạt động', value: '15 năm', sub: 'Phát triển bền vững' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* General Info */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Thông tin doanh nghiệp</h3>
                    <button className="text-xs font-black text-brand-primary px-4 py-2 bg-brand-primary/5 rounded-xl hover:bg-brand-primary/10 transition-all">Sửa thông tin</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên thương mại</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                                <Store size={18} className="text-slate-400" />
                                <input type="text" defaultValue="Phương Trang" className="bg-transparent border-none text-sm font-bold text-slate-700 w-full outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hotline tổng đài</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Phone size={18} className="text-slate-400" />
                                <input type="text" defaultValue="1900 6067" className="bg-transparent border-none text-sm font-bold text-slate-700 w-full outline-none" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email liên hệ</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Mail size={18} className="text-slate-400" />
                                <input type="text" defaultValue="contact@phuongtrang.com" className="bg-transparent border-none text-sm font-bold text-slate-700 w-full outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Trang web chính thức</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Globe size={18} className="text-slate-400" />
                                <input type="text" defaultValue="www.phuongtrang.vn" className="bg-transparent border-none text-sm font-bold text-slate-700 w-full outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Giới thiệu nhà xe</label>
                    <textarea
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                        defaultValue="Phương Trang (FUTA Bus Lines) được thành lập từ năm 2001, với phương châm 'Chất lượng là danh dự'. Chúng tôi tự hào là đơn vị vận tải hành khách hàng đầu Việt Nam với mạng lưới tuyến đường phủ rộng khắp các tỉnh thành, cùng đội ngũ nhân viên chuyên nghiệp và phương tiện hiện đại bậc nhất."
                    />
                </div>
            </div>

            {/* Service Amenities */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Tiện ích dịch vụ</h3>
                    <p className="text-xs text-slate-400 font-bold">Lựa chọn các dịch vụ có sẵn trên xe của bạn</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: Wifi, label: 'Wi-Fi miễn phí', active: true },
                        { icon: Wind, label: 'Điều hòa AC', active: true },
                        { icon: Coffee, label: 'Nước uống & Khăn', active: true },
                        { icon: Tv, label: 'TV giải trí', active: true },
                        { icon: Accessibility, label: 'Chăn đắp', active: true },
                        { icon: HelpCircle, label: 'Hỗ trợ người khuyết tật', active: false },
                    ].map((item) => (
                        <button key={item.label} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            item.active ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                            <item.icon size={18} />
                            <span className="text-xs font-black">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-10">
            {/* Legal & Sidebar info */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Shield size={20} className="text-brand-primary" /> Pháp lý & Trụ sở
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mã số thuế</label>
                        <div className="p-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-between">
                            0301234567
                            <div className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] uppercase">Hợp lệ</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Trụ sở chính</label>
                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <MapPin size={18} className="text-slate-400 mt-1 shrink-0" />
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">80 Trần Hưng Đạo, P. Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh</p>
                        </div>
                    </div>
                </div>
                <button className="w-full py-4 rounded-2xl border border-slate-100 text-slate-500 font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Xem giấy phép kinh doanh
                </button>
            </div>

            {/* Social Links */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 text-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Mạng xã hội</h3>
                <div className="flex items-center justify-center gap-4">
                    {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                        <button key={i} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:scale-110 transition-all shadow-sm">
                            <Icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Visual Gallery */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Hình ảnh nhà xe</h3>
                    <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest cursor-pointer hover:underline">Thêm ảnh</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 size={16} className="text-white cursor-pointer hover:text-red-400" />
                        </div>
                    </div>
                    <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1557223562-6c77ff16210f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 size={16} className="text-white cursor-pointer hover:text-red-400" />
                        </div>
                    </div>
                    <div className="aspect-square rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
                        <ImageIcon size={20} className="text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase">Tải lên</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
