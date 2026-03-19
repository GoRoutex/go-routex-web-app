import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, User, Lock, Eye, EyeOff, Phone, Mail } from 'lucide-react'

const InputField = ({
  label,
  icon: Icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  rightIcon,
  onRightIconClick,
}: {
  label: string
  icon: any
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
  rightIcon?: any
  onRightIconClick?: () => void
}) => (
  <div className="space-y-3">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <div className="flex items-center gap-5 p-5 bg-slate-50 border-2 border-slate-50 focus-within:border-brand-primary/30 focus-within:bg-white rounded-[1.5rem] transition-all duration-300 shadow-sm focus-within:shadow-xl focus-within:shadow-brand-primary/10 group">
      <div className="w-12 h-12 rounded-[1rem] bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100 group-focus-within:border-brand-primary/20 transition-all">
         <Icon className="w-6 h-6 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-black w-full placeholder:text-slate-300 placeholder:font-normal text-lg"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {rightIcon && (
        <button
          onClick={onRightIconClick}
          className="w-12 h-12 rounded-[1rem] hover:bg-slate-100 text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center"
          type="button"
        >
          {rightIcon}
        </button>
      )}
    </div>
  </div>
)

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const canRegister =
    fullName.trim().length > 0 &&
    username.trim().length > 0 &&
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0

  const handleRegister = () => {
    setError('')
    if (!canRegister) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.')
      return
    }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-8 py-20 font-sans selection:bg-brand-primary/30 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full -mr-64 -mt-64 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full -ml-40 -mb-40 blur-3xl opacity-50 pointer-events-none" />

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

        {success ? (
          <div className="bg-white rounded-[3rem] p-16 border border-slate-100 text-center shadow-2xl shadow-slate-200/50 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-brand-primary flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-brand-primary/30">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-[spin_2s_linear_infinite]" />
              <User className="w-10 h-10 text-white absolute" />
            </div>
            <h2 className="text-slate-900 text-4xl font-black mb-4 tracking-tight">Đăng ký thành công!</h2>
            <p className="text-slate-500 font-medium text-lg mb-12">Tài khoản của bạn đã được tạo. Hãy bắt đầu hành trình ngay.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white py-6 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl shadow-brand-primary/30 hover:shadow-brand-dark/30 hover:-translate-y-1"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-brand-primary/5 transition-all duration-500">
            <h1 className="text-slate-900 text-3xl font-black mb-10 tracking-tight">Tạo tài khoản mới</h1>

            <div className="space-y-6">
              <InputField label="Họ và tên" icon={User} placeholder="Nhập đầy đủ họ tên" value={fullName} onChange={setFullName} />
              <InputField label="Tên đăng nhập" icon={User} placeholder="Chọn tên đăng nhập" value={username} onChange={setUsername} />
              <InputField label="Số điện thoại" icon={Phone} placeholder="Nhập số điện thoại" type="tel" value={phone} onChange={setPhone} />
              <InputField label="Email" icon={Mail} placeholder="Nhập địa chỉ email" type="email" value={email} onChange={setEmail} />
              <InputField
                label="Mật khẩu"
                icon={Lock}
                placeholder="Tạo mật khẩu an toàn"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                rightIcon={showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                onRightIconClick={() => setShowPassword(v => !v)}
              />
              <InputField
                label="Xác nhận mật khẩu"
                icon={Lock}
                placeholder="Nhập lại mật khẩu"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                rightIcon={showConfirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                onRightIconClick={() => setShowConfirm(v => !v)}
              />

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 text-sm font-black uppercase tracking-wider animate-shake">
                   <span>⚠️</span> {error}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={!canRegister}
                className={`w-full py-6 rounded-[1.5rem] font-black text-xl transition-all mt-6 shadow-2xl ${
                  canRegister
                    ? 'bg-brand-primary hover:bg-brand-dark text-white shadow-brand-primary/30 hover:shadow-brand-dark/30 hover:-translate-y-1'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 mt-12 border-t border-slate-50 pt-10">
              <span className="text-slate-400 font-medium">Bạn đã có tài khoản rồi?</span>
              <button
                onClick={() => navigate('/login')}
                className="text-brand-primary text-lg font-black hover:text-brand-dark transition-all hover:scale-105 active:scale-95"
              >
                Đăng nhập tại đây
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full mt-10 text-slate-400 hover:text-brand-primary font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-brand-primary/30 transition-all">
             <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </div>
          Quay lại trang chính
        </button>
      </div>
    </div>
  )
}
