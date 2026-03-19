import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, MapPin, CheckCircle2 } from 'lucide-react'

const initialSchedules = [
  { id: 'TRP-1001', route: 'Downtown Express', vehicle: 'Bus-01', driver: 'John Doe', date: '2026-03-20', time: '08:00 AM', status: 'Scheduled' },
  { id: 'TRP-1002', route: 'Airport Shuttle', vehicle: 'Van-05', driver: 'Alice Smith', date: '2026-03-20', time: '10:30 AM', status: 'In Transit' },
  { id: 'TRP-1003', route: 'Coastal Line', vehicle: 'Bus-02', driver: 'Bob Johnson', date: '2026-03-19', time: '02:00 PM', status: 'Completed' },
  { id: 'TRP-1004', route: 'City Loop', vehicle: 'Minivan-01', driver: 'Sarah Connor', date: '2026-03-21', time: '09:00 AM', status: 'Scheduled' },
]

export function SchedulesPage() {
  const [schedules] = useState(initialSchedules)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECF6] text-purple-700 text-[11px] font-bold tracking-wider uppercase"><CheckCircle2 size={12} /> Completed</span>
      case 'In Transit': return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F5FF] text-blue-700 text-[11px] font-bold tracking-wider uppercase"><MapPin size={12} /> In Transit</span>
      default: return <span className="flex w-max items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold tracking-wider uppercase"><Clock size={12} /> Scheduled</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Trip Schedules</h2>
          <span className="text-[12px] text-gray-400 font-medium">Manage and monitor daily trip timelines</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all"
        >
          <Plus size={16} />
          New Schedule
        </button>
      </div>

      <div className="bg-[#F7F9FB] rounded-3xl p-8 overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
           <input type="date" className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2 outline-none cursor-pointer" defaultValue="2026-03-20" />
           <select className="bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-xl px-4 py-2 outline-none cursor-pointer">
             <option>All Routes</option>
             <option>Downtown Express</option>
             <option>Airport Shuttle</option>
           </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Trip ID</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Route Info</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Departure</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-5">
                    <span className="font-bold text-[13px] tracking-wider text-gray-900">{trip.id}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-semibold text-gray-900">{trip.route}</span>
                      <span className="text-[11px] text-gray-500">Vol: {trip.vehicle} • Drv: {trip.driver}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-900">
                        <CalendarIcon size={14} className="text-gray-400" />
                        {trip.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Clock size={12} className="text-gray-400" />
                        {trip.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    {getStatusBadge(trip.status)}
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Edit Schedule">
                         <Edit2 size={16} />
                       </button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Cancel Trip">
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
            <h3 className="text-[16px] font-bold mb-6 text-gray-900">Schedule New Trip</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Route</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>Downtown Express</option>
                   <option>Airport Shuttle</option>
                   <option>Coastal Line</option>
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                   <input type="date" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" />
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                   <input type="time" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" />
                 </div>
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Vehicle Assignment</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>Bus-01 (Available)</option>
                   <option>Van-05 (Available)</option>
                 </select>
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Driver Assignment</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>John Doe</option>
                   <option>Alice Smith</option>
                 </select>
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1C1C1C] text-white hover:bg-black/80 transition-colors">Create Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
