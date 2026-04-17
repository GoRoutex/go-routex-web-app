import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Camera,
    CircleAlert,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
    Upload,
    UserRound,
} from "lucide-react";
import { useRef } from "react";
import { ClientAvatar } from "../../Components/client/ClientAvatar";
import {
    API_BASE_URL,
    MEDIA_UPLOAD_URL,
    PROFILE_ME_URL,
    PROFILE_UPDATE_URL,
} from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";
import {
    extractMyProfileSnapshot,
    type GetMyProfileSnapshot,
} from "../../utils/responseExtractors";

type EditableField = "fullName" | "email" | "phoneNumber" | "address" | "avatarUrl";

const emptyProfile = (): GetMyProfileSnapshot => ({
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    status: "",
    gender: "",
    avatarUrl: "",
    address: "",
    nationalId: "",
    emailVerified: null,
    phoneVerified: null,
    createdAt: "",
    updatedAt: "",
    authorities: [],
    membership: {
        id: "",
        customerId: "",
        membershipTierId: "",
        currentPoint: "",
        currentAvailablePoints: "",
        totalPoints: "",
        promotedAt: "",
        discountPercent: "",
        priorityLevel: "",
        status: "",
    },
    stats: {
        totalTrips: "",
        badge: "",
        totalSpent: "",
        pointToNextTier: "",
        pointMultiplier: "",
        nextTierName: "",
    },
    dob: "",
    phoneNumber: "",
    customer: {
        customerId: "",
        fullName: "",
        tripPoints: "",
        totalTrips: "",
        totalSpent: "",
        lastTripAt: "",
        lastBookingAt: "",
    },
});

const readLocalProfile = (): GetMyProfileSnapshot => ({
    ...emptyProfile(),
    userId: localStorage.getItem("userId") || "",
    fullName:
        localStorage.getItem("profileFullName") ||
        localStorage.getItem("userName") ||
        "",
    email: localStorage.getItem("userEmail") || "",
    phone:
        localStorage.getItem("profilePhone") ||
        localStorage.getItem("userPhoneNumber") ||
        "",
    address: localStorage.getItem("profileAddress") || "",
    avatarUrl: localStorage.getItem("profileAvatarUrl") || "",
    phoneNumber:
        localStorage.getItem("profilePhone") ||
        localStorage.getItem("userPhoneNumber") ||
        "",
    membership: {
        id: localStorage.getItem("membershipId") || "",
        customerId:
            localStorage.getItem("membershipCustomerId") ||
            localStorage.getItem("customerId") ||
            "",
        membershipTierId: localStorage.getItem("membershipTierId") || "",
        currentPoint: localStorage.getItem("membershipCurrentPoint") || "",
        currentAvailablePoints:
            localStorage.getItem("membershipCurrentAvailablePoints") || "",
        totalPoints: localStorage.getItem("membershipTotalPoints") || "",
        promotedAt: localStorage.getItem("membershipPromotedAt") || "",
        discountPercent: localStorage.getItem("membershipDiscountPercent") || "",
        priorityLevel: localStorage.getItem("membershipPriorityLevel") || "",
        status: localStorage.getItem("membershipStatus") || "",
    },
    stats: {
        totalTrips: localStorage.getItem("membershipStatsTotalTrips") || "",
        badge: localStorage.getItem("membershipBadge") || "",
        totalSpent: localStorage.getItem("membershipStatsTotalSpent") || "",
        pointToNextTier: localStorage.getItem("membershipPointToNextTier") || "",
        pointMultiplier: localStorage.getItem("membershipPointMultiplier") || "",
        nextTierName: localStorage.getItem("membershipNextTierName") || "",
    },
    customer: {
        ...emptyProfile().customer,
        fullName:
            localStorage.getItem("profileFullName") ||
            localStorage.getItem("userName") ||
            "",
    },
});

