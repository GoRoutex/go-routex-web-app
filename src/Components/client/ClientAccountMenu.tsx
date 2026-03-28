import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  History,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";

type ClientAccountMenuProps = {
  displayName: string;
  email?: string;
};

export function ClientAccountMenu({
  displayName,
  email,
}: ClientAccountMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("profileFullName");
    localStorage.removeItem("profileCccdNumber");
    localStorage.removeItem("profileDob");
    localStorage.removeItem("profileAddress");
    setOpen(false);
    navigate("/");
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary";
  const accountEmail =
    email?.trim().length > 0
      ? email.trim()
      : displayName.includes("@")
        ? displayName
        : "";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-3 bg-white border border-slate-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 flex items-center justify-center overflow-hidden border-2 border-white">
          <UserRound className="w-4 h-4 text-brand-primary" />
        </div>
        <span className="text-slate-900 text-sm font-bold max-w-[220px] truncate">
          {displayName}
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
              {displayName}
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
