import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ArrowLeft, Clock,
    Bus, MapPin, ShieldCheck,
    X, ArrowRight, Loader2
} from 'lucide-react'
import type { RouteItem } from '../../Components/client/Ticket'
import { createRequestMeta, createAuthorizedEnvelopeHeaders } from '../../utils/requestMeta'

const DETAIL_API_URL = "http://localhost:8080/api/v1/management/route-service/detail";
const SEAT_DIAGRAM_API_URL = "http://localhost:8080/api/v1/management/seat-diagram/search";

// Dummy Data for Seat Map: 2 floors (Lower A, Upper B)
// Dynamic Seat Generation
const generateSeats = (totalSeats = 40, hasFloor = true) => {
    if (hasFloor) {
        const countPerFloor = Math.ceil(totalSeats / 2);
        const lower = Array.from({ length: countPerFloor }).map((_, i) => ({
            id: `A${(i + 1).toString().padStart(2, '0')}`,
            number: `A${(i + 1).toString().padStart(2, '0')}`,
            status: 'available',
            floor: 'lower'
        }))
        const upper = Array.from({ length: totalSeats - countPerFloor }).map((_, i) => ({
            id: `B${(i + 1).toString().padStart(2, '0')}`,
            number: `B${(i + 1).toString().padStart(2, '0')}`,
            status: 'available',
            floor: 'upper'
        }))
        return [...lower, ...upper]
    }
    
    return Array.from({ length: totalSeats }).map((_, i) => ({
        id: `S${(i + 1).toString().padStart(2, '0')}`,
        number: `S${(i + 1).toString().padStart(2, '0')}`,
        status: 'available',
        floor: 'lower'
    }))
}

