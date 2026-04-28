import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Trash2, DollarSign, Clock, Armchair, ChevronDown } from 'lucide-react'
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
  const originParam = searchParams.get('origin')
  const destinationParam = searchParams.get('destination')
  const dateParam = searchParams.get('date')
  const seatsParam = searchParams.get('seats')

  const origin = stateSearchData?.originCity || originParam || "TP. Hồ Chí Minh"
  const destination = stateSearchData?.destinationCity || destinationParam || "Lâm Đồng"
  const departureDate = stateSearchData?.departureDate || dateParam
  const seats = stateSearchData?.seats || (seatsParam ? parseInt(seatsParam) : 1)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const meta = createRequestMeta();
        const body = {
          ...meta,
          data: {
            origin: origin,
            destination: destination,
            departureDate: departureDate || new Date().toISOString(),
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
        
        const items = rawItems.map((item: any) => ({
          ...item,
          origin: origin,
          destination: destination,
          price: item.ticketPrice,
          stopPoints: item.routePoints?.map((rp: any) => ({
            ...rp,
            stopOrder: rp.operationOrder,
            note: rp.note || rp.stopName
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
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      <main className="max-w-[1140px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Sidebar: Bộ lọc tìm kiếm */}
           <div className="lg:col-span-3">
             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                   <h2 className="text-[14px] font-bold text-slate-800">BỘ LỌC TÌM KIẾM</h2>
                   <button className="text-brand-primary text-[13px] font-medium flex items-center gap-1 hover:text-brand-accent transition-colors">
                      Bỏ lọc
                      <Trash2 className="w-4 h-4 ml-1" />
                   </button>
                </div>
                
                {/* Filter 1: Giờ đi */}
                <div className="p-5 border-b border-gray-100">
                   <h3 className="text-[14px] font-bold text-slate-800 mb-4">Giờ đi</h3>
                   <div className="space-y-4">
                      {[
                        "Sáng sớm 00:00 - 06:00",
                        "Buổi sáng 06:00 - 12:00",
                        "Buổi chiều 12:00 - 18:00",
                        "Buổi tối 18:00 - 24:00"
                      ].map((time, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" className="w-[18px] h-[18px] rounded border-gray-300 text-brand-primary focus:ring-brand-primary accent-brand-primary cursor-pointer"/>
                           <span className="text-[13px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">{time}</span>
                        </label>
                      ))}
                   </div>
                </div>

                {/* Filter 2: Loại xe */}
                <div className="p-5 border-b border-gray-100">
                   <h3 className="text-[14px] font-bold text-slate-800 mb-4">Loại xe</h3>
                   <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Ghế</button>
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Giường</button>
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Limousine</button>
                   </div>
                </div>
                
                {/* Filter 3: Hàng ghế */}
                <div className="p-5 border-b border-gray-100">
                   <h3 className="text-[14px] font-bold text-slate-800 mb-4">Hàng ghế</h3>
                   <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Hàng đầu</button>
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Hàng giữa</button>
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Hàng cuối</button>
                   </div>
                </div>

                {/* Filter 4: Tầng */}
                <div className="p-5">
                   <h3 className="text-[14px] font-bold text-slate-800 mb-4">Tầng</h3>
                   <div className="flex flex-wrap gap-2">
                       <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Tầng trên</button>
                       <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary transition-colors">Tầng dưới</button>
                   </div>
                </div>
             </div>
           </div>

           {/* Results List */}
           <div className="lg:col-span-9">
              <h1 className="text-[20px] font-medium text-slate-800 mb-4">{origin} - {destination} ({loading ? 0 : routes.length})</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-8">
                 <button className="flex items-center justify-center gap-2 px-4 py-2 border border-brand-primary/30 text-brand-primary text-[14px] font-medium rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors">
                    <DollarSign className="w-4 h-4 shrink-0"/> Giá rẻ bất ngờ
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-2 border border-brand-primary/30 text-brand-primary text-[14px] font-medium rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors">
                    <Clock className="w-4 h-4 shrink-0"/> Giờ khởi hành
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-slate-700 text-[14px] font-medium rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm">
                    <Armchair className="w-4 h-4 shrink-0"/> Ghế trống
                 </button>
              </div>

              {loading ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Đang tìm kiếm chuyến đi...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-rose-500 font-medium mb-4">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold">Thử lại</button>
                </div>
              ) : routes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-slate-500 font-medium">Không tìm thấy chuyến đi nào phù hợp.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {routes.map((item: RouteItem, i: number) => (
                    <div key={item.id}>
                        {i === 1 && localStorage.getItem("isLoggedIn") !== "true" && (
                            <div className="bg-white rounded-xl border border-brand-primary/20 shadow-sm p-6 mb-5 flex items-center justify-between">
                                <div className="max-w-md">
                                    <h4 className="text-[15px] font-bold text-slate-800 mb-2">Đăng nhập ngay để nhận được nhiều quyền lợi dành cho thành viên</h4>
                                    <p className="text-[13px] text-slate-500 mb-4">Khi đăng nhập và tải App, bạn sẽ dễ dàng quản lý đặt chỗ, nhận thông báo quan trọng và nhiều ưu đãi khác...</p>
                                    <a href="#" className="text-brand-primary font-semibold text-[14px] hover:underline underline-offset-4">Đăng nhập ngay</a>
                                </div>
                                {/* Placeholder for illustration, keeping it abstract with a soft layout */}
                                <div className="hidden sm:flex w-40 h-24 bg-brand-primary/5 rounded-lg relative items-center justify-center border border-brand-primary/10 overflow-hidden">
                                    <div className="w-16 h-10 bg-brand-primary/20 rounded shadow-sm absolute top-4 left-4" />
                                    <div className="w-14 h-8 bg-brand-primary/40 rounded shadow-sm absolute bottom-2 right-4" />
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-10">
                                        <div className="w-6 h-6 bg-brand-primary rounded" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <Ticket
                            item={{...item, origin, destination}} // ensuring origin/dest injected
                            onClick={() => navigate('/booking', { state: { routeData: item } })}
                        />
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  )
}
