import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, User, LayoutDashboard, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react'

const SCHEDULES = [
  { id: 'TRP-1001', route: 'Hà Nội → Hải Phòng', type: 'Limousine', time: '08:00 AM', arrival: '10:30 AM', duration: '2h 30m', seats: 4, price: '320,000 ₫', status: 'On Time' },
  { id: 'TRP-1002', route: 'Hà Nội → Hải Phòng', type: 'Standard Coach', time: '10:00 AM', arrival: '12:30 PM', duration: '2h 30m', seats: 12, price: '250,000 ₫', status: 'Boarding' },
  { id: 'TRP-1003', route: 'Sài Gòn → Nha Trang', type: 'Sleeper Bus', time: '08:00 PM', arrival: '04:00 AM', duration: '8h 00m', seats: 2, price: '280,000 ₫', status: 'Scheduled' },
  { id: 'TRP-1004', route: 'Sài Gòn → Đà Lạt', type: 'Premium Coach', time: '06:30 AM', arrival: '01:00 PM', duration: '6h 30m', seats: 8, price: '300,000 ₫', status: 'Scheduled' },
  { id: 'TRP-1005', route: 'Đà Nẵng → Huế', type: 'Limousine', time: '02:00 PM', arrival: '04:00 PM', duration: '2h 00m', seats: 6, price: '120,000 ₫', status: 'On Time' },
]

export default function ClientSchedulesPage() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [selectedDate, setSelectedDate] = useState('Hôm nay')

  useEffect(() => {
    const flag = localStorage.getItem('isLoggedIn')
    setIsLoggedIn(flag === 'true')
    setUserName(localStorage.getItem('userName') || '')
  }, [])

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
                className={`text-sm font-semibold transition-all relative py-2 ${i === 2 ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'}`}>
                {l}
                {i === 2 && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-full" />}
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
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 flex items-center justify-center overflow-hidden border-2 border-white">
                    <User className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span className="text-slate-900 text-sm font-bold">{userName || 'Chào bạn'}</span>
                </div>
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
            Lịch trình <span className="text-brand-primary">Trực tuyến</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Theo dõi thời gian xuất phát, trạng thái chuyến xe và lên kế hoạch cho hành trình của bạn với bảng lịch trình thời gian thực.
          </p>
          
          <div className="max-w-4xl mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
             <div className="flex bg-white/5 p-2 rounded-2xl w-full sm:w-auto backdrop-blur-xl border border-white/10 shadow-2xl">
               {['Hôm qua', 'Hôm nay', 'Ngày mai'].map((day) => (
                 <button
                   key={day}
                   onClick={() => setSelectedDate(day)}
                   className={`flex-1 sm:flex-none px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                     selectedDate === day 
                       ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105 z-10' 
                       : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   {day}
                 </button>
               ))}
             </div>
             
             <div className="relative w-full sm:w-72 group">
                <select className="appearance-none w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-6 pr-12 text-white font-bold outline-none focus:bg-white/10 focus:border-brand-primary/30 transition-all cursor-pointer backdrop-blur-xl shadow-2xl">
                  <option>Tất cả bến xe</option>
                  <option>Hà Nội (Bắc)</option>
                  <option>Sài Gòn (Nam)</option>
                  <option>Đà Nẵng (Trung)</option>
                </select>
                <MapPin className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors pointer-events-none" />
             </div>
          </div>
        </div>
      </section>

      {/* ══════════════════  CONTENT  ══════════════════ */}
      <main className="max-w-7xl mx-auto px-8 py-20 flex-1 w-full flex flex-col -mt-10 relative z-20">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-2 md:p-10 shadow-2xl shadow-slate-200/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-6 px-8 rounded-l-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tuyến đường & Loại xe</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá vé & Chỗ trống</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="py-6 px-8 rounded-r-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULES.map((trip) => (
                  <tr key={trip.id} className="group hover:bg-slate-50/50 transition-all duration-300 rounded-2xl">
                    <td className="py-8 px-8 border-b border-slate-50">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-black text-xl text-slate-900 tracking-tighter">{trip.time}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          <Clock className="w-3.5 h-3.5" />
                          Đến lúc {trip.arrival}
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 border-b border-slate-50">
                      <div className="flex flex-col gap-2">
                        <span className="font-black text-lg text-slate-900 tracking-tight group-hover:text-brand-primary transition-colors">{trip.route}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-100 w-max px-3 py-1.5 rounded-lg uppercase tracking-widest border border-slate-200/50 leading-none">
                          <Bus className="w-3.5 h-3.5" />
                          {trip.type}
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 border-b border-slate-50">
                      <div className="flex flex-col gap-1.5 text-center sm:text-left">
                        <span className="font-black text-xl text-brand-primary tracking-tighter leading-none">{trip.price}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${trip.seats < 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                          Còn {trip.seats} chỗ trống
                        </span>
                      </div>
                    </td>
                    <td className="py-8 px-8 border-b border-slate-50">
                      <div className="flex flex-col gap-2">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.1em] w-max flex items-center gap-2 uppercase
                          ${trip.status === 'On Time' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 
                            trip.status === 'Boarding' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 
                            'bg-slate-100 text-slate-400 border border-slate-200'}
                        `}>
                          {trip.status === 'On Time' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {trip.status === 'On Time' ? 'Đúng giờ' : trip.status === 'Boarding' ? 'Đang đón khách' : 'Chưa chạy'}
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 opacity-70">Hành trình {trip.duration}</span>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-right border-b border-slate-50">
                      <button 
                        onClick={() => navigate('/')}
                        className="bg-slate-900 hover:bg-brand-primary text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-brand-primary/30 group-hover:-translate-x-2">
                        Đặt ghế
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {SCHEDULES.length === 0 && (
              <div className="py-24 text-center w-full flex flex-col items-center">
                 <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                    <Calendar className="w-10 h-10 text-slate-200" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Không có lịch trình</h3>
                 <p className="text-slate-500 text-base font-medium">Hiện tại không có chuyến xe nào được lên kế hoạch trong ngày này.</p>
              </div>
            )}
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Routex © 2026 • Lịch trình thời gian thực</span>
          </div>
          <div className="flex gap-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {['Trung tâm hỗ trợ', 'Góp ý dịch vụ', 'Liên hệ bến xe'].map(l => (
              <a key={l} href="#" className="hover:text-brand-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
