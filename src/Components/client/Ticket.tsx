import { useState, useMemo } from 'react'
import { MapPin } from 'lucide-react'

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
  vehiclePlate?: string | null
  hasFloor?: boolean | null
}

const pad2 = (n: number) => String(n).padStart(2, "0")

const formatTimeHHmm = (iso: string) => {
  if (!iso) return "--:--";
  try {
    const d = new Date(iso)
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  } catch {
    return "--:--"
  }
}

const durationText = (startIso: string, endIso: string) => {
  if (!startIso || !endIso) return "0h0";
  try {
    const s = new Date(startIso).getTime()
    const e = new Date(endIso).getTime()
    const diff = Math.max(0, e - s)
    const totalMin = Math.floor(diff / 60000)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${pad2(h)}h${pad2(m)}`
  } catch {
    return "0h0"
  }
}

const formatVnd = (v?: number | null) => {
  if (typeof v !== "number") return "—"
  return new Intl.NumberFormat("vi-VN").format(v) + "đ"
}

const formatVehicleType = (value?: string | null) => {
  if (!value) return "Xe khách"
  const normalized = value.trim().toUpperCase()
  if (normalized === "LIMOUSINE") return "Limousine"
  if (normalized === "SLEEPER") return "Giường nằm"
  if (normalized === "STANDARD" || normalized === "COACH") return "Ghế ngồi"
  if (normalized === "PREMIUM") return "Tuyệt đỉnh"
  return "Limousine"
}

export const Ticket = ({ item, onClick }: { item: RouteItem, onClick?: () => void }) => {

  const startTime = formatTimeHHmm(item.plannedStartTime)
  const endTime = formatTimeHHmm(item.plannedEndTime)
  const dur = durationText(item.plannedStartTime, item.plannedEndTime)

  const seats = item.availableSeats ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      {/* Top half */}
      <div className="p-5 flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-center justify-between pointer-events-auto">
        {/* Left: Origin Time & Location */}
        <div className="flex flex-col flex-1 min-w-[200px] w-[500px] md:w-auto">
           <div className="flex items-center gap-4">
             <div className="text-[20px] sm:text-[24px] font-bold text-slate-800 leading-none">{startTime}</div>
             <div className="flex items-center gap-2 flex-1 w-full max-w-[260px]">
                <div className="w-3 h-3 rounded-full border-2 border-slate-600 bg-white shrink-0" />
                <div className="flex-1 min-w-[60px] border-t-[1.5px] border-dotted border-gray-300 relative h-0">
                    <span className="absolute left-1/2 -top-5 transform -translate-x-1/2 text-[12px] text-slate-500 whitespace-nowrap bg-white px-2 mt-0.5">
                       {dur} - 304Km
                    </span>
                    <span className="absolute left-1/2 top-1.5 transform -translate-x-1/2 text-[11px] text-slate-400 whitespace-nowrap px-2">
                       (Asian/Ho Chi Minh)
                    </span>
                </div>
                <div className="w-4 h-4 text-brand-primary shrink-0 bg-white">
                  <MapPin className="w-full h-full text-slate-500 stroke-[2.5]" />
                </div>
             </div>
             <div className="text-[20px] sm:text-[24px] font-bold text-slate-800 leading-none">{endTime}</div>
           </div>
           
           <div className="flex items-start justify-between mt-3 text-[14px]">
             <div className="font-semibold text-slate-800 w-[120px] leading-snug">{item.pickupBranch || item.origin || "An Sương"}</div>
             <div className="font-semibold text-slate-800 w-[120px] text-right leading-snug">{item.destination || "Liên tỉnh Đà Lạt"}</div>
           </div>
           
           <div className="flex justify-start mt-1">
             <p className="text-[12px] text-brand-primary font-medium hover:underline cursor-pointer">Lưu ý: ...</p>
           </div>
        </div>

        {/* Right: Info & Price */}
        <div className="flex flex-col items-end shrink-0 w-full md:w-[200px] space-y-4 sm:space-y-3 pt-2 sm:pt-0">
          <div className="text-[13px] font-medium text-slate-600 flex items-center justify-end flex-wrap gap-1 w-full">
            <div className="bg-gray-400 w-1 h-1 rounded-full shrink-0 mr-1 hidden sm:block" />
            <span className="truncate">{formatVehicleType(item.vehicleType)}</span>
            <div className="bg-gray-400 w-1 h-1 rounded-full shrink-0 mx-1" />
            <span className="text-emerald-700 font-bold whitespace-nowrap">{seats} chỗ trống</span>
          </div>
          <div className="text-[22px] sm:text-[24px] font-bold text-brand-accent leading-none block w-full text-right">
            {formatVnd(item.price || 364000)}
          </div>
        </div>
      </div>

      {/* Bottom half */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white text-[13px] sm:text-[14px] font-medium text-slate-700 overflow-x-auto">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 mr-4">
           <button className="hover:text-brand-primary transition-colors">Chọn ghế</button>
           <button className="hover:text-brand-primary transition-colors">Lịch trình</button>
           <button className="hover:text-brand-primary transition-colors">Trung chuyển</button>
           <button className="hover:text-brand-primary transition-colors whitespace-nowrap">Chính sách</button>
        </div>
        <button 
           onClick={onClick}
           className="px-6 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[13px] hover:bg-brand-primary hover:text-white transition-colors shrink-0"
        >
          Chọn chuyến
        </button>
      </div>
    </div>
  )
}
