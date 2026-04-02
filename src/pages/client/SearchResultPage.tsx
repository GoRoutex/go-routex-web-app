import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, MapPin, Bus } from 'lucide-react'
import { Ticket } from '../../Components/client/Ticket'
import type { RouteItem } from '../../Components/client/Ticket'

const mockRouteData: RouteItem[] = [
  {
    id: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
    pickupBranch: "233 Điện Biên Phủ",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    availableSeats: 32,
    plannedStartTime: "2026-03-04T07:30:00Z",
    plannedEndTime: "2026-03-04T13:30:00Z",
    routeCode: "HAN-HPH-06",
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
  },
  {
    id: "1fa5fc7c-d2ce-5ed6-9093-bdb0db903547",
    pickupBranch: "15 Trần Hưng Đạo",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    availableSeats: 3,
    plannedStartTime: "2026-03-04T10:00:00Z",
    plannedEndTime: "2026-03-04T15:30:00Z",
    routeCode: "HAN-HPH-07",
    vehicleType: "SLEEPER",
    seatCapacity: 30,
    price: 280000,
    stopPoints: [],
  },
]

export default function SearchResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchData = location.state?.searchData

  const origin = searchData?.originCity || "Điểm đi"
  const destination = searchData?.destinationCity || "Điểm đến"
  const date = searchData?.departureDate || "Hôm nay"

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <div
        className="bg-brand-dark pt-12 pb-16 px-8 relative overflow-hidden shadow-2xl shadow-brand-dark/20"
        style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group"
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
            </button>

            <h1 className="text-white font-black text-2xl tracking-tight">Kết quả tìm kiếm</h1>

            <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
              <SlidersHorizontal className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Route Summary */}
          <div className="bg-white border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md bg-opacity-10 shadow-inner">
            <div className="flex items-center gap-8 justify-between">
              <div className="flex items-center gap-10 flex-1">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Điểm đi</span>
                  <div className="flex items-center gap-3">
                    <Bus className="w-6 h-6 text-brand-primary" />
                    <span className="text-white font-black text-2xl tracking-tight">{origin}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center px-4">
                   <div className="w-8 h-px bg-white/20" />
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Điểm đến</span>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-brand-secondary" />
                    <span className="text-white font-black text-2xl tracking-tight">{destination}</span>
                  </div>
                </div>
              </div>

              <div className="h-12 w-px bg-white/10" />

              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày khởi hành</p>
                <p className="text-white font-black text-xl mt-2 tracking-tight">{date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-8 py-12 space-y-8">
        {/* Trips header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chuyến đi hiện có</h2>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Tìm thấy {mockRouteData.length} kết quả phù hợp</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
             <span className="text-slate-600 font-black text-[12px]">Sắp xếp: Phổ biến nhất</span>
          </div>
        </div>

        {/* Ticket List */}
        {mockRouteData.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Bus className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-xl">Không tìm thấy chuyến đi phù hợp.</p>
            <p className="text-slate-300 font-bold mt-2">Vui lòng thử chọn ngày hoặc lộ trình khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {mockRouteData.map((item) => (
              <Ticket
                key={item.id}
                item={item}
                onClick={() =>
                  navigate('/route-detail', { state: { routeData: item } })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
