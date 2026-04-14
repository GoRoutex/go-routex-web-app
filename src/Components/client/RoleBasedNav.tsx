import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, LayoutGrid, ArrowRightLeft } from "lucide-react";
import { hasAdminRole, hasMerchantOwnerRole } from "../../utils/auth";

export function RoleBasedNav() {
  const navigate = useNavigate();
  const isAdmin = hasAdminRole();
  const isMerchant = hasMerchantOwnerRole();
  const [expanded, setExpanded] = useState(false);

  // If no administrative roles, don't show anything
  if (!isAdmin && !isMerchant) return null;

  // Case: Only Admin role
  if (isAdmin && !isMerchant) {
    return (
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors px-4 py-2 rounded-xl hover:bg-slate-50 group"
      >
        <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
        Quản lý hệ thống
      </button>
    );
  }

  // Case: Only Merchant Owner role
  if (!isAdmin && isMerchant) {
    return (
      <button
        onClick={() => navigate("/merchant/portal")}
        className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors px-4 py-2 rounded-xl hover:bg-slate-50 group"
      >
        <Store className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
        Merchant Hub
      </button>
    );
  }

  // Case: Both roles (Admin + Merchant Owner)
  // Shows a toggle logo button that expands into two options
  return (
    <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-2xl border border-slate-100/50">
      <div 
        className={`flex items-center gap-1.5 overflow-hidden transition-all duration-500 ease-out ${
          expanded ? "max-w-[400px] opacity-100 px-1" : "max-w-0 opacity-0 px-0"
        }`}
      >
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-brand-primary transition-all px-3 py-2 rounded-xl hover:bg-white whitespace-nowrap group"
        >
          <LayoutDashboard className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
          Hệ thống
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button
          onClick={() => navigate("/merchant/portal")}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-brand-primary transition-all px-3 py-2 rounded-xl hover:bg-white whitespace-nowrap group"
        >
          <Store className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
          Merchant
        </button>
      </div>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 relative group ${
          expanded 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
            : "bg-white text-brand-primary border border-slate-100 hover:border-brand-primary/20 hover:bg-slate-50"
        }`}
        title="Chuyển đổi quyền quản trị"
      >
        <div className={`transition-transform duration-500 ${expanded ? "rotate-180" : "rotate-0"}`}>
            {expanded ? <ArrowRightLeft className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />}
        </div>
        
        {!expanded && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
            </span>
        )}
      </button>
    </div>
  );
}
