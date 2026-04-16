import { useState, useEffect } from "react";
import {
  Plus, MapPin,
  ChevronLeft, ChevronRight, X, Loader2, Save,
  Info, Map, MoreHorizontal, Edit3, Trash2, Navigation, AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";

interface OperationPoint {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
}

export function MerchantOperationPointPage() {
  const [points, setPoints] = useState<OperationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<OperationPoint | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "OPERATION_POINT",
    address: "",
    city: "",
    latitude: 0,
    longitude: 0,
    status: "ACTIVE"
  });


  const fetchPoints = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/fetch?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
      toast.error("Không thể tải danh sách điểm: " + err.message);
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
      type: "OPERATION_POINT",
      address: "",
      city: "",
      latitude: 0,
      longitude: 0,
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (point: OperationPoint) => {
    setIsEditing(true);
    setSelectedPoint(point);
    setFormData({
      code: point.code,
      name: point.name,
      type: point.type || "OPERATION_POINT",
      address: point.address,
      city: point.city,
      latitude: point.latitude,
      longitude: point.longitude,
      status: point.status || "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (point: OperationPoint) => {
    if (!window.confirm(`Bạn có chắc muốn xóa điểm ${point.name} (${point.code})?`)) return;

    try {
        const meta = createRequestMeta();
        const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/delete`, {
            method: 'POST',
            headers: {
                ...createAuthorizedEnvelopeHeaders(meta),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...meta,
                data: { operationPointId: point.id }
            })
        });

        if (response.ok) {
            toast.success("Đã xóa điểm thành công");
            fetchPoints(page);
        } else {
            throw new Error("Lỗi khi xóa");
        }
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const meta = createRequestMeta();
      const endpoint = isEditing ? "update" : "create";
      const body = {
        ...meta,
        data: isEditing ? { ...formData, operationPointId: selectedPoint?.id } : formData
      };

      const response = await fetch(`${ADMIN_MERCHANT_ACTION_BASE_URL}/operation-point/${endpoint}`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isEditing ? "Cập nhật thành công" : "Thêm điểm thành công");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-[1.75rem] font-black tracking-tight text-slate-900 leading-tight">Điểm đón & Trả khách</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
            Hạ tầng vận hành · Hub Logistics
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
            >
                <Plus size={18} />
                Thêm điểm mới
            </button>
        </div>
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
                <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Chưa có điểm đón/trả</h3>
                <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Thiết lập mạng lưới các điểm dừng chân để bắt đầu khai thác tuyến đường.</p>
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
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Điểm đón/trả</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại hình</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tọa độ</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {points.map((point) => (
                            <tr key={point.id} onClick={() => handleOpenEdit(point)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{point.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã: {point.code}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {point.type === 'OPERATION_POINT' ? 'TRẠM DỪNG' : point.type}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-slate-500 leading-snug truncate max-w-[200px]">
                                        {point.address}, {point.city}
                                    </p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-0.5 text-[11px] font-black text-slate-400">
                                        <p>Lat: {point.latitude}</p>
                                        <p>Lng: {point.longitude}</p>
                                    </div>
                                </td>
                                 <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                                        point.status === 'ACTIVE'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-slate-50 text-slate-400'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            point.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />
                                        {point.status || 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all">
                                        <MoreHorizontal size={18} />
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
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/50">
                {/* Modal Header */}
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-xl shadow-brand-primary/20">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                                {isEditing ? "Cập nhật Điểm đón/trả" : "Thêm Điểm đón/trả mới"}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-xs">
                                {isEditing ? `ID: ${selectedPoint?.id}` : "Mở rộng mạng lưới vận hành"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Mã điểm (Code)</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                placeholder="VD: MĐ-001"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên hiển thị</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="VD: Bến xe Miền Đông"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Địa chỉ chi tiết</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Số nhà, tên đường..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thành phố / Tỉnh</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                placeholder="VD: Hồ Chí Minh"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Trạng thái</label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none"
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
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Kinh độ (Longitude)</label>
                            <input
                                type="number" step="any"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                        <Info size={16} />
                        <p className="text-[9px] font-black uppercase tracking-widest">Hệ thống sẽ đồng bộ điểm dừng này lên bản đồ toàn cầu</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Lưu cấu trúc điểm
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
