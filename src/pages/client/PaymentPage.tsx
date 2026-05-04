import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    X,
    QrCode,
    Scan,
    CreditCard,
    ExternalLink
} from "lucide-react";
import { createRequestMeta } from "../../utils/requestMeta";

import momoIcon from "../../assets/payment/momo.svg";
import shopeePayIcon from "../../assets/payment/shopeePay.png";
import visaIcon from "../../assets/payment/visa.png";
import vnpayIcon from "../../assets/payment/vnpay.png";
import zalopayIcon from "../../assets/payment/zalopay.svg";

type PaymentMethodId = "zalopay" | "vnpay" | "shopeepay" | "momo" | "visa";

const paymentMethods: Array<{
    id: PaymentMethodId;
    label: string;
    icon: string;
    discount?: string;
    dividerAfter?: boolean;
}> = [
        { id: "zalopay", label: "ZaloPay", icon: zalopayIcon, discount: "Giảm 25% tối đa 20k cho khách lần đầu thanh toán. Giảm tối đa 50k cho đơn từ 500k cho tất cả các giao dịch" },
        { id: "vnpay", label: "VNPay", icon: vnpayIcon },
        { id: "shopeepay", label: "ShopeePay", icon: shopeePayIcon, discount: "Giảm đến 20% tối đa 50k." },
        { id: "momo", label: "MoMo", icon: momoIcon, dividerAfter: true },
        { id: "visa", label: "Thẻ Visa/Master/JCB", icon: visaIcon },
    ];

