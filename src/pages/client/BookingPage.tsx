import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    ArrowLeft, AlertCircle, Info, ChevronRight
} from 'lucide-react'
import type { TripItem } from '../../Components/client/Ticket'
import { createRequestMeta, createAuthorizedEnvelopeHeaders } from '../../utils/requestMeta'

const DETAIL_API_URL = "http://localhost:8080/api/v1/management/trip-service/detail";
const SEAT_DIAGRAM_API_URL = "http://localhost:8080/api/v1/management/seat-diagram/search";

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
        floor: 'none'
    }))
}

import seatActive from '../../assets/seat_active.svg'
import seatDisabled from '../../assets/seat_disabled.svg'
import seatSelecting from '../../assets/seat_selecting.svg'

export default function BookingPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const passedRoute = location.state?.routeData as TripItem

    // --- State Management ---
    const [step, setStep] = useState<number>(1)
    const [routeData, setRouteData] = useState<Partial<TripItem>>(() => {
        if (!passedRoute) return {
            originName: "Hồ Chí Minh",
            destinationName: "Đà Lạt",
            departureTime: new Date().toISOString(),
            ticketPrice: 350000,
            pickupBranch: "292 Đinh Bộ Lĩnh, Bình Thạnh",
            tripCode: "HCM-DL-99",
            routePoints: [],
            availableSeats: 40,
            hasFloor: true,
            rawArrivalTime: "06:00"
        };

        return {
            ...passedRoute,
            stopPoints: passedRoute.stopPoints || (passedRoute as any).routePoints?.map((rp: any) => ({
                ...rp,
                stopOrder: rp.operationOrder,
                note: rp.note || rp.stopName
            }))
        };
    })

    const [loading, setLoading] = useState(false)
    const [selectedSeats, setSelectedSeats] = useState<string[]>(location.state?.selectedSeats || [])
    const [seats, setSeats] = useState<any[]>(() => {
        const baseSeats = generateSeats(40, true);
        const initialSelected = location.state?.selectedSeats || [];
        return baseSeats.map((s: any) =>
            initialSelected.includes(s.id) ? { ...s, status: 'held' } : s
        );
    })

    // Customer Info
    const [custName, setCustName] = useState("")
    const [custPhone, setCustPhone] = useState("")
    const [custEmail, setCustEmail] = useState("")
    const [custNote, setCustNote] = useState("")
    const [termsAccepted, setTermsAccepted] = useState(false)

    // Pickup / Dropoff
    const [pickupId, setPickupId] = useState<string>("")
    const [dropoffId, setDropoffId] = useState<string>("")

    // --- Effects ---
    useEffect(() => {
        const fetchDetail = async () => {
            const tripId = passedRoute?.id;
            if (!tripId) return;

            setLoading(true);
            try {
                const meta = createRequestMeta();
                const response = await fetch(`${DETAIL_API_URL}?tripId=${tripId}`, {
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

                    setRouteData(prev => ({
                        ...prev,
                        ...data,
                        stopPoints: (data.routePoints || data.stopPoints)?.map((rp: any) => ({
                            ...rp,
                            stopOrder: rp.operationOrder || rp.stopOrder,
                            note: rp.note || rp.stopName
                        })) || prev.stopPoints
                    }));

                    // Fetch Seat Diagram
                    const seatResponse = await fetch(`${SEAT_DIAGRAM_API_URL}?pageNumber=1&pageSize=100&tripId=${tripId}`, {
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
                            floor: (item.floor === 'LOWER' || item.floor === 'DOWN') ? 'lower' : (item.floor === 'UPPER' || item.floor === 'UP') ? 'upper' : item.floor === 'NONE' ? 'none' : 'lower',
                            rowNo: item.rowNo,
                            colNo: item.colNo
                        }));
                        setSeats(() => {
                            const rawSeats = mappedSeats.length > 0 ? mappedSeats : generateSeats(data.availableSeats || 40, data.hasFloor || true);
                            return rawSeats.map((s: any) => selectedSeats.includes(s.id) ? { ...s, status: 'held' } : s);
                        });
                    } else {
                        setSeats(() => {
                            const newSeats = generateSeats(data.availableSeats || 40, data.hasFloor || true);
                            return newSeats.map((s: any) => selectedSeats.includes(s.id) ? { ...s, status: 'held' } : s);
                        });
                    }
                }
            } catch (err) {
                console.error("Fetch route detail error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [passedRoute?.id, selectedSeats]); // Added selectedSeats to sync when API finishes

    const toggleSeat = (id: string) => {
        setSeats((prevSeats: any[]) => {
            const seat = prevSeats.find((s: any) => s.id === id)
            if (!seat || seat.status === 'occupied') return prevSeats

            if (seat.status === 'available') {
                setSelectedSeats(prev => prev.includes(id) ? prev : [...prev, id])
                return prevSeats.map((s: any) => s.id === id ? { ...s, status: 'held' } : s)
            } else if (seat.status === 'held') {
                setSelectedSeats(prev => prev.filter(sid => sid !== id))
                return prevSeats.map((s: any) => s.id === id ? { ...s, status: 'available' } : s)
            }
            return prevSeats
        })
    }

    const formatVnd = (v?: number | null) => {
        if (typeof v !== "number") return "0 ₫"
        return new Intl.NumberFormat("vi-VN").format(v) + " ₫"
    }

    const totalAmount = selectedSeats.length * (routeData.ticketPrice || 0)

    // Step validation
    const canGoToStep2 = selectedSeats.length > 0
    const canGoToStep3 = custName && custPhone && termsAccepted
    const canGoToStep4 = pickupId && dropoffId
    const canCheckout = canGoToStep2 && canGoToStep3

    const handleNext = () => {
        if (step === 1 && canGoToStep2) setStep(2)
        else if (step === 2 && canGoToStep3) setStep(3)
        else if (step === 3 && canGoToStep4) setStep(4)
        else if (step === 4 && canCheckout) handleCheckout()
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
        else navigate(-1)
    }

    const handleCheckout = async () => {
        if (!canCheckout) return

        try {
            setLoading(true);
            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                data: {
                    tripId: routeData.id,
                    seatNos: selectedSeats.map(id => seats.find((s: any) => s.id === id)?.number || id),
                    holdBy: localStorage.getItem("userId") || custPhone
                },
                info: {
                    customerName: custName,
                    customerPhone: custPhone,
                    customerEmail: custEmail
                }
            };

            const response = await fetch("http://localhost:8084/api/v1/booking-service/trips/hold-seat", {
                method: "POST",
                headers: {
                    ...createAuthorizedEnvelopeHeaders(meta),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                const booking = result.booking;

                navigate('/payment', {
                    state: {
                        routeData,
                        selectedSeats,
                        seatCodes: selectedSeats.map(id => seats.find((s: any) => s.id === id)?.number || id),
                        customerName: custName,
                        customerPhone: custPhone,
                        customerEmail: custEmail,
                        totalAmount: booking?.totalAmount || totalAmount,
                        booking: booking,
                        note: custNote,
                        pickupPoint: routeData.stopPoints?.find((s: any) => s.id === pickupId),
                        dropoffPoint: routeData.stopPoints?.find((s: any) => s.id === dropoffId)
                    }
                });
            } else {
                const errResult = await response.json();
                throw new Error(errResult.result?.description || "Ghế đã bị giữ hoặc không còn trống, vui lòng chọn ghế khác.");
            }
        } catch (err: any) {
            alert(err.message || "Lỗi giữ ghế, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }

    // --- Components ---
    const Stepper = () => (
        <div className="bg-[#E5E7EB] px-4 py-3 border-b border-gray-200">
            <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] sm:text-xs">
                {[
                    { id: 1, label: "CHỌN GHẾ" },
                    { id: 2, label: "THÔNG TIN KHÁCH HÀNG" },
                    { id: 3, label: "ĐIỂM ĐÓN/TRẢ" },
                    { id: 4, label: "THANH TOÁN" }
                ].map((s, idx) => (
                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                        <div className={`flex items-center gap-2 ${step >= s.id ? 'text-slate-900' : 'text-gray-400'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold border ${step >= s.id ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {s.id}
                            </div>
                            <span className="font-black uppercase tracking-tight hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < 3 && <div className={`h-px flex-1 mx-4 ${step > s.id ? 'bg-brand-primary' : 'bg-gray-300'}`} />}
                    </div>
                ))}
            </div>
        </div>
    )

    const Seat = ({ seat }: { seat: any }) => {
        const isSelected = seat.status === 'held';
        const isOccupied = seat.status === 'occupied';

        return (
            <button
                disabled={isOccupied}
                onClick={() => toggleSeat(seat.id)}
                className={`relative w-11 h-11 flex items-center justify-center transition-all group ${isOccupied ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
                <img
                    src={isSelected ? seatSelecting : isOccupied ? seatDisabled : seatActive}
                    alt="seat"
                    className="w-full h-full object-contain"
                />
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black pointer-events-none mt-[-2px]
                    ${isSelected ? 'text-orange-600' : isOccupied ? 'text-gray-500' : 'text-blue-600 group-hover:text-blue-700'}
                `}>
                    {seat.number}
                </span>
            </button>
        )
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans pb-32">
            {/* Header - Brand Color */}
            <header className="bg-brand-primary px-6 py-4 sticky top-0 z-[60] shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div className="text-white">
                            <h1 className="text-sm sm:text-base font-black tracking-tight">{routeData.originName} - {routeData.destinationName}</h1>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                {routeData.departureTime ? new Date(routeData.departureTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }) : '--/--'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-Tabs (Visual only as per image) */}
            <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto whitespace-nowrap">
                <div className="max-w-7xl mx-auto flex gap-8">
                    {["Đặt vé", "Lịch trình", "Trung chuyển", "Chính sách"].map((tab) => (
                        <button key={tab} className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${tab === "Đặt vé" ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400"}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <Stepper />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Desktop View (lg screens): Side-by-side but following step if needed, or all in one? */}
                {/* As per user request "Khi thu nhỏ sẽ là như vầy", I'll use steps for mobile, and keeping the logic unified. */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT AREA: Step Content */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* STEP 1: SEAT SELECTION */}
                        <div className={`${step !== 1 && 'hidden lg:block'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                                <h2 className="text-lg font-bold text-gray-900">Chọn ghế</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#D5D9DD] border border-[#C0C6CC]" /><span className="text-[10px] font-bold text-gray-400">Đã bán</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#DEF3FF] border border-[#96C5E7]" /><span className="text-[10px] font-bold text-gray-400">Trống</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#FDEDE8] border border-[#F8BEAB]" /><span className="text-[10px] font-bold text-gray-400">Chọn</span></div>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col items-center">
                                <div className="flex flex-col md:flex-row gap-12 sm:gap-24 justify-center w-full">
                                    <div className="flex flex-col items-center flex-1 max-w-xs">
                                        {seats.some((s: any) => s.floor === 'lower') && (
                                            <div className="w-full flex justify-between items-center mb-6">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tầng dưới</p>
                                                <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
                                            </div>
                                        )}
                                        {(() => {
                                            const lowerSeats = seats.filter((s: any) => s.floor === 'lower' || s.floor === 'none');
                                            if (lowerSeats.length === 0) return null;

                                            const maxCols = Math.max(1, ...lowerSeats.map((s: any) => s.colNo || 1));
                                            const maxRows = Math.max(1, ...lowerSeats.map((s: any) => s.rowNo || 1));
                                            const useGrid = lowerSeats.some((s: any) => s.colNo && s.rowNo);

                                            return (
                                                <div
                                                    className={`p-6 bg-gray-50 rounded-[2rem] w-full shadow-inner place-items-center ${useGrid ? 'grid gap-6 sm:gap-8' : 'flex flex-wrap justify-center gap-6'}`}
                                                    style={useGrid ? {
                                                        gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                                                        gridTemplateRows: `repeat(${maxRows}, minmax(0, 1fr))`
                                                    } : {}}
                                                >
                                                    {lowerSeats.map((seat) => (
                                                        <div key={seat.id} style={useGrid ? { gridColumn: seat.colNo || 'auto', gridRow: seat.rowNo || 'auto' } : {}}>
                                                            <Seat seat={seat} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })()}
                                    </div>

                                    {seats.some((s: any) => s.floor === 'upper') && (
                                        <div className="flex flex-col items-center flex-1 max-w-xs">
                                            <div className="w-full flex justify-between items-center mb-6">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tầng trên</p>
                                                <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
                                            </div>
                                            {(() => {
                                                const upperSeats = seats.filter((s: any) => s.floor === 'upper');
                                                const maxCols = Math.max(1, ...upperSeats.map((s: any) => s.colNo || 1));
                                                const maxRows = Math.max(1, ...upperSeats.map((s: any) => s.rowNo || 1));
                                                const useGrid = upperSeats.some((s: any) => s.colNo && s.rowNo);

                                                return (
                                                    <div
                                                        className={`p-6 bg-gray-50 rounded-[2rem] w-full shadow-inner place-items-center ${useGrid ? 'grid gap-6 sm:gap-8' : 'flex flex-wrap justify-center gap-6'}`}
                                                        style={useGrid ? {
                                                            gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                                                            gridTemplateRows: `repeat(${maxRows}, minmax(0, 1fr))`
                                                        } : {}}
                                                    >
                                                        {upperSeats.map((seat) => (
                                                            <div key={seat.id} style={useGrid ? { gridColumn: seat.colNo || 'auto', gridRow: seat.rowNo || 'auto' } : {}}>
                                                                <Seat seat={seat} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 py-3 px-6 bg-slate-50 rounded-full border border-slate-100 text-xs font-bold text-slate-400">
                                    Ghế đã chọn: <span className="text-brand-primary ml-1">{selectedSeats.map(id => seats.find((s: any) => s.id === id)?.number || id).join(", ") || "Chưa chọn"}</span>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: CUSTOMER INFO */}
                        <div className={`${step !== 2 && 'hidden lg:block'} bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 transition-all`}>
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">Thông tin khách hàng</h2>
                                <button className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-brand-primary/5 rounded-lg">Điều khoản & Lưu ý</button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên hành khách *</label>
                                        <input
                                            type="text"
                                            placeholder="Nguyễn Văn A"
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-sm"
                                            value={custName}
                                            onChange={(e) => setCustName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            placeholder="09xx xxx xxx"
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-sm"
                                            value={custPhone}
                                            onChange={(e) => setCustPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email *</label>
                                        <input
                                            type="email"
                                            placeholder="example@gmail.com"
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-sm"
                                            value={custEmail}
                                            onChange={(e) => setCustEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú (Nếu có)</label>
                                        <textarea
                                            placeholder="Yêu cầu đặc biệt về vị trí, hành lý..."
                                            rows={3}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 focus:border-brand-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-sm resize-none"
                                            value={custNote}
                                            onChange={(e) => setCustNote(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 text-brand-primary font-black text-sm mb-6 uppercase tracking-widest">
                                            <AlertCircle size={18} />
                                            <span>Lưu ý quan trọng</span>
                                        </div>
                                        <ul className="space-y-4 text-xs font-bold text-gray-500 list-disc ml-4 leading-relaxed">
                                            <li>Quý khách vui lòng <span className="text-brand-accent underline">Đăng ký/Đăng nhập</span> để nhận ưu đãi lên đến 20%.</li>
                                            <li>Thông tin hành khách phải trùng khớp với giấy tờ tùy thân.</li>
                                            <li>Mã vé điện tử sẽ được gửi qua SMS và Email sau khi thanh toán.</li>
                                            <li>Hotline hỗ trợ 24/7: <span className="text-slate-900">1900 6067</span>.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center gap-4">
                                <label className="relative flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                    <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded-lg peer-checked:bg-brand-primary peer-checked:border-brand-primary transition-all flex items-center justify-center">
                                        {termsAccepted && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    </div>
                                    <span className="ml-3 text-[11px] sm:text-xs font-bold text-gray-500">
                                        Chấp nhận <span className="text-brand-primary border-b border-brand-primary/30">điều khoản đặt vé</span> của nhà xe.
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* STEP 3: PICKUP / DROPOFF */}
                        {/* <div className={`${step !== 3 && 'hidden lg:block'} bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10`}>
                            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-50">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                    <MapPin size={22} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Thông tin đón trả</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">VỊ TRÍ ĐÓN KHÁCH</h3>
                                    <div className="flex gap-8">
                                        {["office", "transfer"].map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${pickupType === type ? 'border-brand-primary' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    {pickupType === type && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full shadow-sm" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={pickupType === type} onChange={() => setPickupType(type as any)} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${pickupType === type ? 'text-slate-900' : 'text-gray-400'}`}>
                                                    {type === 'office' ? 'Bến xe/VP' : 'Trung chuyển'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-5 pr-10 py-5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-brand-primary/20 appearance-none font-bold text-gray-900 shadow-sm"
                                            value={pickupId}
                                            onChange={(e) => setPickupId(e.target.value)}
                                        >
                                            <option value="">Chọn địa điểm gần bạn</option>
                                            {routeData.stopPoints?.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.note || `Trạm ${s.stopOrder}`}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight className="rotate-90 w-4 h-4" /></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-brand-accent flex items-center gap-2 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10">
                                        <Info size={14} />
                                        Vui lòng có mặt tại điểm đón trước 30 phút giờ xuất bến.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">VỊ TRÍ TRẢ KHÁCH</h3>
                                    <div className="flex gap-8">
                                        {["office", "transfer"].map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${dropoffType === type ? 'border-brand-primary' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    {dropoffType === type && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full shadow-sm" />}
                                                </div>
                                                <input type="radio" className="hidden" checked={dropoffType === type} onChange={() => setDropoffType(type as any)} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${dropoffType === type ? 'text-slate-900' : 'text-gray-400'}`}>
                                                    {type === 'office' ? 'Bến xe/VP' : 'Trung chuyển'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-5 pr-10 py-5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-brand-primary/20 appearance-none font-bold text-gray-900 shadow-sm"
                                            value={dropoffId}
                                            onChange={(e) => setDropoffId(e.target.value)}
                                        >
                                            <option value="">Chọn địa điểm trung chuyển</option>
                                            {routeData.stopPoints?.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.note || `Trạm ${s.stopOrder}`}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight className="rotate-90 w-4 h-4" /></div>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* STEP 4: SUMMARY & PRICE (Mobile Only or Sidebar Content) */}
                        <div className={`${step !== 4 && 'hidden'} lg:hidden space-y-6`}>
                            {/* Mobile Step 4 implements the Summary cards that are already in the sidebar for desktop */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold mb-6">Tóm tắt đơn hàng</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Chuyến xe</span>
                                        <span className="text-sm font-black">{routeData.originName} → {routeData.destinationName}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ghế đã chọn</span>
                                        <span className="text-sm font-black text-brand-primary">{selectedSeats.map(id => seats.find((s: any) => s.id === id)?.number || id).join(", ")}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tổng thanh toán</span>
                                        <span className="text-2xl font-black text-brand-accent tracking-tighter">{formatVnd(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT AREA: Summary Sidebar (Always visible on large screens) */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-28">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-gray-900">Thông tin chuyến đi</h2>
                                <Info size={16} className="text-gray-300" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Hành trình</span>
                                    <span className="text-sm font-bold text-slate-900">{routeData.originName} - {routeData.destinationName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Khởi hành</span>
                                    <span className="text-sm font-bold text-brand-primary">
                                        {routeData.rawDepartureTime || (routeData.departureTime ? new Date(routeData.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--')}
                                    </span>
                                </div>
                                {routeData.rawArrivalTime && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Đến nơi (Dự kiến)</span>
                                        <span className="text-sm font-bold text-slate-600">{routeData.rawArrivalTime}</span>
                                    </div>
                                )}
                                {routeData.pickupBranch && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Điểm đón</span>
                                        <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{routeData.pickupBranch}</span>
                                    </div>
                                )}
                                {routeData.merchantName && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Nhà xe</span>
                                        <span className="text-sm font-bold text-brand-primary">{routeData.merchantName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Số ghế</span>
                                    <span className="text-sm font-black text-brand-primary">{selectedSeats.length > 0 ? selectedSeats.map(id => seats.find((s: any) => s.id === id)?.number || id).join(", ") : "Chưa chọn"}</span>
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Giá vé lượt đi</span>
                                        <span className="font-black text-slate-900">{formatVnd(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">TỔNG CỘNG</span>
                                        <span className="text-3xl font-black text-brand-accent tracking-tighter">{formatVnd(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={!canCheckout}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-sm mt-10 transition-all shadow-xl flex items-center justify-center gap-3 ${canCheckout ? 'bg-brand-dark hover:bg-brand-primary text-white shadow-brand-primary/20 hover:-translate-y-1' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                TIẾP TỤC THANH TOÁN
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* MOBILE FLOATING ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 sm:p-5 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] lg:hidden transition-transform duration-500">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</span>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">{formatVnd(totalAmount)}</span>
                    </div>
                    <div className="flex flex-1 gap-3 justify-end">
                        {step === 4 ? (
                            <>
                                <button onClick={() => setStep(3)} className="px-6 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl border border-gray-100 text-xs">Quay lại</button>
                                <button onClick={handleCheckout} disabled={!canCheckout} className={`px-10 py-4 rounded-2xl font-black text-white text-xs ${canCheckout ? 'bg-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-gray-300'}`}>Thanh toán</button>
                            </>
                        ) : (
                            <button
                                onClick={handleNext}
                                className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white text-xs transition-all ${(step === 1 && canGoToStep2) || (step === 2 && canGoToStep3) || (step === 3 && canGoToStep4)
                                    ? 'bg-brand-primary shadow-lg shadow-brand-primary/20 active:scale-95'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {step === 3 ? "Xác nhận đặt chỗ" : "Tiếp tục"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[200] flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
                        <p className="text-brand-primary font-black text-sm uppercase tracking-[0.2em]">Đang chuẩn bị...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

