import { useState } from 'react'
import { Plus, Edit2, Trash2, Bus, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react'

const initialVehicles = [
  { id: '1', license: 'B-1029', type: 'Xe khách - 50 chỗ', status: 'Đang hoạt động', mileage: '120,500 km', lastMaintenance: '2023-09-15' },
  { id: '2', license: 'B-1030', type: 'Xe khách - 50 chỗ', status: 'Bảo trì', mileage: '185,200 km', lastMaintenance: '2023-11-20' },
  { id: '3', license: 'V-0544', type: 'Xe van - 16 chỗ', status: 'Đang hoạt động', mileage: '45,000 km', lastMaintenance: '2024-01-10' },
  { id: '4', license: 'B-2011', type: 'Xe khách - 30 chỗ', status: 'Lỗi', mileage: '220,100 km', lastMaintenance: '2023-05-05' },
]

export function FleetManagementPage() {
  const [vehicles] = useState(initialVehicles)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Đang hoạt động': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F5FF] text-blue-700 text-[11px] font-bold tracking-wider uppercase"><CheckCircle2 size={12} /> Đang hoạt động</span>
      case 'Bảo trì': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECF6] text-purple-700 text-[11px] font-bold tracking-wider uppercase"><Wrench size={12} /> Bảo trì</span>
      default: return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold tracking-wider uppercase"><AlertCircle size={12} /> Lỗi</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Quản lý đội xe</h2>
          <span className="text-[12px] text-gray-400 font-medium">Quản lý phương tiện, thông số và trạng thái</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all"
        >
          <Plus size={16} />
          Thêm xe
        </button>
      </div>

      <div className="bg-[#F7F9FB] rounded-3xl p-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Biển số</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Loại xe</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Số km</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vh) => (
                <tr key={vh.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-900">
                          <Bus size={18} />
                       </div>
                       <span className="font-bold text-[14px] tracking-widest text-gray-900">{vh.license}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-[13px] font-medium text-gray-600">{vh.type}</span>
                  </td>
                  <td className="py-5">
                    {getStatusBadge(vh.status)}
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-semibold text-gray-900">{vh.mileage}</span>
                         <span className="text-[11px] text-gray-400">Bảo dưỡng gần nhất: {vh.lastMaintenance}</span>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Sửa xe">
                         <Edit2 size={16} />
                       </button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Xoá xe">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-black/5">
            <h3 className="text-[16px] font-bold mb-6 text-gray-900">Thêm xe mới</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Biển số</label>
                 <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 uppercase" placeholder="VD: B-1234" />
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Loại xe & Sức chứa</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                 <option>Xe khách - 50 chỗ</option>
                 <option>Xe khách - 30 chỗ</option>
                 <option>Xe van - 16 chỗ</option>
                 <option>Xe minivan - 7 chỗ</option>
                 </select>
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Số km ban đầu</label>
                 <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" placeholder="VD: 10,000 km" />
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">Huỷ</button>
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1C1C1C] text-white hover:bg-black/80 transition-colors">Lưu xe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
