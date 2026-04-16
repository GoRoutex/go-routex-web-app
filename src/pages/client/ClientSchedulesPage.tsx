import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react'


const SCHEDULES = [
  { id: 'TRP-1001', route: 'Hà Nội → Hải Phòng', type: 'Xe limousine', time: '08:00', arrival: '10:30', duration: '2h 30m', seats: 4, price: '320,000 ₫', status: 'Đúng giờ' },
  { id: 'TRP-1002', route: 'Hà Nội → Hải Phòng', type: 'Xe tiêu chuẩn', time: '10:00', arrival: '12:30', duration: '2h 30m', seats: 12, price: '250,000 ₫', status: 'Đang đón khách' },
  { id: 'TRP-1003', route: 'Sài Gòn → Nha Trang', type: 'Xe giường nằm', time: '20:00', arrival: '04:00', duration: '8h 00m', seats: 2, price: '280,000 ₫', status: 'Đã lên lịch' },
  { id: 'TRP-1004', route: 'Sài Gòn → Đà Lạt', type: 'Xe cao cấp', time: '06:30', arrival: '13:00', duration: '6h 30m', seats: 8, price: '300,000 ₫', status: 'Đã lên lịch' },
  { id: 'TRP-1005', route: 'Đà Nẵng → Huế', type: 'Xe limousine', time: '14:00', arrival: '16:00', duration: '2h 00m', seats: 6, price: '120,000 ₫', status: 'Đúng giờ' },
]

export default function ClientSchedulesPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('Hôm nay')

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col selection:bg-brand-primary/10">

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
                          ${trip.status === 'Đúng giờ' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 
                            trip.status === 'Đang đón khách' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 
                            'bg-slate-100 text-slate-400 border border-slate-200'}
                        `}>
                          {trip.status === 'Đúng giờ' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {trip.status}
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

    </div>
  )
}
