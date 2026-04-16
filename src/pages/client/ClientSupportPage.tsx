import { useState } from 'react'
import { Send, Phone, Mail, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react'

const FAQS = [
  { question: 'Làm thế nào để hủy hoặc hoàn vé?', answer: 'Bạn có thể hủy vé trực tiếp trên bảng điều khiển trong mục "Vé của tôi" tối đa 24 giờ trước khi khởi hành để được hoàn tiền đầy đủ. Tiền hoàn lại thường được xử lý trong 3-5 ngày làm việc.' },
  { question: 'Tôi có cần mang theo vé in giấy không?', answer: 'Không cần, vé điện tử trên thiết bị di động của bạn là hoàn toàn hợp lệ. Chỉ cần xuất trình mã QR cho tài xế khi lên xe.' },
  { question: 'Chính sách về hạn mức hành lý là gì?', answer: 'Mỗi hành khách được phép mang 1 hành lý xách tay (tối đa 7kg) và 1 hành lý ký gửi (tối đa 20kg). Hành lý bổ sung có thể phát sinh thêm phí tùy thuộc vào không gian còn trống.' },
  { question: 'Tôi có thể đổi chỗ ngồi sau khi đặt vé không?', answer: 'Hiện tại, việc thay đổi chỗ ngồi chỉ có thể được hỗ trợ bằng cách liên hệ với hotline hỗ trợ của chúng tôi ít nhất 2 giờ trước khi khởi hành.' },
]

export default function ClientSupportPage() {

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [formSent, setFormSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
    setTimeout(() => setFormSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col selection:bg-brand-primary/10">

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

    </div>
  )
}
