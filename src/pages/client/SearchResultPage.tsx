import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, MapPin, Bus, Loader2, AlertCircle } from 'lucide-react'
import { Ticket } from '../../Components/client/Ticket'
import type { RouteItem } from '../../Components/client/Ticket'
import { createRequestMeta, createAuthorizedEnvelopeHeaders } from '../../utils/requestMeta'

const SEARCH_API_URL = "http://localhost:8082/api/v1/management/route-service/search";

export default function SearchResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get data from location state OR query params
  const stateSearchData = location.state?.searchData
  const stateTripType = location.state?.tripType

  const originParam = searchParams.get('origin')
  const destinationParam = searchParams.get('destination')
  const dateParam = searchParams.get('date')
  const seatsParam = searchParams.get('seats')
  const typeParam = searchParams.get('type') as "one-way" | "round-trip" | null
  const returnDateParam = searchParams.get('returnDate')

  const origin = stateSearchData?.originCity || originParam || "Hà Nội"
  const destination = stateSearchData?.destinationCity || destinationParam || "Hải Phòng"
  const tripType = stateTripType || typeParam || "one-way"
  const departureDate = stateSearchData?.departureDate || dateParam
  const returnDateRaw = stateSearchData?.returnDate || returnDateParam
  const seats = stateSearchData?.seats || (seatsParam ? parseInt(seatsParam) : 1)

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const date = formatDate(departureDate)
  const returnDate = formatDate(returnDateRaw)

  useEffect(() => {
    const fetchResults = async () => {
      if (!origin || !destination || !departureDate) return;
      
      setLoading(true);
      setError(null);
      try {
        const meta = createRequestMeta();
        const body = {
          ...meta,
          data: {
            origin: origin,
            destination: destination,
            departureDate: departureDate,
            seat: String(seats),
            pageSize: "50",
            pageNumber: "1"
          }
        };

        const response = await fetch(SEARCH_API_URL, {
          method: 'POST',
          headers: {
            ...createAuthorizedEnvelopeHeaders(meta),
            'Content-Type': 'application/json',
            'X-Request-Id': meta.requestId,
            'X-Request-DateTime': meta.requestDateTime,
            'X-Channel': meta.channel
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Không thể tìm thấy chuyến đi phù hợp");
        
        const result = await response.json();
        const rawItems = result.data?.items || result.data || [];
        
        // Map fields based on the new API response structure
        const items = rawItems.map((item: any) => ({
          ...item,
          origin: origin, // Use the searched origin
          destination: destination, // Use the searched destination
          price: item.ticketPrice, // Map ticketPrice to price
          stopPoints: item.routePoints?.map((rp: any) => ({
            ...rp,
            stopOrder: rp.operationOrder,
            note: rp.note || rp.stopName // Use stopName as note if note is empty
          }))
        }));
        
        setRoutes(items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [origin, destination, departureDate, seats]);


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
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-brand-dark/20 relative z-20">
            <div className="flex items-center gap-8 justify-between">
              <div className="flex items-center gap-10 flex-1">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Điểm đi</span>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className="text-slate-900 font-black text-2xl tracking-tight">{origin}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center px-4">
                   <div className="w-12 h-px bg-slate-100" />
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Điểm đến</span>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-secondary" />
                    </div>
                    <span className="text-slate-900 font-black text-2xl tracking-tight">{destination}</span>
                  </div>
                </div>
              </div>

              <div className="h-12 w-px bg-slate-100 mx-6" />

              <div className="text-right flex items-center gap-12">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ngày đi</p>
                  <p className="text-slate-900 font-black text-xl tracking-tight bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{date}</p>
                </div>
                {tripType === "round-trip" && (
                  <div className="border-l border-slate-100 pl-12 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ngày về</p>
                    <p className="text-slate-900 font-black text-xl tracking-tight bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{returnDate}</p>
                  </div>
                )}

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
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">
              {loading ? "Đang tìm kiếm..." : `Tìm thấy ${routes.length} kết quả phù hợp`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
             <span className="text-slate-600 font-black text-[12px]">Sắp xếp: Phổ biến nhất</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
            <p className="text-slate-500 font-black text-xl">Đang tải chuyến đi...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-32 bg-rose-50 rounded-[3rem] border border-rose-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-6" />
            <p className="text-rose-600 font-black text-xl">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Ticket List */}
        {!loading && !error && routes.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Bus className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-xl">Không tìm thấy chuyến đi phù hợp.</p>
            <p className="text-slate-300 font-bold mt-2">Vui lòng thử chọn ngày hoặc lộ trình khác.</p>
          </div>
        ) : !loading && !error && (
          <div className="grid grid-cols-1 gap-6">
            {routes.map((item: RouteItem) => (
              <Ticket
                key={item.id}
                item={item}
                onClick={() =>
                  navigate('/booking', { state: { routeData: item } })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
