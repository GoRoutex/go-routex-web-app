import { useState } from 'react'
import { Ticket, Search, CheckCircle2, XCircle, ArrowRight, Eye, RefreshCw } from 'lucide-react'
import type { SVGProps } from 'react'

const initialTickets = [
  { id: 'TKT-99201', passName: 'Michael Corleone', route: 'Tuyến trung tâm', date: '2026-03-20', time: '08:00', seat: '12A', price: '$24.00', status: 'Đã đặt' },
  { id: 'TKT-99202', passName: 'Vito Spatafore', route: 'Xe trung chuyển sân bay', date: '2026-03-20', time: '10:30', seat: '4C', price: '$45.00', status: 'Đã đặt' },
  { id: 'TKT-99182', passName: 'Paulie Gualtieri', route: 'Tuyến ven biển', date: '2026-03-19', time: '14:00', seat: '18D', price: '$35.00', status: 'Đã hoàn thành' },
  { id: 'TKT-99153', passName: 'Christopher Moltisanti', route: 'Vòng lặp thành phố', date: '2026-03-18', time: '09:00', seat: '2B', price: '$12.00', status: 'Đã huỷ' },
  { id: 'TKT-99205', passName: 'Tony Soprano', route: 'Xe trung chuyển sân bay', date: '2026-03-20', time: '10:30', seat: '4D', price: '$45.00', status: 'Đã hoàn tiền' },
]

export function TicketingPage() {
  const [tickets] = useState(initialTickets)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Đã hoàn thành': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECF6] text-purple-700 text-[11px] font-bold tracking-wider uppercase"><CheckCircle2 size={12} /> Đã hoàn thành</span>
      case 'Đã đặt': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F5FF] text-blue-700 text-[11px] font-bold tracking-wider uppercase"><Ticket size={12} /> Đã đặt</span>
      case 'Đã huỷ': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold tracking-wider uppercase"><XCircle size={12} /> Đã huỷ</span>
      case 'Đã hoàn tiền': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold tracking-wider uppercase"><RefreshCw size={12} /> Đã hoàn tiền</span>
      default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold tracking-wider uppercase">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Quản lý vé</h2>
          <span className="text-[12px] text-gray-400 font-medium">Theo dõi đặt chỗ, huỷ vé và thông tin hành khách</span>
        </div>
        <button 
          className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all"
        >
          <Plus size={16} />
          Tạo đặt chỗ
        </button>
      </div>

      <div className="bg-[#F7F9FB] rounded-3xl p-8 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div className="relative w-full max-w-md">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Tìm theo mã vé, tên hành khách hoặc tuyến..." className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] font-medium rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400" />
           </div>
           
           <div className="flex items-center gap-3">
             <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer">
               <option>Tất cả trạng thái</option>
               <option>Đã đặt</option>
               <option>Đã hoàn thành</option>
               <option>Đã huỷ</option>
             </select>
             <input type="date" className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer" />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Mã vé / Hành khách</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Chi tiết chuyến</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Ghế & Giá</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((tkt) => (
                <tr key={tkt.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[13px] text-blue-600 tracking-wider hover:underline cursor-pointer">{tkt.id}</span>
                      <span className="text-[13px] font-semibold text-gray-900">{tkt.passName}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-semibold text-gray-900">{tkt.route}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        {tkt.date} <ArrowRight size={10} /> {tkt.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Ghế:</span>
                         <span className="text-[13px] font-bold text-gray-900 bg-gray-200 px-2 rounded-md">{tkt.seat}</span>
                      </div>
                      <span className="text-[13px] font-medium text-gray-900 mt-1">{tkt.price}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    {getStatusBadge(tkt.status)}
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                         <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Xem chi tiết vé">
                         <Eye size={16} />
                       </button>
                       {tkt.status === 'Đã đặt' && (
                         <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Huỷ đặt chỗ">
                           <XCircle size={16} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
           <span className="text-[12px] text-gray-500 font-medium">Đang hiển thị 1 đến 5 trong tổng số 124 đặt chỗ</span>
           <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 bg-gray-100 cursor-not-allowed">Trước</button>
             <button className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Sau</button>
           </div>
        </div>
      </div>
    </div>
  )
}

function Plus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
