import { useState, useEffect } from "react";
import { Bus, Plus, Search, Filter, Loader2, AlertCircle, X, Save, Info, Trash2, Edit3 } from "lucide-react";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";
import { toast } from "react-toastify";

const VEHICLE_API_URL = "http://localhost:8083/api/v1/merchant-service/vehicles";

export interface Vehicle {
  vehicleId: string;
  templateId?: string;
  vehiclePlate: string;
  category: string;
  type: string;
  status: string;
  creator?: string;
  manufactureYear?: string;
  manufacturer?: string;
  seatCapacity?: string;
}

export function MerchantVehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vehiclePlate: "",
    category: "",
    type: "",
    status: "AVAILABLE",
    templateId: ""
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${VEHICLE_API_URL}/fetch?pageNumber=1&pageSize=50`, {
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải danh sách đội xe");

      const body = await response.json();
      const data = extractArrayValue(body, ["vehicles", "items", "data", "content", "payload"]) as any[];
      
      const mappedVehicles = (data || []).map((v: any) => ({
        ...v,
        vehicleId: v.vehicleId || v.id || v.id_
      }));

      setVehicles(mappedVehicles);
    } catch (err: any) {
      console.error("Fetch vehicles error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleDetail = async (vehicleId: string) => {
    try {
      setDetailLoading(true);
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${VEHICLE_API_URL}/detail?vehicleId=${vehicleId}`, {
        method: 'GET',
        headers: headers as HeadersInit
      });
      if (response.ok) {
        const body = await response.json();
        const data = body.payload || body.data || body;
        setDetailData(data);
        setIsDetailModalOpen(true);
      } else {
        toast.error("Không thể tải chi tiết phương tiện");
      }
    } catch (err) {
      console.error("Detail error:", err);
      toast.error("Lỗi kết nối");
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplateLoading(true);
      const headers = createAuthorizedEnvelopeHeaders();
      const url = `http://localhost:8083/api/v1/merchant-service/vehicle-templates/fetch?pageNumber=1&pageSize=100&status=ACTIVE`;
      const response = await fetch(url, {
        method: 'GET',
        headers: headers as HeadersInit
      });
      if (response.ok) {
        const body = await response.json();
        const data = extractArrayValue(body, ["vehicleTemplates", "items", "data", "content", "payload"]);
        const mappedTemplates = (data || []).map((t: any) => ({
          ...t,
          templateId: t.templateId || t.id || t.id_
        }));
        setTemplates(mappedTemplates);
      }
    } catch (err: any) {
      console.error("Fetch templates error:", err);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedVehicle(null);
    setFormData({
      vehiclePlate: "",
      category: "",
      type: "",
      status: "AVAILABLE",
      templateId: ""
    });
    fetchTemplates();
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId || (vehicle as any).id,
      vehiclePlate: vehicle.vehiclePlate,
      category: vehicle.category || "",
      type: vehicle.type || "",
      status: vehicle.status || "AVAILABLE",
      templateId: vehicle.templateId || ""
    });
    fetchTemplates();
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVehicle(vehicle);
    setIsDeleteConfirmOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const tpl = templates.find(t => t.templateId === templateId);
    if (tpl) {
      setFormData({
        ...formData,
        templateId: tpl.templateId,
        category: tpl.category,
        type: tpl.type
      });
    } else {
      setFormData({
        ...formData,
        templateId: "",
        category: "",
        type: ""
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle && !formData.templateId) {
      toast.error("Vui lòng chọn mẫu cấu hình xe");
      return;
    }

    setSubmitting(true);
    try {
      const isUpdate = !!selectedVehicle;
      const endpoint = isUpdate ? "update" : "create";
      const meta = createRequestMeta();
      
      const requestData = isUpdate ? {
        creator: localStorage.getItem("userName") || "Phạm Quốc Bảo",
        vehicleId: formData.vehicleId || selectedVehicle?.vehicleId,
        templateId: formData.templateId || "",
        vehiclePlate: formData.vehiclePlate,
        status: formData.status
      } : {
        creator: localStorage.getItem("userName") || "Phạm Quốc Bảo",
        templateId: formData.templateId || "",
        vehiclePlate: formData.vehiclePlate
      };

      const body = {
        ...meta,
        data: requestData
      };

      const response = await fetch(`${VEHICLE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isUpdate ? "Cập nhật phương tiện thành công!" : "Thêm phương tiện mới thành công!");
        setIsEditModalOpen(false);
        fetchVehicles();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || (errData.error && errData.error.description) || "Lỗi khi xử lý phương tiện");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setSubmitting(true);
    try {
      const meta = createRequestMeta();
      const body = {
        ...meta,
        data: {
          vehicleId: selectedVehicle.vehicleId,
          creator: localStorage.getItem("userName") || "System"
        }
      };

      const response = await fetch(`${VEHICLE_API_URL}/delete`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success("Xóa phương tiện thành công!");
        setIsDeleteConfirmOpen(false);
        fetchVehicles();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Không thể xóa phương tiện");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPlate = (val: string) => {
    const raw = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (raw.length <= 2) return raw;
    let province = raw.substring(0, 2);
    let rest = raw.substring(2);
    if (rest.length === 0) return province;
    let series = "";
    let numericStartIdx = 0;
    if (rest.startsWith("LD") || rest.startsWith("NG")) {
      series = rest.substring(0, 2);
      numericStartIdx = 2;
    } else {
      series = rest.substring(0, 1);
      numericStartIdx = 1;
    }
    let digits = rest.substring(numericStartIdx);
    if (digits.length === 0) return `${province}${series}`;
    let formattedDigits = "";
    const cleanDigits = digits.replace(/[^0-9]/g, "").substring(0, 5);
    if (cleanDigits.length <= 3) {
      formattedDigits = cleanDigits;
    } else {
      formattedDigits = `${cleanDigits.substring(0, 3)}.${cleanDigits.substring(3, 5)}`;
    }
    return `${province}${series}-${formattedDigits}`;
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setFormData({ ...formData, vehiclePlate: formatted });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { label: 'Sẵn sàng', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
      case 'BUSY': return { label: 'Đang chạy', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-400' };
      case 'MAINTENANCE': return { label: 'Bảo trì', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' };
      default: return { label: status || 'N/A', color: 'bg-slate-50 text-slate-500', dot: 'bg-slate-300' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Quản lý đội xe</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Quản lý danh sách phương tiện vận hành của nhà xe.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start"
        >
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
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Kiểu xe</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
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
                vehicles.map((v, i) => {
                  const status = getStatusLabel(v.status);
                  return (
                    <tr 
                      key={v.vehicleId || i} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => fetchVehicleDetail(v.vehicleId)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-all">
                            {detailLoading && detailData?.vehicleId === v.vehicleId ? <Loader2 size={18} className="animate-spin" /> : <Bus size={20} />}
                          </div>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{v.vehiclePlate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                          {v.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.type}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                           <Info size={14} />
                           {v.templateId ? "Sử dụng mẫu" : "Thủ công"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${status.color}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleOpenEdit(v, e)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleOpenDelete(v, e)}
                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <Bus size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{detailData.vehiclePlate}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusLabel(detailData.status).color}`}>
                      {getStatusLabel(detailData.status).label}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chi tiết phương tiện ID: {detailData.vehicleId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-3 hover:bg-white rounded-full transition-all text-slate-400 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-3 gap-8 bg-white">
              <div className="col-span-2 grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.category || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kiểu xe</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.type || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hãng sản xuất</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.manufacturer || "Chưa cập nhật"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đời xe</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.manufactureYear || "Chưa cập nhật"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức chứa</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.seatCapacity || "N/A"} chỗ</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhiên liệu</label>
                  <p className="text-sm font-bold text-slate-900">{detailData.fuelType || "DIESEL"}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <Info size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Thông tin hệ thống</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Người tạo</label>
                    <p className="text-xs font-bold text-slate-600">{detailData.creator || "Hệ thống"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ngày tạo</label>
                    <p className="text-xs font-bold text-slate-600">{detailData.createdDate ? new Date(detailData.createdDate).toLocaleDateString('vi-VN') : "Chưa có dữ liệu"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID Mẫu cấu hình</label>
                    <p className="text-[10px] font-mono font-medium text-slate-500 break-all">{detailData.templateId || "Cấu hình thủ công"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-2 text-blue-500">
                <Info size={16} />
                <p className="text-[11px] font-bold">Phương tiện này đang thực hiện lịch trình định kỳ.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setIsDetailModalOpen(false); handleOpenEdit(detailData); }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Bus size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedVehicle ? "Cập nhật phương tiện" : "Thêm xe mới"}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thông tin chi tiết phương tiện</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biển số xe</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: 51F-123.45"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.vehiclePlate}
                    onChange={handlePlateChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mẫu cấu hình xe (Template)</label>
                  <div className="relative">
                    <select 
                      disabled={templateLoading}
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none cursor-pointer disabled:opacity-50"
                      value={formData.templateId || ""}
                      onChange={e => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">-- Chọn mẫu cấu hình --</option>
                      {templates.map((t, i) => (
                        <option key={t.templateId || i} value={t.templateId}>
                          {t.name || t.templateName} ({t.category} - {t.type})
                        </option>
                      ))}
                    </select>
                    {templateLoading && (
                      <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                    )}
                  </div>
                  {!selectedVehicle && (
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter ml-1">
                      * Phân loại và kiểu xe sẽ được tự động áp dụng từ mẫu đã chọn
                    </p>
                  )}
                </div>

                {formData.templateId && !selectedVehicle && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phân loại</label>
                      <div className="px-5 py-3.5 bg-slate-100/50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">
                        {formData.category}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiểu xe</label>
                      <div className="px-5 py-3.5 bg-slate-100/50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">
                        {formData.type}
                      </div>
                    </div>
                  </>
                )}

                {selectedVehicle && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái vận hành</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="AVAILABLE">Sẵn sàng (AVAILABLE)</option>
                        <option value="BUSY">Đang chạy (BUSY)</option>
                        <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã mẫu (Read-only)</label>
                      <div className="px-5 py-3.5 bg-slate-100/50 rounded-2xl text-[10px] font-mono font-bold text-slate-400 border border-slate-100 truncate">
                        {formData.templateId}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                      <Info size={20} />
                  </div>
                  <div>
                      <p className="text-sm font-black text-slate-900">Thông tin đồng bộ</p>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          Khi thêm xe mới, hệ thống sẽ tự động khởi tạo hồ sơ cơ bản. Bạn có thể cập nhật chi tiết bảo trì và các thông số kỹ thuật khác sau khi xe được tạo.
                      </p>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all font-sans"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={submitting}
                  className="px-10 py-3 bg-brand-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 font-sans"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {selectedVehicle ? "Cập nhật" : "Thêm phương tiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Xác nhận xóa xe?</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
              Bạn đang thực hiện xóa phương tiện biển số <span className="font-bold text-slate-900 font-sans">{selectedVehicle.vehiclePlate}</span>. 
              Dữ liệu liên quan đến xe này sẽ bị gỡ bỏ khỏi hệ thống vận hành.
            </p>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all font-sans"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 font-sans"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

