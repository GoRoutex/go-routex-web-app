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
  const displayName = userName?.trim()?.length > 0 ? userName : "Customer"

  return (
    <div className="w-full">
      {/* Top row */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 pr-8">
          <h2 className="text-white text-3xl font-black mb-2">
            {isLoggedIn
              ? `Welcome back, ${displayName}!`
              : "Welcome, Customer!"}
          </h2>

          <p className="text-neutral-400 text-lg leading-snug max-w-lg">
            {isLoggedIn
              ? "Manage routes, bookings and seat inventory with ease."
              : "Search routes, choose seats and book your next trip easily."}
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
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isLoggedIn ? "bg-[#12B3A8] shadow-lg shadow-[#12B3A8]/20" : "bg-[#2C364D] hover:bg-[#3A455E]"
          }`}
        >
          <User className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Stats row / Bottom card */}
      <div className="bg-[#263148] border border-[#33415C] rounded-3xl p-6 flex justify-between items-center shadow-xl shadow-black/10">
        <div className="flex-1 pr-6 border-r border-[#33415C]">
          {isLoggedIn ? (
            <div>
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Route Point</span>
              <div className="text-white text-3xl font-black mt-1">
                {routePoint || "0"}
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                Continue booking to earn more points
              </p>
            </div>
          ) : (
            <div>
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Guest access</span>
              <div className="text-white text-2xl font-black mt-1">
                Explore available trips
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                Sign in to save bookings and track route points
              </p>
            </div>
          )}
        </div>

        <div className="pl-6 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#12B3A8]/10 flex items-center justify-center">
            {isLoggedIn ? (
              <LayoutDashboard className="w-6 h-6 text-[#12B3A8]" />
            ) : (
              <Bus className="w-6 h-6 text-[#12B3A8]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
