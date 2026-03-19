import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bus, LayoutDashboard } from 'lucide-react'

interface ClientHeaderProps {
  isLoggedIn: boolean
  userName: string
  routePoint?: string | null
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  isLoggedIn,
  userName,
  routePoint,
}) => {
  const navigate = useNavigate()
  const displayName = userName?.trim()?.length > 0 ? userName : "Khách"

  return (
    <div className="w-full">
      {/* Top row */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex-1 pr-8">
          <h2 className="text-slate-900 text-4xl font-black mb-3 tracking-tight">
            {isLoggedIn
              ? `Chào mừng quay lại, ${displayName}!`
              : "Chào bạn mới!"}
          </h2>

          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
            {isLoggedIn
              ? "Quản lý hành trình, đặt vé và theo dõi điểm thưởng của bạn dễ dàng hơn bao giờ hết."
              : "Tìm kiếm chuyến đi, chọn chỗ ngồi và đặt vé cho chuyến hành trình tiếp theo của bạn."}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isLoggedIn) {
              navigate('/login')
            } else {
               navigate('/profile')
            }
          }}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xl ${
            isLoggedIn ? "bg-brand-primary shadow-brand-primary/25" : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <User className={`w-7 h-7 ${isLoggedIn ? 'text-white' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Stats row / Bottom card */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
        <div className="flex-1 pr-8 border-r border-slate-100">
          {isLoggedIn ? (
            <div>
              <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Điểm thưởng</span>
              <div className="text-slate-900 text-4xl font-black mt-2 tracking-tighter">
                {routePoint || "0"} <span className="text-lg font-bold text-brand-primary ml-1">RP</span>
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-wide">
                Tiếp tục đặt vé để tích lũy thêm điểm thưởng
              </p>
            </div>
          ) : (
            <div>
              <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Khách vãng lai</span>
              <div className="text-slate-900 text-2xl font-black mt-2 tracking-tight">
                Khám phá chuyến đi hiện có
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-wide">
                Đăng nhập để lưu lịch sử và tích lũy điểm thưởng
              </p>
            </div>
          )}
        </div>

        <div className="pl-8 flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/10 transform group-hover:rotate-12 transition-transform">
            {isLoggedIn ? (
              <LayoutDashboard className="w-8 h-8 text-brand-primary" />
            ) : (
              <Bus className="w-8 h-8 text-brand-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
