import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  X,
  CheckCheck,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNotifications, type NotificationData } from "../../contexts/NotificationContext";

// ─── Toastify-style config per notification type ──────────────────────────────
const TOAST_CONFIG: Record<string, { icon: typeof Info; iconColor: string; barColor: string }> = {
  INFO: { icon: Info, iconColor: "text-blue-500", barColor: "border-l-blue-500" },
  WARNING: { icon: AlertTriangle, iconColor: "text-amber-500", barColor: "border-l-amber-500" },
  SUCCESS: { icon: CheckCircle, iconColor: "text-emerald-500", barColor: "border-l-emerald-500" },
  ERROR: { icon: XCircle, iconColor: "text-red-500", barColor: "border-l-red-500" },
  AI_OPTIMIZATION_COMPLETED: { icon: CheckCircle, iconColor: "text-violet-500", barColor: "border-l-violet-500" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Vừa xong";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// ─── Toastify-like Notification Item ─────────────────────────────────────────
function NotificationItem({
  notification,
  isDarkMode,
  onRead,
  onDelete,
}: {
  notification: NotificationData;
  isDarkMode: boolean;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = TOAST_CONFIG[notification.notificationType] || TOAST_CONFIG.INFO;
  const { icon: Icon, iconColor, barColor } = config;

  return (
    <div
      onClick={() => onRead(notification._id)}
      className={`w-full flex gap-3 p-3.5 rounded-xl border-y border-r text-left transition-all duration-200 group cursor-pointer shadow-sm relative overflow-hidden border-l-4 ${
        notification.read
          ? isDarkMode
            ? "bg-slate-800/30 border-slate-800/50 border-l-slate-600 opacity-60 hover:opacity-80"
            : "bg-slate-50/50 border-slate-100/50 border-l-slate-300 opacity-60 hover:opacity-80"
          : isDarkMode
            ? `bg-slate-900 border-slate-800/60 ${barColor} hover:border-slate-700/80 hover:shadow-black/20`
            : `bg-white border-slate-100/80 ${barColor} hover:shadow-md hover:shadow-slate-100`
      }`}
    >
      {/* Icon Wrapper */}
      <div className="shrink-0 flex items-start pt-0.5">
        <Icon size={16} className={`${notification.read ? "text-slate-450" : iconColor} transition-transform group-hover:scale-110`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[12px] font-bold leading-snug line-clamp-1 ${
            notification.read
              ? isDarkMode ? "text-slate-400" : "text-slate-500"
              : isDarkMode ? "text-slate-100" : "text-slate-900"
          }`}
        >
          {notification.title}
        </p>
        <p
          className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${
            notification.read
              ? isDarkMode ? "text-slate-550" : "text-slate-400"
              : isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {timeAgo(notification.receivedAt)}
            </span>
            {!notification.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
            className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              isDarkMode 
                ? "bg-red-950/60 text-red-400 hover:bg-red-900/80" 
                : "bg-red-50 text-red-500 hover:bg-red-100"
            }`}
            title="Xóa thông báo"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NotificationBell ────────────────────────────────────────────────────────
interface NotificationBellProps {
  isDarkMode?: boolean;
}

export function NotificationBell({ isDarkMode = false }: NotificationBellProps) {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, clearAll, deleteNotification } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(unreadCount);

  // Pulse animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setHasNewPulse(true);
      const t = setTimeout(() => setHasNewPulse(false), 2000);
      return () => clearTimeout(t);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Click-outside to close
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleItemClick = useCallback((n: NotificationData) => {
    markAsRead(n._id);
    setIsOpen(false);

    const currentPath = window.location.pathname;
    const notificationId = n._id;
    if (currentPath.startsWith("/merchant")) {
      window.location.href = `/merchant/notifications/${notificationId}`;
    } else if (currentPath.startsWith("/admin")) {
      window.location.href = `/admin/notifications/${notificationId}`;
    } else {
      window.location.href = `/notifications/${notificationId}`;
    }
  }, [markAsRead]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-black text-white border-black"
            : isDarkMode
              ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
              : "bg-slate-50 border-slate-100 text-slate-400 hover:text-brand-primary hover:border-slate-200"
        }`}
      >
        <Bell size={16} className={hasNewPulse ? "animate-[wiggle_0.5s_ease-in-out_3]" : ""} />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center px-1 shadow-lg shadow-red-500/30 animate-in zoom-in duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Pulse ring */}
        {hasNewPulse && (
          <span className="absolute inset-0 rounded-xl border-2 border-brand-primary animate-ping opacity-50 pointer-events-none" />
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-2xl border shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 ${
            isDarkMode
              ? "bg-slate-900 border-slate-700/50 shadow-black/40"
              : "bg-white border-slate-100 shadow-slate-200/60"
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <h3
                className={`text-[13px] font-black ${
                  isDarkMode ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Connection indicator */}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                  isConnected
                    ? isDarkMode
                      ? "text-emerald-400 bg-emerald-950/40"
                      : "text-emerald-600 bg-emerald-50"
                    : isDarkMode
                      ? "text-red-400 bg-red-950/40"
                      : "text-red-500 bg-red-50"
                }`}
              >
                {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isConnected ? "Live" : "Offline"}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkMode
                    ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Actions bar */}
          {notifications.length > 0 && (
            <div
              className={`px-5 py-2.5 flex items-center justify-between border-b shrink-0 ${
                isDarkMode ? "border-slate-800" : "border-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={markAllAsRead}
                className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  isDarkMode
                    ? "text-slate-500 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <CheckCheck size={12} />
                Đánh dấu đọc hết
              </button>
              <button
                type="button"
                onClick={clearAll}
                className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  isDarkMode
                    ? "text-slate-500 hover:text-red-400"
                    : "text-slate-400 hover:text-red-500"
                }`}
              >
                <Trash2 size={12} />
                Xoá tất cả
              </button>
            </div>
          )}

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isDarkMode ? "bg-slate-800" : "bg-slate-50"
                  }`}
                >
                  <Bell size={24} className="text-slate-300" />
                </div>
                <p
                  className={`text-[12px] font-bold ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Chưa có thông báo nào
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  isDarkMode={isDarkMode}
                  onRead={() => handleItemClick(n)}
                  onDelete={(id) => deleteNotification(id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
