import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  UserCog,
  BellRing,
  Clock3,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'
import { readAdminProfileSummary } from '../../utils/adminProfile'

const quickStats = (profile: ReturnType<typeof readAdminProfileSummary>) => [
  { label: 'Vai trò', value: profile.roleLabel, icon: BadgeCheck },
  { label: 'Email', value: profile.email || 'Chưa cập nhật', icon: ShieldCheck },
  { label: 'Lần đăng nhập cuối', value: 'Vừa xong', icon: Clock3 },
  { label: 'Cảnh báo', value: '2 mục chưa xử lý', icon: BellRing },
]

export function AdminProfileOverviewPage() {
  const profile = readAdminProfileSummary()

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wider">Tổng quan hồ sơ người dùng</h2>
          <span className="text-[12px] text-gray-400 font-medium">Tóm tắt ngắn gọn về tài khoản quản trị và phạm vi truy cập hiện tại</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-[12px] font-bold uppercase tracking-wider">
          <UserCog size={14} />
          Tài khoản quản trị đang hoạt động
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickStats(profile).map((item) => {
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

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Ảnh chụp hồ sơ</h3>
              <p className="text-[12px] text-gray-400 mt-1">Danh tính tài khoản, phạm vi làm việc và trạng thái bảo mật.</p>
            </div>
            <Link to="/admin/profile/overview" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[12px] font-bold hover:bg-black transition-colors">
              Làm mới
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tên hiển thị</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">{profile.name}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">{profile.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Múi giờ</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">Asia/Ho_Chi_Minh</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nhóm</p>
              <p className="mt-2 text-[15px] font-bold text-gray-900">{profile.roleLabel}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
