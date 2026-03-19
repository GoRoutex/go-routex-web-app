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
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userName', username)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-8 font-sans selection:bg-brand-primary/30 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-secondary/5 rounded-full -ml-40 -mb-40 blur-3xl opacity-50" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-16 transform transition-all duration-700 hover:scale-110">
          <div className="w-24 h-24 rounded-[2.5rem] bg-brand-primary flex items-center justify-center mb-8 shadow-2xl shadow-brand-primary/40 group">
            <Bus className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="text-center">
            <div className="text-slate-900 text-4xl font-black tracking-tight leading-none">GO <span className="text-brand-primary">ROUTEX</span></div>
            <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">Quản lý hành trình thông minh</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-brand-primary/5 transition-all duration-500">
          <h1 className="text-slate-900 text-3xl font-black mb-10 tracking-tight">Chào mừng trở lại</h1>

          <div className="space-y-8">
            {/* Username */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tên đăng nhập</label>
              <div className="flex items-center gap-5 p-5 bg-slate-50 border-2 border-slate-50 focus-within:border-brand-primary/30 focus-within:bg-white rounded-[1.5rem] transition-all duration-300 shadow-sm focus-within:shadow-xl focus-within:shadow-brand-primary/10 group">
                <div className="w-12 h-12 rounded-[1rem] bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100 group-focus-within:border-brand-primary/20 transition-all">
                   <User className="w-6 h-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-black w-full placeholder:text-slate-300 placeholder:font-normal text-lg"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mật khẩu</label>
              <div className="flex items-center gap-5 p-5 bg-slate-50 border-2 border-slate-50 focus-within:border-brand-primary/30 focus-within:bg-white rounded-[1.5rem] transition-all duration-300 shadow-sm focus-within:shadow-xl focus-within:shadow-brand-primary/10 group">
                <div className="w-12 h-12 rounded-[1rem] bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100 group-focus-within:border-brand-primary/20 transition-all">
                   <Lock className="w-6 h-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-black w-full placeholder:text-slate-300 placeholder:font-normal text-lg"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  className="w-12 h-12 rounded-[1rem] hover:bg-slate-100 text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!canLogin}
              className={`w-full py-6 rounded-[1.5rem] font-black text-xl transition-all mt-6 shadow-2xl ${
                canLogin
                  ? 'bg-brand-primary hover:bg-brand-dark text-white shadow-brand-primary/30 hover:shadow-brand-dark/30 hover:-translate-y-1'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              Đăng nhập ngay
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 mt-12 border-t border-slate-50 pt-10">
            <span className="text-slate-400 font-medium">Chưa có tài khoản thành viên?</span>
            <button
              onClick={() => navigate('/register')}
              className="text-brand-primary text-lg font-black hover:text-brand-dark transition-all hover:scale-105 active:scale-95"
            >
              Đăng ký tài khoản mới
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-10 text-slate-400 hover:text-brand-primary font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-brand-primary/30 transition-all">
             <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </div>
          Về trang chủ
        </button>
      </div>
    </div>
  )
}
