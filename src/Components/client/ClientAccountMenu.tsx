import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import { ClientAvatar } from "./ClientAvatar";
import { API_BASE_URL, LOGOUT_URL } from "../../utils/api";
import { createRequestMeta } from "../../utils/requestMeta";
import { logout } from "../../utils/auth";

type ClientAccountMenuProps = {
  fullName: string;
  avatarUrl?: string;
  email?: string;
};

export function ClientAccountMenu({
  fullName,
  avatarUrl,
  email,
}: ClientAccountMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutState, setLogoutState] = useState<{
    open: boolean;
    message: string;
    kind: "success" | "error" | "loading";
  }>({
    open: false,
    message: "",
    kind: "success",
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const logoutTimerRef = useRef<number | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      clearLogoutTimer();
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    clearLogoutTimer();
    setOpen(false);
    setLogoutState({
      open: true,
      message: "Đang đăng xuất...",
      kind: "loading",
    });

    const refreshToken =
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("authToken") ||
      "";

    const finalizeLogout = (message: string, kind: "success" | "error") => {
      setLogoutState({
        open: true,
        message,
        kind,
      });

      logoutTimerRef.current = window.setTimeout(() => {
        setLogoutState((current) => ({ ...current, open: false }));
        logout();
      }, 900);
    };

    try {
      await fetch(API_BASE_URL + LOGOUT_URL, {
        method: "POST",
        headers: {
          authorization: "Basic YWRtaW46YWRtaW4=",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...createRequestMeta(),
          data: {
            refreshToken,
          },
        }),
      });
      finalizeLogout("Đã đăng xuất thành công.", "success");
    } catch {
      finalizeLogout("Đăng xuất thất bại, nhưng phiên đăng nhập đã được xóa.", "error");
    }
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary";
  const resolvedDisplayName = fullName;
  const accountEmail =
    (email && email.trim().length > 0)
      ? email.trim()
      : (resolvedDisplayName && resolvedDisplayName.includes("@"))
        ? resolvedDisplayName
        : "";

  return (
    <div ref={rootRef} className="relative">
      {logoutState.open && (
        <div
          className={`fixed right-6 top-6 z-[60] max-w-sm rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all ${
            logoutState.kind === "success"
              ? "border-emerald-100 bg-emerald-50/95 text-emerald-800"
              : logoutState.kind === "error"
                ? "border-rose-100 bg-rose-50/95 text-rose-800"
                : "border-slate-100 bg-white/95 text-slate-700"
          }`}
        >
          <div className="text-xs font-black uppercase tracking-[0.22em] opacity-70">
            {logoutState.kind === "loading"
              ? "Đang xử lý"
              : logoutState.kind === "success"
                ? "Đăng xuất"
                : "Thông báo"}
          </div>
          <div className="mt-1 text-sm font-semibold">{logoutState.message}</div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-3 bg-white border border-slate-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <ClientAvatar name={resolvedDisplayName} avatarUrl={avatarUrl} size="sm" />
        <span className="text-slate-900 text-sm font-bold max-w-[220px] truncate">
          {resolvedDisplayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[280px] overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Tài khoản
              </div>
            <div className="mt-1 text-sm font-black text-slate-900 truncate">
              {resolvedDisplayName}
            </div>
            <div className="mt-0.5 text-xs font-medium text-slate-500 truncate">
              {accountEmail || "Chưa có email"}
            </div>
          </div>

          <div className="my-2 h-px bg-slate-100" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className={itemClass}
          >
            <UserRound className="h-4 w-4" />
            Hồ sơ cá nhân
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className={itemClass}
          >
            <Settings2 className="h-4 w-4" />
            Cài đặt
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/schedules");
            }}
            className={itemClass}
          >
            <History className="h-4 w-4" />
            Lịch sử đặt vé
          </button>

          <div className="my-2 h-px bg-slate-100" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
