import { Activity, CheckCircle2, CircleAlert, Database, Server, ShieldCheck, Wifi } from 'lucide-react'

const services = [
  { name: 'Booking API', status: 'Healthy', uptime: '99.98%', latency: '42 ms', icon: Server, tone: 'text-emerald-600 bg-emerald-50' },
  { name: 'Payment Gateway', status: 'Healthy', uptime: '99.95%', latency: '68 ms', icon: ShieldCheck, tone: 'text-blue-600 bg-blue-50' },
  { name: 'Route Engine', status: 'Degraded', uptime: '98.70%', latency: '124 ms', icon: Activity, tone: 'text-amber-600 bg-amber-50' },
  { name: 'Database Cluster', status: 'Healthy', uptime: '99.99%', latency: '19 ms', icon: Database, tone: 'text-violet-600 bg-violet-50' },
]

const incidents = [
  {
    title: 'Delayed refresh on route occupancy dashboard',
    severity: 'Medium',
    owner: 'Platform Team',
    time: '12 minutes ago',
  },
  {
    title: 'Background sync recovered after retry burst',
    severity: 'Low',
    owner: 'Ops Team',
    time: '2 hours ago',
  },
]

export function AdminSystemHealthPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">System Health</h2>
          <span className="text-[12px] text-gray-400 font-medium">Monitor platform uptime, service latency, and incidents</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-[12px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} />
          All core systems online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div key={service.name} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl ${service.tone} flex items-center justify-center mb-4`}>
                <Icon size={18} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">{service.name}</h3>
                  <p className="text-[12px] text-gray-400 mt-1 uppercase tracking-wider">{service.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Latency</p>
                  <p className="text-[14px] font-bold text-gray-900">{service.latency}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-[12px]">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Uptime</p>
                  <p className="text-gray-900 font-bold mt-1">{service.uptime}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Status</p>
                  <p className="text-gray-900 font-bold mt-1">{service.status}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Recent Incidents</h3>
              <p className="text-[12px] text-gray-400 font-medium">Track active issues and their owners</p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
              <Wifi size={14} />
              Status updated live
            </div>
          </div>

          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <CircleAlert size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">{incident.title}</h4>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Owner: {incident.owner} • {incident.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-gray-700 border border-gray-200 uppercase tracking-wider">
                    {incident.severity}
                  </span>
                  <button className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-black transition-colors">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider mb-4">Operational Notes</h3>
          <ul className="space-y-4">
            {[
              'Database replicas are healthy and synchronized.',
              'Payment retries are within acceptable thresholds.',
              'Route Engine needs a follow-up review during off-peak hours.',
            ].map((note) => (
              <li key={note} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
