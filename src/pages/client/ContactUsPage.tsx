import { useState } from 'react'
import { Phone, Mail, MapPin, Clock3, Send, MessageSquare } from 'lucide-react'

const contactCards = [
  {
    title: 'Hotline hỗ trợ',
    value: '+84 900 000 000',
    href: 'tel:+84900000000',
    icon: Phone,
  },
  {
    title: 'Email',
    value: 'support@goroutex.com',
    href: 'mailto:support@goroutex.com',
    icon: Mail,
  },
  {
    title: 'Văn phòng',
    value: 'TP. Hồ Chí Minh, Việt Nam',
    href: 'https://maps.google.com/?q=Ho+Chi+Minh+City',
    icon: MapPin,
  },
]

export default function ContactUsPage() {

  const [sent, setSent] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
    window.setTimeout(() => setSent(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-primary/20">

      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-20">
        <section className="relative overflow-hidden rounded-[3rem] bg-brand-dark text-white p-10 lg:p-16 shadow-2xl shadow-slate-200/50">
          <div className="absolute inset-0 opacity-35">
            <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-brand-primary/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-secondary/20 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <MessageSquare className="w-4 h-4" />
              Liên hệ chúng tôi
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Chúng tôi luôn sẵn sàng lắng nghe và phản hồi.
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl">
              Dù bạn cần hỗ trợ đặt vé, phản hồi dịch vụ hay muốn trao đổi hợp tác, hãy gửi thông tin cho chúng tôi qua form bên dưới.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <Clock3 className="w-4 h-4" />
                Phản hồi trong giờ làm việc
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                <Send className="w-4 h-4" />
                Ưu tiên xử lý các yêu cầu khẩn cấp
              </span>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 mt-10">
          <div className="space-y-6">
            {contactCards.map((card) => {
              const Icon = card.icon
              return (
                <a
                  key={card.title}
                  href={card.href}
                  className="block bg-white rounded-[2.25rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/40 hover:-translate-y-1 hover:shadow-2xl transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{card.title}</div>
                  <div className="text-xl font-black tracking-tight text-slate-900">{card.value}</div>
                </a>
              )
            })}

            <div className="rounded-[2.25rem] bg-white p-8 border border-slate-100 shadow-lg shadow-slate-200/40">
              <h2 className="text-2xl font-black tracking-tight mb-4">Giờ làm việc</h2>
              <p className="text-slate-500 leading-relaxed">
                Thứ Hai đến Thứ Bảy: 08:00 - 18:00
                <br />
                Chủ Nhật: hỗ trợ qua email và form liên hệ
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2.25rem] p-8 lg:p-10 border border-slate-100 shadow-lg shadow-slate-200/40">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Gửi tin nhắn cho chúng tôi</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Hãy mô tả ngắn gọn nhu cầu của bạn, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Họ và tên</span>
                  <input
                    required
                    type="text"
                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 outline-none px-5 py-4 text-base font-semibold text-slate-900 transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email</span>
                  <input
                    required
                    type="email"
                    className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 outline-none px-5 py-4 text-base font-semibold text-slate-900 transition-colors"
                    placeholder="name@email.com"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Chủ đề</span>
                <input
                  type="text"
                  className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 outline-none px-5 py-4 text-base font-semibold text-slate-900 transition-colors"
                  placeholder="Bạn cần hỗ trợ về nội dung gì?"
                />
              </label>

              <label className="space-y-2 block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nội dung</span>
                <textarea
                  required
                  rows={6}
                  className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 outline-none px-5 py-4 text-base font-semibold text-slate-900 transition-colors resize-none"
                  placeholder="Mô tả chi tiết để chúng tôi hỗ trợ bạn tốt hơn..."
                />
              </label>

              <button
                type="submit"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-lg transition-colors ${
                  sent ? 'bg-brand-secondary text-white' : 'bg-brand-primary text-white hover:bg-brand-dark'
                }`}
              >
                <Send className="w-5 h-5" />
                {sent ? 'Đã nhận tin nhắn' : 'Gửi liên hệ'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
