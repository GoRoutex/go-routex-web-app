import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Map, Clock, User, Bus } from 'lucide-react'

// Dummy Data
const initialRoutes = [
  { id: '1', name: 'Downtown Express', origin: 'Central Station', dest: 'Business District', dist: '12 km', time: '45 min', assignedVehicle: 'Bus-01', assignedDriver: 'John Doe' },
  { id: '2', name: 'Airport Shuttle', origin: 'City Mall', dest: 'International Airport', dist: '25 km', time: '60 min', assignedVehicle: 'Van-05', assignedDriver: 'Alice Smith' },
  { id: '3', name: 'Coastal Line', origin: 'West Terminal', dest: 'East Beach', dist: '30 km', time: '90 min', assignedVehicle: null, assignedDriver: null },
]

export function RouteManagementPage() {
  const [routes] = useState(initialRoutes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Route Management</h2>
          <span className="text-[12px] text-gray-400 font-medium">Manage and assign routes to vehicles & drivers</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-black/80 transition-all"
        >
          <Plus size={16} />
          Create New Route
        </button>
      </div>

      <div className="bg-[#F7F9FB] rounded-3xl p-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Route Name</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Origin & Dest</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Distance/Time</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Assignment</th>
                <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-5">
                    <span className="font-semibold text-[14px] text-gray-900">{route.name}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[12px] text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {route.origin}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-600">
                        <Map size={14} className="text-gray-400" />
                        {route.dest}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-gray-900">{route.dist}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock size={12} />
                        {route.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    {route.assignedVehicle ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-900 bg-[#E3F5FF] w-max px-2.5 py-1 rounded-md">
                          <Bus size={12} className="text-blue-500" />
                          {route.assignedVehicle}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-900 bg-[#E5ECF6] w-max px-2.5 py-1 rounded-md">
                          <User size={12} className="text-indigo-500" />
                          {route.assignedDriver}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedRoute(route); setAssignModalOpen(true); }}
                        className="text-[12px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                      >
                        Assign Trip
                      </button>
                    )}
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Edit Route">
                         <Edit2 size={16} />
                       </button>
                       <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete Route">
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

      {/* Mock Create Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-black/5">
            <h3 className="text-[16px] font-bold mb-6 text-gray-900">Create New Route</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Route Name</label>
                 <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" placeholder="e.g. Downtown Express" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Origin</label>
                   <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" placeholder="Start location" />
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Destination</label>
                   <input type="text" className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5" placeholder="End location" />
                 </div>
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1C1C1C] text-white hover:bg-black/80 transition-colors">Save Route</button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Assign Trip Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-black/5">
            <h3 className="text-[16px] font-bold mb-2 text-gray-900">Assign Trip</h3>
            <p className="text-[12px] text-gray-500 mb-6">Assigning vehicle and driver for: <span className="font-semibold text-gray-900">{selectedRoute?.name}</span></p>
            <div className="space-y-5">
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Vehicle</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>Bus-01 (Active)</option>
                   <option>Bus-02 (Active)</option>
                   <option>Van-05 (Active)</option>
                 </select>
               </div>
               <div>
                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Driver</label>
                 <select className="w-full bg-[#F7F9FB] border-none rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer">
                   <option>John Doe</option>
                   <option>Alice Smith</option>
                   <option>David Johnson</option>
                 </select>
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setAssignModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
               <button onClick={() => setAssignModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1C1C1C] text-white hover:bg-black/80 transition-colors">Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
