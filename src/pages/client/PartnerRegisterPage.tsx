import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function PartnerRegisterPage() {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 2) {
      setFormStep(2);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Gửi yêu cầu thành công!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Cảm ơn bạn đã quan tâm đến chương trình đối tác của Go Routex. Đội ngũ chúng tôi sẽ thẩm định thông tin và liên hệ với bạn trong vòng 24 giờ làm việc.
          </p>
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 active:scale-95 transition-all"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Decoration - Desktop Only */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-dark relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] -ml-64 -mb-64" />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase">GO ROUTEX</span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-8 tracking-tight">
            Nâng tầm doanh nghiệp <br />
            <span className="text-brand-primary">Vận tải của bạn</span>
          </h1>
          
          <div className="space-y-8">
            {[
              { title: "Minh bạch tuyệt đối", desc: "Quản lý doanh thu và lịch trình rõ ràng đến từng ghế ngồi." },
              { title: "Hỗ trợ kỹ thuật 24/7", desc: "Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn vận hành hệ thống." },
              { title: "Công nghệ tiên phong", desc: "Ứng dụng AI giúp tối ưu lộ trình và dự báo nhu cầu khách hàng." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="text-white font-black text-lg mb-1">{item.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="max-w-xl w-full">
          <div className="mb-12">
             <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900">GO ROUTEX</span>
             </div>
             
             <div className="flex items-center gap-4 mb-4">
                <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${formStep === 1 ? 'bg-brand-primary text-white' : 'bg-green-100 text-green-600'}`}>
                   {formStep === 1 ? 'Bước 1: Thông tin liên hệ' : 'Đã xong bước 1'}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${formStep === 2 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                   Bước 2: Thông tin doanh nghiệp
                </span>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">Đăng ký đối tác</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {formStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Họ và tên người đại diện</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input required className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900" placeholder="Nguyễn Văn A" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email công việc</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input required type="email" className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900" placeholder="partner@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input required className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900" placeholder="0901 234 567" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tên nhà xe / Doanh nghiệp</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input required className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900" placeholder="VD: Nhà xe Phương Trang" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mã số thuế</label>
                  <div className="relative">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input required className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900" placeholder="10 chữ số hoặc 13 chữ số" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Địa chỉ trụ sở chính</label>
                  <textarea required className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 px-6 outline-none focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-900 resize-none" rows={3} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."></textarea>
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {formStep === 2 && (
                <button 
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-2xl font-black text-lg transition-all active:scale-95"
                >
                  Quay lại
                </button>
              )}
              <button 
                type="submit"
                className="flex-[2] bg-brand-primary hover:bg-brand-dark text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {formStep === 1 ? 'Tiếp theo' : 'Gửi yêu cầu hợp tác'}
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-slate-400 text-sm font-medium">
            Bạn đã là đối tác? <button onClick={() => navigate('/login')} className="text-brand-primary font-black hover:underline">Đăng nhập Portal</button>
          </p>
        </div>
      </div>
    </div>
  );
}
