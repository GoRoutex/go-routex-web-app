import { Link } from 'react-router-dom'
import { ShieldCheck, UserCog, BellRing, Activity, Clock3, ArrowRight, Settings2, BadgeCheck } from 'lucide-react'

const quickStats = [
  { label: 'Role', value: 'Super Admin', icon: BadgeCheck },
  { label: 'Permissions', value: 'Full access', icon: ShieldCheck },
  { label: 'Last login', value: 'Just now', icon: Clock3 },
  { label: 'Alerts', value: '2 unresolved', icon: BellRing },
]

const recentActions = [
  'Updated fleet maintenance policy',
  'Reviewed route pricing rule set',
  'Approved new staff access for operations',
  'Checked system health incidents',
]

export function AdminProfileOverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">User Profile Overview</h2>
          <span className="text-[12px] text-gray-400 font-medium">A compact summary of the current admin account and access scope</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-[12px] font-bold uppercase tracking-wider">
          <UserCog size={14} />
          Admin account active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickStats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-700">
                <Icon size={18} />
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-[16px] font-bold text-gray-900 mt-2">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Profile snapshot</h3>
              <p className="text-[12px] text-gray-400 mt-1">Your account identity, working scope, and security posture.</p>
            </div>
            <Link to="/admin/profile/settings" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-black transition-colors">
              Open settings
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Display name</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">Admin User</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">admin@goroutex.com</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Timezone</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">Asia/Ho_Chi_Minh</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Team</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">Operations & Platform</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Recent actions</h3>
                <p className="text-[12px] text-gray-400 mt-1">Most recent account activity</p>
              </div>
            </div>
            <ul className="space-y-4">
              {recentActions.map((action, index) => (
                <li key={action} className="flex items-start gap-3 text-[13px] text-gray-600 leading-relaxed">
                  <span className="mt-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">{index + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-2xl shadow-slate-200/20">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
              <Settings2 size={18} />
            </div>
            <h3 className="text-[18px] font-bold">Need to adjust access?</h3>
            <p className="text-white/70 text-[13px] mt-3 leading-relaxed">
              Open settings to update display details, notification preferences, or security options for this admin account.
            </p>
            <Link
              to="/admin/profile/settings"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-2xl bg-white text-slate-900 text-[13px] font-bold hover:bg-slate-100 transition-colors"
            >
              Go to settings
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