const writeBackProfile = (profile: GetMyProfileSnapshot) => {
    localStorage.setItem("userId", profile.userId);
    localStorage.setItem("profileFullName", profile.fullName);
    localStorage.setItem("userName", profile.fullName);
    localStorage.setItem("userEmail", profile.email);
    localStorage.setItem("profilePhone", profile.phone);
    localStorage.setItem("userPhoneNumber", profile.phoneNumber || profile.phone);
    localStorage.setItem("profileAddress", profile.address);
    localStorage.setItem("profileAvatarUrl", profile.avatarUrl);
    localStorage.setItem("profileStatus", profile.status);
    localStorage.setItem("profileNationalId", profile.nationalId);
    localStorage.setItem("profileCccdNumber", profile.nationalId);
    localStorage.setItem("profileGender", profile.gender);
    localStorage.setItem("profileDob", profile.dob);
    localStorage.setItem("profileEmailVerified", profile.emailVerified === null ? "" : String(profile.emailVerified));
    localStorage.setItem("profilePhoneVerified", profile.phoneVerified === null ? "" : String(profile.phoneVerified));
    localStorage.setItem("profileCreatedAt", profile.createdAt);
    localStorage.setItem("profileUpdatedAt", profile.updatedAt);
    localStorage.setItem("membershipId", profile.membership.id);
    localStorage.setItem("membershipCustomerId", profile.membership.customerId);
    localStorage.setItem("membershipTierId", profile.membership.membershipTierId);
    localStorage.setItem("membershipCurrentPoint", profile.membership.currentPoint);
    localStorage.setItem(
        "membershipCurrentAvailablePoints",
        profile.membership.currentAvailablePoints,
    );
    localStorage.setItem("membershipTotalPoints", profile.membership.totalPoints);
    localStorage.setItem("membershipPromotedAt", profile.membership.promotedAt);
    localStorage.setItem("membershipDiscountPercent", profile.membership.discountPercent);
    localStorage.setItem("membershipPriorityLevel", profile.membership.priorityLevel);
    localStorage.setItem("membershipStatus", profile.membership.status);
    localStorage.setItem("membershipStatsTotalTrips", profile.stats.totalTrips);
    localStorage.setItem("membershipBadge", profile.stats.badge);
    localStorage.setItem("membershipStatsTotalSpent", profile.stats.totalSpent);
    localStorage.setItem("membershipPointToNextTier", profile.stats.pointToNextTier);
    localStorage.setItem("membershipPointMultiplier", profile.stats.pointMultiplier);
    localStorage.setItem("membershipNextTierName", profile.stats.nextTierName);
    localStorage.setItem("userRoles", JSON.stringify(profile.authorities));
    localStorage.setItem("profileAuthorities", JSON.stringify(profile.authorities));
    localStorage.setItem("userRole", profile.authorities[0] || "");
    localStorage.setItem("profileRole", profile.authorities[0] || "");
    localStorage.setItem("customerId", profile.customer.customerId);
    localStorage.setItem("profileCustomerId", profile.customer.customerId);
    localStorage.setItem("profileTripPoints", profile.customer.tripPoints);
    localStorage.setItem("profileTotalTrips", profile.customer.totalTrips);
    localStorage.setItem("profileTotalSpent", profile.customer.totalSpent);
    localStorage.setItem("profileLastTripAt", profile.customer.lastTripAt);
    localStorage.setItem("profileLastBookingAt", profile.customer.lastBookingAt);
};

const normalize = (value: string) => value.trim();

const extractErrorMessage = async (response: Response, fallback: string) => {
    try {
        const body = await response.json();
        return body?.message || body?.error || body?.detail || body?.title || fallback;
    } catch {
        return fallback;
    }
};

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

