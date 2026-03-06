import { useState, useEffect, useMemo } from 'react'
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

// Mock seats generated from capacity
const generateMockSeats = (routeId: string, capacity: number): RouteSeatItem[] =>
  Array.from({ length: capacity }, (_, i) => ({
    routeId,
    seatNo: String(i + 1).padStart(2, '0'),
    status: (i < 5 ? 'SOLD' : i < 8 ? 'HELD' : 'AVAILABLE') as RouteSeatStatus,
  }))


const mockRouteData: RouteItem = {
  id: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
  pickupBranch: "233 Dien Bien Phu",
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
      note: "Trạm Dừng Chân",
    },
  ],
}

export default function RouteDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedRoute: RouteItem | undefined = location.state?.routeData
  const routeData = passedRoute ?? mockRouteData

  const [routeSeats, setRouteSeats] = useState<RouteSeatItem[]>([])
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [holding, setHolding] = useState(false)

  // Simulate fetching seats
  useEffect(() => {
    setLoadingSeats(true)
    setTimeout(() => {
      setRouteSeats(generateMockSeats(routeData.id, routeData.seatCapacity ?? 34))
      setLoadingSeats(false)
    }, 800)
  }, [routeData.id, routeData.seatCapacity])

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
    if (isSelected) return 'bg-[#12B3A8] border-[#12B3A8] text-white cursor-pointer'
    if (status === 'SOLD') return 'bg-neutral-200 border-neutral-200 text-neutral-400 cursor-not-allowed'
    if (status === 'HELD') return 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
    if (status === 'BLOCKED') return 'bg-neutral-400 border-neutral-400 text-white cursor-not-allowed'
    return 'bg-white border-neutral-200 text-[#192031] hover:border-[#12B3A8] cursor-pointer'
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
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-[#192031] pt-10 pb-6 px-6"
        style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-black text-xl">Route Detail</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-44 space-y-6">
        {/* Route Info Card */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-black text-[#192031] mb-2">
                {routeData.origin} → {routeData.destination}
              </h2>
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-[#192031]">
                {routeData.routeCode}
              </span>
            </div>
            <div className="px-4 py-2 bg-[#EAFBF9] rounded-full">
              <span className="text-[#1f615d] font-black text-sm">
                {routeData.availableSeats ?? 0} seats left
              </span>
            </div>
          </div>

          {/* Time Row */}
          <div className="flex items-center gap-6 mb-8">
            <div>
              <div className="text-3xl font-black text-[#192031]">{formatTimeHHmm(routeData.plannedStartTime)}</div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Depart</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs font-black text-neutral-300 uppercase tracking-widest mb-2">
                {durationText(routeData.plannedStartTime, routeData.plannedEndTime)}
              </div>
              <div className="w-full h-[2px] bg-neutral-100 rounded-full" />
              <div className="text-xs text-neutral-400 font-bold mt-2">
                {formatDateDDMMYYYY(routeData.plannedStartTime)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#192031]">{formatTimeHHmm(routeData.plannedEndTime)}</div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Arrive</div>
            </div>
          </div>

          {/* Details */}
          <div className="pt-6 border-t border-neutral-50 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pickup branch</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#12B3A8]" />
                <span className="font-bold text-[#192031]">{routeData.pickupBranch || '—'}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Vehicle</p>
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#12B3A8]" />
                <span className="font-bold text-[#192031]">{routeData.vehicleType || '—'} • {routeData.vehiclePlate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-[#192031] mb-6">Select seats</h3>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mb-8">
            {[
              { color: 'bg-white border border-neutral-200', label: 'Available' },
              { color: 'bg-[#12B3A8]', label: 'Selected' },
              { color: 'bg-neutral-200', label: 'Sold' },
              { color: 'bg-red-50 border border-red-200', label: 'Processing' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-xs font-bold text-neutral-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Seat Grid */}
          {loadingSeats ? (
            <div className="py-16 flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#12B3A8] animate-spin" />
              <span className="text-neutral-400 font-bold">Loading seat map...</span>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {routeSeats.map((seat) => (
                <button
                  key={seat.seatNo}
                  onClick={() => toggleSeat(seat.seatNo)}
                  disabled={seat.status !== 'AVAILABLE' && !selectedSeats.includes(seat.seatNo)}
                  className={`h-12 rounded-xl border-2 font-black text-sm transition-all ${seatColorClass(seat.seatNo)}`}
                >
                  {seat.seatNo}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stop Points */}
        {stops.length > 0 && (
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-[#192031] mb-6">Stop points</h3>
            <div className="space-y-5 relative ml-3">
              <div className="absolute top-2 bottom-2 left-0 w-0.5 bg-neutral-100" />
              {stops.map((s) => (
                <div key={s.id} className="relative pl-6">
                  <div className="absolute top-1.5 left-[-5px] w-2.5 h-2.5 rounded-full bg-white border-2 border-[#12B3A8]" />
                  <p className="font-black text-[#192031]">Stop {s.stopOrder}: {s.note || '—'}</p>
                  <p className="text-xs text-neutral-400 font-bold mt-1">
                    Arrival: {formatTimeHHmm(s.plannedArrivalTime)} &bull; Departure: {formatTimeHHmm(s.plannedDepartureTime)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-5 border-t border-neutral-100"
        style={{ backgroundColor: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Summary */}
          <div className="bg-white border border-neutral-100 rounded-2xl px-6 py-4 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Selected seats</p>
              <p className="text-[#192031] font-black text-base mt-1">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Count</p>
              <p className="text-[#192031] font-black text-2xl mt-1">{selectedSeats.length}</p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0 || holding}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              selectedSeats.length > 0
                ? 'bg-[#12B3A8] hover:bg-[#0f968d] text-white shadow-[#12B3A8]/20'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            {holding ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <>Continue <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
