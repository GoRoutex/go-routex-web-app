import { useState, useEffect } from "react";
import { MessageSquare, Star, Search, User, CheckCircle2, Clock, Loader2, AlertCircle, X, ChevronRight, ChevronLeft } from "lucide-react";
import { createAuthorizedEnvelopeHeaders } from "../../utils/requestMeta";
import { extractArrayValue, extractNumberValue } from "../../utils/responseExtractors";

const FETCH_REVIEWS_URL = "http://localhost:8083/api/v1/merchant-service/reviews/fetch";
const DETAIL_REVIEW_URL = "http://localhost:8083/api/v1/merchant-service/reviews/detail";

export function MerchantFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const headers = {
        ...createAuthorizedEnvelopeHeaders(),
        'accept': '*/*'
      };
      const response = await fetch(`${FETCH_REVIEWS_URL}?pageNumber=${pageNum}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải danh sách đánh giá");

      const body = await response.json();
      const data = extractArrayValue(body, ["reviews", "items", "data", "content", "payload"]);
      const total = extractNumberValue(body, ["total", "totalElements", "totalCount", "totalItems"]) || 0;

      setFeedbacks(data);
      setTotalItems(total);
    } catch (err: any) {
      console.error("Fetch reviews error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewDetail = async (reviewId: string) => {
    try {
      setDetailLoading(true);
      const headers = {
        ...createAuthorizedEnvelopeHeaders(),
        'accept': '*/*'
      };
      const response = await fetch(`${DETAIL_REVIEW_URL}?reviewId=${reviewId}`, {
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải chi tiết đánh giá");

      const body = await response.json();
      // Assuming the detail is in 'review' or just the body
      const detail = body.payload || body.review || body.data || body;
      setSelectedReview(detail);
    } catch (err: any) {
      console.error("Fetch review detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Phản hồi khách hàng</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Lắng nghe ý kiến từ hành khách để cải thiện dịch vụ của nhà xe.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform"><Star size={20} className="fill-amber-500" /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Đánh giá trung bình</p>
                <p className="text-xl font-black text-slate-900">{totalItems > 0 ? "4.8" : "N/A"}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tích cực</p>
                <p className="text-xl font-black text-slate-900">{totalItems > 0 ? "92%" : "0%"}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform"><MessageSquare size={20} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tổng phản hồi</p>
                <p className="text-xl font-black text-slate-900">{totalItems.toLocaleString()}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform"><Clock size={20} /></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Chờ xử lý</p>
                <p className="text-xl font-black text-slate-900">{totalItems > 0 ? "12" : "0"}</p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm kiếm phản hồi..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20" />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-black text-slate-500 px-2 uppercase tracking-widest">Trang {page} / {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải phản hồi...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Không thể kết nối</h3>
              <p className="text-slate-500 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => fetchReviews(page)}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <MessageSquare size={32} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Chưa có phản hồi nào từ khách hàng.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
              {feedbacks.map((f, idx) => (
                  <div 
                    key={f.reviewId || f.id || idx} 
                    className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => fetchReviewDetail(f.reviewId || f.id)}
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-white shadow-sm overflow-hidden">
                                {f.customerAvatar ? <img src={f.customerAvatar} alt="" className="w-full h-full object-cover" /> : <User size={20} />}
                              </div>
                              <div>
                                  <h4 className="text-sm font-black text-slate-900">{f.customerName || f.user || "Khách hàng"}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      <div className="flex">
                                          {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= (f.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                        {f.createdAt || f.date || "Vừa xong"} {f.tripName ? `· ${f.tripName}` : ""}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${f.isResponded || f.status === 'Đã phản hồi' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {f.isResponded || f.status === 'Đã phản hồi' ? 'Đã phản hồi' : 'Chờ xử lý'}
                          </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pl-[52px] line-clamp-2 group-hover:line-clamp-none transition-all">{f.comment || f.content}</p>
                      <div className="mt-4 pl-[52px] flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs font-black text-brand-primary hover:underline">Xem chi tiết & Phản hồi</button>
                          <button className="text-xs font-black text-slate-400 hover:text-slate-600">Ghim đánh giá</button>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 ring-4 ring-slate-50">
                  {selectedReview.customerAvatar ? <img src={selectedReview.customerAvatar} alt="" className="w-full h-full object-cover rounded-full" /> : <User size={28} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedReview.customerName || "Khách hàng"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= selectedReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{selectedReview.createdAt}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung đánh giá</p>
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  {selectedReview.comment || selectedReview.content}
                </p>
              </div>

              {selectedReview.tripName && (
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyến xe</p>
                    <p className="text-sm font-bold text-slate-900">{selectedReview.tripName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đi</p>
                    <p className="text-sm font-bold text-slate-900">{selectedReview.tripDate || "N/A"}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phản hồi của bạn</p>
                <textarea 
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                  defaultValue={selectedReview.merchantResponse || ""}
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedReview(null)}
                    className="px-6 py-2.5 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button className="px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading detail overlay */}
      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        </div>
      )}
    </div>
  );
}

