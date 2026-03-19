import { useNavigate } from 'react-router-dom'
import {
  Bus,
  Search,
  Armchair,
  CalendarClock,
  TicketCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown
} from 'lucide-react'

const FeatureCard = ({
  icon: Icon,
  title,
  description
}: {
  icon: any,
  title: string,
  description?: string
}) => (
  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 transition-all hover:border-brand-primary/50 group shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-1">
    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:bg-brand-primary/20 transition-colors">
      <Icon className="w-7 h-7 text-brand-primary" />
    </div>
    <h3 className="text-slate-900 font-black text-xl mb-3 tracking-tight">{title}</h3>
    {description && <p className="text-slate-500 text-base font-medium leading-relaxed">{description}</p>}
  </div>
)

const StatCard = ({ value, label }: { value: string, label: string }) => (
  <div className="bg-white rounded-[2rem] px-8 py-8 border border-white flex-1 shadow-xl shadow-slate-200/50">
    <div className="text-brand-primary text-4xl font-black mb-2 tracking-tighter">{value}</div>
    <div className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">{label}</div>
  </div>
)

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-primary/30 font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/30">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-slate-900 text-2xl font-black tracking-tight leading-none group">GO <span className="text-brand-primary">ROUTEX</span></div>
            <div className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Vận tải thông minh</div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-500 font-black text-sm uppercase tracking-widest hover:text-brand-primary transition-colors"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-brand-dark hover:bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-dark/10 hover:shadow-brand-primary/25 hover:-translate-y-1"
          >
            Đăng ký ngay
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-16 pb-32 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <TrendingDown className="w-4 h-4" />
            Nền tảng vận tải thế hệ mới
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight text-slate-900">
            Đặt vé <span className="text-brand-primary">thông minh,</span><br />
             hành trình <span className="text-brand-secondary">trọn vẹn.</span>
          </h1>

          <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-xl">
            Tìm kiếm lộ trình, chọn chỗ ngồi trực quan và trải nghiệm quy trình 
            đặt vé hiện đại nhất dành riêng cho các nhà xe chuyên nghiệp.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            <button
              onClick={() => navigate('/home')}
              className="bg-brand-primary hover:bg-brand-dark text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-brand-primary/30 hover:shadow-brand-dark/30 flex items-center gap-3 hover:-translate-y-1"
            >
              Khám phá lộ trình
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white border-2 border-slate-100 hover:border-brand-primary/30 text-slate-600 px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1"
            >
              Quản lý đặt vé
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10">
            <StatCard value="24/7" label="Giám sát chuyến" />
            <StatCard value="Live" label="Sơ đồ ghế thực" />
            <StatCard value="Fast" label="Đặt vé siêu tốc" />
          </div>
        </div>

        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div className="space-y-8 pt-16">
              <FeatureCard
                icon={Search}
                title="Tìm kiếm lộ trình"
                description="Tìm thấy những chuyến đi tốt nhất trên mọi vùng miền chỉ trong vài giây."
              />
              <FeatureCard
                icon={CalendarClock}
                title="Sắp xếp chuyến"
                description="Tự động phân bổ xe và tài xế cho từng hành trình một cách thông minh."
              />
            </div>
            <div className="space-y-8">
              <FeatureCard
                icon={Armchair}
                title="Sơ đồ chỗ ngồi"
                description="Chọn ghế trực quan với cập nhật tình trạng chỗ trống theo thời gian thực."
              />
              <FeatureCard
                icon={TicketCheck}
                title="Quy trình thanh toán"
                description="Trải nghiệm đặt vé xuyên suốt với hệ thống vé điện tử hiện đại."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Info Section */}
      <section className="bg-white text-slate-900 py-32 rounded-[4rem] mx-8 mb-8 shadow-2xl shadow-slate-200/50 border border-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">Vận hành nhà xe trong tầm tay</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
                Từ việc lập kế hoạch chuyến đi đến giữ chỗ và xác nhận đặt vé, 
                mọi thứ luôn được đồng bộ hóa tức thời trên toàn bộ nền tảng.
              </p>
            </div>
            <div className="w-24 h-24 rounded-[2.5rem] bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/40 group hover:rotate-12 transition-transform">
              <TicketCheck className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-8">
                 <CheckCircle2 className="w-8 h-8 text-brand-primary" />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight">Khởi hành đúng giờ</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Quản lý và điều hành các chuyến đi với kế hoạch khởi hành chính xác và công cụ điều chỉnh linh hoạt.
              </p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-8">
                 <CheckCircle2 className="w-8 h-8 text-brand-secondary" />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight">Ghế trống thực tế</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Theo dõi vé đã bán, đang giữ chỗ và các ghế bị khóa theo thời gian thực với hệ thống kho chỗ tập trung.
              </p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-8">
                 <CheckCircle2 className="w-8 h-8 text-brand-accent" />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight">Đồng bộ tức thời</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Mọi giao dịch đặt vé, hủy chuyến hoặc thay đổi đều được phản ánh ngay lập tức trên tất cả thiết bị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
               <Bus className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-slate-300 tracking-[0.2em] uppercase text-sm">Go Routex &copy; 2026</span>
          </div>

          <div className="flex flex-wrap justify-center gap-10 text-slate-500 text-sm font-black uppercase tracking-widest">
            <a href="#" className="hover:text-brand-primary transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Liên hệ chúng tôi</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
