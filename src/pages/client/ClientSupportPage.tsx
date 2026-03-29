import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bus, LayoutDashboard, Send, Phone, Mail, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react'
import { ClientAccountMenu } from '../../Components/client/ClientAccountMenu'

const FAQS = [
  { question: 'Làm thế nào để hủy hoặc hoàn vé?', answer: 'Bạn có thể hủy vé trực tiếp trên bảng điều khiển trong mục "Vé của tôi" tối đa 24 giờ trước khi khởi hành để được hoàn tiền đầy đủ. Tiền hoàn lại thường được xử lý trong 3-5 ngày làm việc.' },
  { question: 'Tôi có cần mang theo vé in giấy không?', answer: 'Không cần, vé điện tử trên thiết bị di động của bạn là hoàn toàn hợp lệ. Chỉ cần xuất trình mã QR cho tài xế khi lên xe.' },
  { question: 'Chính sách về hạn mức hành lý là gì?', answer: 'Mỗi hành khách được phép mang 1 hành lý xách tay (tối đa 7kg) và 1 hành lý ký gửi (tối đa 20kg). Hành lý bổ sung có thể phát sinh thêm phí tùy thuộc vào không gian còn trống.' },
  { question: 'Tôi có thể đổi chỗ ngồi sau khi đặt vé không?', answer: 'Hiện tại, việc thay đổi chỗ ngồi chỉ có thể được hỗ trợ bằng cách liên hệ với hotline hỗ trợ của chúng tôi ít nhất 2 giờ trước khi khởi hành.' },
]

