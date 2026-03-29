import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bus, LayoutDashboard, Search, MapPin, Navigation, ArrowRight, Clock } from 'lucide-react'
import { ClientAccountMenu } from '../../Components/client/ClientAccountMenu'

const ALL_ROUTES = [
  { id: 1, from: 'Hà Nội', to: 'Hải Phòng', info: 'Limousine • Up to 8 trips/day', duration: '2h 30m', distance: '120 km', price: '320,000 ₫' },
  { id: 2, from: 'Sài Gòn', to: 'Nha Trang', info: 'Sleeper bus • Overnight route', duration: '8h 00m', distance: '400 km', price: '280,000 ₫' },
  { id: 3, from: 'Đà Lạt', to: 'Sài Gòn', info: 'Premium coach • Morning departures', duration: '6h 30m', distance: '300 km', price: '240,000 ₫' },
  { id: 4, from: 'Hà Nội', to: 'Đà Nẵng', info: 'Express • Limited seats', duration: '14h 00m', distance: '760 km', price: '450,000 ₫' },
  { id: 5, from: 'Sài Gòn', to: 'Cần Thơ', info: 'Standard coach • Hourly departures', duration: '3h 30m', distance: '160 km', price: '150,000 ₫' },
  { id: 6, from: 'Đà Nẵng', to: 'Huế', info: 'Fast transit • Scenic route', duration: '2h 00m', distance: '100 km', price: '120,000 ₫' },
  { id: 7, from: 'Hải Phòng', to: 'Hạ Long', info: 'Luxury Limousine', duration: '1h 15m', distance: '75 km', price: '200,000 ₫' },
  { id: 8, from: 'Sài Gòn', to: 'Vũng Tàu', info: 'Express • High frequency', duration: '2h 15m', distance: '110 km', price: '160,000 ₫' },
]

export default function ClientRoutesPage() {
  const navigate = useNavigate()
  const [isLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true')
  const [userName] = useState(() => localStorage.getItem('profileFullName') || localStorage.getItem('userName') || '')
  const [userEmail] = useState(() => localStorage.getItem('userEmail') || '')
  const [userAvatarUrl] = useState(() => localStorage.getItem('profileAvatarUrl') || '')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRoutes = ALL_ROUTES.filter(r => 
    r.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.to.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBook = (from: string, to: string) => {
    navigate('/', { state: { prefill: { from, to } } }) // Mock redirection to home to book
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-brand-primary/10">
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
                className={`text-sm font-semibold transition-all relative py-2 ${i === 1 ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'}`}>
                {l}
                {i === 1 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />}
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
            Khám phá <span className="text-brand-primary">Mạng lưới tuyến đường</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Hợp tác với hàng trăm nhà xe uy tín để mang đến cho bạn những chuyến đi an toàn, tiện nghi và đúng giờ trên mọi nẻo đường.
          </p>
          
          <div className="max-w-2xl mx-auto mt-12 relative group">
             <div className="absolute inset-0 bg-brand-primary/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
             <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
             <input 
               type="text" 
               placeholder="Tìm theo tỉnh, thành phố (VD: Hà Nội, Sài Gòn)..." 
               className="w-full bg-white/10 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-slate-500 outline-none focus:bg-white/15 focus:border-brand-primary/30 transition-all font-bold text-lg backdrop-blur-xl relative z-10 shadow-2xl"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </section>

      {/* ══════════════════  CONTENT  ══════════════════ */}
      <main className="max-w-7xl mx-auto px-8 -mt-10 mb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                <Bus className="w-32 h-32 text-brand-primary" />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hệ thống liên kết</span>
                </div>
                <span className="text-slate-900 font-black text-2xl tracking-tighter">{route.price}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-3 relative z-10">
                 <h3 className="font-black text-slate-900 text-2xl tracking-tight">{route.from}</h3>
                 <div className="flex-1 h-px bg-slate-100 relative">
                    <div className="absolute inset-0 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                 </div>
                 <h3 className="font-black text-slate-900 text-2xl tracking-tight">{route.to}</h3>
              </div>
              
              <p className="text-slate-500 text-sm font-medium mb-8 flex-1 leading-relaxed relative z-10">{route.info}</p>
              
              <div className="flex items-center gap-6 py-4 border-t border-slate-50 mb-8 relative z-10">
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-slate-400" />
                   <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{route.duration}</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-slate-400" />
                   <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{route.distance}</span>
                 </div>
              </div>
              
              <button 
                onClick={() => handleBook(route.from, route.to)}
                className="w-full bg-slate-50 group-hover:bg-brand-primary text-slate-900 group-hover:text-white py-4 rounded-2xl font-black text-base transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-primary/20 relative z-10 flex items-center justify-center gap-3 active:scale-95">
                Đặt vé tuyến này
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
          
          {filteredRoutes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
               <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Không tìm thấy tuyến đường</h3>
               <p className="text-slate-500 text-base font-medium">Chúng tôi chưa có tuyến đường nào phù hợp với từ khóa "{searchTerm}".</p>
               <button 
                 onClick={() => setSearchTerm('')}
                 className="mt-8 text-brand-primary font-black hover:underline"
               >
                 Xóa bộ lọc tìm kiếm
               </button>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════  FOOTER  ══════════════════ */}
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
               <Bus className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Routex © 2026 • Hành trình xanh</span>
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
