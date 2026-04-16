import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bus, MapPin, ChevronRight, Loader2 } from 'lucide-react'

type RouteSeatStatus = "AVAILABLE" | "HELD" | "SOLD" | "BLOCKED"

type RouteSeatItem = {
  routeId: string
  seatNo: string
  status: RouteSeatStatus
}

type StopPoint = {
  id: string
  stopOrder: string
  routeId: string
  plannedArrivalTime?: string
  plannedDepartureTime?: string
  note?: string
}

type RouteItem = {
  id: string
  pickupBranch?: string | null
  origin: string
  destination: string
  availableSeats?: number | null
  plannedStartTime: string
  plannedEndTime: string
  routeCode: string
  vehiclePlate?: string | null
  vehicleType?: string | null
  seatCapacity?: number | null
  stopPoints?: StopPoint[] | null
  price?: number | null
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const formatTimeHHmm = (iso?: string) => {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
const formatDateDDMMYYYY = (iso?: string) => {
  if (!iso) return '--/--/----'
  const d = new Date(iso)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}
const durationText = (s?: string, e?: string) => {
  if (!s || !e) return '--'
  const diff = Math.max(0, new Date(e).getTime() - new Date(s).getTime())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const formatVehicleType = (value?: string | null) => {
  if (!value) return "Xe khách"
  const normalized = value.trim().toUpperCase()
  if (normalized === "LIMOUSINE") return "Xe limousine"
  if (normalized === "SLEEPER") return "Xe giường nằm"
  if (normalized === "STANDARD" || normalized === "COACH") return "Xe tiêu chuẩn"
  if (normalized === "PREMIUM") return "Xe cao cấp"
  return value
}

// Mock seats generated from capacity
const generateMockSeats = (routeId: string, capacity: number): RouteSeatItem[] =>
  Array.from({ length: capacity }, (_, i) => ({
    routeId,
    seatNo: String(i + 1).padStart(2, '0'),
    status: (i < 5 ? 'SOLD' : i < 8 ? 'HELD' : 'AVAILABLE') as RouteSeatStatus,
  }))


const mockRouteData: RouteItem = {
  id: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
  pickupBranch: "233 Điện Biên Phủ",
  origin: "Hà Nội",
  destination: "Hải Phòng",
  availableSeats: 32,
  plannedStartTime: "2026-03-04T07:30:00Z",
  plannedEndTime: "2026-03-04T13:30:00Z",
  routeCode: "HAN-HPH-06",
  vehiclePlate: "51B-123.45",
  vehicleType: "LIMOUSINE",
  seatCapacity: 34,
  price: 320000,
  stopPoints: [
    {
      id: "d80f95a5-db24-499f-ac6e-bc92d02fbdc2",
      stopOrder: "1",
      routeId: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
      plannedArrivalTime: "2026-03-04T09:30:00Z",
      plannedDepartureTime: "2026-03-04T09:45:00Z",
      note: "Trạm dừng chân",
    },
  ],
}

export default function RouteDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedRoute: RouteItem | undefined = location.state?.routeData
  const routeData = passedRoute ?? mockRouteData

  const routeSeats = useMemo(
    () => generateMockSeats(routeData.id, routeData.seatCapacity ?? 34),
    [routeData.id, routeData.seatCapacity]
  )
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [holding, setHolding] = useState(false)

  const seatStatusMap = useMemo(() => {
    const map = new Map<string, RouteSeatStatus>()
    routeSeats.forEach(s => map.set(s.seatNo, s.status))
    return map
  }, [routeSeats])

  const toggleSeat = (seatNo: string) => {
    const status = seatStatusMap.get(seatNo) ?? 'AVAILABLE'
    if (status !== 'AVAILABLE') return
    setSelectedSeats(prev =>
      prev.includes(seatNo) ? prev.filter(s => s !== seatNo) : [...prev, seatNo]
    )
  }

  const seatColorClass = (seatNo: string) => {
    const status = seatStatusMap.get(seatNo) ?? 'AVAILABLE'
    const isSelected = selectedSeats.includes(seatNo)
    if (isSelected) return 'bg-brand-primary border-brand-primary text-white cursor-pointer shadow-lg shadow-brand-primary/20 scale-105'
    if (status === 'SOLD') return 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
    if (status === 'HELD') return 'bg-rose-50 border-rose-100 text-rose-300 cursor-not-allowed'
    if (status === 'BLOCKED') return 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed'
    return 'bg-white border-slate-200 text-slate-900 hover:border-brand-primary hover:text-brand-primary cursor-pointer'
  }

  const stops = useMemo(() => {
    return [...(routeData.stopPoints ?? [])].sort(
      (a, b) => parseInt(a.stopOrder) - parseInt(b.stopOrder)
    )
  }, [routeData.stopPoints])

  const handleContinue = () => {
    if (selectedSeats.length === 0) return
    setHolding(true)
    setTimeout(() => {
      setHolding(false)
      navigate('/booking', {
        state: { routeData, selectedSeats },
      })
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-brand-primary/10">

      <main className="max-w-3xl mx-auto px-6 py-4 pb-32 space-y-6">
        {/* Route Info Card - Refined & Compact */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-1.5 tracking-tight group">
                {routeData.origin} <span className="text-brand-primary/40 mx-1 group-hover:mx-2 transition-all">→</span> {routeData.destination}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{routeData.routeCode}</span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Chuyến đi hằng ngày</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl self-start sm:self-center">
              <span className="text-brand-primary font-black text-[11px] flex items-center gap-2 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                {routeData.availableSeats ?? 0} ghế trống
              </span>
            </div>
          </div>

          {/* Time Row - Slimmer */}
          <div className="flex items-center gap-6 mb-10 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50">
            <div className="text-left">
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatTimeHHmm(routeData.plannedStartTime)}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{routeData.origin}</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 py-1 bg-white rounded-full border border-slate-100/50 shadow-sm">
                {durationText(routeData.plannedStartTime, routeData.plannedEndTime)}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full relative">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" />
                <Bus className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 text-brand-primary bg-white rounded-full p-0.5 border border-brand-primary/20 shadow-sm" />
              </div>
              <div className="text-[10px] text-slate-400 font-bold mt-2.5">
                {formatDateDDMMYYYY(routeData.plannedStartTime)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatTimeHHmm(routeData.plannedEndTime)}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{routeData.destination}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <MapPin size={18} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Điểm đón</p>
                  <p className="font-bold text-slate-950 text-sm tracking-tight">{routeData.pickupBranch || 'Liên hệ nhà xe'}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <Bus size={18} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Xe vận hành</p>
                  <p className="font-bold text-slate-950 text-sm tracking-tight">{formatVehicleType(routeData.vehicleType)} • {routeData.vehiclePlate || '—'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Improved Seat Selection Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sơ đồ chỗ ngồi</h3>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Thời gian thực</span>
            </div>
          </div>

          {/* Minimalist Legend */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 pb-8 border-b border-slate-50">
            {[
              { color: 'bg-white border-slate-200', label: 'Ghế trống' },
              { color: 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20', label: 'Đang chọn' },
              { color: 'bg-slate-100 opacity-40 border-transparent', label: 'Đã bán' },
              { color: 'bg-rose-50 border-rose-100', label: 'Đã đặt' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-md border ${color}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {routeSeats.map((seat) => (
              <button
                key={seat.seatNo}
                onClick={() => toggleSeat(seat.seatNo)}
                disabled={seat.status !== 'AVAILABLE' && !selectedSeats.includes(seat.seatNo)}
                className={`h-10 rounded-xl border font-bold text-xs transition-all active:scale-95 flex items-center justify-center ${seatColorClass(seat.seatNo)}`}
              >
                {seat.seatNo}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Timeline for Stops */}
        {stops.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/30">
            <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Lộ trình chi tiết</h3>
            <div className="space-y-4">
              {stops.map((s, idx) => (
                <div key={s.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-white ring-1 ring-brand-primary/20 shadow-md translate-y-4 z-10" />
                    {idx !== stops.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-4" />}
                  </div>
                  <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Điểm {idx + 1}: {s.note || 'Trạm dừng chân'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Vị trí: {s.stopOrder}</p>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-brand-primary tracking-tight">
                        {formatTimeHHmm(s.plannedArrivalTime)} — {formatTimeHHmm(s.plannedDepartureTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Bar - Most Important Transformation */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 animate-in slide-in-from-bottom-5 duration-700">
          <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <div className="px-6">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tổng cộng {selectedSeats.length} vé</p>
              <p className="text-xl font-black text-white tracking-tighter">
                {new Intl.NumberFormat('vi-VN').format(selectedSeats.length * (routeData.price || 320000))} <span className="text-xs text-slate-400">₫</span>
              </p>
            </div>

            <button
              onClick={handleContinue}
              disabled={holding}
              className="bg-brand-primary hover:bg-brand-accent text-slate-950 h-14 px-8 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
            >
              {holding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Tiếp tục đặt chỗ <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
