import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bus, Search, MapPin, Navigation, ArrowRight, Clock } from 'lucide-react'

import { getClientHomeRoute } from '../../utils/auth'

const ALL_ROUTES = [
    { id: 1, from: 'Hà Nội', to: 'Hải Phòng', info: 'Xe limousine • Tối đa 8 chuyến/ngày', duration: '2h 30m', distance: '120 km', price: '320,000 ₫' },
    { id: 2, from: 'Sài Gòn', to: 'Nha Trang', info: 'Xe giường nằm • Tuyến đêm', duration: '8h 00m', distance: '400 km', price: '280,000 ₫' },
    { id: 3, from: 'Đà Lạt', to: 'Sài Gòn', info: 'Xe cao cấp • Giờ khởi hành buổi sáng', duration: '6h 30m', distance: '300 km', price: '240,000 ₫' },
    { id: 4, from: 'Hà Nội', to: 'Đà Nẵng', info: 'Tuyến nhanh • Số chỗ có hạn', duration: '14h 00m', distance: '760 km', price: '450,000 ₫' },
    { id: 5, from: 'Sài Gòn', to: 'Cần Thơ', info: 'Xe tiêu chuẩn • Khởi hành mỗi giờ', duration: '3h 30m', distance: '160 km', price: '150,000 ₫' },
    { id: 6, from: 'Đà Nẵng', to: 'Huế', info: 'Tuyến nhanh • Cung đường ngắm cảnh', duration: '2h 00m', distance: '100 km', price: '120,000 ₫' },
    { id: 7, from: 'Hải Phòng', to: 'Hạ Long', info: 'Xe limousine cao cấp', duration: '1h 15m', distance: '75 km', price: '200,000 ₫' },
    { id: 8, from: 'Sài Gòn', to: 'Vũng Tàu', info: 'Tuyến nhanh • Tần suất cao', duration: '2h 15m', distance: '110 km', price: '160,000 ₫' },
]

export default function ClientRoutesPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')

    const filteredRoutes = ALL_ROUTES.filter(r =>
        r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.to.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleBook = (from: string, to: string) => {
        navigate(getClientHomeRoute(), { state: { prefill: { from, to } } }) // Mock redirection to home to book
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-brand-primary/10">
            {/* ══════════════════  HERO  ══════════════════ */}
            <section className="bg-brand-dark pb-24 pt-20 px-8 relative overflow-hidden" style={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}>
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                        Khám phá <span className="text-brand-primary">Mạng lưới tuyến đường</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Hợp tác với hàng trăm nhà xe uy tín để mang đến cho bạn những chuyến đi an toàn, tiện nghi và đúng giờ trên mọi nẻo đường.
                    </p>

                    <div className="max-w-xl mx-auto mt-10 relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo tỉnh, thành phố (VD: Hà Nội, Sài Gòn)..."
                            className="w-full bg-white/10 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-slate-500 outline-none focus:bg-white/15 focus:border-brand-primary/30 transition-all font-bold text-lg backdrop-blur-xl relative z-10 shadow-2xl"
                            value={searchTerm}  
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* ══════════════════  CONTENT  ══════════════════ */}
            <main className="max-w-7xl mx-auto px-8 mt-10 mb-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRoutes.map((route) => (
                        <div key={route.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                                <Bus className="w-32 h-32 text-brand-primary" />
                            </div>

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                        <Navigation className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hệ thống liên kết</span>
                                </div>
                                <span className="text-slate-900 font-black text-2xl tracking-tighter">{route.price}</span>
                            </div>

                            <div className="flex items-center gap-4 mb-3 relative z-10">
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight">{route.from}</h3>
                                <div className="flex-1 h-px bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                                </div>
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight">{route.to}</h3>
                            </div>

                            <p className="text-slate-500 text-sm font-medium mb-8 flex-1 leading-relaxed relative z-10">{route.info}</p>

                            <div className="flex items-center gap-6 py-4 border-t border-slate-50 mb-8 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{route.duration}</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{route.distance}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBook(route.from, route.to)}
                                className="w-full bg-slate-50 group-hover:bg-brand-primary text-slate-900 group-hover:text-white py-4 rounded-2xl font-black text-base transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-primary/20 relative z-10 flex items-center justify-center gap-3 active:scale-95">
                                Đặt vé tuyến này
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}

                    {filteredRoutes.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Không tìm thấy tuyến đường</h3>
                            <p className="text-slate-500 text-base font-medium">Chúng tôi chưa có tuyến đường nào phù hợp với từ khóa "{searchTerm}".</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-8 text-brand-primary font-black hover:underline"
                            >
                                Xóa bộ lọc tìm kiếm
                            </button>
                        </div>
                    )}
                </div>
            </main>

        </div>
    )
}
