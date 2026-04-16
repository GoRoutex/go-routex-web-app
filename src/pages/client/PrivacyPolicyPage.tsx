import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, Eye, Database, FileText, CalendarDays } from 'lucide-react'

const sections = [
  {
    title: 'Thông tin chúng tôi thu thập',
    body: 'Chúng tôi chỉ thu thập những dữ liệu cần thiết để vận hành dịch vụ, bao gồm thông tin tài khoản, lịch sử đặt vé, thông tin thanh toán đã được mã hóa và các dữ liệu kỹ thuật cơ bản từ thiết bị của bạn.',
  },
  {
    title: 'Cách chúng tôi sử dụng dữ liệu',
    body: 'Dữ liệu được dùng để xử lý đặt vé, hỗ trợ khách hàng, gửi thông báo liên quan đến chuyến đi, cải thiện trải nghiệm sử dụng và ngăn chặn hành vi gian lận.',
  },
  {
    title: 'Chia sẻ với bên thứ ba',
    body: 'Chúng tôi chỉ chia sẻ dữ liệu khi cần thiết cho việc cung cấp dịch vụ, ví dụ với đơn vị vận hành chuyến xe, cổng thanh toán hoặc khi pháp luật yêu cầu.',
  },
  {
    title: 'Quyền của bạn',
    body: 'Bạn có thể yêu cầu xem, cập nhật, xuất hoặc xóa một phần dữ liệu cá nhân của mình theo quy định hiện hành bằng cách liên hệ với đội hỗ trợ.',
  },
]

export default function PrivacyPolicyPage() {


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-primary/20">

      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <section className="relative overflow-hidden rounded-[3rem] bg-brand-dark text-white p-10 lg:p-16 shadow-2xl shadow-slate-200/50">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-brand-primary/30 blur-3xl" />
            <div className="absolute -bottom-24 left-8 w-80 h-80 rounded-full bg-brand-accent/20 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4" />
              Chính sách bảo mật
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Bảo vệ dữ liệu cá nhân của bạn là ưu tiên hàng đầu.
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl">
              Trang này mô tả cách Go Routex thu thập, sử dụng và bảo vệ thông tin khi bạn sử dụng nền tảng đặt vé của chúng tôi.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <CalendarDays className="w-4 h-4" />
                Cập nhật lần cuối: 27/03/2026
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <Lock className="w-4 h-4" />
                Dữ liệu được bảo vệ bằng các biện pháp kỹ thuật phù hợp
              </span>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.35fr_0.65fr] gap-8 mt-10">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <article key={section.title} className="bg-white rounded-[2.25rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    {index === 0 && <Eye className="w-6 h-6 text-brand-primary" />}
                    {index === 1 && <Database className="w-6 h-6 text-brand-primary" />}
                    {index === 2 && <FileText className="w-6 h-6 text-brand-primary" />}
                    {index === 3 && <ShieldCheck className="w-6 h-6 text-brand-primary" />}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{section.title}</h2>
                    <p className="text-slate-500 text-base leading-relaxed font-medium">{section.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 h-max">
            <div className="bg-white rounded-[2.25rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/40">
              <h2 className="text-2xl font-black tracking-tight mb-4">Liên hệ về quyền riêng tư</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Nếu bạn có câu hỏi về chính sách bảo mật, đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ.
              </p>
              <div className="space-y-4 text-sm font-medium">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Email</div>
                  <a href="mailto:support@goroutex.com" className="text-brand-primary font-bold break-all">support@goroutex.com</a>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Hotline</div>
                  <a href="tel:+84900000000" className="text-brand-primary font-bold">+84 900 000 000</a>
                </div>
              </div>
            </div>

            <div className="rounded-[2.25rem] bg-brand-primary text-white p-8 shadow-2xl shadow-brand-primary/20">
              <h3 className="text-2xl font-black tracking-tight mb-3">Bạn muốn cập nhật dữ liệu?</h3>
              <p className="text-white/80 leading-relaxed mb-6">
                Hãy đến trang liên hệ để gửi yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân.
              </p>
              <Link
                to="/lien-he-chung-toi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-primary font-black hover:bg-slate-50 transition-colors"
              >
                Tới trang liên hệ
              </Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
