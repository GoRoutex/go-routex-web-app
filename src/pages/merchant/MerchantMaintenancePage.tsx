import { useState, useEffect } from "react";
import { Wrench, Plus, Search, AlertCircle, Loader2, Calendar, Info, Clock, History, X, DollarSign, User, Edit3, Trash2, Save, Hash } from "lucide-react";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";
import { toast } from "react-toastify";

const MAINTENANCE_API_URL = "http://localhost:8080/api/v1/merchant-service/maintenance-plans";
const VEHICLE_API_URL = "http://localhost:8080/api/v1/merchant-service/vehicles";

interface MaintenancePlan {
  maintenancePlanId: string;
  vehicleId: string;
  vehiclePlate?: string;
  code: string;
  title: string;
  description: string;
  type: "PERIODIC" | "REPAIR" | "INSPECTION" | "EMERGENCY" | "WARRANTY";
  status: "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  plannedDate: string;
  dueDate: string;
  completedDate?: string;
  currentOdometerKm: number;
  targetOdometerKm: number;
  estimatedCost: number;
  actualCost?: number;
  serviceProvider: string;
  note: string;
  creator: string;
  vehicle?: {
    id: string;
    templateId: string;
    status: string;
    category: string;
    type: string;
    vehiclePlate: string;
    seatCapacity: number;
    hasFloor: boolean;
    manufacturer: string;
  };
}

