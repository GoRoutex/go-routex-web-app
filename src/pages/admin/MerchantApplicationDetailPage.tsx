import { ArrowLeft, Check, X, FileText, Building2, MapPin, Mail, Phone, Download, ShieldAlert, BadgeCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function MerchantApplicationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for detail
  const app = {
    id: id || "APP-4492",
    businessName: "Hải Vân Express",
    legalName: "Công ty Cổ phần Vận tải Hải Vân",
    taxCode: "0400123456",
    contactPerson: "Lê Minh Hải",
    role: "Giám đốc điều hành",
    email: "hai.minh@haivan.com",
    phone: "0912 345 678",
    submittedAt: "10/04/2026",
    address: "156 Nguyễn Văn Linh, Quận Thanh Khê, TP. Đà Nẵng",
    status: "Đang chờ",
    description: "Chúng tôi chuyên cung cấp dịch vụ vận tải hành khách tuyến Đà Nẵng - Huế - Quảng Bình với đội xe giường nằm đời mới 2023-2024.",
    fleetInfo: {
        total: 45,
        types: ["Giường nằm 40 chỗ", "Limousine 9 chỗ"],
        averageAge: "2 năm"
    },
    documents: [
      { name: "Giấy phép đăng ký kinh doanh.pdf", size: "2.4 MB" },
      { name: "Giấy phép kinh doanh vận tải.pdf", size: "1.8 MB" },
      { name: "Danh sách và hình ảnh đội xe.pdf", size: "15.2 MB" },
      { name: "Hồ sơ năng lực doanh nghiệp.pdf", size: "5.6 MB" }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">Chi tiết đơn đăng ký</h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{app.id} · {app.submittedAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-rose-600 px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-rose-50 transition-all">
            <X size={16} /> Từ chối hồ sơ
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.05] transition-all">
            <Check size={16} /> Phê duyệt đối tác
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-50">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                    <Building2 size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900">{app.businessName}</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">{app.legalName}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs font-black px-3 py-1 bg-slate-50 text-slate-500 rounded-lg w-fit">
                        Mã số thuế: {app.taxCode}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Địa chỉ trụ sở</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <MapPin size={16} className="text-slate-300" />
                        {app.address}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Người đại diện pháp luật</p>
                    <div className="text-sm font-black text-slate-700">
                        {app.contactPerson} <span className="text-slate-400 ml-1">({app.role})</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Email liên hệ</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <Mail size={16} className="text-slate-300" />
                        {app.email}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Số điện thoại</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <Phone size={16} className="text-slate-300" />
                        {app.phone}
                    </div>
                </div>
            </div>

            <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Giới thiệu doanh nghiệp</p>
                <p className="text-sm font-bold text-slate-600 italic leading-relaxed">"{app.description}"</p>
            </div>
          </div>

          {/* Fleet Info */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                Năng lực vận tải
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Tổng số xe</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{app.fleetInfo.total}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Độ tuổi TB</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{app.fleetInfo.averageAge}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Loại xe chính</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{app.fleetInfo.types.join(", ")}</p>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            {/* Documents List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Hồ sơ đính kèm</h3>
                <div className="space-y-3">
                    {app.documents.map((doc, i) => (
                        <div key={i} className="group p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-brand-primary/20 rounded-2xl transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-brand-primary shadow-sm border border-slate-100">
                                        <FileText size={16} />
                                    </div>
                                    <div className="max-w-[140px]">
                                        <p className="text-xs font-black text-slate-900 truncate">{doc.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{doc.size}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-brand-primary transition-colors">
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checklist/Validation */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-amber-400" />
                    Danh mục soát xét
                </h3>
                <div className="space-y-4">
                    {[
                        "Kiểm tra Mã số thuế",
                        "Xác thực địa chỉ trụ sở",
                        "Đối chiếu CMND/CCCD đại diện",
                        "Xác nhận giấy phép vận tải"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-5 h-5 rounded-md border-2 border-slate-700 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                                <Check size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                        <BadgeCheck size={24} className="text-emerald-500" />
                        <div>
                            <p className="text-[11px] font-black leading-none">AI Score: 98/100</p>
                            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Hồ sơ rất uy tín</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
