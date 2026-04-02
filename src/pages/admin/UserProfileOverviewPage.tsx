import {
  Plus,
  ListFilter,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  LayoutGrid
} from 'lucide-react'

const staffData = [
  { id: '#ST9801', name: 'Natali Craig', avatar: 'https://i.pravatar.cc/150?u=1', route: 'Tuyến A1 (Bắc)', employeeId: 'DR-10492', date: 'Vừa xong', status: 'Đang hoạt động', statusColor: 'text-blue-500', bg: 'bg-blue-500' },
  { id: '#ST9802', name: 'Kate Morrison', avatar: 'https://i.pravatar.cc/150?u=2', route: 'Xe trung chuyển sân bay', employeeId: 'DR-11920', date: 'Một phút trước', status: 'Hoàn thành', statusColor: 'text-green-500', bg: 'bg-green-500' },
  { id: '#ST9803', name: 'Drew Cano', avatar: 'https://i.pravatar.cc/150?u=3', route: 'Tuyến trung tâm B5', employeeId: 'ST-09218', date: '1 giờ trước', status: 'Đang chờ', statusColor: 'text-sky-400', bg: 'bg-sky-400' },
  { id: '#ST9804', name: 'Orlando Diggs', avatar: 'https://i.pravatar.cc/150?u=4', route: 'Tuyến nội đô 10', employeeId: 'DR-12831', date: 'Hôm qua', status: 'Đã duyệt', statusColor: 'text-orange-400', bg: 'bg-orange-400' },
  { id: '#ST9805', name: 'Andi Lane', avatar: 'https://i.pravatar.cc/150?u=5', route: 'Tuyến ven biển', employeeId: 'ST-10029', date: '02/02/2026', status: 'Bị từ chối', statusColor: 'text-gray-400', bg: 'bg-gray-400' },
  { id: '#ST9801', name: 'Natali Craig', avatar: 'https://i.pravatar.cc/150?u=1', route: 'Tuyến A1 (Bắc)', employeeId: 'DR-10492', date: 'Vừa xong', status: 'Đang hoạt động', statusColor: 'text-blue-500', bg: 'bg-blue-500' },
  { id: '#ST9802', name: 'Kate Morrison', avatar: 'https://i.pravatar.cc/150?u=2', route: 'Xe trung chuyển sân bay', employeeId: 'DR-11920', date: 'Một phút trước', status: 'Hoàn thành', statusColor: 'text-green-500', bg: 'bg-green-500' },
  { id: '#ST9803', name: 'Drew Cano', avatar: 'https://i.pravatar.cc/150?u=3', route: 'Tuyến trung tâm B5', employeeId: 'ST-09218', date: '1 giờ trước', status: 'Đang chờ', statusColor: 'text-sky-400', bg: 'bg-sky-400' },
  { id: '#ST9804', name: 'Orlando Diggs', avatar: 'https://i.pravatar.cc/150?u=4', route: 'Tuyến nội đô 10', employeeId: 'DR-12831', date: 'Hôm qua', status: 'Đã duyệt', statusColor: 'text-orange-400', bg: 'bg-orange-400' },
  { id: '#ST9805', name: 'Andi Lane', avatar: 'https://i.pravatar.cc/150?u=5', route: 'Tuyến ven biển', employeeId: 'ST-10029', date: '02/02/2026', status: 'Bị từ chối', statusColor: 'text-gray-400', bg: 'bg-gray-400' },
]

export function UserProfileOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-[14px] font-semibold text-gray-900 mb-6">Nhật ký hiệu suất nhân sự</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-2">
             <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                <Plus size={18} />
             </button>
             <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                <ListFilter size={18} />
             </button>
             <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                <ArrowUpDown size={18} />
             </button>
          </div>

          <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="Tìm kiếm"
               className="bg-gray-50/50 border border-gray-100 rounded-lg pl-9 pr-4 py-1.5 text-[13px] w-56 focus:ring-1 focus:ring-gray-200 outline-none transition-all"
             />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[12px] text-gray-400 font-medium border-b border-gray-50">
                <th className="px-6 py-4 w-12 text-center">
                   <input type="checkbox" className="rounded border-gray-300 accent-black" />
                </th>
                <th className="px-4 py-4 font-medium">Mã bản ghi</th>
                <th className="px-4 py-4 font-medium">Nhân sự</th>
                <th className="px-4 py-4 font-medium">Tuyến được phân</th>
                <th className="px-4 py-4 font-medium">Mã nhân viên</th>
                <th className="px-4 py-4 font-medium">Thời gian</th>
                <th className="px-4 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {staffData.map((staff, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 accent-black" checked={index === 3} onChange={() => {}} />
                  </td>
                  <td className="px-4 py-4 text-gray-500 font-medium">{staff.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <img src={staff.avatar} className="w-6 h-6 rounded-full border border-gray-100" alt="" />
                      <span className="text-gray-900 font-medium">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{staff.route}</td>
                  <td className="px-4 py-4 text-gray-500">{staff.employeeId}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                       <LayoutGrid size={14} className="opacity-50" />
                       <span>{staff.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${staff.bg}`} />
                       <span className={`${staff.statusColor} font-medium`}>{staff.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200">
                          <Copy size={14} className="text-gray-400" />
                       </button>
                       <button className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200">
                          <MoreHorizontal size={14} className="text-gray-400" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 flex items-center justify-end gap-2 border-t border-gray-50">
           <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
              <ChevronLeft size={18} />
           </button>
           <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(page => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-all ${
                    page === 1 ? 'bg-gray-100 text-black' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
           </div>
           <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
              <ChevronRight size={18} />
           </button>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="pt-12 pb-6 flex items-center justify-between text-[12px] text-gray-400">
         <p>© 2026 Go Routex - Vận hành xe buýt</p>
         <div className="flex items-center gap-6">
            <a href="#" className="hover:text-black transition-colors">Giới thiệu</a>
            <a href="#" className="hover:text-black transition-colors">Hỗ trợ</a>
            <a href="#" className="hover:text-black transition-colors">Liên hệ</a>
         </div>
      </footer>
    </div>
  )
}
