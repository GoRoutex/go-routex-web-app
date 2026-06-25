import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Calendar, Clock, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { createRequestMeta, createEnvelopeHeaders } from '../../utils/requestMeta'

const getStatusDisplay = (status: string) => {
    switch(status) {
        case 'ASSIGNED': return { label: 'Đang mở bán', class: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' };
        case 'ACTIVE': return { label: 'Đã lên lịch', class: 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' };
        case 'IN_PROGRESS': return { label: 'Đang chạy', class: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' };
        case 'COMPLETED': return { label: 'Hoàn thành', class: 'bg-slate-100 text-slate-500 border border-slate-200' };
        case 'CANCELLED': return { label: 'Đã hủy', class: 'bg-red-500/10 text-red-600 border border-red-500/20' };
        default: return { label: status || 'Không xác định', class: 'bg-slate-100 text-slate-400 border border-slate-200' };
    }
}

export default function ClientSchedulesPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('Hôm nay')
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const mapDateFilter = (text: string) => {
    switch (text) {
        case 'Hôm nay': return 'TODAY';
        case 'Ngày mai': return 'TOMORROW';
        default: return 'TODAY';
    }
  }

  const fetchSchedules = async (dateText: string) => {
    setLoading(true)
    try {
      const dateFilter = mapDateFilter(dateText)
      const meta = createRequestMeta()
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/management/trip-service/fetch?dateFilter=${dateFilter}&pageNumber=1&pageSize=50`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...createEnvelopeHeaders(meta)
          }
        }
      )
      const result = await response.json()
      if (result.data && result.data.items) {
        const items = result.data.items;
        const merchantMap: Record<string, any> = {};
        
        for (const trip of items) {
          const mId = trip.merchantId || trip.merchant?.id || 'unknown_' + trip.id;
          const routeKey = trip.routeId || trip.route?.id || trip.routeCode || trip.routeName || (trip.originName && trip.destinationName ? trip.originName + '-' + trip.destinationName : null) || 'unknown_route_' + Math.random();
          
          if (!merchantMap[mId]) {
            merchantMap[mId] = {
              merchantId: mId,
              merchantName: trip.merchantName || trip.merchant?.name || 'Nhà xe chưa xác định',
              trips: [],
              seenRoutes: new Set()
            };
          }
          
          // Mỗi tuyến chỉ lấy 1 chuyến, hiển thị tối đa 3 tuyến đường tiêu biểu cho mỗi nhà xe
          if (merchantMap[mId].trips.length < 3 && !merchantMap[mId].seenRoutes.has(routeKey)) {
            merchantMap[mId].seenRoutes.add(routeKey);
            merchantMap[mId].trips.push(trip);
          }
        }
        
        setSchedules(Object.values(merchantMap))
      } else {
        setSchedules([])
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules(selectedDate)
  }, [selectedDate])

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
               {['Hôm nay', 'Ngày mai'].map((day) => (
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
                  <th className="py-6 px-8 rounded-l-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nhà xe</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tuyến đường tiêu biểu</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá vé tham khảo</th>
                  <th className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin xe</th>
                  <th className="py-6 px-8 rounded-r-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-brand-primary mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Đang tải lịch trình...</p>
                    </td>
                  </tr>
                ) : schedules.map((merchantGroup: any, idx: number) => {
                  const mName = merchantGroup.merchantName;
                  const trips = merchantGroup.trips;

                  return (
                    <Fragment key={merchantGroup.merchantId || idx}>
                      {trips.map((t: any, i: number) => {
                         const rName = (t.originName && t.destinationName) ? `${t.originName} → ${t.destinationName}` : (t.routeName || t.route?.name || 'Tuyến chưa cập nhật');
                         const tPrice = t.ticketPrice || t.price || 0;
                         const tFormattedPrice = tPrice > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tPrice) : 'Đang cập nhật';
                         const tVehicleType = t.hasFloor ? 'Xe giường nằm' : (t.vehicleType || t.vehicle?.vehicleType || t.vehicleTemplate?.name || 'Xe tiêu chuẩn');
                         
                         return (
                           <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300">
                             <td className="py-6 px-8 border-b border-slate-50 align-middle">
                               <div className="flex flex-col gap-1.5 text-slate-900">
                                 <span className="font-black text-xl tracking-tighter">{mName}</span>
                               </div>
                             </td>
                             <td className="py-6 px-8 border-b border-slate-50 align-middle">
                               <div className="flex items-center">
                                 <span className="font-black text-[15px] md:text-base text-slate-900 tracking-tight hover:text-brand-primary transition-colors cursor-default">
                                   {rName}
                                 </span>
                               </div>
                             </td>
                             <td className="py-6 px-8 border-b border-slate-50 align-middle">
                               <div className="flex flex-col gap-1.5 text-center sm:text-left">
                                 <span className="font-black text-xl text-brand-primary tracking-tighter leading-none">{tFormattedPrice}</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                   Giá chỉ từ
                                 </span>
                               </div>
                             </td>
                             <td className="py-6 px-8 border-b border-slate-50 align-middle">
                               <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                 <Bus className="w-3.5 h-3.5" />
                                 {tVehicleType as string}
                               </div>
                             </td>
                             <td className="py-6 px-8 text-right border-b border-slate-50 align-middle">
                               <button
                                 onClick={() => navigate('/booking', { state: { routeData: t } })}
                                 className="bg-slate-900 hover:bg-brand-primary text-white font-black px-6 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all duration-300 shadow-md shadow-slate-200 hover:shadow-brand-primary/30 group-hover:-translate-x-1"
                               >
                                 Đặt vé
                               </button>
                             </td>
                           </tr>
                         );
                      })}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>

            {!loading && schedules.length === 0 && (
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
