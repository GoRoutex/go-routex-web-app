import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Home,
  ImageUp,
  Trash2,
  User,
  UserRound,
} from "lucide-react";
import { AuthLayout } from "../../Components/client/AuthLayout";
import { API_BASE_URL, COMPLETE_PROFILE_URL } from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";

type GenderValue = "MALE" | "FEMALE" | "LGBT" | "OTHER";

const extractErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return (
      body?.message || body?.error || body?.detail || body?.title || fallback
    );
  } catch {
    return fallback;
  }
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId") || "",
  );
  const [fullName, setFullName] = useState(
    () =>
      localStorage.getItem("profileFullName") ||
      localStorage.getItem("userName") ||
      "",
  );
  const [nationalId, setNationalId] = useState(
    () =>
      localStorage.getItem("profileNationalId") ||
      localStorage.getItem("profileCccdNumber") ||
      "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem("profileAvatarUrl") || "",
  );
  const [avatarFileName, setAvatarFileName] = useState("");
  const [address, setAddress] = useState(
    () => localStorage.getItem("profileAddress") || "",
  );
  const [gender, setGender] = useState<GenderValue | "">(() => {
    const savedGender = localStorage.getItem("profileGender") || "";
    if (
      savedGender === "MALE" ||
      savedGender === "FEMALE" ||
      savedGender === "LGBT" ||
      savedGender === "OTHER"
    ) {
      return savedGender;
    }
    return "";
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const queryUserId = searchParams.get("userId");
    if (queryUserId?.trim()) {
      const trimmed = queryUserId.trim();
      setUserId(trimmed);
      localStorage.setItem("userId", trimmed);
    }
  }, [searchParams]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarUrl(result);
      setAvatarFileName(file.name);
    };
    reader.onerror = () => {
      setError("Không thể đọc file ảnh đã chọn. Vui lòng thử lại.");
    };
    reader.readAsDataURL(file);
  };

  const handleClearAvatar = () => {
    setAvatarUrl("");
    setAvatarFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit =
    userId.trim().length > 0 &&
    fullName.trim().length > 0 &&
    nationalId.trim().length > 0 &&
    address.trim().length > 0 &&
    gender !== "";

  const handleSubmit = async () => {
    setError("");

    if (!userId.trim()) {
      setError(
        "Thiếu userId. Vui lòng đăng nhập hoặc đăng ký lại để tiếp tục.",
      );
      return;
    }

    if (!canSubmit) {
      setError("Vui lòng điền đầy đủ thông tin cá nhân.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_BASE_URL + COMPLETE_PROFILE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createRequestMeta(),
          data: {
            userId: userId.trim(),
            fullName: fullName.trim(),
            nationalId: nationalId.trim(),
            avatarUrl: avatarUrl.trim(),
            address: address.trim(),
            gender,
          },
        }),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Hoàn thiện hồ sơ thất bại (${response.status})`,
        );
        setError(message);
        return;
      }

      localStorage.setItem("profileCompleted", "true");
      localStorage.setItem("userId", userId.trim());
      localStorage.setItem("profileFullName", fullName.trim());
      localStorage.setItem("userName", fullName.trim());
      localStorage.setItem("profileNationalId", nationalId.trim());
      localStorage.setItem("profileCccdNumber", nationalId.trim());
      localStorage.setItem("profileAvatarUrl", avatarUrl.trim());
      localStorage.setItem("profileAddress", address.trim());
      localStorage.setItem("profileGender", gender);

      navigate("/home", { replace: true });
    } catch {
      setError(
        "Không thể kết nối tới máy chủ hoàn thiện hồ sơ. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      activeTab="login"
      title="Hoàn thiện hồ sơ"
      subtitle="Điền thêm thông tin cá nhân để sử dụng đầy đủ các chức năng đặt vé."
      showTabs={false}
      panelTitle="Hoàn thiện hồ sơ"
      panelSubtitle="Điền thêm thông tin cá nhân để sử dụng đầy đủ các chức năng đặt vé."
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-brand-primary/10 bg-brand-primary/5 px-4 py-3 text-sm text-slate-600">
          <span className="font-black text-brand-primary">Gợi ý:</span> Thông
          tin này giúp xác thực danh tính khi đặt vé và hỗ trợ chăm sóc khách
          hàng tốt hơn.
        </div>

        {!userId.trim() && (
          <div className="rounded-[1.15rem] border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Chưa có <span className="font-black">userId</span>. Bạn vẫn có thể
            nhập dữ liệu, nhưng cần đăng nhập hoặc đăng ký lại để lưu thành
            công.
          </div>
        )}

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Họ và tên
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
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
            Số CCCD / CMND
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <CreditCard className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số CCCD / CMND"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </label>

        <div className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Ảnh đại diện
          </span>
          <div className="rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-slate-200 bg-white">
                {avatarUrl.trim() ? (
                  <img
                    src={avatarUrl.trim()}
                    alt="Ảnh đại diện đã chọn"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageUp className="h-6 w-6 text-slate-400" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-[0.95rem] bg-brand-primary px-4 py-2.5 text-sm font-black text-white transition-all hover:bg-brand-dark">
                    Chọn ảnh
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleClearAvatar}
                      className="inline-flex items-center gap-2 rounded-[0.95rem] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xoá ảnh
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-700">
                    {avatarFileName ||
                      (avatarUrl ? "Đã chọn ảnh đại diện" : "Chưa chọn ảnh")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Giới tính
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <UserRound className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <select
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderValue | "")}
            >
              <option value="" disabled>
                Chọn giới tính
              </option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="LGBT">LGBT</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </label>

        <label className="space-y-2.5 block">
          <span className="ml-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Địa chỉ liên hệ
          </span>
          <div className="group flex items-center gap-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 p-4 transition-all duration-300 focus-within:border-brand-primary/35 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-brand-primary/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-100 bg-white transition-all group-focus-within:border-brand-primary/20">
              <Home className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-primary" />
            </div>
            <input
              type="text"
              placeholder="Nhập địa chỉ liên hệ"
              className="w-full border-none bg-transparent text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[17px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </label>

        {error && (
          <div className="rounded-[1.15rem] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full rounded-[1.25rem] py-[1.05rem] text-lg font-black transition-all shadow-xl ${
            canSubmit && !isSubmitting
              ? "bg-brand-primary text-white shadow-brand-primary/30 hover:-translate-y-1 hover:bg-brand-dark hover:shadow-brand-dark/30"
              : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
          }`}
        >
          {isSubmitting ? "Đang lưu..." : "Hoàn thiện hồ sơ"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all hover:border-brand-primary/20 hover:text-brand-primary"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </AuthLayout>
  );
}
