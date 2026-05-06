import { useState, useEffect } from "react";
import {
  Plus, MapPin,
  ChevronLeft, ChevronRight, X, Loader2, Save,
  Info, MoreHorizontal, Edit3, Navigation
} from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";

interface Department {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  timeAtDepartment: number;
  openingTime: string;
  closingTime: string;
  latitude: number;
  longitude: number;
  status: string;
  shuttleService: boolean;
}

export function MerchantOperationPointPage() {
  const [points, setPoints] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "DEPARTMENT",
    address: "",
    provinceId: "",
    districtId: "",
    wardId: "",
    timeAtDepartment: 0,
    openingTime: "00:00",
    closingTime: "23:59",
    latitude: 0,
    longitude: 0,
    status: "ACTIVE",
    shuttleService: true
  });


  const fetchPoints = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers: createAuthorizedEnvelopeHeaders()
        }
      );
      const result = await response.json();
      if (result.data && result.data.items) {
        setPoints(result.data.items);
        setTotalItems(result.data.totalCount || 0);
      }
    } catch (err: any) {
      toast.error("Không thể tải danh sách chi nhánh: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints(page);
  }, [page]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedPoint(null);
    setFormData({
      code: "",
      name: "",
      type: "DEPARTMENT",
      address: "",
      provinceId: "",
      districtId: "",
      wardId: "",
      timeAtDepartment: 0,
      openingTime: "00:00",
      closingTime: "23:59",
      latitude: 0,
      longitude: 0,
      status: "ACTIVE",
      shuttleService: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (point: Department) => {
    setIsEditing(true);
    setSelectedPoint(point);
    setFormData({
      code: point.code,
      name: point.name,
      type: point.type || "DEPARTMENT",
      address: point.address,
      provinceId: point.provinceId || "",
      districtId: point.districtId || "",
      wardId: point.wardId || "",
      timeAtDepartment: point.timeAtDepartment || 0,
      openingTime: point.openingTime || "00:00",
      closingTime: point.closingTime || "23:59",
      latitude: point.latitude || 0,
      longitude: point.longitude || 0,
      status: point.status || "ACTIVE",
      shuttleService: point.shuttleService !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const meta = createRequestMeta();
      const endpoint = isEditing ? "update" : "create";
      const body = {
        ...meta,
        data: isEditing ? { ...formData, id: selectedPoint?.id } : formData
      };

      const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/department/${endpoint}`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isEditing ? "Cập nhật thành công" : "Thêm chi nhánh thành công");
        setIsModalOpen(false);
        fetchPoints(page);
      } else {
        const err = await response.json();
        throw new Error(err.message || "Lỗi hệ thống");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h2 className="text-xl font-black tracking-tight text-slate-900">Chi nhánh</h2>
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hạ tầng vận hành Logistics Hub</p>
         </div>
         <button
             onClick={handleOpenCreate}
             className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all self-start"
         >
             <Plus size={14} />
             Thêm chi nhánh
         </button>
       </div>

      {/* Main Content */}
      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
           <Loader2 className="animate-spin text-brand-primary" size={32} />
           <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang tải...</p>
        </div>
      ) : points.length === 0 ? (
        <div className="h-[450px] flex flex-col items-center justify-center gap-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                <MapPin size={48} />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Chưa có chi nhánh</h3>
                <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Thiết lập mạng lưới các chi nhánh để bắt đầu khai thác tuyến đường.</p>
            </div>
            <button
                onClick={handleOpenCreate}
                className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
            >
                Thiết lập ngay
            </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Chi nhánh</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại hình</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tọa độ</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {points.map((point) => (
                             <tr key={point.id} onClick={() => handleOpenEdit(point)} className="hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                                 <td className="px-6 py-3">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                             <MapPin size={14} />
                                         </div>
                                         <div>
                                             <p className="text-[11px] font-black text-slate-900 leading-none mb-0.5">{point.name}</p>
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REF: {point.code}</p>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-3">
                                     <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                         {point.type === 'DEPARTMENT' ? 'CHI NHÁNH' : point.type}
                                     </span>
                                 </td>
                                 <td className="px-6 py-3">
                                     <p className="text-[11px] font-bold text-slate-500 leading-snug truncate max-w-[200px]">
                                         {point.address}
                                     </p>
                                 </td>
                                 <td className="px-6 py-3">
                                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                         <Navigation size={10} />
                                         <span>{point.latitude}, {point.longitude}</span>
                                     </div>
                                 </td>
                                  <td className="px-6 py-3">
                                     <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                                         point.status === 'ACTIVE'
                                         ? 'bg-emerald-50 text-emerald-600'
                                         : 'bg-slate-50 text-slate-400'
                                     }`}>
                                         <div className={`w-1 h-1 rounded-full ${
                                             point.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                                         }`} />
                                         {point.status || 'ACTIVE'}
                                     </span>
                                 </td>
                                 <td className="px-6 py-3 text-right">
                                     <button className="text-slate-300 hover:text-black p-1">
                                         <MoreHorizontal size={14} />
                                     </button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/50">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center">
                            {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight">
                                {isEditing ? "Cập nhật Chi nhánh" : "Thêm Chi nhánh mới"}
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                {isEditing ? `Ref: ${selectedPoint?.code}` : "Expand operational network"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Mã điểm (Code)</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                placeholder="VD: MĐ-001"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên hiển thị</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="VD: Bến xe Miền Đông"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Địa chỉ chi tiết</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Số nhà, tên đường..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thành phố / Tỉnh (ID)</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.provinceId}
                                onChange={(e) => setFormData({...formData, provinceId: e.target.value})}
                                placeholder="VD: 79 (Hồ Chí Minh)"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Trạng thái</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Tạm ngưng</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Vĩ độ (Latitude)</label>
                            <input
                                type="number" step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Kinh độ (Longitude)</label>
                            <input
                                type="number" step="any"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                        <Info size={14} />
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">Global Network Sync · Verified</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            Lưu chi nhánh
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-10 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Logistics Points: <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{Math.ceil(totalItems / pageSize) || 1}</span>
        </p>
        <div className="flex items-center gap-2">
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all"
            >
                <ChevronLeft size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg">
                {page}
            </div>
            <button
                disabled={page * pageSize >= totalItems}
                onClick={() => setPage(page + 1)}
                className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black disabled:opacity-30 transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