export default function UpdateProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(readLocalProfile);
    const [initialProfile, setInitialProfile] = useState(readLocalProfile);
    const [fullName, setFullName] = useState(profile.fullName || profile.customer.fullName || "");
    const [email, setEmail] = useState(profile.email || "");
    const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || profile.phone || "");
    const [address, setAddress] = useState(profile.address || "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId") || "";
        if (!userId.trim()) {
            setIsLoading(false);
            setError("Thiếu userId. Vui lòng đăng nhập lại để cập nhật hồ sơ.");
            return;
        }

        const controller = new AbortController();

        const loadProfile = async () => {
            setIsLoading(true);
            setError("");

            try {
                const authToken = localStorage.getItem("authToken") || "";
                const response = await fetch(
                    `${API_BASE_URL}${PROFILE_ME_URL}?userId=${encodeURIComponent(userId.trim())}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            ...(authToken.trim()
                                ? { Authorization: `Bearer ${authToken.trim()}` }
                                : {}),
                        },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    const message = await extractErrorMessage(
                        response,
                        `Tải hồ sơ thất bại (${response.status})`,
                    );
                    throw new Error(message);
                }

                const body: unknown = await response.json();
                const apiProfile = extractMyProfileSnapshot(body);
                const cachedProfile = readLocalProfile();
                const resolvedProfile: GetMyProfileSnapshot = {
                    ...cachedProfile,
                    ...apiProfile,
                    userId: apiProfile.userId || cachedProfile.userId || userId.trim(),
                    fullName:
                        apiProfile.fullName ||
                        apiProfile.customer.fullName ||
                        cachedProfile.fullName,
                    email: apiProfile.email || cachedProfile.email,
                    phone: apiProfile.phone || cachedProfile.phone,
                    phoneNumber:
                        apiProfile.phoneNumber ||
                        apiProfile.phone ||
                        cachedProfile.phoneNumber,
                    address: apiProfile.address || cachedProfile.address,
                    avatarUrl: apiProfile.avatarUrl || cachedProfile.avatarUrl,
                    membership: {
                        id: apiProfile.membership.id || cachedProfile.membership.id,
                        customerId:
                            apiProfile.membership.customerId ||
                            cachedProfile.membership.customerId ||
                            apiProfile.customer.customerId ||
                            cachedProfile.customer.customerId,
                        membershipTierId:
                            apiProfile.membership.membershipTierId ||
                            cachedProfile.membership.membershipTierId,
                        currentPoint:
                            apiProfile.membership.currentPoint ||
                            apiProfile.membership.currentAvailablePoints ||
                            cachedProfile.membership.currentPoint,
                        currentAvailablePoints:
                            apiProfile.membership.currentAvailablePoints ||
                            apiProfile.membership.currentPoint ||
                            cachedProfile.membership.currentAvailablePoints,
                        totalPoints:
                            apiProfile.membership.totalPoints ||
                            cachedProfile.membership.totalPoints,
                        promotedAt:
                            apiProfile.membership.promotedAt ||
                            cachedProfile.membership.promotedAt,
                        discountPercent:
                            apiProfile.membership.discountPercent ||
                            cachedProfile.membership.discountPercent,
                        priorityLevel:
                            apiProfile.membership.priorityLevel ||
                            cachedProfile.membership.priorityLevel,
                        status:
                            apiProfile.membership.status || cachedProfile.membership.status,
                    },
                    stats: {
                        totalTrips:
                            apiProfile.stats.totalTrips || cachedProfile.stats.totalTrips,
                        badge: apiProfile.stats.badge || cachedProfile.stats.badge,
                        totalSpent:
                            apiProfile.stats.totalSpent || cachedProfile.stats.totalSpent,
                        pointToNextTier:
                            apiProfile.stats.pointToNextTier ||
                            cachedProfile.stats.pointToNextTier,
                        pointMultiplier:
                            apiProfile.stats.pointMultiplier ||
                            cachedProfile.stats.pointMultiplier,
                        nextTierName:
                            apiProfile.stats.nextTierName || cachedProfile.stats.nextTierName,
                    },
                    authorities:
                        apiProfile.authorities.length > 0
                            ? apiProfile.authorities
                            : cachedProfile.authorities.length > 0
                                ? cachedProfile.authorities
                                : apiProfile.authorities,
                    dob: apiProfile.dob || cachedProfile.dob,
                    customer: {
                        customerId:
                            apiProfile.customer.customerId ||
                            cachedProfile.customer.customerId,
                        fullName:
                            apiProfile.customer.fullName ||
                            apiProfile.fullName ||
                            cachedProfile.customer.fullName,
                        tripPoints:
                            apiProfile.customer.tripPoints ||
                            cachedProfile.customer.tripPoints,
                        totalTrips:
                            apiProfile.customer.totalTrips ||
                            cachedProfile.customer.totalTrips,
                        totalSpent:
                            apiProfile.customer.totalSpent ||
                            cachedProfile.customer.totalSpent,
                        lastTripAt:
                            apiProfile.customer.lastTripAt || cachedProfile.customer.lastTripAt,
                        lastBookingAt:
                            apiProfile.customer.lastBookingAt ||
                            cachedProfile.customer.lastBookingAt,
                    },
                };

                setProfile(resolvedProfile);
                setInitialProfile(resolvedProfile);
                setFullName(resolvedProfile.fullName || resolvedProfile.customer.fullName || "");
                setEmail(resolvedProfile.email || "");
                setPhoneNumber(resolvedProfile.phoneNumber || resolvedProfile.phone || "");
                setAddress(resolvedProfile.address || "");
                setAvatarUrl(resolvedProfile.avatarUrl || "");
                writeBackProfile(resolvedProfile);
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                setError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "Không thể tải thông tin hồ sơ. Vui lòng thử lại.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProfile();

        return () => controller.abort();
    }, []);

    const displayName = useMemo(
        () => profile.fullName || profile.customer.fullName || profile.email || "Tài khoản của bạn",
        [profile],
    );

    const hasChanges = useMemo(() => {
        const nextValues = {
            fullName: normalize(fullName),
            email: normalize(email),
            phoneNumber: normalize(phoneNumber),
            address: normalize(address),
            avatarUrl: normalize(avatarUrl),
        };

        const initialValues = {
            fullName: normalize(initialProfile.fullName || initialProfile.customer.fullName || ""),
            email: normalize(initialProfile.email || ""),
            phoneNumber: normalize(initialProfile.phoneNumber || initialProfile.phone || ""),
            address: normalize(initialProfile.address || ""),
            avatarUrl: normalize(initialProfile.avatarUrl || ""),
        };

        return (Object.keys(nextValues) as EditableField[]).some(
            (field) => nextValues[field] !== initialValues[field],
        );
    }, [address, avatarUrl, email, fullName, initialProfile, phoneNumber]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setIsUploading(true);

        try {
            const meta = createRequestMeta();
            const formData = new FormData();
            formData.append("requestId", meta.requestId);
            formData.append("requestDateTime", meta.requestDateTime);
            formData.append("channel", meta.channel);

            formData.append(
                "data",
                JSON.stringify({
                    folder: "avatars",
                    publicId: `user_${localStorage.getItem("userId") || "unknown"}_${Date.now()}`,
                }),
            );

            formData.append("file", file);

            const authToken = localStorage.getItem("authToken") || "";
            const response = await fetch(API_BASE_URL + MEDIA_UPLOAD_URL, {
                method: "POST",
                headers: {
                    ...(authToken.trim() ? { Authorization: `Bearer ${authToken.trim()}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                const message = await extractErrorMessage(response, "Không thể tải lên ảnh đại diện.");
                throw new Error(message);
            }

            const result = await response.json();
            const uploadedUrl = result.data?.url || "";
            if (uploadedUrl) {
                setAvatarUrl(uploadedUrl);
            } else {
                throw new Error("Không tìm thấy URL sau khi tải ảnh lên.");
            }
        } catch (err: any) {
            setError(err.message || "Lỗi tải ảnh đại diện.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        setError("");

        const userId = localStorage.getItem("userId") || "";
        if (!userId.trim()) {
            setError("Thiếu userId. Vui lòng đăng nhập lại để cập nhật hồ sơ.");
            return;
        }

        const nextFullName = normalize(fullName);
        const nextEmail = normalize(email);
        const nextPhoneNumber = normalize(phoneNumber);
        const nextAddress = normalize(address);

        const initialValues = {
            fullName: normalize(initialProfile.fullName || initialProfile.customer.fullName || ""),
            email: normalize(initialProfile.email || ""),
            phoneNumber: normalize(initialProfile.phoneNumber || initialProfile.phone || ""),
            address: normalize(initialProfile.address || ""),
        };

        const changes: Partial<Record<EditableField, string>> = {};
        if (nextFullName !== initialValues.fullName) changes.fullName = nextFullName;
        if (nextEmail !== initialValues.email) changes.email = nextEmail;
        if (nextPhoneNumber !== initialValues.phoneNumber) {
            changes.phoneNumber = nextPhoneNumber;
        }
        if (nextAddress !== initialValues.address) changes.address = nextAddress;
        if (avatarUrl !== initialProfile.avatarUrl) changes.avatarUrl = avatarUrl;

        if (Object.keys(changes).length === 0) {
            setError("Bạn chưa thay đổi thông tin nào để cập nhật.");
            return;
        }

        if (changes.email && !isValidEmail(changes.email)) {
            setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(API_BASE_URL + PROFILE_UPDATE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(localStorage.getItem("authToken")?.trim()
                        ? {
                            Authorization: `Bearer ${localStorage.getItem("authToken")!.trim()}`,
                        }
                        : {}),
                },
                body: JSON.stringify({
                    ...createRequestMeta(),
                    userId: userId.trim(),
                    data: changes,
                }),
            });

            if (!response.ok) {
                const message = await extractErrorMessage(
                    response,
                    `Cập nhật hồ sơ thất bại (${response.status})`,
                );
                setError(message);
                return;
            }

            const responseBody: unknown = await response.json().catch(() => null);
            const updatedProfile = extractMyProfileSnapshot(responseBody);
            const resolvedProfile: GetMyProfileSnapshot = {
                ...initialProfile,
                ...updatedProfile,
                userId: userId.trim(),
                fullName:
                    changes.fullName ?? updatedProfile.fullName ?? nextFullName ?? initialProfile.fullName,
                email: changes.email ?? updatedProfile.email ?? nextEmail ?? initialProfile.email,
                phone: updatedProfile.phone || initialProfile.phone,
                phoneNumber:
                    changes.phoneNumber ??
                    updatedProfile.phoneNumber ??
                    nextPhoneNumber ??
                    initialProfile.phoneNumber,
                address:
                    changes.address ?? updatedProfile.address ?? nextAddress ?? initialProfile.address,
                avatarUrl:
                    changes.avatarUrl ?? updatedProfile.avatarUrl ?? avatarUrl ?? initialProfile.avatarUrl,
                membership: {
                    ...initialProfile.membership,
                    ...updatedProfile.membership,
                    customerId:
                        updatedProfile.membership.customerId ||
                        initialProfile.membership.customerId ||
                        userId.trim(),
                },
                stats: {
                    ...initialProfile.stats,
                    ...updatedProfile.stats,
                },
                authorities:
                    updatedProfile.authorities.length > 0
                        ? updatedProfile.authorities
                        : initialProfile.authorities,
                customer: {
                    ...initialProfile.customer,
                    ...updatedProfile.customer,
                    fullName:
                        changes.fullName ??
                        updatedProfile.customer.fullName ??
                        updatedProfile.fullName ??
                        nextFullName ??
                        initialProfile.customer.fullName,
                },
            };

            setProfile(resolvedProfile);
            setInitialProfile(resolvedProfile);
            setFullName(resolvedProfile.fullName || "");
            setEmail(resolvedProfile.email || "");
            setPhoneNumber(resolvedProfile.phoneNumber || "");
            setAddress(resolvedProfile.address || "");
            setAvatarUrl(resolvedProfile.avatarUrl || "");
            writeBackProfile(resolvedProfile);

            navigate("/profile", { replace: true });
        } catch {
            setError("Không thể kết nối tới máy chủ cập nhật hồ sơ. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-surface px-6 py-10 text-slate-900 sm:px-8">
            <div className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/25 hover:text-brand-primary"
                >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Quay lại hồ sơ
                </button>

                <div className="rounded-4xl border border-slate-100 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
                    {(isLoading || error) && (
                        <div
                            className={`mb-6 rounded-[1.2rem] border px-4 py-3 text-sm ${error
                                    ? "border-rose-100 bg-rose-50 text-rose-700"
                                    : "border-brand-primary/10 bg-brand-primary/5 text-slate-600"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {isLoading ? (
                                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-primary" />
                                ) : (
                                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                )}
                                <p className="leading-relaxed">
                                    {error || "Đang tải dữ liệu hồ sơ để chuẩn bị biểu mẫu cập nhật."}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-primary">
                                Cập nhật hồ sơ
                            </p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {displayName}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                                Chỉnh sửa thông tin cá nhân, hệ thống sẽ chỉ gửi những trường bạn
                                vừa thay đổi lên máy chủ.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-[1.15rem] border border-brand-primary/15 bg-brand-primary/5 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-brand-primary">
                            <Save className="h-4 w-4" />
                            {hasChanges ? "Đã có thay đổi" : "Chưa có thay đổi"}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-6 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-6">
                        <div className="relative group">
                            <ClientAvatar
                                name={displayName}
                                avatarUrl={avatarUrl || profile.avatarUrl}
                                size="lg"
                                className="border-white shadow-xl ring-4 ring-slate-100/50"
                                textClassName="text-2xl"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={`absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-white bg-slate-900 text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${isUploading ? "cursor-wait opacity-50" : ""
                                    }`}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Ảnh đại diện
                                    </div>
                                    <div className="mt-1 text-sm font-bold text-slate-900">
                                        {profile.email || "Chào bạn!"}
                                    </div>
                                </div>
                                {avatarUrl !== profile.avatarUrl && (
                                    <div className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 border border-emerald-100">
                                        Ảnh mới chờ lưu
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
                                >
                                    <Upload className="h-3 w-3" />
                                    Tải ảnh lên
                                </button>
                                {avatarUrl && avatarUrl !== initialProfile.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl(initialProfile.avatarUrl || "")}
                                        className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition-all hover:bg-rose-100"
                                    >
                                        Khôi phục
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2.5 block">
                            <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Họ và tên
                            </span>
                            <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
                                    <UserRound className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </label>

                        <label className="space-y-2.5 block">
                            <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Email
                            </span>
                            <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
                                    <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Nhập email"
                                    className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </label>

                        <label className="space-y-2.5 block">
                            <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Số điện thoại
                            </span>
                            <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
                                    <Phone className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Nhập số điện thoại"
                                    className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </label>

                        <label className="space-y-2.5 block">
                            <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Địa chỉ
                            </span>
                            <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
                                    <MapPin className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập địa chỉ"
                                    className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="inline-flex items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isLoading || !hasChanges}
                            className="inline-flex items-center justify-center rounded-[1.15rem] bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang cập nhật
                                </>
                            ) : (
                                "Cập nhật hồ sơ"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
