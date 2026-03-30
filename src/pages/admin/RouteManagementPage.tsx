import { useMemo, useState } from "react";
import {
  Clock,
  Edit2,
  Map,
  MapPin,
  Plus,
  Route,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type RouteStatus = "ACTIVE" | "DRAFT" | "PAUSED";

type RouteRow = {
  id: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  assignedVehicle: string;
  licensePlate: string;
  assignedDriver: string;
  status: RouteStatus;
  note: string;
};

type RouteForm = Omit<RouteRow, "id">;

const initialRoutes: RouteRow[] = [
  {
    id: "1",
    routeCode: "HCM-NT-001",
    routeName: "TP.HCM - Nha Trang",
    origin: "TP.HCM",
    destination: "Nha Trang",
    departureTime: "00:10",
    arrivalTime: "06:10",
    assignedVehicle: "Bus-01",
    licensePlate: "51B-123.45",
    assignedDriver: "Nguyễn Văn A",
    status: "ACTIVE",
    note: "Chuyến đêm cao cấp",
  },
  {
    id: "2",
    routeCode: "HCM-NT-002",
    routeName: "TP.HCM - Nha Trang",
    origin: "TP.HCM",
    destination: "Nha Trang",
    departureTime: "08:30",
    arrivalTime: "14:30",
    assignedVehicle: "Bus-05",
    licensePlate: "51B-678.90",
    assignedDriver: "Trần Văn B",
    status: "ACTIVE",
    note: "Chuyến sáng ngày",
  },
  {
    id: "3",
    routeCode: "HN-HP-001",
    routeName: "Hà Nội - Hải Phòng",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    departureTime: "07:00",
    arrivalTime: "09:30",
    assignedVehicle: "Van-02",
    licensePlate: "29B-445.56",
    assignedDriver: "Lê Văn C",
    status: "DRAFT",
    note: "Tuyến Limousine VIP",
  },
];

const statusMeta: Record<RouteStatus, { label: string; badge: string }> = {
  ACTIVE: {
    label: "Đang chạy",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  DRAFT: {
    label: "Bản nháp",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  PAUSED: {
    label: "Tạm dừng",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const formTemplate: RouteForm = {
  routeCode: "",
  routeName: "",
  origin: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  assignedVehicle: "",
  licensePlate: "",
  assignedDriver: "",
  status: "ACTIVE",
  note: "",
};

export function RouteManagementPage() {
  const [items, setItems] = useState<RouteRow[]>(initialRoutes);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(formTemplate);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.routeCode, item.routeName, item.origin, item.destination, item.assignedVehicle, item.assignedDriver, item.note]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "ACTIVE").length,
      draft: items.filter((item) => item.status === "DRAFT").length,
      paused: items.filter((item) => item.status === "PAUSED").length,
      total: items.length,
    }),
    [items],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: RouteRow) => {
    setEditingId(item.id);
    setForm({
      routeCode: item.routeCode,
      routeName: item.routeName,
      origin: item.origin,
      destination: item.destination,
      departureTime: item.departureTime,
      arrivalTime: item.arrivalTime,
      assignedVehicle: item.assignedVehicle,
      licensePlate: item.licensePlate,
      assignedDriver: item.assignedDriver,
      status: item.status,
      note: item.note,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const normalized: RouteRow = {
      id: editingId || crypto.randomUUID(),
      routeCode: form.routeCode.trim().toUpperCase(),
      routeName: form.routeName.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      departureTime: form.departureTime.trim(),
      arrivalTime: form.arrivalTime.trim(),
      assignedVehicle: form.assignedVehicle.trim(),
      licensePlate: form.licensePlate.trim(),
      assignedDriver: form.assignedDriver.trim(),
      status: form.status,
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
            <Route className="h-3.5 w-3.5" />
            Routes Management
          </div>
          <h2 className="mt-2 text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Quản lý chuyến trong ngày
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            Chi tiết các chuyến xe chạy trong ngày: giờ khởi hành, giờ đến, tài xế và biển số xe cụ thể theo yêu cầu.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm chuyến
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Đang chạy", value: String(summary.active), note: "Chuyến đang đi" },
          { label: "Bản nháp", value: String(summary.draft), note: "Sắp khởi hành" },
          { label: "Tạm dừng", value: String(summary.paused), note: "Tạm ngưng nhận" },
          { label: "Tổng chuyến hôm nay", value: String(summary.total), note: "Theo lịch trình" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.label}</div>
            <div className="mt-1 text-[1.4rem] font-bold tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">
              Danh sách chuyến xe
            </h3>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              Dùng một layout thoáng, tập trung vào chuyến và thông tin gán kèm.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã chuyến, điểm đi, điểm đến..."
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
                      {item.routeName}
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusMeta[item.status].badge}`}
                    >
                      {statusMeta[item.status].label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {item.origin}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                      <Map className="h-3.5 w-3.5 text-slate-400" />
                      {item.destination}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/5 px-2.5 py-1.25 font-bold text-brand-primary shadow-sm ring-1 ring-brand-primary/10">
                      <Clock className="h-3.5 w-3.5" />
                      {item.departureTime} - {item.arrivalTime}
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

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px]">
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-50">
                   <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tài xế:</div>
                   <div className="font-bold text-slate-900">{item.assignedDriver}</div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-50">
                   <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Biển số:</div>
                   <div className="font-bold text-slate-900">{item.licensePlate}</div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm border border-slate-50">
                   <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Xe:</div>
                   <div className="font-bold text-slate-900">{item.assignedVehicle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.4rem] border border-slate-100 bg-white p-4.5 shadow-2xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-primary">
                  {editingId ? "Chỉnh sửa chuyến xe" : "Tạo chuyến xe mới"}
                </div>
                <h3 className="mt-1 text-[1.35rem] font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật chuyến xe" : "Thêm chuyến xe khai thác"}
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["routeCode", "Mã chuyến", "VD: HCM-NT-001"],
                ["routeName", "Tên tuyến", "VD: TP.HCM - Nha Trang"],
                ["origin", "Điểm đi", "VD: TP.HCM"],
                ["destination", "Điểm đến", "VD: Nha Trang"],
                ["departureTime", "Giờ khởi hành", "VD: 00:10"],
                ["arrivalTime", "Giờ đến", "VD: 06:10"],
                ["assignedVehicle", "Loại xe", "VD: Bus-01"],
                ["licensePlate", "Biển số xe", "VD: 51B-123.45"],
                ["assignedDriver", "Tài xế", "VD: Nguyễn Văn A"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="space-y-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={form[key as keyof RouteForm] as string}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
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
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as RouteStatus }))}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="ACTIVE">Đang chạy</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PAUSED">Tạm dừng</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Ghi chú
                  </span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                  rows={4}
                  placeholder="Ghi chú vận hành"
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
                Lưu chuyến
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
