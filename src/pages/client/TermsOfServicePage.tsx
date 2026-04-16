import { Link } from 'react-router-dom'
import { FileBadge2, Scale, ClipboardCheck, Ban, Ticket, CalendarDays } from 'lucide-react'

const terms = [
  {
    title: 'Tài khoản và thông tin người dùng',
    body: 'Bạn cần cung cấp thông tin chính xác và cập nhật khi tạo tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình.',
  },
  {
    title: 'Đặt vé, thanh toán và hoàn tiền',
    body: 'Mọi giao dịch đặt vé chỉ được xác nhận khi hệ thống ghi nhận thanh toán thành công. Các yêu cầu hoàn hoặc đổi vé sẽ tuân theo chính sách từng chuyến và thời điểm trước khởi hành.',
  },
  {
    title: 'Hành vi bị cấm',
    body: 'Bạn không được sử dụng nền tảng cho mục đích gian lận, gây rối, can thiệp trái phép vào hệ thống, hoặc đăng tải nội dung vi phạm pháp luật và quyền của bên thứ ba.',
  },
  {
    title: 'Giới hạn trách nhiệm',
    body: 'Go Routex nỗ lực đảm bảo dịch vụ luôn ổn định, nhưng chúng tôi không chịu trách nhiệm đối với các sự cố ngoài tầm kiểm soát hợp lý, bao gồm gián đoạn từ bên cung cấp hạ tầng hoặc đơn vị vận hành chuyến đi.',
  },
]

export default function TermsOfServicePage() {


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-primary/20">

      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white p-10 lg:p-16 shadow-2xl shadow-slate-200/50">
          <div className="absolute inset-0 opacity-35">
            <div className="absolute -top-24 left-0 w-80 h-80 rounded-full bg-brand-primary/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-brand-secondary/20 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <Scale className="w-4 h-4" />
              Điều khoản dịch vụ
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Những quy tắc giúp trải nghiệm đặt vé minh bạch và an toàn.
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl">
              Khi sử dụng Go Routex, bạn đồng ý tuân thủ các điều khoản dưới đây để đảm bảo quyền lợi cho bạn, nhà xe và các hành khách khác.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <CalendarDays className="w-4 h-4" />
                Cập nhật lần cuối: 27/03/2026
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <Ticket className="w-4 h-4" />
                Áp dụng cho mọi giao dịch trên nền tảng
              </span>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.35fr_0.65fr] gap-8 mt-10">
          <div className="space-y-6">
            {terms.map((term, index) => (
              <article key={term.title} className="bg-white rounded-[2.25rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    {index === 0 && <FileBadge2 className="w-6 h-6 text-brand-primary" />}
                    {index === 1 && <ClipboardCheck className="w-6 h-6 text-brand-primary" />}
                    {index === 2 && <Ban className="w-6 h-6 text-brand-primary" />}
                    {index === 3 && <Scale className="w-6 h-6 text-brand-primary" />}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{term.title}</h2>
                    <p className="text-slate-500 text-base leading-relaxed font-medium">{term.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 h-max">
            <div className="bg-white rounded-[2.25rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/40">
              <h2 className="text-2xl font-black tracking-tight mb-4">Cần hỗ trợ về chuyến đi?</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Nếu bạn đang cần trợ giúp về hủy vé, đổi chỗ hoặc thanh toán, trang liên hệ của chúng tôi sẽ phù hợp hơn.
              </p>
              <Link
                to="/lien-he-chung-toi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white font-black hover:bg-brand-dark transition-colors"
              >
                Tới trang liên hệ
              </Link>
            </div>

            <div className="rounded-[2.25rem] bg-slate-900 text-white p-8 shadow-2xl shadow-slate-200/40">
              <h3 className="text-2xl font-black tracking-tight mb-3">Mục đích sử dụng hợp lệ</h3>
              <p className="text-white/75 leading-relaxed">
                Nền tảng được thiết kế cho nhu cầu đặt vé, theo dõi lịch trình và quản lý hành trình cá nhân hoặc doanh nghiệp một cách hợp pháp.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
