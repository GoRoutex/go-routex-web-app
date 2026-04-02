import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bus, MapPin, ChevronRight, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-brand-primary/10">
      {/* Header */}
      <div className="bg-brand-dark pt-14 pb-10 px-8 sticky top-0 z-50 shadow-xl"
        style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/5 backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-black text-2xl tracking-tight">Chi tiết tuyến đường</h1>
          <div className="w-12" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-8 py-12 pb-48 space-y-10">
        {/* Route Info Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
            <div className="flex-1">
              <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                {routeData.origin} <span className="text-brand-primary mx-2">→</span> {routeData.destination}
              </h2>
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {routeData.routeCode}
                </span>
                <span className="text-slate-400 font-bold text-sm">Chuyến đi trong ngày</span>
              </div>
            </div>
            <div className="px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl self-start">
              <span className="text-brand-primary font-black text-base flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                Còn {routeData.availableSeats ?? 0} chỗ trống
              </span>
            </div>
          </div>

          {/* Time Row */}
          <div className="flex flex-col md:flex-row items-center gap-10 mb-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <div className="text-center md:text-left min-w-[120px]">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{formatTimeHHmm(routeData.plannedStartTime)}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Giờ xuất phát</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center w-full px-4">
              <div className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-3 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                {durationText(routeData.plannedStartTime, routeData.plannedEndTime)}
              </div>
              <div className="w-full h-[3px] bg-slate-200 rounded-full relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-brand-primary rounded-full" />
                <Bus className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 text-brand-primary bg-white rounded-full p-0.5" />
              </div>
              <div className="text-xs text-slate-500 font-bold mt-4 tracking-tight">
                {formatDateDDMMYYYY(routeData.plannedStartTime)}
              </div>
            </div>

            <div className="text-center md:text-right min-w-[120px]">
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{formatTimeHHmm(routeData.plannedEndTime)}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Giờ kết thúc</div>
            </div>
          </div>

          {/* Details */}
          <div className="pt-10 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="flex items-start gap-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover/item:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Điểm đón khách</p>
                <span className="font-bold text-slate-900 text-lg tracking-tight">{routeData.pickupBranch || '—'}</span>
              </div>
            </div>
            <div className="flex items-start gap-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover/item:scale-110 transition-transform">
                <Bus className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Phương tiện</p>
                <span className="font-bold text-slate-900 text-lg tracking-tight">{formatVehicleType(routeData.vehicleType)} • {routeData.vehiclePlate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
          <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            Chọn chỗ ngồi của bạn
          </h3>

          {/* Legend */}
          <div className="flex flex-wrap gap-8 mb-12 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            {[
              { color: 'bg-white border-2 border-slate-200', label: 'Còn trống', sub: 'Chưa có người đặt' },
              { color: 'bg-brand-primary border-2 border-brand-primary', label: 'Đang chọn', sub: 'Chỗ bạn muốn đặt' },
              { color: 'bg-slate-100 opacity-50 border-2 border-slate-100', label: 'Đã bán', sub: 'Không khả dụng' },
              { color: 'bg-rose-50 border-2 border-rose-100', label: 'Đang giữ', sub: 'Khách đang thanh toán' },
            ].map(({ color, label, sub }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-lg ${color}`} />
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">{label}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-10 gap-4 p-4">
            {routeSeats.map((seat) => (
              <button
                key={seat.seatNo}
                onClick={() => toggleSeat(seat.seatNo)}
                disabled={seat.status !== 'AVAILABLE' && !selectedSeats.includes(seat.seatNo)}
                className={`h-16 rounded-2xl border-2 font-black text-lg transition-all active:scale-90 flex items-center justify-center ${seatColorClass(seat.seatNo)}`}
              >
                {seat.seatNo}
              </button>
            ))}
          </div>
        </div>

        {/* Stop Points */}
        {stops.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
            <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Lộ trình dừng nghỉ
            </h3>
            <div className="space-y-10 relative ml-6">
              <div className="absolute top-2 bottom-2 left-0 w-0.5 bg-slate-100" />
              {stops.map((s, idx) => (
                <div key={s.id} className="relative pl-10 group/stop">
                  <div className="absolute top-1.5 left-[-8px] w-4 h-4 rounded-full bg-white border-4 border-brand-primary group-hover/stop:scale-125 transition-transform" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-colors">
                    <div>
                      <p className="font-black text-slate-900 text-lg">Điểm dừng {idx + 1}: {s.note || 'Trạm dừng chân'}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em] mt-1 italic">Vị trí trạm: {s.stopOrder}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                          <p className="font-black text-brand-primary bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm">
                             {formatTimeHHmm(s.plannedArrivalTime)} - {formatTimeHHmm(s.plannedDepartureTime)}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-8 py-8 border-t border-slate-100 z-[60]"
        style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          {/* Summary */}
          <div className="flex-1 w-full bg-slate-900 rounded-3xl px-8 py-6 flex justify-between items-center shadow-2xl shadow-slate-900/20">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Chỗ ngồi đã chọn</p>
              <p className="text-white font-black text-xl tracking-tight">
                {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'Chưa có chỗ được chọn'}
              </p>
            </div>
            <div className="text-right pl-6 border-l border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Số lượng</p>
              <p className="text-brand-primary font-black text-3xl tracking-tighter">{selectedSeats.length}</p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0 || holding}
            className={`w-full sm:w-[300px] py-7 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              selectedSeats.length > 0
                ? 'bg-brand-primary hover:bg-brand-primary shadow-[0_20px_40px_-15px_rgba(14,165,233,0.4)] text-white hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {holding ? (
              <><Loader2 className="w-7 h-7 animate-spin" /> Đang xử lý...</>
            ) : (
              <>Tiếp tục đặt vé <ChevronRight className="w-6 h-6" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
