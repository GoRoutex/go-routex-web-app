import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Hash,
  Mail,
  User,
  Bell,
  Trash2,
} from "lucide-react";
import { useNotifications, type NotificationData } from "../../contexts/NotificationContext";
import { toast } from "react-toastify";

const TYPE_CONFIG: Record<string, { icon: typeof Info; bg: string; color: string; border: string; label: string }> = {
  INFO: { icon: Info, bg: "bg-blue-50/50", color: "text-blue-500", border: "border-blue-100", label: "Thông tin" },
  WARNING: { icon: AlertTriangle, bg: "bg-amber-50/50", color: "text-amber-500", border: "border-amber-100", label: "Cảnh báo" },
  SUCCESS: { icon: CheckCircle, bg: "bg-emerald-50/50", color: "text-emerald-500", border: "border-emerald-100", label: "Thành công" },
  ERROR: { icon: XCircle, bg: "bg-red-50/50", color: "text-red-500", border: "border-red-100", label: "Lỗi" },
  AI_OPTIMIZATION_COMPLETED: { icon: CheckCircle, bg: "bg-violet-50/50", color: "text-violet-500", border: "border-violet-100", label: "Tối ưu AI Hoàn tất" },
};

export function NotificationDetailPage({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isDark, setIsDark] = useState(isDarkMode);

  useEffect(() => {
    const checkTheme = () => {
      const darkMerchant = document.documentElement.dataset.merchantTheme === "dark";
      const darkClass = document.documentElement.classList.contains("dark");
      setIsDark(darkMerchant || darkClass || isDarkMode);
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-merchant-theme", "class"]
    });
    return () => observer.disconnect();
  }, [isDarkMode]);

  useEffect(() => {
    if (!id) return;

    // Find notification in local list
    const found = notifications.find((n) => n._id === id);
    if (found) {
      setNotification(found);
      // Auto mark as read when viewing details
      if (!found.read) {
        markAsRead(id);
      }
    }
  }, [id, notifications, markAsRead]);

  if (!notification) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] gap-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
          <Bell size={32} className="animate-pulse" />
        </div>
        <p className="text-sm font-bold">Không tìm thấy thông báo hoặc đang tải dữ liệu...</p>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
            isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-100 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const { icon: Icon, bg, color, border, label } = TYPE_CONFIG[notification.notificationType] || TYPE_CONFIG.INFO;

  const formattedDate = new Date(notification.receivedAt).toLocaleString("vi-VN", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const handleDelete = async () => {
    if (!notification) return;
    await deleteNotification(notification._id);
    toast.success("Đã xóa thông báo");
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar with back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
              : "bg-white border-slate-100 hover:bg-slate-50 hover:shadow-sm text-slate-600"
          }`}
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isDark
                  ? "bg-red-950/40 border-red-900/50 hover:bg-red-900/40 text-red-500"
                  : "bg-red-50 border-red-100 hover:bg-red-100 text-red-500 hover:shadow-sm"
              }`}
            >
              <Trash2 size={14} /> Xóa
            </button>
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${bg} ${color} ${border}`}
            >
              {label}
            </span>
        </div>
      </div>

      {/* Main card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-colors duration-300 ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-100 text-slate-900 shadow-sm shadow-slate-100/50"
        }`}
      >
        {/* Header content */}
        <div className="flex gap-4 items-start border-b pb-6 border-slate-100 dark:border-slate-800">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${border} ${
              isDark ? "bg-slate-800" : "bg-slate-50"
            }`}
          >
            <Icon size={24} className={color} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
              {notification.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formattedDate}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  notification.read
                    ? isDark
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-100 text-slate-400"
                    : "bg-red-500 text-white"
                }`}
              >
                {notification.read ? "Đã đọc" : "Chưa đọc"}
              </span>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Nội dung thông báo</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {notification.message}
          </p>
        </div>

        {/* Technical meta info */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl text-[12px] font-bold border transition-colors ${
            isDark
              ? "bg-slate-950/40 border-slate-800 text-slate-300"
              : "bg-slate-50/50 border-slate-100/50 text-slate-600"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 shrink-0" />
              <span className="text-slate-400 mr-1">Nhà xe ID:</span>
              <span className="font-mono text-[11px] truncate select-all">{notification.merchantId || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="text-slate-400 mr-1">Email người nhận:</span>
              <span className="truncate select-all">{notification.userEmail || "N/A"}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-slate-400 shrink-0" />
              <span className="text-slate-400 mr-1">Tham chiếu ID:</span>
              <span className="font-mono text-[11px] truncate select-all">{notification.referenceId || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {notification.notificationType === "AI_OPTIMIZATION_COMPLETED" && (
          <div className="flex justify-end pt-4 mt-2">
            <button
              onClick={() => navigate(`/merchant/schedules?view_ai_job=${notification.referenceId}`)}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-950 text-white hover:bg-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-95"
            >
              <CheckCircle size={14} /> Xem Kết Quả Chi Tiết
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
