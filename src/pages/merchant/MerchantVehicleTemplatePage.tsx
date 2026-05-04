import { useState, useEffect } from "react";
import { Copy, Plus, Search, Filter, Loader2, AlertCircle, X, Info, Trash2, Edit3, Save } from "lucide-react";
import { createAuthorizedEnvelopeHeaders, createRequestMeta } from "../../utils/requestMeta";
import { extractArrayValue } from "../../utils/responseExtractors";
import { toast } from "react-toastify";
import { VEHICLE_TEMPLATE_ENDPOINTS } from "../../utils/api-constants";

export interface VehicleTemplate {
  templateId: string;
  templateName?: string;
  name?: string;
  code: string;
  manufacturer: string;
  model: string;
  seatCapacity: number;
  category: string;
  type: string;
  fuelType: string;
  hasFloor: boolean;
  status: string;
  ticketPrice: number;
  description?: string;
  createdAt?: string;
  totalSeats?: number;
}


export function MerchantVehicleTemplatePage() {
  const [templates, setTemplates] = useState<VehicleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VehicleTemplate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<VehicleTemplate>>({
    code: "",
    name: "",
    manufacturer: "Thaco",
    model: "2024",
    seatCapacity: 40,
    category: "BUS",
    type: "SEAT",
    fuelType: "DIESEL",
    hasFloor: false,
    status: "ACTIVE",
    ticketPrice: 0
  });


  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = createAuthorizedEnvelopeHeaders();
      const url = `${VEHICLE_TEMPLATE_ENDPOINTS.FETCH}?pageNumber=1&pageSize=10&status=ACTIVE`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...headers,
          'accept': '*/*'
        } as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải danh sách mẫu xe");

      const body = await response.json();
      const content = extractArrayValue(body, ["templates", "items", "data", "content"]) as any[];

      const mappedTemplates = (content || []).map((t: any) => ({
        ...t,
        templateId: t.templateId || t.id || t.id_
      }));

      setTemplates(mappedTemplates);
    } catch (err: any) {
      console.error("Fetch templates error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateDetail = async (templateId: string) => {
    try {
      setDetailLoading(true);
      const headers = createAuthorizedEnvelopeHeaders();
      const response = await fetch(`${VEHICLE_TEMPLATE_ENDPOINTS.DETAIL}?templateId=${templateId}`, {
        method: 'GET',
        headers: {
          ...headers,
          'accept': '*/*'
        } as HeadersInit
      });

      if (!response.ok) throw new Error("Không thể tải chi tiết mẫu xe");

      const body = await response.json();
      const data = body.data || body.payload || body;
      const normalizedData = {
        ...data,
        templateId: data.templateId || data.id || data.id_
      };
      setSelectedTemplate(normalizedData);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error("Fetch detail error:", err);
      toast.error("Không thể lấy thông tin chi tiết");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setFormData({
      code: `TPL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      manufacturer: "Thaco",
      model: "2024",
      seatCapacity: 40,
      category: "BUS",
      type: "SEAT",
      fuelType: "DIESEL",
      hasFloor: false,
      status: "ACTIVE",
      ticketPrice: 0
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (template: VehicleTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTemplate(template);
    setFormData({
      templateId: template.templateId,
      code: template.code || "",
      name: template.name || template.templateName || "",
      manufacturer: template.manufacturer || "",
      model: template.model || "",
      seatCapacity: template.seatCapacity || template.totalSeats || 0,
      category: template.category || "BUS",
      type: template.type || "SEAT",
      fuelType: template.fuelType || "DIESEL",
      hasFloor: template.hasFloor || false,
      status: template.status || "ACTIVE",
      ticketPrice: template.ticketPrice || 0
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (template: VehicleTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTemplate(template);
    setIsDeleteConfirmOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isUpdate = !!selectedTemplate;
      const endpoint = isUpdate ? "update" : "create";
      const meta = createRequestMeta();
      const body = {
        ...meta,
        data: {
          ...formData,
          creator: localStorage.getItem("userName") || "System"
        }
      };

      const response = await fetch(isUpdate ? VEHICLE_TEMPLATE_ENDPOINTS.UPDATE : VEHICLE_TEMPLATE_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(isUpdate ? "Cập nhật mẫu xe thành công!" : "Thêm mẫu xe mới thành công!");
        setIsEditModalOpen(false);
        fetchTemplates();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || (errData.error && errData.error.description) || "Lỗi khi lưu mẫu xe");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const meta = createRequestMeta();
      const body = {
        ...meta,
        data: {
          templateId: selectedTemplate.templateId,
          creator: localStorage.getItem("userName") || "System"
        }
      };

      const response = await fetch(VEHICLE_TEMPLATE_ENDPOINTS.DELETE, {
        method: 'POST',
        headers: {
          ...createAuthorizedEnvelopeHeaders(meta),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success("Xóa mẫu xe thành công!");
        setIsDeleteConfirmOpen(false);
        fetchTemplates();
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Không thể xóa mẫu xe");
      }
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number | string) => {
    if (!val) return "0";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseCurrency = (val: string) => {
    return parseInt(val.replace(/\./g, "")) || 0;
  };


  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Mẫu xe & Quy chuẩn</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cấu hình tiêu chuẩn Routex Core</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all self-start"
        >
          <Plus size={14} />
          Thêm mẫu mới
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mẫu xe, phân hạng..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-brand-primary/5 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={16} />
          Lọc mẫu
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-20 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải danh sách mẫu xe...</p>
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
            onClick={fetchTemplates}
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
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên mẫu xe</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã mẫu</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Số ghế</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Giá vé</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>

                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-400 text-sm font-medium">Chưa có mẫu xe nào được cấu hình.</p>
                  </td>
                </tr>
              ) : (
                templates.map((t, index) => (
                  <tr
                    key={t.templateId || index}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 last:border-0"
                    onClick={() => fetchTemplateDetail(t.templateId)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-black group-hover:text-white transition-colors">
                          <Copy size={16} />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.templateName || t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.code}</td>
                    <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                            {t.category}
                        </span>
                    </td>
                                    <td className="px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-tighter">{t.seatCapacity || t.totalSeats} Ghế</td>
                                    <td className="px-6 py-3">
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                            {t.ticketPrice ? t.ticketPrice.toLocaleString('vi-VN') : '0'} Đ
                                        </span>
                                    </td>

                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                        t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                         <div className={`w-1 h-1 rounded-full ${
                          t.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        {t.status === 'ACTIVE' ? 'Verified' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEdit(t, e)}
                          className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(t, e)}
                          className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center">
                  <Copy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{selectedTemplate.templateName || selectedTemplate.name}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Asset Registry · Template Profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400 border border-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {detailLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải chi tiết...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại phương tiện</p>
                      <p className="text-base font-bold text-slate-900">{selectedTemplate.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kiểu dáng / Variant</p>
                      <p className="text-base font-bold text-slate-900">{selectedTemplate.type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số ghế</p>
                      <p className="text-base font-bold text-slate-900">{selectedTemplate.seatCapacity || selectedTemplate.totalSeats} ghế tiêu chuẩn</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hãng sản xuất</p>
                      <p className="text-base font-bold text-slate-900">{selectedTemplate.manufacturer} - {selectedTemplate.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá vé mặc định</p>
                      <p className="text-base font-black text-brand-primary">
                        {selectedTemplate.ticketPrice?.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>


                  <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả cấu hình</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                              {selectedTemplate.description || "Chưa có mô tả chi tiết cho cấu hình mẫu này."}
                          </p>
                      </div>
                  </div>

                  <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                          <Info size={20} />
                      </div>
                      <div>
                          <p className="text-sm font-black text-indigo-900">Mẫu xe hệ thống</p>
                          <p className="text-xs text-indigo-600/80 font-medium mt-1 leading-relaxed">
                              Đây là mẫu cấu hình xe tiêu chuẩn từ hệ thống. Bạn có thể áp dụng mẫu này khi thêm xe mới để tự động cấu hình sơ đồ ghế và thông số kỹ thuật.
                          </p>
                      </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{selectedTemplate ? "Cập nhật mẫu xe" : "Thêm mẫu xe mới"}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Fleet Standardization · Routex System</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400 border border-slate-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã mẫu xe</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên mẫu xe</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Thaco Mobihome Deluxe"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhà sản xuất</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model / Đời xe</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số ghế</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formData.seatCapacity}
                    onChange={e => setFormData({...formData, seatCapacity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phân mục</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="BUS">Xe khách (BUS)</option>
                    <option value="LIMOUSINE">Limousine</option>
                    <option value="TRUCK">Xe tải (TRUCK)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiểu xe</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="SEAT">Ghế ngồi (SEAT)</option>
                    <option value="VAN_16">Xe 16 chỗ (VAN_16)</option>
                    <option value="SLEEPER_STANDARD">Giường nằm (SLEEPER_STANDARD)</option>
                    <option value="CABIN">Phòng nằm/Cabin (CABIN)</option>
                    <option value="LIMOUSINE_9">Limousine 9 chỗ</option>
                    <option value="LIMOUSINE_11">Limousine 11 chỗ</option>
                    <option value="RECLINER">Ghế ngả (RECLINER)</option>
                    <option value="SLEEPER_3_4">Giường nằm 3/4</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhiên liệu</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                    value={formData.fuelType}
                    onChange={e => setFormData({...formData, fuelType: e.target.value})}
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="GASOLINE">Xăng (Gasoline)</option>
                    <option value="ELECTRIC">Điện (Electric)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cấu trúc tầng</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                    value={formData.hasFloor ? "true" : "false"}
                    onChange={e => setFormData({...formData, hasFloor: e.target.value === "true"})}
                  >
                    <option value="false">1 Tầng</option>
                    <option value="true">2 Tầng (Double Decker)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá vé mặc định (VNĐ)</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: 250.000"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-black text-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    value={formatCurrency(formData.ticketPrice || 0)}
                    onChange={e => setFormData({...formData, ticketPrice: parseCurrency(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none cursor-pointer"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Kích hoạt</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all font-sans"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={submitting}
                  className="px-8 py-2.5 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 font-sans"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {selectedTemplate ? "Cập nhật" : "Lưu mẫu xe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Xác nhận xóa mẫu xe?</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
              Bạn đang thực hiện xóa mẫu xe <span className="font-bold text-slate-900 font-sans">{selectedTemplate.templateName || selectedTemplate.name}</span>.
              Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các quy trình sử dụng mẫu này.
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
