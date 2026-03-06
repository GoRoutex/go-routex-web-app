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
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all overflow-hidden group">
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-neutral-100 text-[#192031] text-[10px] font-black uppercase tracking-widest rounded-full">
              {item.routeCode}
            </span>
            <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{date}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-[#192031]">{startTime}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Depart</span>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-2">{dur}</span>
              <div className="w-full h-[2px] bg-neutral-100 relative rounded-full">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neutral-200" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-[#12B3A8] transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">
                {stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-black text-[#192031]">{endTime}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Arrive</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-bold text-neutral-600">{item.vehicleType || 'Limousine'} • {item.seatCapacity || 32} seats</span>
            </div>
            {item.pickupBranch && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-bold text-neutral-600">{item.pickupBranch}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action */}
        <div className="md:w-56 md:border-l border-neutral-50 md:pl-8 flex flex-col justify-between items-end md:items-center text-center">
          <div>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Price per person</div>
            <div className="text-3xl font-black text-[#12B3A8]">{formatVnd(item.price || 50000)}</div>
          </div>

          <div className="mt-6 md:mt-0 w-full flex flex-col gap-3">
             {lowSeat && (
              <div className="text-[10px] font-black text-red-500 uppercase tracking-wide animate-pulse">
                Only {seats} seats left!
              </div>
            )}
            <button
              onClick={onClick}
              className="w-full bg-[#192031] hover:bg-[#12B3A8] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-[#12B3A8]/20"
            >
              Select Trip
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="w-full text-neutral-400 hover:text-[#192031] py-2 font-bold text-xs flex items-center justify-center gap-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Hide Details' : 'View Stops'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Stops */}
      {expanded && stopCount > 0 && (
        <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-neutral-50 rounded-[24px] p-6 space-y-4">
            <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Route Information</h5>
            <div className="space-y-6 relative ml-2">
              <div className="absolute top-2 bottom-2 left-0 w-0.5 bg-neutral-200" />
              {stops.map((stop) => (
                <div key={stop.id} className="relative pl-6">
                  <div className="absolute top-2 left-[-3px] w-2 h-2 rounded-full bg-white border-2 border-neutral-300" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-black text-sm text-[#192031]">{stop.note || `Stop ${stop.stopOrder}`}</h6>
                      <p className="text-xs text-neutral-400 font-bold mt-1">Arrival: {stop.plannedArrivalTime ? formatTimeHHmm(stop.plannedArrivalTime) : 'TBD'}</p>
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
