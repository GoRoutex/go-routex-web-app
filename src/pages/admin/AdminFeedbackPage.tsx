import { useState } from 'react'
import { Star, Send, Filter, CheckCircle2, Clock3, AlertCircle } from 'lucide-react'

const feedbackItems = [
  {
    id: 'FB-1001',
    name: 'Nguyễn Minh Khang',
    route: 'Hà Nội - Hải Phòng',
    rating: 5,
    category: 'Dịch vụ',
    status: 'Mới',
    message: 'Xe sạch, tài xế thân thiện và khởi hành đúng giờ.',
  },
  {
    id: 'FB-1002',
    name: 'Trần Thu Hà',
    route: 'Sài Gòn - Nha Trang',
    rating: 4,
    category: 'Đặt chỗ',
    status: 'Đang xem xét',
    message: 'Quy trình chọn ghế tốt, mong có thêm phương thức thanh toán.',
  },
  {
    id: 'FB-1003',
    name: 'Lê Hoàng Nam',
    route: 'Đà Nẵng - Huế',
    rating: 3,
    category: 'Hỗ trợ',
    status: 'Đã xử lý',
    message: 'Đội hỗ trợ phản hồi nhanh nhưng cần cập nhật trạng thái vé rõ hơn.',
  },
]

export function AdminFeedbackPage() {
  const [selectedStatus, setSelectedStatus] = useState('Tất cả')
  const filteredItems = selectedStatus === 'Tất cả'
    ? feedbackItems
    : feedbackItems.filter((item) => item.status === selectedStatus)

  const badge = (status: string) => {
    switch (status) {
      case 'Mới':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider"><Clock3 size={12} /> Mới</span>
      case 'Đang xem xét':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider"><AlertCircle size={12} /> Đang xem xét</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Đã xử lý</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Phản hồi</h2>
          <span className="text-[12px] text-gray-400 font-medium">Xem phản hồi của hành khách và các yêu cầu dịch vụ</span>
        </div>
        <button className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all">
          <Send size={16} />
          Gửi thông báo
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        {['Tất cả', 'Mới', 'Đang xem xét', 'Đã xử lý'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-colors ${
              selectedStatus === status ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <article key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[15px] font-bold text-gray-900">{item.name}</h3>
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{item.id}</span>
                  {badge(item.status)}
                </div>
                <p className="text-[13px] text-gray-500">
                  Tuyến: <span className="font-semibold text-gray-700">{item.route}</span> • Danh mục: <span className="font-semibold text-gray-700">{item.category}</span>
                </p>
                <p className="text-[13px] text-gray-700 leading-relaxed max-w-3xl">{item.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, index) => (
                    <Star key={index} size={14} fill="currentColor" />
                  ))}
                </div>
                <button className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-black transition-colors">
                  Trả lời
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
