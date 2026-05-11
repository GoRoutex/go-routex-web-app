import { useState, useMemo } from 'react'
import { MapPin, Loader2, Bus, ShieldCheck, X, ArrowRight, Clock, Info, AlertCircle, ChevronRight } from 'lucide-react'
import { createRequestMeta, createAuthorizedEnvelopeHeaders } from '../../utils/requestMeta'

export type StopPoint = {
    id: string
    stopOrder: string
    routeId: string
    plannedArrivalTime?: string
    plannedDepartureTime?: string
    note?: string
    stopName?: string
    stopCity?: string
    stopAddress?: string
}

export type TripItem = {
    id: string
    merchantId: string
    driverId: string
    vehicleId: string
    merchantName: string
    pickupBranch: string | null
    originCode: string
    originName: string
    originDepartmentName?: string
    destinationCode: string
    destinationName: string
    destinationDepartmentName?: string
    availableSeats: number
    departureTime: string
    rawDepartureDate: string
    rawDepartureTime: string
    vehiclePlate: string
    hasFloor: boolean
    tripCode: string
    ticketPrice: number
    rawArrivalTime: string
    routePoints: any[]
    // UI helper fields
    origin?: string
    destination?: string
    price?: number
    stopPoints?: StopPoint[]
}

const pad2 = (n: number) => String(n).padStart(2, "0")

const formatTimeHHmm = (iso: string) => {
    if (!iso) return "--:--";
    try {
        const d = new Date(iso)
        return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    } catch {
        return "--:--"
    }
}

// durationText removed as it's not used with current response structure

const formatVnd = (v?: number | null) => {
    if (typeof v !== "number") return "—"
    return new Intl.NumberFormat("vi-VN").format(v) + "đ"
}

const SEAT_DIAGRAM_API_URL = "http://localhost:8080/api/v1/management/seat-diagram/search";

