import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  CreditCard,
  Award,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  Trophy,
  UserRound,
  UsersRound,
  Clock3,
  BadgeInfo,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ClientAvatar } from "../../Components/client/ClientAvatar";
import { API_BASE_URL, PROFILE_ME_URL } from "../../utils/api";
import {
  extractMyProfileSnapshot,
  type GetMyProfileSnapshot,
} from "../../utils/responseExtractors";

const genderLabel = (value: string | null) => {
  if (value === "MALE") return "Nam";
  if (value === "FEMALE") return "Nữ";
  if (value === "LGBT") return "LGBT";
  if (value === "OTHER") return "Khác";
  return "Chưa cập nhật";
};

const statusLabel = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "Chưa cập nhật";
  if (normalized === "ACTIVE" || normalized === "ACTIVATED")
    return "Đang hoạt động";
  if (normalized === "INACTIVE") return "Không hoạt động";
  if (normalized === "PENDING") return "Chờ xử lý";
  if (normalized === "LOCKED" || normalized === "BLOCKED") return "Đã khóa";
  return value;
};

const booleanLabel = (value: boolean | null) => {
  if (value === null) return "Chưa cập nhật";
  return value ? "Đã xác thực" : "Chưa xác thực";
};

const formatDateTime = (value: string) => {
  if (!value.trim()) return "Chưa cập nhật";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const formatNumber = (value: string) => {
  if (!value.trim()) return "Chưa cập nhật";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat("vi-VN").format(parsed);
};

const formatCurrency = (value: string) => {
  if (!value.trim()) return "Chưa cập nhật";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(parsed);
};

const formatMembershipValue = (value: string, fallback = "Chưa cập nhật") =>
  value.trim().length > 0 ? value : fallback;

const membershipBadgeLabel = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "Chưa cập nhật";
  if (normalized === "BRONZE") return "Đồng";
  if (normalized === "SILVER") return "Bạc";
  if (normalized === "GOLD") return "Vàng";
  if (normalized === "PLATINUM" || normalized === "DIAMOND") return "Kim cương";
  return value;
};

const priorityLevelLabel = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return "Chưa cập nhật";
  const numeric = Number(normalized);
  if (Number.isFinite(numeric)) {
    return `Cấp ưu tiên ${new Intl.NumberFormat("vi-VN").format(numeric)}`;
  }
  return normalized;
};