export default function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        routeData = {
            origin: "An Sương",
            destination: "Đà Lạt",
            routeCode: "AS-DL-01",
            plannedStartTime: new Date().toISOString(),
            price: 364000,
        },
        selectedSeats = [],
        seatCodes = [],
        customerName = "Không xác định",
        customerPhone = "Không xác định",
        customerEmail = "Không xác định",
        pickupPoint,
        dropoffPoint,
        totalAmount = 0,
        booking,
    } = location.state || {};

    const seatsToDisplay = seatCodes.length > 0 ? seatCodes : selectedSeats;

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("vnpay");
    const [timeLeft, setTimeLeft] = useState(300); // Default 5 minutes
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetchingPayment, setIsFetchingPayment] = useState(false);

    // Effect for the timer based on holdUntil
    useEffect(() => {
        if (!booking?.holdUntil) return;

        const calculateTimeLeft = () => {
            const holdUntilTime = new Date(booking.holdUntil).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((holdUntilTime - now) / 1000);
            return diff > 0 ? diff : 0;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [booking?.holdUntil]);

    // Effect to fetch payment URL when method changes
    useEffect(() => {
        const fetchPaymentData = async () => {
            if (!booking?.bookingCode) return;

            setIsFetchingPayment(true);
            try {
                const methodMap: Record<PaymentMethodId, string> = {
                    zalopay: "ZALOPAY",
                    vnpay: "VNPAY",
                    shopeepay: "SHOPEEPAY",
                    momo: "MOMO",
                    visa: "VISA"
                };

                const method = methodMap[paymentMethod];
                const amount = booking.totalAmount || totalAmount;
                const meta = createRequestMeta();
                const url = `http://localhost:8080/api/v1/payment-service/get-payment-url?bookingCode=${booking.bookingCode}&method=${method}&amount=${amount}`;

                const response = await fetch(url, {
                    headers: {
                        'accept': '*/*',
                        'RT-REQUEST_ID': meta.requestId,
                        'RT-REQUEST_DATE_TIME': meta.requestDateTime,
                        'RT-CHANNEL': 'ONL'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setQrCodeUrl(result.data?.qrCodeUrl);
                    setPaymentUrl(result.data?.paymentUrl);
                }
            } catch (err) {
                console.error("Fetch payment URL error:", err);
            } finally {
                setIsFetchingPayment(false);
            }
        };

        fetchPaymentData();
    }, [paymentMethod, booking?.bookingCode, booking?.totalAmount, totalAmount]);

    // Handle timeout: notification and redirect
    useEffect(() => {
        if (timeLeft === 0 && !isSuccess && booking?.holdUntil) {
            alert("Thời gian giữ chỗ của bạn đã hết. Vui lòng thực hiện chọn lại ghế!");
            navigate(-1);
        }
    }, [timeLeft, isSuccess, navigate, booking?.holdUntil]);

    // Polling effect for payment status
    useEffect(() => {
        if (!booking?.bookingCode || isSuccess) return;

        const pollStatus = async () => {
            try {
                const meta = createRequestMeta();
                const url = `http://localhost:8080/api/v1/payment-service/polling/status?bookingCode=${booking.bookingCode}`;

                const response = await fetch(url, {
                    headers: {
                        'accept': '*/*',
                        'RT-REQUEST_ID': meta.requestId,
                        'RT-REQUEST_DATE_TIME': meta.requestDateTime,
                        'RT-CHANNEL': 'ONL'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const status = result.data?.status;

                    if (status === "PAID" || status === "FAILED") {
                        navigate("/payment-result", {
                            state: {
                                status: status,
                                bookingCode: booking.bookingCode,
                                amount: result.data?.amount || totalAmount
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        const interval = setInterval(pollStatus, 5000);
        return () => clearInterval(interval);
    }, [booking?.bookingCode, isSuccess, navigate, totalAmount]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
    };

    const handleSelectMethod = (id: PaymentMethodId) => {
        setPaymentMethod(id);
        if (id === "visa") {
            setShowCardModal(true);
        }
    };

    const handlePay = () => {
        setShowCardModal(false);
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            navigate("/payment-result", {
                state: {
                    status: "PAID",
                    bookingCode: booking?.bookingCode || "BK-MOCK-123",
                    amount: booking?.totalAmount || totalAmount
                }
            });
        }, 1500);
    };

    const formatVnd = (val: number) => {
        return new Intl.NumberFormat("vi-VN").format(val) + "đ";
    };

    const currentMethodLabel = paymentMethods.find(m => m.id === paymentMethod)?.label || "ZaloPay";


    return (
        <div className="min-h-screen bg-white font-sans pb-20">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

                    {/* LEFT: PAYMENT METHODS (4 cols) */}
                    <div className="lg:col-span-4">
                        <h2 className="text-[20px] font-bold text-slate-800 mb-4 px-1">Chọn phương thức thanh toán</h2>
                        <div className="flex flex-col">
                            {paymentMethods.map((method) => (
                                <div key={method.id}>
                                    <label className="flex items-start gap-4 py-4 cursor-pointer group">
                                        <div className="pt-2 flex items-center justify-center shrink-0 pl-1">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={() => handleSelectMethod(method.id)}
                                                className="w-5 h-5 accent-brand-primary cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-10 h-10 min-w-10 border border-slate-100 rounded-lg p-1.5 shadow-sm flex items-center justify-center bg-white overflow-hidden shrink-0 mt-0.5">
                                            <img src={method.icon} alt={method.label} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex flex-col justify-center pt-1.5">
                                            <span className="font-semibold text-[15px] text-slate-800 leading-tight">{method.label}</span>
                                            {method.discount && <span className="text-[12px] text-brand-primary mt-1.5 leading-tight pr-4">{method.discount}</span>}
                                        </div>
                                    </label>
                                    {method.dividerAfter && (
                                        <div className="w-full h-[1px] bg-slate-100 my-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE: QR CODE AND TOTAL (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                        <div className="text-center mb-5">
                            <h3 className="text-[14px] font-medium text-slate-500 mb-1">Tổng thanh toán</h3>
                            <p className="text-[42px] font-bold text-brand-primary leading-none tracking-tight">{formatVnd(totalAmount)}</p>
                        </div>

                        <div className="w-full bg-[#f8f9fa] rounded-2xl p-6 flex flex-col items-center border border-slate-100/50">
                            <p className="text-brand-primary font-semibold text-[13px] mb-6">Thời gian giữ chỗ còn lại {formatTime(timeLeft)}</p>

                            <div className="w-[220px] aspect-square bg-white rounded-xl mb-6 flex items-center justify-center relative p-3 border border-slate-200">
                                {isFetchingPayment ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-2" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Đang tải...</p>
                                    </div>
                                ) : qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                                ) : (
                                    <QrCode className="w-full h-full text-slate-800" strokeWidth={1.5} />
                                )}
                                {!isFetchingPayment && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white p-1.5 rounded w-10 h-10 shadow-sm flex justify-center items-center">
                                            <img src={paymentMethods.find(m => m.id === paymentMethod)?.icon} className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {paymentUrl && (
                                <button
                                    onClick={() => window.open(paymentUrl, '_blank')}
                                    className="w-full max-w-[220px] mb-6 py-3 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
                                >
                                    <ExternalLink size={18} />
                                    <span>Thanh toán ngay</span>
                                </button>
                            )}

                            <h4 className="text-emerald-700 mx-auto font-semibold text-[15px] mb-5 text-center px-4">
                                Hướng dẫn thanh toán bằng {currentMethodLabel}
                            </h4>

                            <div className="space-y-4 w-full px-1">
                                <div className="flex items-start gap-3">
                                    <div className="w-[22px] h-[22px] rounded-full bg-[#6a737b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">1</div>
                                    <p className="text-[13px] font-medium text-slate-800 leading-snug">Mở ứng dụng {currentMethodLabel} hoặc Ngân hàng (Mobile Banking) trên điện thoại</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-[22px] h-[22px] rounded-full bg-[#6a737b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">2</div>
                                    <p className="text-[13px] font-medium text-slate-800 leading-snug flex flex-wrap items-center gap-1">Dùng biểu tượng <Scan className="w-4 h-4 inline-block text-slate-600" /> để quét mã QR</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-[22px] h-[22px] rounded-full bg-[#6a737b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">3</div>
                                    <p className="text-[13px] font-medium text-slate-800 leading-snug">Quét mã ở trang này và thanh toán</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TICKET DETAILS (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Passenger Info */}
                        <div className="bg-white border text-[14px] border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-[16px] font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100/60">Thông tin hành khách</h3>
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500">Họ và tên</span>
                                    <span className="font-semibold text-slate-800 truncate text-right">{customerName}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500">Số điện thoại</span>
                                    <span className="font-semibold text-slate-800 text-right">{customerPhone}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500">Email</span>
                                    <span className="font-semibold text-slate-800 truncate text-right">{customerEmail}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trip Details */}
                        <div className="bg-white border text-[14px] border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100/60">
                                <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                                    Thông tin chuyến đi
                                    <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-brand-primary text-brand-primary flex items-center justify-center text-[10px] font-bold cursor-help">i</div>
                                </h3>
                                <button className="text-brand-primary text-[13px] font-semibold underline hover:text-brand-accent transition">Chi tiết</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500 shrink-0">Tuyến xe</span>
                                    <span className="font-semibold text-slate-800 text-right">{routeData.origin} - {routeData.destination}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500 shrink-0">Thời gian xuất bến</span>
                                    <span className="font-semibold text-emerald-800 text-right">
                                        {routeData.plannedStartTime ? new Date(routeData.plannedStartTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(routeData.plannedStartTime).toLocaleDateString("vi-VN") : "--"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500 shrink-0">Số lượng ghế</span>
                                    <span className="font-semibold text-slate-800 text-right">{selectedSeats.length} Ghế</span>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500 shrink-0">Số ghế</span>
                                    <span className="font-semibold text-emerald-800 text-right max-w-[150px]">{seatsToDisplay.join(", ")}</span>
                                </div>
                                <div className="flex justify-between items-start gap-4 pt-1">
                                    <span className="text-slate-500 shrink-0 mt-0.5">Điểm lên xe</span>
                                    <div className="flex flex-col items-end text-right">
                                        <span className="font-semibold text-slate-800 leading-snug">{pickupPoint?.note || `Trạm ${pickupPoint?.stopOrder || 1}`}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start gap-4">
                                    <span className="text-slate-500 text-[13px] mt-0.5 shrink-0 opacity-80 pt-2">Thời gian tới điểm lên xe</span>
                                    <div className="flex flex-col items-end text-right pt-2">
                                        <span className="text-brand-primary font-semibold text-[13px]">
                                            Trước {routeData.plannedStartTime ? new Date(new Date(routeData.plannedStartTime).getTime() - 15 * 60000).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "--"}
                                        </span>
                                        <span className="text-brand-primary font-semibold text-[13px]">
                                            {routeData.plannedStartTime ? new Date(routeData.plannedStartTime).toLocaleDateString("vi-VN") : "--"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start gap-4 pt-2">
                                    <span className="text-slate-500 shrink-0 mt-0.5">Điểm trả khách</span>
                                    <div className="flex flex-col items-end text-right">
                                        <span className="font-semibold text-slate-800 leading-snug">{dropoffPoint?.note || `Trạm ${dropoffPoint?.stopOrder || 2}`}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-5 mt-1 border-t border-slate-100">
                                    <span className="text-slate-500">Tổng tiền lượt đi</span>
                                    <span className="font-bold text-emerald-800">{formatVnd(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-white border text-[14px] border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-[16px] font-bold text-slate-800 mb-5 flex items-center gap-2 pb-4 border-b border-slate-100/60">
                                Chi tiết giá
                                <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-brand-primary text-brand-primary flex items-center justify-center text-[10px] font-bold cursor-help">i</div>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Giá vé lượt đi</span>
                                    <span className="font-semibold text-brand-primary">{formatVnd(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Phí thanh toán</span>
                                    <span className="font-semibold text-slate-800">0đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-2">
                                    <span className="text-slate-500">Tổng tiền</span>
                                    <span className="font-bold text-brand-primary text-[15px]">{formatVnd(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Modal nhập thông tin thẻ */}
                {showCardModal && (
                    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                            <button onClick={() => setShowCardModal(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-5 border border-slate-100 mt-1">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Thanh toán qua Thẻ</h2>
                            <p className="text-sm text-slate-500 mb-6">Hệ thống thanh toán bảo mật. Vui lòng nhập thông tin thẻ để tiếp tục.</p>

                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Số thẻ {paymentMethod === 'visa' ? 'Visa/MasterCard' : 'ATM'}</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-800 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                                        placeholder="•••• •••• •••• ••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Tên chủ thẻ</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-800 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm uppercase"
                                        placeholder="NGUYEN VAN A"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Ngày hết hạn</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-800 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Mã bảo mật {paymentMethod === 'visa' ? '(CVV)' : ''}</label>
                                        <input
                                            type="password"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-800 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-sm"
                                            placeholder="•••"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowCardModal(false)} className="px-5 py-3 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                    Hủy thao tác
                                </button>
                                <button
                                    onClick={handlePay}
                                    disabled={isProcessing}
                                    className={`flex-1 py-3 rounded-lg font-bold text-white text-[15px] transition-all flex justify-center items-center gap-2 ${isProcessing ? "bg-slate-400" : "bg-brand-primary hover:bg-brand-accent"}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        </>
                                    ) : (
                                        `Thanh toán ${formatVnd(totalAmount)}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
