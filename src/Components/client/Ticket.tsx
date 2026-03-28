import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, MapPin, Bus } from 'lucide-react'

export type StopPoint = {
  id: string
  stopOrder: string
  routeId: string
  plannedArrivalTime?: string
  plannedDepartureTime?: string
  note?: string
}

export type RouteItem = {
  id: string
  pickupBranch?: string | null
  origin: string
  destination: string
  availableSeats?: number | null
  plannedStartTime: string
  plannedEndTime: string
  routeCode: string
  stopPoints?: StopPoint[] | null
  price?: number | null
  currency?: string
  vehicleType?: string | null
  seatCapacity?: number | null
}

const pad2 = (n: number) => String(n).padStart(2, "0")

const formatTimeHHmm = (iso: string) => {
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const formatDateDDMM = (iso: string) => {
  const d = new Date(iso)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`
}

const durationText = (startIso: string, endIso: string) => {
  const s = new Date(startIso).getTime()
  const e = new Date(endIso).getTime()
  const diff = Math.max(0, e - s)
  const totalMin = Math.floor(diff / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const formatVnd = (v?: number | null) => {
  if (typeof v !== "number") return "—"
  return new Intl.NumberFormat("vi-VN").format(v) + " ₫"
}

export const Ticket = ({ item, onClick }: { item: RouteItem, onClick?: () => void }) => {
  const [expanded, setExpanded] = useState(false)

  const startTime = formatTimeHHmm(item.plannedStartTime)
  const endTime = formatTimeHHmm(item.plannedEndTime)
  const date = formatDateDDMM(item.plannedStartTime)
  const dur = durationText(item.plannedStartTime, item.plannedEndTime)

  const seats = item.availableSeats ?? 0
  const lowSeat = seats > 0 && seats <= 3

  const stops = useMemo<StopPoint[]>(() => {
    if (!item.stopPoints) return []
    return [...item.stopPoints].sort((a, b) => parseInt(a.stopOrder) - parseInt(b.stopOrder))
  }, [item.stopPoints])

  const stopCount = stops.length

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden group">
      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
        {/* Left Info */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-xl border border-brand-primary/10">
              {item.routeCode}
            </span>
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{date}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start gap-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{startTime}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khởi hành</span>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{dur}</span>
              <div className="w-full h-[3px] bg-slate-50 relative rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000" 
                  style={{ width: '100%' }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
                {stopCount === 0 ? "Chạy thẳng" : `${stopCount} điểm dừng`}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{endTime}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kết thúc</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Bus className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-[13px] font-bold text-slate-600 tracking-tight">{item.vehicleType || 'Limousine'} • {item.seatCapacity || 32} chỗ</span>
            </div>
            {item.pickupBranch && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <MapPin className="w-4 h-4 text-brand-secondary" />
                </div>
                <span className="text-[13px] font-bold text-slate-600 tracking-tight">{item.pickupBranch}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action */}
        <div className="md:w-64 md:border-l border-slate-100 md:pl-10 flex flex-col justify-between items-end md:items-center text-center">
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Giá vé 1 người</div>
            <div className="text-4xl font-black text-brand-primary tracking-tighter">{formatVnd(item.price || 50000)}</div>
          </div>

          <div className="mt-8 md:mt-0 w-full flex flex-col gap-4">
             {lowSeat && (
              <div className="text-[11px] font-black text-red-500 uppercase tracking-widest animate-pulse mb-1">
                Chỉ còn {seats} ghế cuối!
              </div>
            )}
            <button
              onClick={onClick}
              className="w-full bg-brand-dark hover:bg-brand-primary text-white py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-xl shadow-brand-dark/10 hover:shadow-brand-primary/25 hover:-translate-y-1"
            >
              Chọn chuyến này
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="w-full text-slate-400 hover:text-slate-900 py-2 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Ẩn chi tiết' : 'Xem điểm dừng'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Stops */}
      {expanded && stopCount > 0 && (
        <div className="px-10 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 border border-white">
            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Thông tin lộ trình</h5>
            <div className="space-y-8 relative ml-3">
              <div className="absolute top-2 bottom-2 left-0 w-1 bg-gradient-to-b from-brand-primary/20 via-brand-accent/20 to-brand-secondary/20 rounded-full" />
              {stops.map((stop) => (
                <div key={stop.id} className="relative pl-8 group/stop">
                  <div className="absolute top-1.5 left-[-6px] w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover/stop:border-brand-primary group-hover/stop:scale-125 transition-all shadow-sm" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-black text-base text-slate-900 tracking-tight">{stop.note || `Trạm dừng ${stop.stopOrder}`}</h6>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Đến lúc: {stop.plannedArrivalTime ? formatTimeHHmm(stop.plannedArrivalTime) : 'Dự kiến'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