const formatPercent = (value: string) => {
  if (!value.trim()) return "Chưa cập nhật";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(parsed)}%`;
};

const formatMultiplier = (value: string) => {
  if (!value.trim()) return "Chưa cập nhật";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return value;
  return `x${new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed)}`;
};

const deriveMembershipProgress = (
  currentPoint: string,
  pointToNextTier: string,
  currentAvailablePoints: string,
  totalPoints: string,
) => {
  const current = Number(currentPoint || currentAvailablePoints);
  const next = Number(pointToNextTier);

  if (
    Number.isFinite(current) &&
    Number.isFinite(next) &&
    current >= 0 &&
    next >= 0
  ) {
    const denominator = current + next;
    if (denominator > 0) {
      return Math.max(
        0,
        Math.min(100, Math.round((current / denominator) * 100)),
      );
    }
  }

  const currentFallback = Number(currentAvailablePoints);
  const totalFallback = Number(totalPoints);
  if (
    !Number.isFinite(currentFallback) ||
    !Number.isFinite(totalFallback) ||
    totalFallback <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round((currentFallback / totalFallback) * 100)),
  );
};

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
  status: localStorage.getItem("profileStatus") || "",
  gender: localStorage.getItem("profileGender") || "",
  avatarUrl: localStorage.getItem("profileAvatarUrl") || "",
  address: localStorage.getItem("profileAddress") || "",
  nationalId:
    localStorage.getItem("profileNationalId") ||
    localStorage.getItem("profileCccdNumber") ||
    "",
  emailVerified: (() => {
    const saved = localStorage.getItem("profileEmailVerified");
    if (saved === null || saved === "") return null;
    return saved === "true";
  })(),
  phoneVerified: (() => {
    const saved = localStorage.getItem("profilePhoneVerified");
    if (saved === null || saved === "") return null;
    return saved === "true";
  })(),
  createdAt: localStorage.getItem("profileCreatedAt") || "",
  updatedAt: localStorage.getItem("profileUpdatedAt") || "",
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
  phoneNumber:
    localStorage.getItem("profilePhone") ||
    localStorage.getItem("userPhoneNumber") ||
    localStorage.getItem("phone") ||
    "",
  customer: {
    customerId:
      localStorage.getItem("customerId") ||
      localStorage.getItem("profileCustomerId") ||
      "",
    fullName:
      localStorage.getItem("profileFullName") ||
      localStorage.getItem("userName") ||
      "",
    tripPoints: localStorage.getItem("profileTripPoints") || "",
    totalTrips: localStorage.getItem("profileTotalTrips") || "",
    totalSpent: localStorage.getItem("profileTotalSpent") || "",
    lastTripAt: localStorage.getItem("profileLastTripAt") || "",
    lastBookingAt: localStorage.getItem("profileLastBookingAt") || "",
  },
});

const writeLocalProfile = (profile: GetMyProfileSnapshot) => {
  const serializeBoolean = (value: boolean | null) =>
    value === null ? "" : String(value);

  localStorage.setItem("userId", profile.userId);
  localStorage.setItem("profileFullName", profile.fullName);
  localStorage.setItem("userName", profile.fullName);
  localStorage.setItem("userEmail", profile.email);
  localStorage.setItem("profilePhone", profile.phone);
  localStorage.setItem("userPhoneNumber", profile.phoneNumber || profile.phone);
  localStorage.setItem("profileStatus", profile.status);
  localStorage.setItem("profileNationalId", profile.nationalId);
  localStorage.setItem("profileCccdNumber", profile.nationalId);
  localStorage.setItem("profileGender", profile.gender);
  localStorage.setItem("profileDob", profile.dob);
  localStorage.setItem("profileAvatarUrl", profile.avatarUrl);
  localStorage.setItem("profileAddress", profile.address);
  localStorage.setItem(
    "profileEmailVerified",
    serializeBoolean(profile.emailVerified),
  );
  localStorage.setItem(
    "profilePhoneVerified",
    serializeBoolean(profile.phoneVerified),
  );
  localStorage.setItem("profileCreatedAt", profile.createdAt);
  localStorage.setItem("profileUpdatedAt", profile.updatedAt);
  localStorage.setItem("membershipId", profile.membership.id);
  localStorage.setItem("membershipCustomerId", profile.membership.customerId);
  localStorage.setItem("membershipTierId", profile.membership.membershipTierId);
  localStorage.setItem(
    "membershipCurrentPoint",
    profile.membership.currentPoint,
  );
  localStorage.setItem(
    "membershipCurrentAvailablePoints",
    profile.membership.currentAvailablePoints,
  );
  localStorage.setItem("membershipTotalPoints", profile.membership.totalPoints);
  localStorage.setItem("membershipPromotedAt", profile.membership.promotedAt);
  localStorage.setItem(
    "membershipDiscountPercent",
    profile.membership.discountPercent,
  );
  localStorage.setItem(
    "membershipPriorityLevel",
    profile.membership.priorityLevel,
  );
  localStorage.setItem("membershipStatus", profile.membership.status);
  localStorage.setItem("membershipStatsTotalTrips", profile.stats.totalTrips);
  localStorage.setItem("membershipBadge", profile.stats.badge);
  localStorage.setItem("membershipStatsTotalSpent", profile.stats.totalSpent);
  localStorage.setItem(
    "membershipPointToNextTier",
    profile.stats.pointToNextTier,
  );
  localStorage.setItem(
    "membershipPointMultiplier",
    profile.stats.pointMultiplier,
  );
  localStorage.setItem("membershipNextTierName", profile.stats.nextTierName);
  localStorage.setItem("userRoles", JSON.stringify(profile.authorities));
  localStorage.setItem(
    "profileAuthorities",
    JSON.stringify(profile.authorities),
  );
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

const formatProfileValue = (value: string, fallback = "Chưa cập nhật") =>
  value.trim().length > 0 ? value : fallback;

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "accent";
};

const toneClasses = {
  default: "bg-slate-50 text-brand-primary",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  accent: "bg-brand-primary/10 text-brand-primary",
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  tone = "default",
}: MetricCardProps) => (
  <div className="rounded-[1.35rem] border border-slate-100 bg-slate-50 p-5">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] ${toneClasses[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          {label}
        </div>
        <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
      </div>
    </div>
  </div>
);

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(readLocalProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    if (!userId.trim()) {
      setIsLoading(false);
      setError("Thiếu userId. Vui lòng đăng nhập lại để tải hồ sơ.");
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
          let message = `Tải hồ sơ thất bại (${response.status})`;
          try {
            const body = await response.json();
            message =
              body?.message ||
              body?.error ||
              body?.detail ||
              body?.title ||
              message;
          } catch {
            // Keep the fallback message when the server does not return JSON.
          }
          throw new Error(message);
        }

        const responseBody: unknown = await response.json();
        const apiProfile = extractMyProfileSnapshot(responseBody);
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
          status: apiProfile.status || cachedProfile.status,
          gender: apiProfile.gender || cachedProfile.gender,
          avatarUrl: apiProfile.avatarUrl || cachedProfile.avatarUrl,
          address: apiProfile.address || cachedProfile.address,
          nationalId: apiProfile.nationalId || cachedProfile.nationalId,
          emailVerified:
            apiProfile.emailVerified ?? cachedProfile.emailVerified ?? null,
          phoneVerified:
            apiProfile.phoneVerified ?? cachedProfile.phoneVerified ?? null,
          createdAt: apiProfile.createdAt || cachedProfile.createdAt,
          updatedAt: apiProfile.updatedAt || cachedProfile.updatedAt,
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
              apiProfile.customer.lastTripAt ||
              cachedProfile.customer.lastTripAt,
            lastBookingAt:
              apiProfile.customer.lastBookingAt ||
              cachedProfile.customer.lastBookingAt,
          },
        };

        setProfile(resolvedProfile);
        writeLocalProfile(resolvedProfile);
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

  const profileItems = useMemo<MetricCardProps[]>(
    () => [
      {
        label: "Họ và tên",
        value: formatProfileValue(
          profile.fullName || profile.customer.fullName || profile.email,
        ),
        icon: UserRound,
        tone: "default" as const,
      },
      {
        label: "Email",
        value: formatProfileValue(profile.email),
        icon: Mail,
        tone: "default" as const,
      },
      {
        label: "Số điện thoại",
        value: formatProfileValue(profile.phone || profile.phoneNumber),
        icon: Phone,
        tone: "default" as const,
      },
      {
        label: "Số CCCD / CMND",
        value: formatProfileValue(profile.nationalId),
        icon: CreditCard,
        tone: "default" as const,
      },
      {
        label: "Giới tính",
        value: genderLabel(profile.gender || null),
        icon: BadgeInfo,
        tone: "default" as const,
      },
      {
        label: "Địa chỉ",
        value: formatProfileValue(profile.address),
        icon: MapPin,
        tone: "default" as const,
      },
    ],
    [profile],
  );

  const accountItems = useMemo<MetricCardProps[]>(
    () => [
      {
        label: "Trạng thái tài khoản",
        value: statusLabel(profile.status),
        icon: ShieldCheck,
        tone: "accent" as const,
      },
      {
        label: "Email xác thực",
        value: booleanLabel(profile.emailVerified),
        icon: Mail,
        tone: profile.emailVerified
          ? ("success" as const)
          : ("warning" as const),
      },
      {
        label: "SĐT xác thực",
        value: booleanLabel(profile.phoneVerified),
        icon: Phone,
        tone: profile.phoneVerified
          ? ("success" as const)
          : ("warning" as const),
      },
      {
        label: "Ngày tạo",
        value: formatDateTime(profile.createdAt),
        icon: CalendarDays,
      },
      {
        label: "Cập nhật lần cuối",
        value: formatDateTime(profile.updatedAt),
        icon: Clock3,
      },
    ],
    [profile],
  );

  const customerStats = useMemo<MetricCardProps[]>(
    () => [
      {
        label: "Điểm tích lũy",
        value: formatNumber(profile.customer.tripPoints),
        icon: Trophy,
        tone: "success" as const,
      },
      {
        label: "Tổng chuyến đi",
        value: formatNumber(profile.customer.totalTrips),
        icon: Ticket,
        tone: "accent" as const,
      },
      {
        label: "Tổng chi tiêu",
        value: formatCurrency(profile.customer.totalSpent),
        icon: UsersRound,
        tone: "warning" as const,
      },
      {
        label: "Chuyến gần nhất",
        value: formatDateTime(profile.customer.lastTripAt),
        icon: CalendarDays,
        tone: "default" as const,
      },
      {
        label: "Đặt vé gần nhất",
        value: formatDateTime(profile.customer.lastBookingAt),
        icon: BadgeCheck,
        tone: "default" as const,
      },
    ],
    [profile],
  );

  const membershipProgress = useMemo(
    () =>
      deriveMembershipProgress(
        profile.membership.currentPoint,
        profile.stats.pointToNextTier,
        profile.membership.totalPoints,
        profile.membership.currentAvailablePoints,
      ),
    [
      profile.membership.currentAvailablePoints,
      profile.membership.currentPoint,
      profile.membership.totalPoints,
      profile.stats.pointToNextTier,
    ],
  );

  const membershipHighlights = useMemo<MetricCardProps[]>(
    () => [
      {
        label: "Badge",
        value: membershipBadgeLabel(
          profile.stats.badge || profile.membership.membershipTierId,
        ),
        icon: Award,
        tone: "accent" as const,
      },
      {
        label: "Điểm hiện tại",
        value: formatNumber(
          profile.membership.currentPoint ||
            profile.membership.currentAvailablePoints,
        ),
        icon: Sparkles,
        tone: "success" as const,
      },
      {
        label: "Điểm tới hạng kế",
        value: formatNumber(profile.stats.pointToNextTier),
        icon: TrendingUp,
        tone: "warning" as const,
      },
    ],
    [
      profile.membership.currentAvailablePoints,
      profile.membership.currentPoint,
      profile.membership.membershipTierId,
      profile.stats.badge,
      profile.stats.pointToNextTier,
    ],
  );

  const membershipDetails = useMemo<MetricCardProps[]>(
    () => [
      {
        label: "Mức ưu tiên",
        value: priorityLevelLabel(profile.membership.priorityLevel),
        icon: ShieldCheck,
        tone: "accent" as const,
      },
      {
        label: "Giảm giá",
        value: formatPercent(profile.membership.discountPercent),
        icon: BadgeCheck,
        tone: "success" as const,
      },
      {
        label: "Hệ số điểm",
        value: formatMultiplier(profile.stats.pointMultiplier),
        icon: Sparkles,
        tone: "warning" as const,
      },
      {
        label: "Hạng tiếp theo",
        value: formatMembershipValue(profile.stats.nextTierName),
        icon: TrendingUp,
        tone: "default" as const,
      },
      {
        label: "Tổng điểm",
        value: formatNumber(profile.membership.totalPoints),
        icon: Trophy,
        tone: "default" as const,
      },
      {
        label: "Lượt đi",
        value: formatNumber(
          profile.stats.totalTrips || profile.customer.totalTrips,
        ),
        icon: Ticket,
        tone: "default" as const,
      },
    ],
    [
      profile.customer.totalTrips,
      profile.membership.discountPercent,
      profile.membership.priorityLevel,
      profile.membership.totalPoints,
      profile.stats.nextTierName,
      profile.stats.pointMultiplier,
      profile.stats.totalTrips,
    ],
  );

  const displayName =
    profile.fullName ||
    profile.customer.fullName ||
    profile.email ||
    "Tài khoản của bạn";
  const avatarSrc = profile.avatarUrl;

  return (
    <div className="min-h-screen bg-brand-surface px-6 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/25 hover:text-brand-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Về trang chủ
        </button>

        <div className="rounded-4xl border border-slate-100 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-10">
          {(isLoading || error) && (
            <div
              className={`mb-6 rounded-[1.2rem] border px-4 py-3 text-sm ${
                error
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
                  {error ||
                    "Đang tải dữ liệu hồ sơ từ máy chủ để đồng bộ thông tin mới nhất."}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-primary">
                Hồ sơ cá nhân
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Đây là nơi bạn xem nhanh thông tin tài khoản, trạng thái xác
                thực và số liệu khách hàng từ hồ sơ của bạn.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile/update")}
              className="inline-flex items-center justify-center rounded-[1.15rem] bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Cập nhật hồ sơ
            </button>
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4">
            <ClientAvatar
              name={displayName}
              avatarUrl={avatarSrc}
              size="lg"
              className="border-slate-200 shadow-sm"
              textClassName="text-lg"
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Ảnh đại diện hiện tại
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {avatarSrc.trim() ? "Đã tải ảnh lên" : "Chưa có ảnh đại diện"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {avatarSrc.trim()
                  ? "Ảnh được lưu dưới dạng base64 hoặc URL."
                  : "Bạn có thể cập nhật ảnh trong Complete Profile."}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-brand-primary/10 bg-linear-to-br from-brand-primary/5 via-white to-brand-accent/5 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-white text-brand-primary shadow-sm">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Membership
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  Hạng hội viên và ưu đãi hiện tại
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Dữ liệu được ghép từ membership và stats của hồ sơ, hiển thị gọn
              ngay dưới avatar.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {membershipHighlights.map((item) => (
                <MetricCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {membershipDetails.map((item) => (
                <MetricCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-white/80 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">
                  {profile.membership.status ||
                    profile.stats.badge ||
                    "Chưa cập nhật"}
                </div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">
                  {membershipProgress}%
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-primary to-brand-accent transition-all"
                  style={{ width: `${membershipProgress}%` }}
                />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                <div>
                  Mã hạng:{" "}
                  {formatMembershipValue(
                    profile.membership.membershipTierId || profile.stats.badge,
                  )}
                </div>
                <div>
                  Ngày thăng hạng:{" "}
                  {formatDateTime(profile.membership.promotedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {profileItems.map((item) => (
              <MetricCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                tone={item.tone}
              />
            ))}
          </div>

          <div className="mt-10 rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-white text-brand-primary shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Thông tin tài khoản
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  Trạng thái và xác thực
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accountItems.map((item) => (
                <MetricCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-white text-brand-primary shadow-sm">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Hồ sơ khách hàng
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  Điểm và lịch sử mua vé
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {customerStats.map((item) => (
                <MetricCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