export default function ClientSupportPage() {
  const navigate = useNavigate()
  const [isLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true')
  const [userName] = useState(() => localStorage.getItem('profileFullName') || localStorage.getItem('userName') || '')
  const [userEmail] = useState(() => localStorage.getItem('userEmail') || '')
  const [userAvatarUrl] = useState(() => localStorage.getItem('profileAvatarUrl') || '')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [formSent, setFormSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
    setTimeout(() => setFormSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col selection:bg-brand-primary/10">
      {/* ══════════════════  TOP NAV BAR  ══════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
              GO <span className="text-brand-primary">ROUTEX</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10">
           {['Trang chủ', 'Tuyến đường', 'Lịch trình', 'Hỗ trợ'].map((l, i) => (
              <button 
                key={l}
                onClick={() => {
                  if (i === 0) navigate('/')
                  if (i === 1) navigate('/routes')
                  if (i === 2) navigate('/schedules')
                  if (i === 3) navigate('/support')
                }}
                className={`text-sm font-semibold transition-all relative py-2 ${i === 3 ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'}`}>
                {l}
                {i === 3 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors px-4 py-2 rounded-xl hover:bg-slate-50">
                  <LayoutDashboard className="w-4 h-4" /> Quản lý hệ thống
                </button>
                <ClientAccountMenu
                  fullName={userName || 'Chào bạn'}
                  avatarUrl={userAvatarUrl}
                  email={userEmail}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')}
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
                  Đăng nhập
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95">
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════  HERO  ══════════════════ */}
      <section className="bg-brand-dark pb-24 pt-20 px-8 relative overflow-hidden" style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
            Chúng tôi có thể giúp gì <span className="text-brand-primary">Cho bạn?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Liên hệ với đội ngũ hỗ trợ 24/7 của chúng tôi hoặc tìm câu trả lời nhanh chóng qua các câu hỏi thường gặp.
          </p>
        </div>
      </section>

      {/* ══════════════════  CONTENT  ══════════════════ */}
      <main className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 w-full flex-1 -mt-10 relative z-20">
        
        {/* Left Col - Info & FAQ */}
        <div className="space-y-16">
           {/* Info Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 hover:border-brand-primary/20 transition-all group">
               <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20 group-hover:scale-110 transition-transform">
                 <Phone className="w-6 h-6 text-brand-primary" />
               </div>
               <h3 className="font-black text-slate-900 text-xl mb-1 tracking-tight">Gọi cho chúng tôi</h3>
               <p className="text-slate-500 text-sm font-medium mb-6">Hỗ trợ khẩn cấp 24/7</p>
               <span className="text-brand-primary font-black text-2xl tracking-tighter">1900 1234 56</span>
             </div>
             
             <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 hover:border-brand-primary/20 transition-all group">
               <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20 group-hover:scale-110 transition-transform">
                 <Mail className="w-6 h-6 text-brand-primary" />
               </div>
               <h3 className="font-black text-slate-900 text-xl mb-1 tracking-tight">Gửi Email</h3>
               <p className="text-slate-500 text-sm font-medium mb-6">Phản hồi trong vòng 1 giờ</p>
               <span className="text-brand-primary font-black text-base tracking-tight">support@goroutex.com</span>
             </div>
           </div>

           {/* FAQ Segment */}
           <section>
             <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4 tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" /> 
                </div>
                Câu hỏi thường gặp
             </h2>
             <div className="space-y-4">
               {FAQS.map((faq, idx) => (
                 <div 
                   key={idx} 
                   className={`bg-white border rounded-[2rem] p-8 cursor-pointer transition-all duration-300 ${expandedFaq === idx ? 'border-brand-primary/30 shadow-2xl shadow-brand-primary/5' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'}`}
                   onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                 >
                   <div className="flex items-start justify-between gap-6">
                     <h4 className={`font-black text-lg tracking-tight ${expandedFaq === idx ? 'text-brand-primary' : 'text-slate-900'}`}>
                       {faq.question}
                     </h4>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedFaq === idx ? 'bg-brand-primary text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                        <ChevronDown className="w-5 h-5" />
                     </div>
                   </div>
                   {expandedFaq === idx && (
                     <p className="mt-6 text-base text-slate-500 leading-relaxed font-medium animate-in slide-in-from-top-4 fade-in duration-500">
                       {faq.answer}
                     </p>
                   )}
                 </div>
               ))}
             </div>
           </section>
        </div>

        {/* Right Col - Form */}
        <div className="lg:sticky lg:top-32 h-max">
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Gửi lời nhắn cho chúng tôi</h2>
              <p className="text-slate-500 text-base font-medium mb-10 leading-relaxed">Chúng tôi luôn lắng nghe và sẽ phản hồi ngay sau khi kiểm tra vấn đề của bạn.</p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Họ và tên</label>
                       <input required type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 hover:border-slate-200 rounded-2xl px-6 py-4.5 outline-none text-base font-bold text-slate-900 transition-all placeholder:text-slate-300" placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Địa chỉ Email</label>
                       <input required type="email" className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 hover:border-slate-200 rounded-2xl px-6 py-4.5 outline-none text-base font-bold text-slate-900 transition-all placeholder:text-slate-300" placeholder="name@email.com" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Chủ đề (Không bắt buộc)</label>
                    <input type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 hover:border-slate-200 rounded-2xl px-6 py-4.5 outline-none text-base font-bold text-slate-900 transition-all placeholder:text-slate-300" placeholder="Bạn cần hỗ trợ về việc gì?" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nội dung chi tiết</label>
                    <textarea required rows={5} className="w-full bg-slate-50 border-2 border-transparent focus:border-brand-primary/30 hover:border-slate-200 rounded-2xl px-6 py-4.5 outline-none text-base font-bold/80 text-slate-900 transition-all placeholder:text-slate-300 resize-none" placeholder="Mô tả cụ thể vấn đề hoặc góp ý của bạn tại đây..."></textarea>
                 </div>

                 <button 
                   type="submit" 
                   disabled={formSent}
                   className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl active:scale-[0.98] ${
                     formSent 
                       ? 'bg-brand-secondary text-white shadow-brand-secondary/20' 
                       : 'bg-slate-900 hover:bg-brand-primary text-white shadow-slate-200 hover:shadow-brand-primary/20'
                   }`}>
                   {formSent ? (
                     <><CheckCircle2 className="w-6 h-6" /> Gửi tin nhắn thành công</>
                   ) : (
                     <><Send className="w-5 h-5" /> Gửi yêu cầu</>
                   )}
                 </button>
              </form>
           </div>
        </div>

      </main>

      {/* ══════════════════  FOOTER  ══════════════════ */}
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
               <Bus className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Routex © 2026 • Đồng hành cùng khách hàng</span>
          </div>
          <div className="flex gap-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {[
              { label: 'Chính sách bảo mật', to: '/chinh-sach-bao-mat' },
              { label: 'Điều khoản dịch vụ', to: '/dieu-khoan-dich-vu' },
              { label: 'Liên hệ chúng tôi', to: '/lien-he-chung-toi' },
            ].map(item => (
              <Link key={item.label} to={item.to} className="hover:text-brand-primary transition-colors">{item.label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
