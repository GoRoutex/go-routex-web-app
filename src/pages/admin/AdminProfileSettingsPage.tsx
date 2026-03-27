import { useState } from 'react'
import { UserCog, ShieldCheck, BellRing, Palette, Save } from 'lucide-react'

export function AdminProfileSettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-5xl">
      <div>
        <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Profile Settings</h2>
        <span className="text-[12px] text-gray-400 font-medium">Configure your admin identity, access, and preferences</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <UserCog size={18} />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Identity</h3>
          <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">Keep account name, role, and contact details current.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Security</h3>
          <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">Control password rotation, MFA, and login session preferences.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
            <Palette size={18} />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Appearance</h3>
          <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">Adjust display preferences for a cleaner operator workspace.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">Admin Account</h3>
            <p className="text-[12px] text-gray-400 mt-1">Edit the profile shown in the top navigation.</p>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full">
            <BellRing size={14} />
            Settings in sync
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Display name</span>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-[13px] font-semibold text-gray-900 outline-none focus:border-brand-primary/40 focus:bg-white transition-colors"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Email address</span>
            <input
              type="email"
              defaultValue="admin@goroutex.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-[13px] font-semibold text-gray-900 outline-none focus:border-brand-primary/40 focus:bg-white transition-colors"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Current role</span>
            <input
              type="text"
              defaultValue="Super Admin"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-[13px] font-semibold text-gray-900 outline-none focus:border-brand-primary/40 focus:bg-white transition-colors"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Timezone</span>
            <select className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-[13px] font-semibold text-gray-900 outline-none focus:border-brand-primary/40 focus:bg-white transition-colors">
              <option>Asia/Ho_Chi_Minh</option>
              <option>UTC</option>
              <option>Asia/Singapore</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setNotifications((value) => !value)}
            className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
              notifications ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <p className="text-[13px] font-bold text-gray-900">Email notifications</p>
            <p className="text-[12px] text-gray-400 mt-1">Receive important platform alerts by email.</p>
          </button>
          <button
            type="button"
            onClick={() => setTwoFactor((value) => !value)}
            className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
              twoFactor ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <p className="text-[13px] font-bold text-gray-900">Two-factor authentication</p>
            <p className="text-[12px] text-gray-400 mt-1">Add an extra layer of account protection.</p>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 text-white text-[13px] font-bold hover:bg-black transition-colors">
            <Save size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
