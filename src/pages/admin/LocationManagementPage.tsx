import { useMemo, useState } from "react";
import {
  Edit2,
  Globe2,
  MapPinned,
  Plus,
  Search,
  Save,
  Trash2,
  X,
} from "lucide-react";

type LocationStatus = "OPEN" | "REVIEW" | "PAUSED";

type LocationRow = {
  id: string;
  province: string;
  city: string;
  status: LocationStatus;
  terminals: string;
  routes: string;
  priority: string;
  updatedAt: string;
  note: string;
};

type LocationForm = Omit<LocationRow, "id" | "updatedAt">;

const initialLocations: LocationRow[] = [
  {
    id: "1",
    province: "Hà Nội",
    city: "Trung tâm",
    status: "OPEN",
    terminals: "6",
    routes: "18",
    priority: "1",
    updatedAt: "2 giờ trước",
    note: "Khu vực trọng điểm miền Bắc",
  },
  {
    id: "2",
    province: "TP. Hồ Chí Minh",
    city: "Khu vực phía Nam",
    status: "OPEN",
    terminals: "8",
    routes: "22",
    priority: "1",
    updatedAt: "10 phút trước",
    note: "Hub vận hành lớn nhất",
  },
  {
    id: "3",
    province: "Đà Nẵng",
    city: "Trung tâm du lịch",
    status: "OPEN",
    terminals: "4",
    routes: "12",
    priority: "2",
    updatedAt: "35 phút trước",
    note: "Kết nối Bắc - Trung - Nam",
  },
  {
    id: "4",
    province: "Nha Trang",
    city: "Khu ven biển",
    status: "REVIEW",
    terminals: "3",
    routes: "9",
    priority: "2",
    updatedAt: "Hôm qua",
    note: "Đang đánh giá thêm điểm trung chuyển",
  },
  {
    id: "5",
    province: "Hải Phòng",
    city: "Cảng biển",
    status: "PAUSED",
    terminals: "2",
    routes: "5",
    priority: "3",
    updatedAt: "3 ngày trước",
    note: "Tạm dừng do tối ưu lại tuyến",
  },
];

const statusMeta: Record<
  LocationStatus,
  { label: string; badge: string; tone: string }
> = {
  OPEN: {
    label: "Đang khai thác",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    tone: "text-emerald-600",
  },
  REVIEW: {
    label: "Chờ duyệt",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    tone: "text-amber-600",
  },
  PAUSED: {
    label: "Tạm dừng",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    tone: "text-slate-500",
  },
};

const formTemplate: LocationForm = {
  province: "",
  city: "",
  status: "OPEN",
  terminals: "0",
  routes: "0",
  priority: "1",
  note: "",
};

export function LocationManagementPage() {
  const [items, setItems] = useState<LocationRow[]>(initialLocations);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(formTemplate);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.province, item.city, item.note, item.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const summary = useMemo(
    () => ({
      open: items.filter((item) => item.status === "OPEN").length,
      review: items.filter((item) => item.status === "REVIEW").length,
      paused: items.filter((item) => item.status === "PAUSED").length,
      routes: items.reduce((sum, item) => sum + Number(item.routes || 0), 0),
    }),
    [items],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: LocationRow) => {
    setEditingId(item.id);
    setForm({
      province: item.province,
      city: item.city,
      status: item.status,
      terminals: item.terminals,
      routes: item.routes,
      priority: item.priority,
      note: item.note,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const normalized: LocationRow = {
      id: editingId || crypto.randomUUID(),
      province: form.province.trim(),
      city: form.city.trim(),
      status: form.status,
      terminals: form.terminals.trim(),
      routes: form.routes.trim(),
      priority: form.priority.trim(),
      updatedAt: editingId ? "Vừa xong" : "Vừa tạo",
      note: form.note.trim(),
    };

    setItems((current) =>
      editingId
        ? current.map((item) => (item.id === editingId ? normalized : item))
        : [normalized, ...current],
    );
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
            <MapPinned className="h-3.5 w-3.5" />
            Location Management
          </div>
            <h2 className="mt-2 text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
                Quản lý tỉnh thành khai thác
            </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            CRUD đầy đủ cho các tỉnh/thành phố đang được nhà xe mở khai thác.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm location
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {[
            { label: "Đang khai thác", value: String(summary.open), note: "Khu vực mở bán" },
            { label: "Chờ duyệt", value: String(summary.review), note: "Đang review" },
            { label: "Tạm dừng", value: String(summary.paused), note: "Có thể kích hoạt lại" },
            { label: "Tổng tuyến", value: String(summary.routes), note: "Tuyến đang gắn location" },
        ].map((item) => (
            <div
            key={item.label}
            className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/40"
            >
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {item.label}
            </div>

            <div className="mt-1 text-[1.4rem] font-bold tracking-tight text-slate-900">
                {item.value}
            </div>

            <div className="mt-0.5 text-[11px] text-slate-500">
                {item.note}
            </div>
            </div>
        ))}
        </div>

      <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Danh sách location đang quản lý
              </h3>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                Có thể tạo mới, chỉnh sửa, hoặc ngưng khai thác từng khu vực.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tỉnh, thành phố..."
                className="w-44 bg-transparent text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[15px] font-black tracking-tight text-slate-900">
                        {item.province}
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                          statusMeta[item.status].badge
                        }`}
                      >
                        {statusMeta[item.status].label}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                        <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                        {item.city}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{item.note}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-brand-primary/20 hover:text-brand-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-100 bg-white px-3 py-2 text-[11px] font-bold text-rose-500 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xoá
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Bến xe", value: item.terminals },
                    { label: "Tuyến", value: item.routes },
                    { label: "Ưu tiên", value: item.priority },
                    { label: "Cập nhật", value: item.updatedAt },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="rounded-xl border border-white bg-white px-3 py-2.5 shadow-sm"
                    >
                      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                        {field.label}
                      </div>
                      <div className="mt-1 text-[12px] font-bold text-slate-900">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[1.4rem] border border-slate-100 bg-white p-4.5 shadow-2xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-primary">
                  {editingId ? "Chỉnh sửa location" : "Tạo location mới"}
                </div>
                <h3 className="mt-1 text-[1.35rem] font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật location" : "Thêm location khai thác"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["province", "Tỉnh / Thành", "Ví dụ: Hà Nội"],
                ["city", "Khu vực", "Ví dụ: Trung tâm"],
                ["terminals", "Bến xe", "Số bến xe"],
                ["routes", "Tuyến", "Số tuyến đang mở"],
                ["priority", "Ưu tiên", "Mức ưu tiên"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="space-y-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={form[key as keyof LocationForm] as string}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                  />
                </label>
              ))}
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Trạng thái
                </span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, status: e.target.value as LocationStatus }))
                  }
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="OPEN">Đang khai thác</option>
                  <option value="REVIEW">Chờ duyệt</option>
                  <option value="PAUSED">Tạm dừng</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Ghi chú
                </span>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, note: e.target.value }))
                  }
                  rows={4}
                  placeholder="Mô tả ngắn cho location"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-100 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                <Save className="h-3.5 w-3.5" />
                Lưu location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
