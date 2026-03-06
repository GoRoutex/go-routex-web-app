import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bus, MapPin, User, Phone, Mail, StickyNote, TicketCheck, ChevronRight } from 'lucide-react'

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
const formatVnd = (v?: number | null) => {
  if (typeof v !== 'number') return '—'
  return new Intl.NumberFormat('vi-VN').format(v) + ' ₫'
}

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
  stopPoints: [],
}

const InputField = ({
  label,
  icon: Icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  multiline,
}: {
  label: string
  icon: any
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-start gap-4 p-4 bg-neutral-50 border-2 border-transparent focus-within:border-[#12B3A8]/30 rounded-2xl transition-all">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-neutral-400" />
      </div>
      {multiline ? (
        <textarea
          className="bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-[#192031] w-full resize-none placeholder:text-neutral-300 placeholder:font-normal"
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-[#192031] w-full placeholder:text-neutral-300 placeholder:font-normal"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  </div>
)

export default function BookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedRoute: RouteItem | undefined = location.state?.routeData
  const passedSeats: string[] = location.state?.selectedSeats ?? []
  const routeData = passedRoute ?? mockRouteData
  const selectedSeats = passedSeats.length > 0 ? passedSeats : ['A1', 'A2']

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const unitPrice = routeData.price ?? 0
  const totalAmount = unitPrice * selectedSeats.length
  const canContinue = customerName.trim().length > 0 && customerPhone.trim().length > 0 && selectedSeats.length > 0

  const handleConfirm = () => {
    if (!canContinue) return
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 text-center shadow-2xl shadow-slate-200 border border-neutral-100">
          <div className="w-20 h-20 rounded-full bg-[#12B3A8] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#12B3A8]/20">
            <TicketCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-[#192031] mb-3">Booking Confirmed!</h2>
          <p className="text-neutral-400 font-bold mb-2">{routeData.origin} → {routeData.destination}</p>
          <p className="text-neutral-400 text-sm mb-8">Seats: <span className="text-[#192031] font-black">{selectedSeats.join(', ')}</span></p>
          <div className="bg-neutral-50 rounded-3xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-bold text-sm">Passenger</span>
              <span className="text-[#192031] font-black text-sm">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-bold text-sm">Total</span>
              <span className="text-[#12B3A8] font-black text-sm">{formatVnd(totalAmount)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-[#192031] hover:bg-[#12B3A8] text-white py-4 rounded-2xl font-black transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-white font-black text-xl">Booking</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-48 space-y-6">
        {/* Route Summary */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[#192031] mb-1">{routeData.origin} → {routeData.destination}</h2>
          <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">{routeData.routeCode}</span>

          <div className="flex items-center gap-6 my-6">
            <div>
              <div className="text-2xl font-black text-[#192031]">{formatTimeHHmm(routeData.plannedStartTime)}</div>
              <div className="text-xs text-neutral-400 font-bold mt-1">Depart</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">
                {durationText(routeData.plannedStartTime, routeData.plannedEndTime)}
              </div>
              <div className="w-full h-[2px] bg-neutral-100 rounded-full" />
              <div className="text-xs text-neutral-400 font-bold mt-1">
                {formatDateDDMMYYYY(routeData.plannedStartTime)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#192031]">{formatTimeHHmm(routeData.plannedEndTime)}</div>
              <div className="text-xs text-neutral-400 font-bold mt-1">Arrive</div>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-50 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pickup Branch</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#12B3A8]" />
                <span className="font-bold text-[#192031] text-sm">{routeData.pickupBranch || '—'}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Vehicle</p>
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#12B3A8]" />
                <span className="font-bold text-[#192031] text-sm">{routeData.vehicleType || '—'} • {routeData.vehiclePlate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-[#192031] mb-5">Selected seats</h3>
          <div className="flex flex-wrap gap-3">
            {selectedSeats.length === 0 ? (
              <p className="text-neutral-400 font-bold">No seats selected</p>
            ) : (
              selectedSeats.map(seat => (
                <span key={seat} className="px-4 py-2 bg-[#EAFBF9] text-[#1f615d] font-black rounded-full">
                  {seat}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-[#192031]">Customer information</h3>
          <InputField label="Full name" icon={User} placeholder="Enter full name" value={customerName} onChange={setCustomerName} />
          <InputField label="Phone number" icon={Phone} placeholder="Enter phone number" type="tel" value={customerPhone} onChange={setCustomerPhone} />
          <InputField label="Email" icon={Mail} placeholder="Enter email address" type="email" value={customerEmail} onChange={setCustomerEmail} />
          <InputField label="Note" icon={StickyNote} placeholder="Additional instructions or notes..." value={note} onChange={setNote} multiline />
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-[#192031] mb-6">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-bold">Seat quantity</span>
              <span className="font-black text-[#192031]">{selectedSeats.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-bold">Unit price</span>
              <span className="font-black text-[#192031]">{formatVnd(unitPrice)}</span>
            </div>
            <div className="pt-4 border-t border-neutral-50 flex justify-between items-center">
              <span className="text-xl font-black text-[#192031]">Total</span>
              <span className="text-2xl font-black text-[#12B3A8]">{formatVnd(totalAmount)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-5 border-t border-neutral-100"
        style={{ backgroundColor: 'rgba(245,247,250,0.97)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-white border border-neutral-100 rounded-2xl px-6 py-4 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Passenger</p>
              <p className="text-[#192031] font-black text-base mt-1">
                {customerName.trim().length > 0 ? customerName : 'Not entered'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total</p>
              <p className="text-[#12B3A8] font-black text-xl mt-1">{formatVnd(totalAmount)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canContinue}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              canContinue
                ? 'bg-[#12B3A8] hover:bg-[#0f968d] text-white shadow-[#12B3A8]/20'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            Confirm Booking <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
