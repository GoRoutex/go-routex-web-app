import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, User, Lock, Eye, EyeOff, Phone, Mail, ArrowLeft } from 'lucide-react'

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
  <div className="space-y-2">
    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-4 p-4 bg-[#192031] border-2 border-[#33415C] focus-within:border-[#12B3A8] rounded-2xl transition-all">
      <Icon className="w-5 h-5 text-neutral-500 flex-shrink-0" />
      <input
        type={type}
        placeholder={placeholder}
        className="bg-transparent border-none focus:outline-none focus:ring-0 text-white font-bold w-full placeholder:text-neutral-600 placeholder:font-normal"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {rightIcon && (
        <button
          onClick={onRightIconClick}
          className="text-neutral-500 hover:text-neutral-300 transition-colors flex-shrink-0"
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
      setError('Please fill in all required fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#192031] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-[28px] bg-[#12B3A8] flex items-center justify-center mb-6 shadow-2xl shadow-[#12B3A8]/30">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <div className="text-white text-3xl font-black tracking-tight">GO <span className="text-[#12B3A8]">ROUTEX</span></div>
            <p className="text-neutral-400 mt-3 font-medium">Create your account to start booking</p>
          </div>
        </div>

        {success ? (
          <div className="bg-[#222C3F] rounded-[32px] p-10 border border-[#33415C] text-center">
            <div className="w-16 h-16 rounded-full bg-[#12B3A8] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#12B3A8]/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-black mb-3">Account Created!</h2>
            <p className="text-neutral-400 font-medium mb-8">Your account has been successfully registered.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#12B3A8] hover:bg-[#0f968d] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#12B3A8]/20"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <div className="bg-[#222C3F] rounded-[32px] p-8 border border-[#33415C] shadow-2xl shadow-black/20">
            <h1 className="text-white text-2xl font-black mb-8">Create account</h1>

            <div className="space-y-5">
              <InputField label="Full name" icon={User} placeholder="Enter your full name" value={fullName} onChange={setFullName} />
              <InputField label="Username" icon={User} placeholder="Choose a username" value={username} onChange={setUsername} />
              <InputField label="Phone number" icon={Phone} placeholder="Enter phone number" type="tel" value={phone} onChange={setPhone} />
              <InputField label="Email" icon={Mail} placeholder="Enter email address" type="email" value={email} onChange={setEmail} />
              <InputField
                label="Password"
                icon={Lock}
                placeholder="Create a password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                onRightIconClick={() => setShowPassword(v => !v)}
              />
              <InputField
                label="Confirm password"
                icon={Lock}
                placeholder="Repeat your password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                rightIcon={showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                onRightIconClick={() => setShowConfirm(v => !v)}
              />

              {error && (
                <p className="text-red-400 text-sm font-bold text-center">{error}</p>
              )}

              <button
                onClick={handleRegister}
                disabled={!canRegister}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all mt-2 ${
                  canRegister
                    ? 'bg-[#12B3A8] hover:bg-[#0f968d] text-white shadow-xl shadow-[#12B3A8]/20'
                    : 'bg-[#2C364D] text-neutral-500 cursor-not-allowed'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <span className="text-neutral-500 font-medium">Already have an account?</span>
              <button
                onClick={() => navigate('/login')}
                className="text-[#12B3A8] font-black hover:text-[#4AE8DD] transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 text-neutral-500 hover:text-neutral-300 font-bold text-sm transition-colors text-center flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>
      </div>
    </div>
  )
}