export default function SeatSelectionPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const routeData = location.state?.routeData as RouteItem

    const [trip, setTrip] = useState<Partial<RouteItem>>(() => {
        if (!routeData) return {
            origin: "Hồ Chí Minh",
            destination: "Đà Lạt",
            plannedStartTime: new Date().toISOString(),
            plannedEndTime: new Date(Date.now() + 6 * 3600000).toISOString(),
            price: 350000,
            vehicleType: "LIMOUSINE",
            pickupBranch: "292 Đinh Bộ Lĩnh, Bình Thạnh",
            routeCode: "HCM-DL-99"
        };

        // Ensure we use the mapped fields if they came from search
        return {
            ...routeData,
            price: routeData.price || (routeData as any).ticketPrice,
            stopPoints: routeData.stopPoints || (routeData as any).routePoints?.map((rp: any) => ({
                ...rp,
                stopOrder: rp.operationOrder,
                note: rp.note || rp.stopName
            }))
        };
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDetail = async () => {
            const routeId = routeData?.id;
            if (!routeId) return;

            setLoading(true);
            try {
                const meta = createRequestMeta();
                const response = await fetch(`${DETAIL_API_URL}?routeId=${routeId}`, {
                    method: 'GET',
                    headers: {
                        ...createAuthorizedEnvelopeHeaders(meta),
                        'X-Request-Id': meta.requestId,
                        'X-Request-DateTime': meta.requestDateTime,
                        'X-Channel': meta.channel
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || result;

                    setTrip(prev => ({
                        ...prev,
                        ...data,
                        price: data.ticketPrice || data.price || prev.price,
                        stopPoints: (data.routePoints || data.stopPoints)?.map((rp: any) => ({
                            ...rp,
                            stopOrder: rp.operationOrder || rp.stopOrder,
                            note: rp.note || rp.stopName
                        })) || prev.stopPoints
                    }));

                    // Fetch Seat Diagram
                    const seatResponse = await fetch(`${SEAT_DIAGRAM_API_URL}?pageNumber=1&pageSize=100&routeId=${routeId}`, {
                        method: 'GET',
                        headers: {
                            'accept': '*/*',
                            'X-Request-Id': meta.requestId,
                            'X-Request-DateTime': meta.requestDateTime,
                            'X-Channel': 'ONL'
                        }
                    });

                    if (seatResponse.ok) {
                        const seatResult = await seatResponse.json();
                        const items = seatResult.data?.items || [];
                        const mappedSeats = items.map((item: any) => ({
                            id: item.seatId,
                            number: item.code,
                            status: item.status === 'AVAILABLE' ? 'available' : 'occupied',
                            floor: item.floor === 'LOWER' ? 'lower' : item.floor === 'UPPER' ? 'upper' : 'lower',
                            rowNo: item.rowNo,
                            colNo: item.colNo
                        }));
                        setSeats(mappedSeats.length > 0 ? mappedSeats : generateSeats(data.availableSeats || 40, data.hasFloor || true));
                    } else {
                        // Fallback
                        const seatsCount = data.availableSeats || 40;
                        const floors = data.hasFloor || true;
                        setSeats(generateSeats(seatsCount, floors));
                    }
                }
            } catch (err) {
                console.error("Fetch route detail error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [routeData?.id]);

    const [seats, setSeats] = useState<any[]>(() => generateSeats(40, true))
    const [selectedSeats, setSelectedSeats] = useState<string[]>([])
    const [holdExpiration, setHoldExpiration] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(0)


    useEffect(() => {
        let interval: number
        if (holdExpiration) {
            interval = window.setInterval(() => {
                const now = Date.now()
                const diff = holdExpiration - now
                if (diff <= 0) {
                    setTimeLeft(0)
                    setHoldExpiration(null)
                    setSelectedSeats([])
                    setSeats(prev => prev.map(s => s.status === 'held' ? { ...s, status: 'available' } : s))
                } else {
                    setTimeLeft(Math.floor(diff / 1000))
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [holdExpiration])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const toggleSeat = (id: string) => {
        setSeats(prev => {
            const seat = prev.find(s => s.id === id)
            if (!seat || seat.status === 'occupied') return prev

            if (seat.status === 'available') {
                const newSelected = [...selectedSeats, id]
                setSelectedSeats(newSelected)
                if (!holdExpiration) {
                    setHoldExpiration(Date.now() + 5 * 60 * 1000)
                }
                return prev.map(s => s.id === id ? { ...s, status: 'held' } : s)
            } else if (seat.status === 'held') {
                const newSelected = selectedSeats.filter(sid => sid !== id)
                setSelectedSeats(newSelected)
                if (newSelected.length === 0) setHoldExpiration(null)
                return prev.map(s => s.id === id ? { ...s, status: 'available' } : s)
            }
            return prev
        })
    }

    const handleContinue = () => {
        if (selectedSeats.length === 0) return
        navigate('/booking', { 
            state: { 
                selectedSeats,
                routeData: trip 
            } 
        })
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans pb-32 selection:bg-brand-primary/10">

            {/* ══════════════════  REFINED HEADER  ══════════════════ */}
            <header className="bg-slate-950 pt-3 pb-8 px-6 relative overflow-hidden" style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] opacity-30" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-6 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 group backdrop-blur-md"
                        >
                            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-white font-black text-2xl tracking-tight mb-1">Chọn ghế của bạn</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest">{trip.routeCode}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-800" />
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    {(trip as any).vehiclePlate ? `Biển số: ${(trip as any).vehiclePlate}` : (trip.vehicleType === 'LIMOUSINE' ? 'Premium Air' : 'Routex Direct')}
                                    {trip.hasFloor && " • Xe 2 tầng"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Route Info */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-1.5 backdrop-blur-sm shadow-2xl inline-block w-full">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                            <div className="md:col-span-2 bg-white/5 rounded-2xl px-6 py-4 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Điểm đi</p>
                                    <p className="text-white font-bold text-lg">{trip.origin}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <ArrowRight className="text-brand-primary" size={14} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Điểm đến</p>
                                    <p className="text-white font-bold text-lg">{trip.destination}</p>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-l border-white/10">
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Giờ khởi hành</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-primary font-black text-xl leading-none">
                                        {trip.plannedStartTime ? new Date(trip.plannedStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </span>
                                    <span className="text-slate-400 font-bold text-[10px] leading-none">
                                        {trip.plannedStartTime ? new Date(trip.plannedStartTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-l border-white/10">
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Giá vé niêm yết</p>
                                <p className="text-white font-black text-xl leading-none">
                                    {new Intl.NumberFormat('vi-VN').format(trip.price || 0)} <span className="text-[10px] text-slate-400">VND</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════════════  MAIN CONTENT AREA ══════════════════ */}
            <main className="max-w-[1400px] mx-auto px-10 py-16 -mt-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] shadow-2xl border border-slate-50">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-6" />
                        <p className="text-slate-500 font-black text-xl">Đang tải thông tin chuyến đi...</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                    
                    {/* Visual Bus Map Container */}
                    <div className="flex-1 w-full bg-white rounded-[48px] p-16 shadow-2xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row gap-16 justify-center">
                            {/* Lower Floor */}
                            <div className="flex flex-col items-center">
                                <div className="mb-10 text-center">
                                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">Hạng Phổ Thông - Tầng 01</span>
                                    <div className="w-full h-1 bg-slate-100 rounded-full mt-4 max-w-[80px] mx-auto" />
                                </div>
                                
                                {(() => {
                                    const lowerSeats = seats.filter(s => s.floor === 'lower');
                                    if (lowerSeats.length === 0) return null;
                                    
                                    const maxCols = Math.max(1, ...lowerSeats.map(s => s.colNo || 1));
                                    const maxRows = Math.max(1, ...lowerSeats.map(s => s.rowNo || 1));
                                    const useGrid = lowerSeats.some(s => s.colNo && s.rowNo);
                                    
                                    return (
                                        <div 
                                            className={`p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 shadow-inner ${useGrid ? 'grid gap-x-4 gap-y-5' : 'flex flex-wrap gap-4 justify-center max-w-[300px]'}`}
                                            style={useGrid ? { 
                                                gridTemplateColumns: `repeat(${maxCols}, minmax(3rem, 1fr))`,
                                                gridTemplateRows: `repeat(${maxRows}, minmax(3rem, 1fr))`
                                            } : {}}
                                        >
                                            {lowerSeats.map((seat) => (
                                                <button
                                                    key={seat.id}
                                                    disabled={seat.status === 'occupied'}
                                                    onClick={() => toggleSeat(seat.id)}
                                                    style={useGrid ? { 
                                                        gridColumn: seat.colNo || 'auto',
                                                        gridRow: seat.rowNo || 'auto'
                                                    } : {}}
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 relative shrink-0
                                                        ${seat.status === 'available' ? 'bg-white border border-slate-200 text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:shadow-lg hover:bg-white' :
                                                        seat.status === 'held' ? 'bg-slate-900 border-none text-white shadow-2xl scale-110 z-10' :
                                                        'bg-slate-100 border-none text-slate-200 cursor-not-allowed opacity-40'}
                                                    `}
                                                >
                                                    {seat.number}
                                                    {seat.status === 'held' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full ring-2 ring-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })()}
                            </div>

                            {/* Upper Floor */}
                            {seats.some(s => s.floor === 'upper') && (
                                <div className="flex flex-col items-center">
                                    <div className="mb-10 text-center">
                                        <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-100">Hạng Thương Gia - Tầng 02</span>
                                        <div className="w-full h-1 bg-indigo-50 rounded-full mt-4 max-w-[80px] mx-auto" />
                                    </div>
                                    
                                    {(() => {
                                        const upperSeats = seats.filter(s => s.floor === 'upper');
                                        if (upperSeats.length === 0) return null;
                                        
                                        const maxCols = Math.max(1, ...upperSeats.map(s => s.colNo || 1));
                                        const maxRows = Math.max(1, ...upperSeats.map(s => s.rowNo || 1));
                                        const useGrid = upperSeats.some(s => s.colNo && s.rowNo);

                                        return (
                                            <div 
                                                className={`p-10 bg-indigo-50/20 rounded-[3rem] border border-indigo-50 shadow-inner ${useGrid ? 'grid gap-x-4 gap-y-5' : 'flex flex-wrap gap-4 justify-center max-w-[300px]'}`}
                                                style={useGrid ? { 
                                                    gridTemplateColumns: `repeat(${maxCols}, minmax(3rem, 1fr))`,
                                                    gridTemplateRows: `repeat(${maxRows}, minmax(3rem, 1fr))`
                                                } : {}}
                                            >
                                                {upperSeats.map((seat) => (
                                                    <button
                                                        key={seat.id}
                                                        disabled={seat.status === 'occupied'}
                                                        onClick={() => toggleSeat(seat.id)}
                                                        style={useGrid ? { 
                                                            gridColumn: seat.colNo || 'auto',
                                                            gridRow: seat.rowNo || 'auto'
                                                        } : {}}
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 relative shrink-0
                                                            ${seat.status === 'available' ? 'bg-white border border-slate-200 text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:shadow-lg hover:bg-white' :
                                                            seat.status === 'held' ? 'bg-slate-900 border-none text-white shadow-2xl scale-110 z-10' :
                                                            'bg-slate-100 border-none text-slate-200 cursor-not-allowed opacity-40'}
                                                        `}
                                                    >
                                                        {seat.number}
                                                        {seat.status === 'held' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full ring-2 ring-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Aesthetic Divider */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </div>

                    {/* Dashboard Sidebar */}
                    <div className="w-full lg:w-[420px] space-y-10">
                        
                        {/* Elegant Legend */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Chú thích trạng thái</h3>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 group/l">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 font-black text-sm group-hover/l:border-brand-primary transition-colors">A1</div>
                                    <div>
                                        <p className="font-black text-slate-950 text-lg">Chỗ còn trống</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sẵn sàng đặt ngay</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                        <ShieldCheck size={24} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-950 text-lg">Chỗ đang chọn</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Đặt tạm thời</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 opacity-40">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <X size={20} className="text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-950 text-lg">Không khả dụng</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Đã được bán</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trip Quick Info */}
                        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                        <Bus size={20} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Phương tiện</p>
                                        <p className="font-bold text-white tracking-tight">
                                            {trip.vehicleType || "Limousine VIP Cloud"} 
                                            {(trip as any).vehiclePlate && ` - ${(trip as any).vehiclePlate}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                        <MapPin size={20} className="text-brand-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Điểm đón khách</p>
                                        <p className="font-bold text-white tracking-tight leading-snug">{trip.pickupBranch}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {holdExpiration && (
                            <div className="bg-brand-primary/5 rounded-[2rem] p-8 border border-brand-primary/10 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Kết thúc giữ chỗ sau</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 text-brand-primary animate-pulse" />
                                    <span className="text-3xl font-black text-slate-950 tracking-tighter">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                )}
            </main>

            {/* ══════════════════  FLOATING ACTION BAR  ══════════════════ */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 pr-6 flex flex-col md:flex-row items-center gap-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                        <div className="flex-1 flex flex-col md:flex-row items-center gap-10 px-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Chỗ đã chọn</p>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedSeats.map(id => (
                                        <span key={id} className="px-4 py-2 bg-white/5 rounded-xl text-brand-primary font-black text-sm border border-white/5">{id}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Thanh toán dự kiến</p>
                                <p className="text-2xl font-black text-white tracking-tighter">
                                    {new Intl.NumberFormat('vi-VN').format(selectedSeats.length * (trip.price || 0))} <span className="text-sm font-bold text-slate-400">₫</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full md:w-auto bg-brand-primary hover:bg-brand-accent text-slate-950 px-10 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3"
                        >
                            Xác nhận đặt vé
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
