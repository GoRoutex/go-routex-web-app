import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, MapPin, Bus } from 'lucide-react'
import { Ticket } from '../../Components/client/Ticket'
import type { RouteItem } from '../../Components/client/Ticket'

const mockRouteData: RouteItem[] = [
  {
    id: "09b6fc7c-c3ce-4ed6-9093-ada0db903546",
    pickupBranch: "233 Dien Bien Phu",
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
        note: "Trạm Dừng Chân",
      },
    ],
  },
  {
    id: "1fa5fc7c-d2ce-5ed6-9093-bdb0db903547",
    pickupBranch: "15 Tran Hung Dao",
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

  const origin = searchData?.originCity || "Origin"
  const destination = searchData?.destinationCity || "Destination"
  const date = searchData?.departureDate || ""

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div
        className="bg-[#192031] pt-10 pb-10 px-6"
        style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h1 className="text-white font-black text-xl">Search Results</h1>

            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Route Summary */}
          <div className="bg-[#263148] border border-[#33415C] rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bus className="w-4 h-4 text-[#12B3A8]" />
                  <span className="text-white font-black text-lg">{origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-400 font-bold text-sm">{destination}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Travel Date</p>
                <p className="text-white font-black text-base mt-1">{date || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Trips header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#192031]">Trips</h2>
          <span className="text-neutral-400 font-bold text-sm">
            {mockRouteData.length} Result{mockRouteData.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Ticket List */}
        {mockRouteData.length === 0 ? (
          <div className="text-center py-24 text-neutral-400 font-bold">
            No trips found for this route and date.
          </div>
        ) : (
          <div className="space-y-5">
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