export const Ticket = ({ item, onClick }: { item: TripItem, onClick?: () => void }) => {
    const [expandedTab, setExpandedTab] = useState<string | null>(null);
    const [seatsData, setSeatsData] = useState<any[]>([]);
    const [loadingSeats, setLoadingSeats] = useState(false);

    const fetchSeats = async () => {
        if (seatsData.length > 0) return;
        setLoadingSeats(true);
        try {
            const meta = createRequestMeta();
            const response = await fetch(`${SEAT_DIAGRAM_API_URL}?pageNumber=1&pageSize=100&tripId=${item.id}`, {
                method: 'GET',
                headers: {
                    'X-Request-Id': meta.requestId,
                    'X-Request-DateTime': meta.requestDateTime,
                    'X-Channel': 'ONL'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const items = result.data?.items || [];
                const mapped = items.map((i: any) => ({
                    id: i.seatId,
                    number: i.code,
                    status: i.status === 'AVAILABLE' ? 'available' : 'occupied',
                    floor: (i.floor === 'LOWER' || i.floor === 'DOWN') ? 'lower' : (i.floor === 'UPPER' || i.floor === 'UP') ? 'upper' : 'lower',
                    rowNo: i.rowNo,
                    colNo: i.colNo
                }));
                setSeatsData(mapped);
            }
        } catch (err) {
            console.error("Lỗi tải sơ đồ ghế:", err);
        } finally {
            setLoadingSeats(false);
        }
    };

    const handleTabClick = (tab: string) => {
        if (expandedTab === tab) {
            setExpandedTab(null);
        } else {
            setExpandedTab(tab);
            if (tab === 'seat') fetchSeats();
        }
    };

    const startTime = item.rawDepartureTime || formatTimeHHmm(item.departureTime)
    const endTime = item.rawArrivalTime || "--:--"

    // Calculate duration if both raw times are available
    const calculateDuration = () => {
        if (!item.rawDepartureTime || !item.rawArrivalTime) return "4h00"
        try {
            const [sh, sm] = item.rawDepartureTime.split(':').map(Number)
            let [eh, em] = item.rawArrivalTime.split(':').map(Number)

            let startTotal = sh * 60 + sm
            let endTotal = eh * 60 + em

            if (endTotal < startTotal) endTotal += 24 * 60 // Next day

            const diff = endTotal - startTotal
            const h = Math.floor(diff / 60)
            const m = diff % 60
            return `${pad2(h)}h${pad2(m)}`
        } catch {
            return "4h00"
        }
    }

    const dur = calculateDuration()

    const seats = item.availableSeats
    const price = item.ticketPrice

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
            {/* Top half */}
            <div className="p-5 flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-center justify-between pointer-events-auto">
                {/* Left: Origin Time & Location */}
                <div className="flex flex-col flex-1 min-w-[200px] w-[500px] md:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="text-[20px] sm:text-[24px] font-bold text-slate-800 leading-none">{startTime}</div>
                        <div className="flex items-center gap-2 flex-1 w-full max-w-[260px]">
                            <div className="w-3 h-3 rounded-full border-2 border-slate-600 bg-white shrink-0" />
                            <div className="flex-1 min-w-[60px] border-t-[1.5px] border-dotted border-gray-300 relative h-0">
                                <span className="absolute left-1/2 -top-5 transform -translate-x-1/2 text-[12px] text-slate-500 whitespace-nowrap bg-white px-2 mt-0.5">
                                    {dur} - 304Km
                                </span>
                                <span className="absolute left-1/2 top-1.5 transform -translate-x-1/2 text-[11px] text-slate-400 whitespace-nowrap px-2">
                                    (Asian/Ho Chi Minh)
                                </span>
                            </div>
                            <div className="w-4 h-4 text-brand-primary shrink-0 bg-white">
                                <MapPin className="w-full h-full text-slate-500 stroke-[2.5]" />
                            </div>
                        </div>
                        <div className="text-[20px] sm:text-[24px] font-bold text-slate-800 leading-none">{endTime}</div>
                    </div>

                    <div className="flex items-start justify-between mt-3 text-[14px]">
                        <div className="font-semibold text-slate-800 w-[140px] leading-snug">{item.originName}</div>
                        <div className="font-semibold text-slate-800 w-[140px] text-right leading-snug">{item.destinationName}</div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        {item.pickupBranch && (
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>Điểm đón: <span className="text-slate-700 font-medium">{item.pickupBranch}</span></span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Nhà xe: <span className="text-brand-primary font-bold">{item.merchantName}</span></span>
                        </div>
                    </div>
                </div>

                {/* Right: Info & Price */}
                <div className="flex flex-col items-end shrink-0 w-full md:w-[200px] space-y-4 sm:space-y-3 pt-2 sm:pt-0">
                    <div className="text-[13px] font-medium text-slate-600 flex items-center justify-end flex-wrap gap-1 w-full">
                        <div className="bg-gray-400 w-1 h-1 rounded-full shrink-0 mr-1 hidden sm:block" />
                        <span className="truncate">{item.hasFloor ? "Giường nằm" : "Ghế ngồi"}</span>
                        <div className="bg-gray-400 w-1 h-1 rounded-full shrink-0 mx-1" />
                        <span className="text-emerald-700 font-bold whitespace-nowrap">{seats} chỗ trống</span>
                    </div>
                    <div className="text-[22px] sm:text-[24px] font-bold text-brand-accent leading-none block w-full text-right">
                        {formatVnd(price)}
                    </div>
                </div>
            </div>

            {/* Bottom half */}
            {/* Bottom half - Tabs */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white text-[13px] sm:text-[14px] font-medium text-slate-700 overflow-x-auto">
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 mr-4">
                    {[
                        { id: 'seat', label: 'Chọn ghế' },
                        { id: 'schedule', label: 'Lịch trình' },
                        { id: 'transfer', label: 'Trung chuyển' },
                        { id: 'policy', label: 'Chính sách' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`transition-colors py-1 relative ${expandedTab === tab.id ? 'text-brand-primary font-bold' : 'hover:text-brand-primary'}`}
                        >
                            {tab.label}
                            {expandedTab === tab.id && <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-brand-primary" />}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClick}
                    className="px-6 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[13px] hover:bg-brand-primary hover:text-white transition-colors shrink-0"
                >
                    Chọn chuyến
                </button>
            </div>

            {/* Expanded Content Section */}
            {expandedTab && (
                <div className="border-t border-gray-100 bg-[#FDFDFD] p-5 animate-in slide-in-from-top-2 duration-300 max-h-[480px] overflow-y-auto custom-scrollbar">

                    {/* SEAT MAP TAB */}
                    {expandedTab === 'seat' && (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-6 mb-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200" /> Đã bán</div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-slate-200" /> Còn trống</div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-brand-primary/20 border border-brand-primary/30" /> Đang chọn</div>
                            </div>

                            {loadingSeats ? (
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải sơ đồ...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-12 sm:gap-20 justify-center w-full max-w-4xl">
                                    {['lower', 'upper'].map((floor) => {
                                        const floorSeats = seatsData.filter(s => s.floor === floor);
                                        if (floorSeats.length === 0) return null;

                                        const maxCols = Math.max(1, ...floorSeats.map(s => s.colNo || 1));
                                        const maxRows = Math.max(1, ...floorSeats.map(s => s.rowNo || 1));

                                        return (
                                            <div key={floor} className="flex flex-col items-center flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                                    {floor === 'lower' ? 'Tầng dưới' : 'Tầng trên'}
                                                </p>
                                                <div
                                                    className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 grid gap-4"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                                                        gridTemplateRows: `repeat(${maxRows}, minmax(0, 1fr))`
                                                    }}
                                                >
                                                    {floorSeats.map(seat => (
                                                        <div
                                                            key={seat.id}
                                                            style={{ gridColumn: seat.colNo, gridRow: seat.rowNo }}
                                                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all
                                                                ${seat.status === 'occupied' ? 'bg-slate-200 border-transparent text-slate-400' : 'bg-white border-slate-200 text-brand-primary shadow-sm'}
                                                            `}
                                                        >
                                                            {seat.number}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SCHEDULE TAB */}
                    {expandedTab === 'schedule' && (
                        <div className="max-w-2xl mx-auto py-4">
                            <div className="space-y-0 relative before:absolute before:left-[60px] before:top-2 before:bottom-6 before:w-px before:bg-slate-300">
                                {(() => {
                                    const stopsToRender: any[] = [];
                                    const [baseH, baseM] = (item.rawDepartureTime || "00:00").split(':').map(Number);
                                    const baseMinutes = baseH * 60 + baseM;

                                    // Origin Point
                                    if (item.originDepartmentName) {
                                        stopsToRender.push({
                                            id: 'origin',
                                            stopName: item.originDepartmentName,
                                            stopCity: item.originName,
                                            isOrigin: true,
                                            timeString: item.rawDepartureTime || "--:--",
                                            stopAddress: "Điểm xuất phát chuyến",
                                            absoluteMinutes: baseMinutes
                                        });
                                    }

                                    // Transit Points
                                    const transitStops = [...(item.routePoints || item.stopPoints || [])];
                                    transitStops.forEach((stop: any) => {
                                        let scheduledTime = "--:--";
                                        let absMin = baseMinutes;
                                        if (item.rawDepartureTime && stop.timeAtDepartment !== undefined) {
                                            absMin = baseMinutes + stop.timeAtDepartment;
                                            
                                            let h = Math.floor(absMin / 60) % 24;
                                            if (h < 0) h += 24;
                                            let m = absMin % 60;
                                            if (m < 0) m += 60;
                                            
                                            scheduledTime = `${pad2(h)}:${pad2(m)}`;
                                        }
                                        stopsToRender.push({
                                            ...stop,
                                            isTransit: true,
                                            timeString: scheduledTime,
                                            absoluteMinutes: absMin
                                        });
                                    });

                                    // Destination Point
                                    if (item.destinationDepartmentName) {
                                        let destBaseH = 0, destBaseM = 0;
                                        if (item.rawArrivalTime) {
                                            const [dh, dm] = item.rawArrivalTime.split(':').map(Number);
                                            destBaseH = dh;
                                            destBaseM = dm;
                                        }
                                        let destAbsMin = destBaseH * 60 + destBaseM;
                                        if (destAbsMin < baseMinutes) {
                                            destAbsMin += 24 * 60;
                                        }

                                        stopsToRender.push({
                                            id: 'destination',
                                            stopName: item.destinationDepartmentName,
                                            stopCity: item.destinationName,
                                            isDestination: true,
                                            timeString: item.rawArrivalTime || "--:--",
                                            stopAddress: "Điểm kết thúc chuyến",
                                            absoluteMinutes: destAbsMin
                                        });
                                    }

                                    // Sort by absolute time
                                    stopsToRender.sort((a, b) => a.absoluteMinutes - b.absoluteMinutes);

                                    return stopsToRender.map((stop: any, idx: number, arr: any[]) => {
                                        const isOrigin = stop.isOrigin === true;
                                        const isDestination = stop.isDestination === true;
                                        const isHighlighted = isOrigin || isDestination;
                                        
                                        const borderColor = isOrigin ? 'border-brand-primary' : isDestination ? 'border-brand-accent' : 'border-slate-400';
                                        const bgColor = isOrigin ? 'bg-brand-primary' : isDestination ? 'bg-brand-accent' : 'bg-slate-400';

                                        return (
                                            <div key={stop.id} className="relative pl-[80px] pb-8 last:pb-0 group">
                                                {/* Time Display */}
                                                <div className="absolute left-0 top-[-2px] w-12 text-left">
                                                    <span className={`text-[15px] font-bold tracking-tight ${isHighlighted ? 'text-slate-900' : 'text-slate-800'}`}>
                                                        {stop.timeString}
                                                    </span>
                                                </div>

                                                {/* Timeline Node */}
                                                <div className={`absolute left-[54px] top-1.5 w-[13px] h-[13px] rounded-full border-[2.5px] bg-white z-10 flex items-center justify-center ${borderColor}`}>
                                                    <div className={`w-[5px] h-[5px] rounded-full ${bgColor}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex flex-col -mt-[2px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[14px] font-bold text-slate-800">
                                                            {stop.stopName || `Trạm dừng ${stop.stopOrder}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed pr-4">
                                                        {stop.stopAddress || "Đang cập nhật địa chỉ..."}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                                    Lưu ý: Thời gian các mốc lịch trình là thời gian dự kiến. Lịch trình này có thể thay đổi tùy vào tình hình thực tế xuất bến sớm hay trễ.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TRANSFER TAB */}
                    {expandedTab === 'transfer' && (
                        <div className="max-w-3xl mx-auto py-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                    <Bus className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Thông tin đón/ trả tận nơi</h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Thời gian nhận khách', value: 'Trước 4 tiếng.', icon: Clock },
                                    { label: 'Thời gian xe đón', value: 'Chuẩn bị trước 2 - 3 tiếng. Tài xế sẽ liên hệ hẹn giờ cụ thể tùy theo mật độ giao thông.', icon: AlertCircle },
                                    { label: 'Hẻm nhỏ', value: 'Xe trung chuyển sẽ đón Khách tại đầu hẻm hoặc đầu đường nếu xe không thể quay đầu.', icon: MapPin },
                                    { label: 'Khu vực cấm dừng đỗ', value: 'Xe sẽ đón tại vị trí gần nhất có thể theo quy định giao thông.', icon: X },
                                    { label: 'Quy định hành lý', value: 'Hành lý nhỏ gọn dưới 20kg. Không vận chuyển động vật, thú cưng hoặc hàng hóa có mùi, chảy nước.', icon: Info }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-primary/30 transition-all group shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-brand-primary/5">
                                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            <p className="text-[13px] font-bold text-slate-700 leading-relaxed">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* POLICY TAB */}
                    {expandedTab === 'policy' && (
                        <div className="max-w-4xl mx-auto py-6 pr-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-[14px] font-black text-slate-900 mb-5 flex items-center gap-3">
                                        <div className="w-2 h-5 bg-brand-primary rounded-full" />
                                        Chính sách huỷ vé
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3 text-[13px] font-bold text-slate-600 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
                                            Chỉ được chuyển đổi vé 1 lần duy nhất
                                        </li>
                                        <li className="flex gap-3 text-[13px] font-bold text-slate-600 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
                                            Phí hủy từ 10% – 30% tùy thời điểm.
                                        </li>
                                        <li className="flex gap-3 text-[12px] font-medium text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                                            Liên hệ tổng đài 1900 6067 trước ít nhất 24h để được hỗ trợ thay đổi.
                                        </li>
                                    </ul>
                                </section>

                                <section className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-[14px] font-black text-slate-900 mb-5 flex items-center gap-3">
                                        <div className="w-2 h-5 bg-brand-accent rounded-full" />
                                        Yêu cầu khi lên xe
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            'Có mặt trước 30-60 phút tại văn phòng',
                                            'Xuất trình vé qua SMS/Email/App',
                                            'Không mang thức ăn/đồ uống có mùi',
                                            'Không hút thuốc, chất kích thích',
                                            'Không mang động vật lên xe'
                                        ].map((text, idx) => (
                                            <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl text-[12px] font-bold text-slate-700">
                                                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                                                {text}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="p-6 bg-brand-primary/[0.02] rounded-[2rem] border border-brand-primary/10 md:col-span-2">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <h4 className="text-[13px] font-black text-slate-900 mb-3 uppercase tracking-wider">Hành lý & Trẻ em</h4>
                                            <ul className="space-y-2 text-[12px] font-bold text-slate-600">
                                                <li>• Hành lý xách tay tối đa 20kg.</li>
                                                <li>• Trẻ em dưới 6 tuổi (cao &lt; 1.3m) miễn phí vé.</li>
                                                <li>• Mỗi người lớn kèm tối đa 1 trẻ em.</li>
                                            </ul>
                                        </div>
                                        <div className="w-px bg-brand-primary/10 hidden md:block" />
                                        <div className="flex-1">
                                            <h4 className="text-[13px] font-black text-slate-900 mb-3 uppercase tracking-wider">Lưu ý chung</h4>
                                            <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                                                Quý khách có nhu cầu đón đường vui lòng liên hệ trước ít nhất 2 tiếng. Chúng tôi chỉ hỗ trợ đón tại các điểm thuận tiện trên lộ trình.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
