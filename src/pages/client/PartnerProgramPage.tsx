import { useNavigate } from 'react-router-dom';

import { 
  Bus, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Star,
  CheckCircle2,
} from 'lucide-react';

export default function PartnerProgramPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ══════════════════  HERO SECTION  ══════════════════ */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden bg-brand-dark text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] -ml-40 -mb-40" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-white/10">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-black uppercase tracking-wider">Chương trình đối tác Go Routex 2026</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tight">
                Số hóa vận tải, <br />
                <span className="text-brand-primary">Đột phá doanh thu</span>
              </h1>
              
              <p className="text-slate-400 text-lg lg:text-xl max-w-2xl leading-relaxed mb-12">
                Gia nhập hệ sinh thái Go Routex để tiếp cận hàng triệu hành khách, tối ưu hóa quy trình vận hành và nâng tầm thương hiệu vận tải của bạn.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <button 
                  onClick={() => navigate('/partner/register')}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-brand-primary/30 flex items-center gap-3 active:scale-95"
                >
                  Đăng ký ngay
                  <ArrowRight className="w-6 h-6" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all backdrop-blur-sm border border-white/10 active:scale-95">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 p-2 rounded-[3rem] backdrop-blur-md border border-white/10 shadow-2xl">
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Doanh thu đối tác</span>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-4xl font-black">+145%</div>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Tăng trưởng trung bình sau 6 tháng gia nhập</p>
                  </div>
                  <div className="p-8">
                     <div className="space-y-6">
                        {[
                          { label: 'Số chuyến đã hoàn tất', val: '24,500+', color: 'text-brand-primary' },
                          { label: 'Đánh giá từ khách hàng', val: '4.9/5.0', color: 'text-yellow-400' },
                          { label: 'Tỷ lệ lấp đầy chỗ', val: '92%', color: 'text-green-400' }
                        ].map(stat => (
                          <div key={stat.label} className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold text-sm">{stat.label}</span>
                            <span className={`${stat.color} font-black text-lg`}>{stat.val}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
              {/* Decorative rings */}
              <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 border border-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════  BENEFITS SECTION  ══════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Quyền lợi khi là đối tác</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Chúng tôi cung cấp bộ giải pháp toàn diện giúp nhà xe vận hành thông minh và hiệu quả hơn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Tiếp cận thị trường lớn",
                desc: "Hàng triệu khách hàng tìm kiếm và đặt vé mỗi ngày trên ứng dụng Go Routex.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: ShieldCheck,
                title: "Hệ thống quản lý 4.0",
                desc: "Công cụ quản lý lịch trình, xe, tài xế và doanh thu chuyên nghiệp theo thời gian thực.",
                color: "bg-green-50 text-green-600"
              },
              {
                icon: TrendingUp,
                title: "Tối ưu hóa lợi nhuận",
                desc: "Hệ thống định giá linh hoạt và phân tích dữ liệu giúp tối đa hóa tỷ lệ lấp đầy mỗi chuyến.",
                color: "bg-purple-50 text-purple-600"
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 group">
                <div className={`w-16 h-16 rounded-2xl ${benefit.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{benefit.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════  PROCESS SECTION  ══════════════════ */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[4rem] p-12 lg:p-20 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-5">
              <Bus className="w-64 h-64 text-brand-primary" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Hợp tác dễ dàng chỉ với 4 bước</h2>
                <div className="space-y-10">
                  {[
                    { step: "01", title: "Đăng ký thông tin", desc: "Điền thông tin cơ bản về doanh nghiệp vận tải của bạn." },
                    { step: "02", title: "Thẩm định & Ký kết", desc: "Go Routex sẽ liên hệ xác minh và ký hợp đồng hợp tác." },
                    { step: "03", title: "Cấu hình hệ thống", desc: "Thiết lập đội xe, lịch trình và điểm đón ngay trên Portal." },
                    { step: "04", title: "Bắt đầu đón khách", desc: "Các chuyến xe của bạn chính thức hiển thị và nhận đặt chỗ." }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-lg">
                          {s.step}
                        </div>
                        {i < 3 && <div className="w-0.5 h-full bg-slate-100 my-2" />}
                      </div>
                      <div className="pt-1">
                        <h4 className="text-xl font-black text-slate-900 mb-2">{s.title}</h4>
                        <p className="text-slate-500 font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-900/20">
                  <h3 className="text-3xl font-black mb-6">Bắt đầu ngay hôm nay?</h3>
                  <p className="text-white/60 mb-10 leading-relaxed font-medium">Tham gia cùng +500 nhà xe đang hoạt động hiệu quả trên nền tảng của chúng tôi.</p>
                  <ul className="space-y-4 mb-12">
                     {["Hỗ trợ 24/7", "Không phí khởi tạo", "Công nghệ vượt trội"].map(item => (
                       <li key={item} className="flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                         <span className="font-bold">{item}</span>
                       </li>
                     ))}
                  </ul>
                  <button 
                    onClick={() => navigate('/partner/register')}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-brand-primary/20"
                  >
                    Đăng ký làm đối tác
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
