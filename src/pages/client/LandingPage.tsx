import { useNavigate } from 'react-router-dom'
import {
  Bus,
  Search,
  Armchair,
  CalendarClock,
  TicketCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown
} from 'lucide-react'

const FeatureCard = ({
  icon: Icon,
  title,
  description
}: {
  icon: any,
  title: string,
  description?: string
}) => (
  <div className="bg-[#263148] border border-[#33415C] rounded-2xl p-6 transition-all hover:border-[#12B3A8]/50 group">
    <div className="w-12 h-12 rounded-xl bg-[#12B3A8]/20 flex items-center justify-center mb-4 group-hover:bg-[#12B3A8]/30 transition-colors">
      <Icon className="w-6 h-6 text-[#12B3A8]" />
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    {description && <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>}
  </div>
)

const StatCard = ({ value, label }: { value: string, label: string }) => (
  <div className="bg-[#1E2738] rounded-2xl px-6 py-6 border border-[#2C364D] flex-1">
    <div className="text-[#12B3A8] text-3xl font-extrabold mb-1">{value}</div>
    <div className="text-neutral-300 text-sm font-medium">{label}</div>
  </div>
)

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#192031] text-white selection:bg-[#12B3A8]/30">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#12B3A8] flex items-center justify-center shadow-lg shadow-[#12B3A8]/20">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white text-xl font-black tracking-tight leading-none">GO</div>
            <div className="text-[#4AE8DD] text-sm italic font-bold tracking-wider">ROUTEX</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/login')}
            className="text-neutral-300 font-semibold hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#12B3A8] hover:bg-[#0f968d] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-[#12B3A8]/20"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12B3A8]/10 border border-[#12B3A8]/20 text-[#12B3A8] text-xs font-bold uppercase tracking-wider">
            <TrendingDown className="w-3.5 h-3.5" />
            Next Gen Transport Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-[1.1]">
            Book <span className="text-white">smarter,</span><br />
            <span className="text-[#12B3A8]">manage routes faster.</span>
          </h1>

          <p className="text-neutral-400 text-xl leading-relaxed max-w-xl">
            Search routes, choose seats, track availability, and streamline
            transport operations in one modern experience.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate('/home')}
              className="bg-[#12B3A8] hover:bg-[#0f968d] text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-[#12B3A8]/20 flex items-center gap-2"
            >
              Discover Routes
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border-2 border-[#3A455E] hover:border-neutral-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
            >
              Manage Bookings
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <StatCard value="24/7" label="Trip monitoring" />
            <StatCard value="Live" label="Seat inventory" />
            <StatCard value="Fast" label="Booking flow" />
          </div>
        </div>

        <div className="relative">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#12B3A8]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#4AE8DD]/10 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="space-y-6 pt-12">
              <FeatureCard
                icon={Search}
                title="Route Search"
                description="Find the best paths across multiple regions in seconds."
              />
              <FeatureCard
                icon={CalendarClock}
                title="Assignment"
                description="Automated vehicle and driver assignment for every trip."
              />
            </div>
            <div className="space-y-6">
              <FeatureCard
                icon={Armchair}
                title="Seat Map"
                description="Interactive seat selection with real-time status updates."
              />
              <FeatureCard
                icon={TicketCheck}
                title="Booking Flow"
                description="Seamless end-to-end booking experience with digital tickets."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Info Section */}
      <section className="bg-white text-[#192031] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Route operations at your fingertips</h2>
              <p className="text-neutral-500 text-xl leading-relaxed">
                From trip planning to seat holding and booking confirmation,
                everything stays synchronized in real time across our entire platform.
              </p>
            </div>
            <div className="w-20 h-20 rounded-3xl bg-[#12B3A8] flex items-center justify-center shadow-2xl shadow-[#12B3A8]/40">
              <TicketCheck className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-[#F5F7FA] border border-neutral-100">
              <CheckCircle2 className="w-8 h-8 text-[#12B3A8] mb-6" />
              <h4 className="text-xl font-black mb-4">On-time departures</h4>
              <p className="text-neutral-500 leading-relaxed">
                Manage and operate trips with accurate departure planning and real-time adjustment tools.
              </p>
            </div>
            <div className="p-8 rounded-[32px] bg-[#F5F7FA] border border-neutral-100">
              <CheckCircle2 className="w-8 h-8 text-[#12B3A8] mb-6" />
              <h4 className="text-xl font-black mb-4">Seat availability</h4>
              <p className="text-neutral-500 leading-relaxed">
                Track available, held, sold and blocked seats in real time with our unified inventory system.
              </p>
            </div>
            <div className="p-8 rounded-[32px] bg-[#F5F7FA] border border-neutral-100">
              <CheckCircle2 className="w-8 h-8 text-[#12B3A8] mb-6" />
              <h4 className="text-xl font-black mb-4">Real-time sync</h4>
              <p className="text-neutral-500 leading-relaxed">
                Every booking, cancellation or change is instantly reflected across all devices and platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#192031] border-t border-[#2C364D] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-60">
            <Bus className="w-5 h-5 text-[#12B3A8]" />
            <span className="font-bold text-sm tracking-widest uppercase">Go Routex &copy; 2026</span>
          </div>

          <div className="flex gap-8 text-neutral-500 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
