import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Armchair,
  CheckCircle2,
  ArrowRightLeft,
  ChevronRightIcon,
  User,
  LayoutDashboard,
  Search,
  TrendingUp,
} from 'lucide-react'

const POPULAR_ROUTES = [
  { from: 'Hà Nội', to: 'Hải Phòng',    info: 'Limousine • Up to 8 trips/day',     price: '320,000 ₫' },
  { from: 'Sài Gòn',  to: 'Nha Trang',  info: 'Sleeper bus • Overnight route',     price: '280,000 ₫' },
  { from: 'Đà Lạt',  to: 'Sài Gòn',    info: 'Premium coach • Morning departures', price: '240,000 ₫' },
  { from: 'Hà Nội',  to: 'Đà Nẵng',    info: 'Express • Limited seats',            price: '450,000 ₫' },
]

const GUIDELINES = [
  'Selected seats are held for 15 minutes before payment confirmation.',
  'Seat availability is synchronized in real time across all platforms.',
  'Vehicle assignment is managed automatically based on trip demand.',
]

const STATS = [
  { value: '120+', label: 'Active Routes' },
  { value: '24/7',  label: 'Live Monitoring' },
  { value: '50k+',  label: 'Trips Completed' },
]

export default function HomePage() {
  const navigate  = useNavigate()
  const [isLoggedIn, setIsLoggedIn]     = useState(false)
  const [userName,   setUserName]       = useState('')
  const [tripType,   setTripType]       = useState<'one-way' | 'round-trip'>('one-way')
  const [searchData, setSearchData]     = useState({
    originCity:      '',
    destinationCity: '',
    departureDate:   '',
    seats:           1,
  })

  useEffect(() => {
    const flag = localStorage.getItem('isLoggedIn')
    setIsLoggedIn(flag === 'true')
    setUserName(localStorage.getItem('userName') || '')
  }, [])

  const handleSearch = () => {
    if (!searchData.originCity || !searchData.destinationCity || !searchData.departureDate) {
      alert('Please fill in all search fields.')
      return
    }
    navigate('/search-results', { state: { searchData } })
  }

  const patchRoute = (from: string, to: string) => {
    setSearchData(s => ({ ...s, originCity: from, destinationCity: to }))
  }

  /* ─── helper: inline input field ─── */
  const Field = ({
    label, icon: Icon, children,
  }: { label: string; icon: any; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border-2 border-transparent
                      focus-within:border-[#12B3A8]/30 hover:border-[#12B3A8]/20
                      rounded-xl transition-all group cursor-text">
        <Icon className="w-4 h-4 text-neutral-400 group-hover:text-[#12B3A8] flex-shrink-0 transition-colors" />
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0F3F8] font-sans">

      {/* ══════════════════  TOP NAV BAR  ══════════════════ */}
      <header className="bg-[#192031] border-b border-[#263148]">
        <div className="max-w-screen-xl mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#12B3A8] flex items-center justify-center shadow-lg shadow-[#12B3A8]/20">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black tracking-tight">
              GO <span className="text-[#12B3A8]">ROUTEX</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'Routes', 'Schedules', 'Support'].map(l => (
              <button key={l}
                className={`text-sm font-bold transition-colors ${l === 'Home' ? 'text-[#12B3A8]' : 'text-neutral-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#263148] border border-[#33415C] rounded-full px-4 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#12B3A8] flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-sm font-bold">{userName || 'User'}</span>
                </div>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">
                  Sign In
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-[#12B3A8] hover:bg-[#0f968d] text-white text-sm font-black px-5 py-2 rounded-lg transition-all shadow-lg shadow-[#12B3A8]/20">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════  HERO BANNER  ══════════════════ */}
      <section className="bg-[#192031] pb-16 pt-14 px-8 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#12B3A8]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#12B3A8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-screen-xl mx-auto relative z-10">
          {/* welcome line */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#12B3A8]" />
            <span className="text-[#12B3A8] text-xs font-black uppercase tracking-widest">
              {isLoggedIn ? `Welcome back, ${userName}` : 'Book your journey'}
            </span>
          </div>

          <div className="flex items-end justify-between gap-8 mb-10">
            <div>
              <h1 className="text-4xl font-black text-white leading-tight">
                Find your next route.<br />
                <span className="text-[#12B3A8]">Book in seconds.</span>
              </h1>
              <p className="text-neutral-400 mt-3 text-base max-w-lg leading-relaxed">
                Search thousands of intercity routes, choose your seat and book with confidence.
              </p>
            </div>

            {/* Stat pills */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {STATS.map(s => (
                <div key={s.label} className="bg-[#263148] border border-[#33415C] rounded-2xl px-5 py-3 text-center">
                  <div className="text-[#12B3A8] text-xl font-black">{s.value}</div>
                  <div className="text-neutral-400 text-xs font-bold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SEARCH BAR ─── */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-5">
            {/* trip type */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
                {(['one-way', 'round-trip'] as const).map(t => (
                  <button key={t} onClick={() => setTripType(t)}
                    className={`px-5 py-1.5 rounded-lg text-xs font-black transition-all ${
                      tripType === t
                        ? 'bg-white text-[#12B3A8] shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}>
                    {t === 'one-way'
                      ? <span className="flex items-center gap-1.5"><ChevronRightIcon className="w-3.5 h-3.5" />One Way</span>
                      : <span className="flex items-center gap-1.5"><ArrowRightLeft className="w-3.5 h-3.5" />Round Trip</span>}
                  </button>
                ))}
              </div>
              <span className="text-xs text-neutral-400 font-medium hidden sm:block">Search across all available departures</span>
            </div>

            {/* fields row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <Field label="From" icon={Bus}>
                <input
                  type="text"
                  placeholder="Departure city"
                  className="bg-transparent border-none focus:outline-none text-sm font-bold text-[#192031] w-full placeholder:text-neutral-400 placeholder:font-normal"
                  value={searchData.originCity}
                  onChange={e => setSearchData(s => ({ ...s, originCity: e.target.value }))}
                />
              </Field>

              <Field label="To" icon={MapPin}>
                <input
                  type="text"
                  placeholder="Destination city"
                  className="bg-transparent border-none focus:outline-none text-sm font-bold text-[#192031] w-full placeholder:text-neutral-400 placeholder:font-normal"
                  value={searchData.destinationCity}
                  onChange={e => setSearchData(s => ({ ...s, destinationCity: e.target.value }))}
                />
              </Field>

              <Field label="Travel Date" icon={Calendar}>
                <input
                  type="date"
                  className="bg-transparent border-none focus:outline-none text-sm font-bold text-[#192031] w-full"
                  value={searchData.departureDate}
                  onChange={e => setSearchData(s => ({ ...s, departureDate: e.target.value }))}
                />
              </Field>

              <Field label="Passengers" icon={Users}>
                <input
                  type="number"
                  min="1"
                  className="bg-transparent border-none focus:outline-none text-sm font-bold text-[#192031] w-16"
                  value={searchData.seats}
                  onChange={e => setSearchData(s => ({ ...s, seats: parseInt(e.target.value) || 1 }))}
                />
              </Field>
            </div>

            {/* search button */}
            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-[#12B3A8] hover:bg-[#0f968d] text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#12B3A8]/20">
              <Search className="w-5 h-5" />
              Search Available Trips
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════  MAIN CONTENT  ══════════════════ */}
      <main className="max-w-screen-xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── LEFT / MAIN column (2/3 width) ─── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Popular Routes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-[#192031]">Popular Routes</h2>
              <button className="text-[#12B3A8] text-sm font-black hover:underline">View all</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {POPULAR_ROUTES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => patchRoute(r.from, r.to)}
                  className="bg-white border border-neutral-100 rounded-2xl p-5 text-left hover:border-[#12B3A8]/30 hover:shadow-xl hover:shadow-slate-100 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#12B3A8]/10 flex items-center justify-center">
                        <Bus className="w-4 h-4 text-[#12B3A8]" />
                      </div>
                      <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Route</span>
                    </div>
                    <span className="text-[#12B3A8] font-black text-sm">{r.price}</span>
                  </div>
                  <h3 className="font-black text-[#192031] text-base mb-1">
                    {r.from} <span className="text-neutral-300 mx-1">→</span> {r.to}
                  </h3>
                  <p className="text-neutral-400 text-xs font-medium">{r.info}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-black text-[#12B3A8] opacity-0 group-hover:opacity-100 transition-opacity">
                    Quick select <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Why Go Routex */}
          <section>
            <h2 className="text-xl font-black text-[#192031] mb-4">Why Go Routex?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Clock,      title: 'On-time Departures', desc: 'Accurate planning with live deviation tracking across the entire fleet.' },
                { icon: Armchair,   title: 'Live Seat Control',   desc: 'Pick your seat from an interactive map with real-time availability.' },
                { icon: TrendingUp, title: 'Best Price Guarantee', desc: 'Transparent pricing — no hidden fees, no last-minute surprises.' },
                { icon: CheckCircle2, title: 'Instant Confirmation', desc: 'Booking is confirmed immediately with digital receipt and e-ticket.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-neutral-100 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#12B3A8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-[#12B3A8]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#192031] text-sm mb-1">{title}</h4>
                    <p className="text-neutral-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ─── RIGHT sidebar (1/3 width) ─── */}
        <aside className="space-y-6">

          {/* How It Works */}
          <div className="bg-white border border-neutral-100 rounded-2xl p-6">
            <h3 className="font-black text-[#192031] mb-5">How to Book</h3>
            <ol className="space-y-4">
              {[
                { step: '01', text: 'Search your origin & destination' },
                { step: '02', text: 'Choose a departure time and trip' },
                { step: '03', text: 'Select your preferred seat number' },
                { step: '04', text: 'Fill in passenger info and confirm' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-[#12B3A8] bg-[#12B3A8]/10 rounded-lg px-2 py-1 flex-shrink-0">
                    {step}
                  </span>
                  <p className="text-sm text-neutral-600 font-medium leading-snug">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Booking Guidelines */}
          <div className="bg-[#192031] border border-[#263148] rounded-2xl p-6">
            <h3 className="font-black text-white mb-5">Booking Guidelines</h3>
            <ul className="space-y-3">
              {GUIDELINES.map((g, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#12B3A8] flex-shrink-0 mt-0.5" />
                  <p className="text-neutral-400 text-xs leading-relaxed">{g}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          {!isLoggedIn && (
            <div className="bg-gradient-to-br from-[#12B3A8] to-[#0b8f85] rounded-2xl p-6 text-white">
              <h3 className="font-black text-lg mb-2">Sign in to track <br/>your bookings</h3>
              <p className="text-white/70 text-xs mb-5 leading-relaxed">
                Save your favourite routes, view booking history and earn route points.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white text-[#12B3A8] font-black py-2.5 rounded-xl text-sm hover:bg-white/90 transition-all">
                Sign In Now
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* ══════════════════  FOOTER  ══════════════════ */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Bus className="w-4 h-4 text-[#12B3A8]" />
            <span className="text-xs font-bold uppercase tracking-widest">Go Routex © 2026</span>
          </div>
          <div className="flex gap-6 text-neutral-400 text-xs font-medium">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
              <a key={l} href="#" className="hover:text-[#12B3A8] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
