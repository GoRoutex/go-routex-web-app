import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, User, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const canLogin = username.trim().length > 0 && password.trim().length > 0

  const handleLogin = () => {
    if (!canLogin) return
    // TODO: call login API
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userName', username)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#192031] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-[28px] bg-[#12B3A8] flex items-center justify-center mb-6 shadow-2xl shadow-[#12B3A8]/30">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <div className="text-white text-3xl font-black tracking-tight">GO <span className="text-[#12B3A8]">ROUTEX</span></div>
            <p className="text-neutral-400 mt-3 font-medium">Sign in to manage routes, vehicles and bookings</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#222C3F] rounded-[32px] p-8 border border-[#33415C] shadow-2xl shadow-black/20">
          <h1 className="text-white text-2xl font-black mb-8">Welcome back</h1>

          <div className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Username</label>
              <div className="flex items-center gap-4 p-4 bg-[#192031] border-2 border-[#33415C] focus-within:border-[#12B3A8] rounded-2xl transition-all">
                <User className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-white font-bold w-full placeholder:text-neutral-600 placeholder:font-normal"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Password</label>
              <div className="flex items-center gap-4 p-4 bg-[#192031] border-2 border-[#33415C] focus-within:border-[#12B3A8] rounded-2xl transition-all">
                <Lock className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-white font-bold w-full placeholder:text-neutral-600 placeholder:font-normal"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!canLogin}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all mt-2 ${
                canLogin
                  ? 'bg-[#12B3A8] hover:bg-[#0f968d] text-white shadow-xl shadow-[#12B3A8]/20'
                  : 'bg-[#2C364D] text-neutral-500 cursor-not-allowed'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="text-neutral-500 font-medium">Don't have an account?</span>
            <button
              onClick={() => navigate('/register')}
              className="text-[#12B3A8] font-black hover:text-[#4AE8DD] transition-colors"
            >
              Register
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 text-neutral-500 hover:text-neutral-300 font-bold text-sm transition-colors text-center"
        >
          ← Back to home
        </button>
      </div>
    </div>
  )
}
