import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Navigation, Clock, ChevronRight } from 'lucide-react'

// Dummy Data for Seat Map
// Status: 'available', 'occupied', 'held'
const initialSeats = Array.from({ length: 36 }).map((_, i) => ({
  id: `S${i + 1}`,
  number: `${i + 1}`,
  status: Math.random() > 0.7 ? 'occupied' : 'available'
}))

export default function SeatSelectionPage() {
  const navigate = useNavigate()
  
  const [seats, setSeats] = useState(initialSeats)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [holdExpiration, setHoldExpiration] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  // Timer logic for holding seats
  useEffect(() => {
    let interval: number
    if (holdExpiration) {
      interval = window.setInterval(() => {
        const now = Date.now()
        const diff = holdExpiration - now
        if (diff <= 0) {
          setTimeLeft(0)
          setHoldExpiration(null)
          setSelectedSeats([])
          setSeats(prev => prev.map(s => s.status === 'held' ? { ...s, status: 'available' } : s))
        } else {
          setTimeLeft(Math.floor(diff / 1000))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [holdExpiration])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const toggleSeat = (id: string) => {
    setSeats(prev => {
      const seat = prev.find(s => s.id === id)
      if (!seat || seat.status === 'occupied') return prev

      if (seat.status === 'available') {
        const newSelected = [...selectedSeats, id]
        setSelectedSeats(newSelected)
        if (!holdExpiration) {
           setHoldExpiration(Date.now() + 5 * 60 * 1000) // 5 minutes hold
        }
        return prev.map(s => s.id === id ? { ...s, status: 'held' } : s)
      } else if (seat.status === 'held') {
        const newSelected = selectedSeats.filter(sid => sid !== id)
        setSelectedSeats(newSelected)
        if (newSelected.length === 0) setHoldExpiration(null)
        return prev.map(s => s.id === id ? { ...s, status: 'available' } : s)
      }
      return prev
    })
  }

  const handleContinue = () => {
    if (selectedSeats.length === 0) return
    navigate('/booking', { state: { selectedSeats } })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-48">
      {/* ══════════════════  HEADER  ══════════════════ */}
      <header className="bg-brand-dark pt-12 pb-20 px-8 relative overflow-hidden" style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group">
             <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="text-center">
             <h1 className="text-white font-black text-2xl tracking-tight">Chọn chỗ ngồi</h1>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">Sơ đồ xe thực tế</p>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* ══════════════════  SEAT MAP  ══════════════════ */}
      <main className="max-w-5xl mx-auto px-8 -mt-10">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-16 items-start">
           
           {/* Left side: Bus Layout representation */}
           <div className="flex-1 flex flex-col items-center w-full">
             <div className="w-full max-w-[320px] bg-slate-50 rounded-[50px] border-[6px] border-slate-100 p-8 shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
               
               {/* Driver Area */}
               <div className="w-full h-24 border-b-2 border-dashed border-slate-200 mb-10 flex items-center justify-center relative">
                  <div className="absolute right-2 top-2 w-12 h-12 border-2 border-slate-200 rounded-2xl flex items-center justify-center bg-white shadow-sm">
                    <Navigation className="w-6 h-6 text-slate-300 -rotate-45" />
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Khoang lái</div>
               </div>

               {/* Seats Grid */}
               <div className="grid grid-cols-5 gap-x-4 gap-y-6 relative">
                  {seats.map((seat, index) => {
                     const isRightOfAisle = index % 4 === 1
                     return (
                       <div key={seat.id} className="contents">
                         <button
                           disabled={seat.status === 'occupied'}
                           onClick={() => toggleSeat(seat.id)}
                           className={`w-[48px] h-[48px] rounded-2xl flex items-center justify-center font-black text-[14px] transition-all duration-300 relative overflow-hidden group/seat
                             ${seat.status === 'available' ? 'bg-white border-2 border-slate-100 text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 hover:-translate-y-1' : 
                                seat.status === 'held' ? 'bg-brand-primary border-2 border-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-110 z-10 -translate-y-1' : 
                                'bg-slate-100 border-2 border-slate-100 text-slate-200 cursor-not-allowed'}
                           `}
                         >
                           {seat.status === 'occupied' ? (
                             <div className="absolute inset-0 bg-slate-200/30 flex items-center justify-center">
                               <div className="w-full h-px bg-slate-200 rotate-45 transform" />
                               <div className="w-full h-px bg-slate-200 -rotate-45 transform absolute" />
                             </div>
                           ) : seat.number}
                           {seat.status === 'available' && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-primary scale-0 group-hover/seat:scale-100 transition-transform" />}
                         </button>
                         {isRightOfAisle && <div className="w-[48px]" />}
                       </div>
                     )
                  })}
               </div>
             </div>
           </div>

           {/* Right side: Legend and Summary */}
           <div className="w-full lg:w-[320px] space-y-10">
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-white shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Chú thích</h3>
                <div className="flex flex-col gap-5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 shadow-sm"></div>
                      <span className="text-sm font-black text-slate-500 uppercase tracking-wider">Ghế trống</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-100 flex items-center justify-center overflow-hidden">
                        <div className="absolute w-full h-px bg-slate-200 rotate-45" />
                      </div>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-wider">Đã có người</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary border-2 border-brand-primary shadow-lg shadow-brand-primary/20"></div>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Đang chọn</span>
                   </div>
                </div>
              </div>

              {holdExpiration && (
                <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2rem] p-8 animate-in slide-in-from-bottom-5 duration-500 shadow-xl shadow-brand-primary/5">
                   <div className="flex items-center gap-3 mb-4 text-brand-primary">
                     <Clock className="w-6 h-6 animate-pulse" />
                     <span className="font-black text-sm uppercase tracking-[0.2em]">Thời gian giữ chỗ</span>
                   </div>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                     Chỗ ngồi của bạn đang được giữ tạm thời. Vui lòng hoàn tất trong thời gian quy định.
                   </p>
                   <div className="text-4xl font-black text-brand-primary tracking-tighter">
                     {formatTime(timeLeft)}
                   </div>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* ══════════════════  BOTTOM ACTION BAR  ══════════════════ */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-8 py-8 border-t border-slate-100 animate-in slide-in-from-bottom-10 duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-50 bg-white/80 backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-10 w-full md:w-auto">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vị trí ghế</span>
                  <div className="font-black text-slate-900 text-2xl tracking-tighter mt-1 flex gap-2 flex-wrap">
                     {selectedSeats.map(s => s.replace('S', '')).join(', ')}
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tổng cộng</span>
                  <div className="font-black text-brand-primary text-3xl tracking-tighter mt-1">
                     {new Intl.NumberFormat('vi-VN').format(selectedSeats.length * 320000)} ₫
                  </div>
                </div>
             </div>
             
             <button
               onClick={handleContinue}
               className="w-full md:w-auto bg-brand-primary hover:bg-brand-dark text-white px-12 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-brand-primary/30 hover:shadow-brand-dark/30 hover:-translate-y-1 group"
             >
               Tiếp tục đặt chỗ 
               <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