export function MerchantMaintenancePage() {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<MaintenancePlan>>({
    type: "PERIODIC",
    status: "DRAFT",
    plannedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    currentOdometerKm: 0,
    targetOdometerKm: 0,
    estimatedCost: 0,
    actualCost: 0
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: ""
  });

  const fetchVehicles = async () => {
    try {
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${VEHICLE_API_URL}/fetch?pageNumber=1&pageSize=100`, {
        method: 'GET',
        headers: headers as HeadersInit
      });
      if (response.ok) {
        const body = await response.json();
        const data = extractArrayValue(body, ["vehicles", "items", "data", "content", "payload"]) as any[];
        // Đảm bảo mỗi xe đều có vehicleId để khớp với form
        const mappedVehicles = (data || []).map(v => ({
          ...v,
          vehicleId: v.vehicleId || v.id
        }));
        setVehicles(mappedVehicles);
      }
    } catch (err) {
      console.error("Fetch vehicles error:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = createAuthorizedEnvelopeHeaders();

      const queryParams = new URLSearchParams({
        pageNumber: "1",
        pageSize: "50",
      });

      if (dateRange.from) queryParams.append("fromPlannedDate", dateRange.from);
      if (dateRange.to) queryParams.append("toPlannedDate", dateRange.to);
      if (selectedStatus) queryParams.append("status", selectedStatus);
      if (selectedType) queryParams.append("type", selectedType);

      const response = await fetch(`${MAINTENANCE_API_URL}/fetch?${queryParams.toString()}`, {
        method: 'GET',
        headers: headers as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải danh sách kế hoạch bảo trì");

      const body = await response.json();
      const data = extractArrayValue(body, ["items", "maintenancePlans", "data", "content", "payload"]) as any[];

      // Map data with nested vehicle support
      const mappedData = (data || []).map(item => ({
        ...item,
        maintenancePlanId: item.maintenancePlanId || item.id,
        vehicleId: item.vehicleId || item.vehicle?.id,
        vehiclePlate: item.vehicle?.vehiclePlate || item.vehiclePlate || "N/A"
      }));

      setPlans(mappedData);
    } catch (err: any) {
      console.error("Fetch plans error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanDetail = async (id: string, isForEdit: boolean = false) => {
    try {
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${MAINTENANCE_API_URL}/detail?maintenancePlanId=${id}`, {
        method: 'GET',
        headers: headers as HeadersInit
      });
      if (response.ok) {
        const body = await response.json();
        const detail = body.data;
        if (detail) {
          const mappedDetail = {
            ...detail,
            maintenancePlanId: detail.maintenancePlanId || detail.id,
            vehicleId: detail.vehicle?.id || detail.vehicleId,
            vehiclePlate: detail.vehicle?.vehiclePlate || detail.vehiclePlate || "N/A"
          };
          setSelectedPlan(mappedDetail);

          if (isForEdit) {
            setFormData({
              ...mappedDetail,
              plannedDate: mappedDetail.plannedDate?.split('T')[0],
              dueDate: mappedDetail.dueDate?.split('T')[0],
              completedDate: mappedDetail.completedDate?.split('T')[0],
            });
            setIsFormOpen(true);
          } else {
            setIsDetailOpen(true);
          }
        }
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
      toast.error("Không thể tải chi tiết kế hoạch");
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchVehicles();
  }, [selectedStatus, selectedType, dateRange]);

  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setFormData({
      creator: localStorage.getItem("userName") || "Phạm Quốc Bảo",
      type: "PERIODIC",
      status: "DRAFT",
      plannedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      currentOdometerKm: 0,
      targetOdometerKm: 0,
      estimatedCost: 0,
      actualCost: 0,
      vehicleId: "",
      code: `MP-${Date.now().toString().slice(-6)}`,
      title: "",
      description: "",
      serviceProvider: "",
      note: ""
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (plan: MaintenancePlan, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    fetchPlanDetail(plan.maintenancePlanId, true);
  };

  const handleOpenDelete = (plan: MaintenancePlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlan(plan);
    setIsDeleting(true);
  };

  const formatNumber = (val: number | undefined) => {
    if (val === undefined || val === null) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (str: string) => {
    return Number(str.replace(/\./g, ""));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isUpdate = !!selectedPlan;
      const endpoint = isUpdate ? "update" : "create";
      const meta = createRequestMeta();

      const body = {
        ...meta,
        data: isUpdate ? { ...formData, maintenancePlanId: selectedPlan.maintenancePlanId } : formData
      };

      const response = await fetch(`${MAINTENANCE_API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isUpdate ? "Cập nhật thành công!" : "Tạo kế hoạch mới thành công!");
        setIsFormOpen(false);
        fetchPlans();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Lỗi khi xử lý yêu cầu");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const meta = createRequestMeta();
      const body = {
        ...meta,
        data: {
          maintenancePlanId: selectedPlan.maintenancePlanId,
          creator: localStorage.getItem("userName") || "System"
        }
      };

      const response = await fetch(`${MAINTENANCE_API_URL}/delete`, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success("Đã xóa kế hoạch bảo trì");
        setIsDeleting(false);
        fetchPlans();
      } else {
        throw new Error("Không thể xóa kế hoạch");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT': return { label: 'Bản nháp', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
      case 'SCHEDULED': return { label: 'Đã lên lịch', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-400' };
      case 'IN_PROGRESS': return { label: 'Đang thực hiện', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' };
      case 'COMPLETED': return { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
      case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-400' };
      default: return { label: status, color: 'bg-slate-50 text-slate-400', dot: 'bg-slate-300' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERIODIC': return 'Định kỳ';
      case 'REPAIR': return 'Sửa chữa';
      case 'INSPECTION': return 'Kiểm định';
      case 'EMERGENCY': return 'Khẩn cấp';
      case 'WARRANTY': return 'Bảo hành';
      default: return type;
    }
  };

  const filteredPlans = plans.filter(p =>
    p.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    scheduled: plans.filter(p => p.status === 'SCHEDULED' || p.status === 'DRAFT').length,
    inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length,
    completedOfMonth: plans.filter(p => p.status === 'COMPLETED').length // Simplified
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Bảo trì & Sửa chữa</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi lịch sử bảo trì và lập kế hoạch sửa chữa định kỳ cho đội xe.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start"
        >
          <Plus size={18} />
          Ghi nhận bảo trì
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Panel 1: Scheduled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp thực hiện</p>
                    <h3 className="text-2xl font-black text-slate-900">{loading ? "..." : stats.scheduled}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center transition-all">
                    <Clock size={18} />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
                <p className="text-[10px] font-bold text-slate-500">Kế hoạch đã lên lịch</p>
            </div>
        </div>

        {/* Panel 2: In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang xử lý</p>
                    <h3 className="text-2xl font-black text-slate-900">{loading ? "..." : stats.inProgress}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center transition-all">
                    <Wrench size={18} />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
                <p className="text-[10px] font-bold text-slate-500">Phương tiện tại xưởng</p>
            </div>
        </div>

        {/* Panel 3: Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoàn thành</p>
                    <h3 className="text-2xl font-black text-slate-900">{loading ? "..." : stats.completedOfMonth}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center transition-all">
                    <History size={18} />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
                <p className="text-[10px] font-bold text-slate-500">Trong giai đoạn này</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo biển số, nội dung..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="IN_PROGRESS">Đang tiến hành</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>

            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Tất cả loại hình</option>
              <option value="PERIODIC">Bảo trì định kỳ</option>
              <option value="REPAIR">Sửa chữa</option>
              <option value="INSPECTION">Kiểm định</option>
              <option value="EMERGENCY">Khẩn cấp</option>
              <option value="WARRANTY">Bảo hành</option>
            </select>

            <div className="relative group/date">
              <button
                onClick={() => setDateRange({ from: "2024-01-01", to: "2026-12-31" })}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <Calendar size={18} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover/date:opacity-100 group-hover/date:visible transition-all z-10">
                <button onClick={() => setDateRange({ from: "2026-04-01", to: "2026-04-30" })} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Tháng 4, 2026</button>
                <button onClick={() => setDateRange({ from: "2026-05-01", to: "2026-05-31" })} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Tháng 5, 2026</button>
                <button onClick={() => setDateRange({ from: "2024-01-01", to: "2026-12-31" })} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-colors italic">Tất cả thời gian</button>
              </div>
            </div>
          </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[32px] p-24 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang đồng bộ lịch trình bảo trì...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Lỗi kết nối API</h3>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchPlans}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-50/50">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest first:pl-8">Phương tiện</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian dự kiến</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung thực hiện</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi phí (Ước tính)</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest last:pr-8">Trạng thái</th>
                          <th className="px-6 py-5"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/80">
                      {filteredPlans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <Info size={40} className="text-slate-300" />
                              <p className="text-sm font-bold text-slate-400">Không tìm thấy kế hoạch bảo trì nào.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPlans.map((p) => {
                          const status = getStatusConfig(p.status);
                          return (
                              <tr
                                key={p.maintenancePlanId}
                                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                onClick={() => fetchPlanDetail(p.maintenancePlanId)}
                              >
                                  <td className="px-6 py-6 first:pl-8">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <Clock size={18} />
                                      </div>
                                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{p.vehiclePlate || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-6">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                      {getTypeLabel(p.type)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-6 text-sm font-bold text-slate-500">
                                    {p.plannedDate ? new Date(p.plannedDate).toLocaleDateString('vi-VN') : '---'}
                                  </td>
                                  <td className="px-6 py-6 font-medium text-slate-600 max-w-xs">
                                    <p className="text-sm line-clamp-2">{p.description || "Không có mô tả"}</p>
                                  </td>
                                  <td className="px-6 py-6 text-sm font-black text-slate-900">
                                    {p.estimatedCost ? `${p.estimatedCost.toLocaleString('vi-VN')} VNĐ` : '-'}
                                  </td>
                                  <td className="px-6 py-6 last:pr-8">
                                      <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${status.color}`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                          {status.label}
                                      </span>
                                  </td>
                                  <td className="px-6 py-6 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => handleOpenEdit(p, e)}
                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                                      >
                                        <Edit3 size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => handleOpenDelete(p, e)}
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
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <Wrench size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedPlan.title || "Chi tiết bảo trì"}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusConfig(selectedPlan.status).color}`}>
                      {getStatusConfig(selectedPlan.status).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã: {selectedPlan.code}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg">{selectedPlan.vehiclePlate}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-3 hover:bg-white rounded-full transition-all text-slate-400 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Schedule & Provider */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                    <Calendar size={16} className="text-slate-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Thời gian & Đơn vị</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hình</label>
                      <p className="text-sm font-bold text-slate-900">{getTypeLabel(selectedPlan.type)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị thực hiện</label>
                      <p className="text-sm font-bold text-slate-900">{selectedPlan.serviceProvider || "---"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày dự kiến</label>
                      <p className="text-sm font-bold text-slate-900">{selectedPlan.plannedDate ? new Date(selectedPlan.plannedDate).toLocaleDateString('vi-VN') : '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn chót</label>
                      <p className="text-sm font-bold text-slate-900">{selectedPlan.dueDate ? new Date(selectedPlan.dueDate).toLocaleDateString('vi-VN') : '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chỉ số Odometer (KM)</h5>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Hiện tại</p>
                        <p className="text-sm font-black text-slate-900">{formatNumber(selectedPlan.currentOdometerKm)}</p>
                      </div>
                      <div className="w-8 h-px bg-slate-200" />
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Mục tiêu</p>
                        <p className="text-sm font-black text-brand-primary">{formatNumber(selectedPlan.targetOdometerKm)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Costs & Vehicle */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                    <DollarSign size={16} className="text-slate-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Chi phí & Phương tiện</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dự kiến</label>
                      <p className="text-sm font-black text-slate-900">{formatNumber(selectedPlan.estimatedCost)} VNĐ</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thực tế</label>
                      <p className="text-sm font-black text-emerald-600">{selectedPlan.actualCost ? `${formatNumber(selectedPlan.actualCost)} VNĐ` : '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hãng xe</label>
                      <p className="text-sm font-bold text-slate-900">{selectedPlan.vehicle?.manufacturer || "---"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dòng xe / Sức chứa</label>
                      <p className="text-sm font-bold text-slate-900">{selectedPlan.vehicle?.category} / {selectedPlan.vehicle?.seatCapacity} chỗ</p>
                    </div>
                  </div>
                  <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-indigo-400" />
                      <h5 className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Người phụ trách</h5>
                    </div>
                    <p className="text-sm font-bold text-indigo-700">{selectedPlan.creator || "Nhà xe Routex"}</p>
                  </div>
                </div>
              </div>

              {/* Note & Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả công việc</h4>
                   <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {selectedPlan.description || "Không có mô tả chi tiết."}
                   </div>
                </div>
                {selectedPlan.note && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú thêm</h4>
                    <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100/50 text-sm text-amber-900 italic">
                      "{selectedPlan.note}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
               <div className="flex items-center gap-2 text-slate-400">
                <Info size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Hệ thống lưu trữ lịch sử 24 tháng</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Đóng
                </button>
                {selectedPlan.status !== 'COMPLETED' && selectedPlan.status !== 'CANCELLED' && (
                  <button
                    onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedPlan); }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Chỉnh sửa kế hoạch
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-start shrink-0">
               <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Wrench size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedPlan ? "Cập nhật kế hoạch" : "Tạo kế hoạch bảo trì"}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thông tin chi tiết quy trình bảo dưỡng</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phương tiện</label>
                  <select
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.vehicleId}
                    onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehiclePlate} ({v.type})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã kế hoạch</label>
                  <div className="flex items-center bg-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-500">
                    <Hash size={16} className="mr-2" />
                    {formData.code}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề</label>
                  <input
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="VD: Bảo trì định kỳ 10.000km"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại hình</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="PERIODIC">Định kỳ</option>
                    <option value="REPAIR">Sửa chữa</option>
                    <option value="INSPECTION">Kiểm định</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                    <option value="WARRANTY">Bảo hành</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị thực hiện</label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.serviceProvider}
                    onChange={e => setFormData({...formData, serviceProvider: e.target.value})}
                    placeholder="Tên gara / Xưởng dịch vụ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày dự kiến</label>
                  <input
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={formData.plannedDate}
                    onChange={e => setFormData({...formData, plannedDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hạn chót</label>
                  <input
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
                {selectedPlan && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hoàn thành</label>
                      <input
                        type="date"
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={formData.completedDate || ""}
                        onChange={e => setFormData({...formData, completedDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chi phí thực tế</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 pr-16"
                          value={formatNumber(formData.actualCost)}
                          onChange={e => setFormData({...formData, actualCost: parseNumber(e.target.value)})}
                          placeholder="0"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">VNĐ</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số KM hiện tại</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={formatNumber(formData.currentOdometerKm)}
                    onChange={e => setFormData({...formData, currentOdometerKm: parseNumber(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mục tiêu KM</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={formatNumber(formData.targetOdometerKm)}
                    onChange={e => setFormData({...formData, targetOdometerKm: parseNumber(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chi phí dự kiến</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20 pr-16"
                      value={formatNumber(formData.estimatedCost)}
                      onChange={e => setFormData({...formData, estimatedCost: parseNumber(e.target.value)})}
                      placeholder="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả công việc</label>
                  <textarea
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Chi tiết các hạng mục cần bảo trì / sửa chữa..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú thêm</label>
                  <textarea
                    rows={2}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                  />
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-slate-50 flex justify-end items-center bg-slate-50/30 gap-3 shrink-0">
               <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">Hủy bỏ</button>
               <button
                onClick={handleSave}
                disabled={submitting}
                className="px-10 py-3 bg-brand-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
               >
                 {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {selectedPlan ? "Cập nhật kế hoạch" : "Lưu kế hoạch"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {isDeleting && selectedPlan && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Xóa kế hoạch bảo trì?</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
              Bạn đang thực hiện xóa kế hoạch <span className="font-bold text-slate-900">{selectedPlan.code}</span> cho xe <span className="font-bold text-slate-900">{selectedPlan.vehiclePlate}</span>. Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Hủy bỏ</button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-3 bg-rose-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
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
