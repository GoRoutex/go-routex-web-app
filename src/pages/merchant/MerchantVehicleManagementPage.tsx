import { useState, useEffect } from "react";
import { Bus, Plus, Search, Filter, MoreHorizontal, Loader2, AlertCircle } from "lucide-react";
import { createAuthorizedEnvelopeHeaders } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";

const VEHICLE_API_URL = "http://localhost:8080/api/v1/merchant-service/vehicles/fetch";

export function MerchantVehicleManagementPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${VEHICLE_API_URL}?pageNumber=1&pageSize=10`, {
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải danh sách đội xe");

      const body = await response.json();
      const data = extractArrayValue(body, ["vehicles", "items", "data", "content"]);

      const mappedData = data.map((v: any) => ({
        id: v.vehicleId || v.id || Math.random().toString(),
        plate: v.licensePlate || v.plate || "N/A",
        type: v.vehicleType || v.type || "N/A",
        status: v.status || "Hoạt động",
        year: v.manufactureYear || v.year || "2024",
        nextMaintenance: v.nextMaintenanceDate || v.nextMaintenance || "Chưa cập nhật"
      }));

      setVehicles(mappedData);
    } catch (err: any) {
      console.error("Fetch vehicles error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Quản lý đội xe</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Danh sách phương tiện đang hoạt động của nhà xe.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start">
          <Plus size={18} />
          Thêm xe mới
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo biển số, loại xe..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Lọc
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-20 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang đồng bộ dữ liệu đội xe...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Lỗi kết nối</h3>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchVehicles}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Biển số</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại xe</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Đời xe</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Bảo trì kế tiếp</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-400 text-sm font-medium">Chưa có phương tiện nào trong đội xe.</p>
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <Bus size={20} />
                        </div>
                        <span className="text-sm font-black text-slate-900">{v.plate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.type}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.year}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-500">{v.nextMaintenance}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        v.status === 'Hoạt động' || v.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                        v.status === 'Đang chạy' || v.status === 'RUNNING' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
