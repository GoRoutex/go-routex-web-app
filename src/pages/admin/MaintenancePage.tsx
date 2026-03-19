import { useState } from 'react'
import { Plus, Wrench, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, PenTool, Trash2 } from 'lucide-react'

const initialMaintenance = [
  { id: 'MNT-0092', vehicle: 'Bus-01', mechanic: 'Bob Smith', type: 'Oil Change', cost: '$120.00', date: '2026-03-15', status: 'Completed' },
  { id: 'MNT-0104', vehicle: 'Van-05', mechanic: 'Jim Taylor', type: 'Brake Pad Replacement', cost: '$350.00', date: '2026-03-18', status: 'In Progress' },
  { id: 'MNT-0112', vehicle: 'Bus-02', mechanic: 'Awaiting', type: 'Engine Check', cost: 'Pending', date: '2026-03-21', status: 'Pending' },
  { id: 'MNT-0115', vehicle: 'Minivan-01', mechanic: 'Bob Smith', type: 'Tire Rotation', cost: '$80.00', date: '2026-03-22', status: 'Pending' },
]

export function MaintenancePage() {
  const [logs] = useState(initialMaintenance)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECF6] text-purple-700 text-[11px] font-bold tracking-wider uppercase"><CheckCircle2 size={12} /> Completed</span>
      case 'In Progress': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F5FF] text-blue-700 text-[11px] font-bold tracking-wider uppercase"><PenTool size={12} /> In Progress</span>
      case 'Pending': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold tracking-wider uppercase"><AlertTriangle size={12} /> Pending</span>
      default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold tracking-wider uppercase">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Maintenance Logs</h2>
          <span className="text-[12px] text-gray-400 font-medium">Record and track fleet repair and servicing</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all"
        >
          <Plus size={16} />
          Log Maintenance
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#E5ECF6] p-6 rounded-2xl space-y-4 shadow-sm border border-black/5">
           <div className="flex items-center justify-between">
             <p className="text-[13px] font-medium text-black/80">Pending Tasks</p>
             <AlertTriangle size={16} className="text-black/40" />
           </div>
           <h3 className="text-2xl font-bold tracking-tight">12</h3>
        </div>
        <div className="bg-[#E3F5FF] p-6 rounded-2xl space-y-4 shadow-sm border border-black/5">
           <div className="flex items-center justify-between">
             <p className="text-[13px] font-medium text-black/80">In Progress</p>
             <PenTool size={16} className="text-black/40" />
           </div>
           <h3 className="text-2xl font-bold tracking-tight">3</h3>
        </div>
        <div className="bg-[#F7F9FB] p-6 rounded-2xl space-y-4 shadow-sm border border-black/5">
           <div className="flex items-center justify-between">
             <p className="text-[13px] font-medium text-black/80">Completed (This Month)</p>
             <CheckCircle2 size={16} className="text-black/40" />
           </div>
           <h3 className="text-2xl font-bold tracking-tight">45</h3>
        </div>
      </div>

      <div className="bg-[#F7F9FB] rounded-3xl p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-3">
             <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer">
               <option>All Tasks</option>
               <option>Pending</option>
               <option>In Progress</option>
               <option>Completed</option>
             </select>
             <input type="month" className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer" defaultValue="2026-03" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Log ID</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Vehicle & Type</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Mechanic & Date</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Cost</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-5">
                    <span className="font-bold text-[13px] tracking-wider text-gray-900">{log.id}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Wrench size={12} className="text-gray-400" />
                        <span className="text-[13px] font-semibold text-gray-900">{log.type}</span>
                      </div>
                      <span className="text-[11px] font-bold tracking-wider uppercase bg-gray-200 w-max px-2 py-0.5 rounded text-gray-600">{log.vehicle}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-gray-900">{log.mechanic}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <CalendarIcon size={12} className="text-gray-400" />
                        {log.date}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={`text-[13px] font-bold ${log.cost === 'Pending' ? 'text-orange-500' : 'text-gray-900'}`}>{log.cost}</span>
                  </td>
                  <td className="py-5">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Edit Log">
                         <PenTool size={16} />
                       </button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete Log">
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
            <h3 className="text-[16px] font-bold mb-6 text-gray-900">Log Maintenance Task</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Vehicle</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>Bus-01</option>
                   <option>Bus-02</option>
                   <option>Van-05</option>
                 </select>
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Maintenance Type</label>
                 <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" placeholder="e.g. Oil Change, Brake Pad..." />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Assign Mechanic</label>
                   <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                     <option>Bob Smith</option>
                     <option>Jim Taylor</option>
                     <option>Outsourced</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                   <input type="date" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" />
                 </div>
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1C1C1C] text-white hover:bg-black/80 transition-colors">Save Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
