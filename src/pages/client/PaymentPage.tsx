import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    X,
    QrCode,
    Scan,
    CreditCard,
    ExternalLink,
    Ticket,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import { CAMPAIGN_ENDPOINTS } from "../../utils/api-constants";

import momoIcon from "../../assets/Payment/momo.svg";
import shopeePayIcon from "../../assets/Payment/shopeePay.png";
import visaIcon from "../../assets/Payment/visa.png";
import vnpayIcon from "../../assets/Payment/vnpay.png";
import zalopayIcon from "../../assets/Payment/zalopay.svg";

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
        routeData,
        outboundRouteData,
        returnRouteData,
        tripType = "one-way",
        selectedSeats = [],
        selectedOutboundSeats = [],
        selectedReturnSeats = [],
        seatCodes = [],
        outboundSeatCodes = [],
        returnSeatCodes = [],
        customerName = "Không xác định",
        customerPhone = "Không xác định",
        customerEmail = "Không xác định",
        pickupPoint,
        dropoffPoint,
        totalAmount = 0,
        booking,
    } = location.state || {};

    const seatsToDisplay = tripType === "one-way" ? (seatCodes.length > 0 ? seatCodes : selectedSeats) : [];
    const currentRoute = routeData || outboundRouteData || {
        originName: "Không xác định",
        destinationName: "Không xác định",
        departureTime: new Date().toISOString()
    };

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("vnpay");
    const [timeLeft, setTimeLeft] = useState(300); // Default 5 minutes
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetchingPayment, setIsFetchingPayment] = useState(false);
    const [promotionCode, setPromotionCode] = useState("");
    const [promotionResult, setPromotionResult] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isPaymentFailed, setIsPaymentFailed] = useState(false);
    const [txnCode, setTxnCode] = useState<string | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const paymentWindow = useRef<Window | null>(null);

    const finalTotal = promotionResult?.valid ? promotionResult.finalAmount : totalAmount;
    const discountAmount = promotionResult?.valid ? promotionResult.discountAmount : 0;

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
            const bCode = booking?.bookingCode || booking?.code || booking?.id;
            if (!bCode) return;

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
                const amount = finalTotal;
                const meta = createRequestMeta();
                const bCode = booking?.bookingCode || booking?.code || booking?.id;

                const url = `http://localhost:8080/api/v1/payment-service/get-payment-url?bookingCode=${bCode}&method=${method}&amount=${amount}`;

                const response = await fetch(url, {
                    headers: {
                        'accept': '*/*',
                        'RT-REQUEST-ID': meta.requestId,
                        'RT-REQUEST_DATE_TIME': meta.requestDateTime,
                        'RT-CHANNEL': 'ONL'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setQrCodeUrl(result.data?.qrCodeUrl);
                    setPaymentUrl(result.data?.paymentUrl);
                    if (result.data?.bookingCode) {
                        setTxnCode(result.data.bookingCode);
                    }
                }
            } catch (err) {
                console.error("Fetch payment URL error:", err);
            } finally {
                setIsFetchingPayment(false);
            }
        };

        fetchPaymentData();
    }, [paymentMethod, booking, finalTotal]);

    // Handle timeout: notification and redirect
    useEffect(() => {
        if (timeLeft === 0 && !isSuccess && booking?.holdUntil) {
            alert("Thời gian giữ chỗ của bạn đã hết. Vui lòng thực hiện chọn lại ghế!");
            navigate(-1);
        }
    }, [timeLeft, isSuccess, navigate, booking?.holdUntil]);

    // Persist finalTotal and merchantId in sessionStorage for redirect survival
    useEffect(() => {
        const bCode = booking?.bookingCode || booking?.code || booking?.id;
        if (bCode) {
            sessionStorage.setItem(`amount_${bCode}`, String(finalTotal));
            const mId = booking?.merchantId || routeData?.merchantId || "";
            if (mId) {
                sessionStorage.setItem(`merchant_${bCode}`, mId);
            }
        }
    }, [booking, finalTotal, routeData?.merchantId]);

    // Restore promotion from sessionStorage on refresh
    useEffect(() => {
        const bCode = booking?.bookingCode || booking?.code || booking?.id;
        if (bCode) {
            const savedPromo = sessionStorage.getItem(`promo_${bCode}`);
            if (savedPromo && !promotionResult && !isValidating) {
                setPromotionCode(savedPromo);
                // Trigger validation automatically
                const restorePromo = async () => {
                    // Reuse validation logic directly to avoid DOM dependency
                    try {
                        const meta = createRequestMeta();
                        const mId = booking?.merchantId || routeData?.merchantId || "";
                        const payload = {
                            ...meta,
                            data: {
                                promotionCode: savedPromo,
                                orderAmount: totalAmount,
                                merchantId: mId
                            }
                        };
                        const response = await fetch(CAMPAIGN_ENDPOINTS.VALIDATE, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                ...createXAuthorizedHeaders(meta)
                            },
                            body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if (result.data && result.data.valid) {
                            setPromotionResult(result.data);
                        } else {
                            sessionStorage.removeItem(`promo_${bCode}`);
                        }
                    } catch (e) {
                        console.error("Restore promo error:", e);
                    }
                };
                restorePromo();
            }
        }
    }, [booking]);

    // Polling effect for payment status
    useEffect(() => {
        const bCode = booking?.bookingCode || booking?.code || booking?.id;
        if (!bCode || isSuccess) return;

        let errorCount = 0;

        const pollStatus = async () => {
            try {
                const meta = createRequestMeta();
                const codeToPoll = txnCode || bCode;
                const url = `http://localhost:8080/api/v1/payment-service/polling/status?bookingCode=${codeToPoll}&method=${paymentMethod.toUpperCase()}`;

                const response = await fetch(url, {
                    headers: {
                        'accept': '*/*',
                        'RT-REQUEST-ID': meta.requestId,
                        'RT-REQUEST_DATE_TIME': meta.requestDateTime,
                        'RT-CHANNEL': 'ONL'
                    }
                });

                if (response.ok) {
                    errorCount = 0; // reset on success
                    const result = await response.json();
                    const status = result.data?.status;

                    if (status === "PAID" || status === "FAILED") {
                        if (paymentWindow.current && !paymentWindow.current.closed) {
                            try {
                                paymentWindow.current.close();
                            } catch (e) {
                                console.error("Failed to close payment window:", e);
                            }
                        }
                        const successParam = status === "PAID" ? "success" : "failed";
                        navigate(`/payment-result?status=${successParam}&txnRef=${bCode}`);
                    }
                } else {
                    errorCount++;
                    if (errorCount >= 10) {
                        alert("Hệ thống hiện tại không phản hồi. Vui lòng thử lại sau!");
                        navigate("/");
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
                errorCount++;
                if (errorCount >= 10) {
                    alert("Hệ thống hiện tại không phản hồi. Vui lòng thử lại sau!");
                    navigate("/");
                }
            }
        };

        const interval = setInterval(pollStatus, 5000);
        return () => clearInterval(interval);
    }, [booking, isSuccess, navigate, totalAmount, paymentMethod]);

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

    const handleValidatePromotion = async () => {
        if (!promotionCode.trim()) return;
        setIsValidating(true);
        setPromoError(null);
        try {
            const meta = createRequestMeta();
            const mId = booking?.merchantId || routeData?.merchantId || "";
            const payload = {
                ...meta,
                data: {
                    promotionCode: promotionCode.trim(),
                    orderAmount: totalAmount,
                    merchantId: mId
                }
            };
            const response = await fetch(CAMPAIGN_ENDPOINTS.VALIDATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...createXAuthorizedHeaders(meta)
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.data && result.data.valid) {
                setPromotionResult(result.data);
                setPromoError(null);
                // Persist promo code for this booking
                const bCode = booking?.bookingCode || booking?.code || booking?.id;
                if (bCode) {
                    sessionStorage.setItem(`promo_${bCode}`, promotionCode.trim());
                }
            } else {
                setPromoError(result.data?.message || result.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
                setPromotionResult(null);
            }
        } catch (err) {
            console.error("Validate promotion error:", err);
            setPromoError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
        } finally {
            setIsValidating(false);
        }
    };

    const handlePay = () => {
        setShowCardModal(false);
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            const bCode = booking?.bookingCode || booking?.code || booking?.id || "BK-MOCK-123";
            const amt = booking?.totalAmount || totalAmount;
            const mId = booking?.merchantId || routeData?.merchantId || "";

            sessionStorage.setItem(`amount_${bCode}`, String(amt));
            if (mId) sessionStorage.setItem(`merchant_${bCode}`, mId);
            if (promotionResult?.promotionCode) {
                sessionStorage.setItem(`promo_${bCode}`, promotionResult.promotionCode);
            }

            navigate(`/payment-result?status=success&txnRef=${bCode}`);
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
                            <p className="text-[42px] font-bold text-brand-primary leading-none tracking-tight">{formatVnd(finalTotal)}</p>
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
                                    onClick={() => {
                                        paymentWindow.current = window.open(paymentUrl, '_blank');
                                    }}
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Thông tin hành khách</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Họ và tên</span>
                                    <span className="text-sm font-bold text-slate-900">{customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                                    <span className="text-sm font-bold text-slate-900">{customerPhone}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Email</span>
                                    <span className="text-sm font-bold text-slate-900">{customerEmail}</span>
                                </div>
                            </div>
                        </div>

                        {/* Panel 1: Thông tin chuyến đi */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-base font-bold text-gray-900">Thông tin chuyến đi</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Tuyến xe</span>
                                    <span className="text-sm font-bold text-slate-900">{currentRoute.originName} - {currentRoute.destinationName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Thời gian xuất bến</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {currentRoute.rawDepartureTime || (currentRoute.departureTime ? new Date(currentRoute.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(currentRoute.departureTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--:--')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Số lượng ghế</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {tripType === "one-way" ? selectedSeats.length : selectedOutboundSeats.length} Ghế
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Số ghế</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {tripType === "one-way" ? seatsToDisplay.join(", ") : outboundSeatCodes.join(", ")}
                                    </span>
                                </div>
                                {pickupPoint && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Điểm đón</span>
                                        <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]" title={pickupPoint.note || pickupPoint.address}>{pickupPoint.note || pickupPoint.address || `Trạm ${pickupPoint?.stopOrder || 1}`}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Tổng tiền lượt đi</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {formatVnd(tripType === "one-way" ? totalAmount : selectedOutboundSeats.length * (outboundRouteData?.ticketPrice || 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Panel 2: Thông tin chuyến về (Only for round trip) */}
                        {tripType === "round-trip" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-base font-bold text-gray-900">Thông tin chuyến về</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Tuyến xe</span>
                                        <span className="text-sm font-bold text-slate-900">{returnRouteData?.originName} - {returnRouteData?.destinationName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Thời gian xuất bến</span>
                                        <span className="text-sm font-bold text-emerald-600">
                                            {returnRouteData?.rawDepartureTime || (returnRouteData?.departureTime ? new Date(returnRouteData.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(returnRouteData.departureTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--:--')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Số lượng ghế</span>
                                        <span className="text-sm font-bold text-slate-900">
                                            {selectedReturnSeats.length} Ghế
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Số ghế</span>
                                        <span className="text-sm font-bold text-emerald-600">
                                            {returnSeatCodes.join(", ")}
                                        </span>
                                    </div>
                                    {dropoffPoint && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Điểm đón (lượt về)</span>
                                            <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]" title={dropoffPoint.note || dropoffPoint.address}>{dropoffPoint.note || dropoffPoint.address || `Trạm ${dropoffPoint?.stopOrder || 1}`}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Tổng tiền lượt về</span>
                                        <span className="text-sm font-bold text-emerald-600">
                                            {formatVnd(selectedReturnSeats.length * (returnRouteData?.ticketPrice || 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Promotion Code */}
                        <div className="bg-white border text-[14px] border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-[16px] font-bold text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100/60">
                                <Ticket size={18} className="text-brand-primary" />
                                Mã giảm giá / Ưu đãi
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã khuyến mãi..."
                                        value={promotionCode}
                                        onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                                        disabled={promotionResult?.valid}
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider outline-none focus:border-brand-primary transition-all disabled:opacity-50"
                                    />
                                    {promotionResult?.valid ? (
                                        <button
                                            onClick={() => {
                                                setPromotionResult(null);
                                                setPromotionCode("");
                                            }}
                                            className="px-4 py-2.5 bg-slate-100 text-slate-500 hover:text-red-500 font-bold rounded-xl transition-all"
                                        >
                                            Hủy
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleValidatePromotion}
                                            disabled={isValidating || !promotionCode}
                                            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {isValidating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Áp dụng"}
                                        </button>
                                    )}
                                </div>

                                {promoError && (
                                    <div className="flex items-center gap-2 text-red-500 text-[12px] font-bold px-1">
                                        <AlertCircle size={14} />
                                        {promoError}
                                    </div>
                                )}

                                {promotionResult?.valid && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-emerald-800">Đã áp dụng mã: {promotionResult.promotionCode}</span>
                                            <span className="text-[12px] text-emerald-600 font-medium">{promotionResult.message || `Bạn được giảm ${formatVnd(promotionResult.discountAmount)}`}</span>
                                        </div>
                                    </div>
                                )}
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
                                    <span className="font-semibold text-slate-800">{formatVnd(totalAmount)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Giảm giá khuyến mãi</span>
                                        <span className="font-semibold text-emerald-600">-{formatVnd(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Phí thanh toán</span>
                                    <span className="font-semibold text-slate-800">0đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-2">
                                    <span className="text-slate-500">Tổng thanh toán</span>
                                    <span className="font-bold text-brand-primary text-[20px]">{formatVnd(finalTotal)}</span>
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
                                        `Thanh toán ${formatVnd(finalTotal)}`
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
