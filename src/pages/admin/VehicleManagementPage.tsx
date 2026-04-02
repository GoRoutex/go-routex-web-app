import { useMemo, useState } from "react";
import {
  Bus,
  Edit2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type VehicleStatus = "ACTIVE" | "MAINTENANCE" | "IDLE";

type VehicleRow = {
  id: string;
  licensePlate: string;
  vehicleType: string;
  seatCount: string;
  mileageKm: string;
  lastMaintenance: string;
  status: VehicleStatus;
  depot: string;
  note: string;
};

type VehicleForm = Omit<VehicleRow, "id">;

const initialVehicles: VehicleRow[] = [
  {
    id: "1",
    licensePlate: "B-1029",
    vehicleType: "Xe khách - 50 chỗ",
    seatCount: "50",
    mileageKm: "120500",
    lastMaintenance: "2026-03-15",
    status: "ACTIVE",
    depot: "Hà Nội",
    note: "Phục vụ tuyến liên tỉnh",
  },
  {
    id: "2",
    licensePlate: "B-1030",
    vehicleType: "Xe khách - 50 chỗ",
    seatCount: "50",
    mileageKm: "185200",
    lastMaintenance: "2026-03-10",
    status: "MAINTENANCE",
    depot: "TP. Hồ Chí Minh",
    note: "Đang kiểm tra định kỳ",
  },
  {
    id: "3",
    licensePlate: "V-0544",
    vehicleType: "Xe van - 16 chỗ",
    seatCount: "16",
    mileageKm: "45000",
    lastMaintenance: "2026-03-20",
    status: "ACTIVE",
    depot: "Đà Nẵng",
    note: "Phù hợp tuyến ngắn",
  },
];

const statusMeta: Record<VehicleStatus, { label: string; badge: string }> = {
  ACTIVE: {
    label: "Đang hoạt động",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  IDLE: {
    label: "Nhàn rỗi",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const formTemplate: VehicleForm = {
  licensePlate: "",
  vehicleType: "Xe khách - 50 chỗ",
  seatCount: "50",
  mileageKm: "0",
  lastMaintenance: "",
  status: "ACTIVE",
  depot: "",
  note: "",
};

const formatMileage = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return `${new Intl.NumberFormat("vi-VN").format(parsed)} km`;
};

export function VehicleManagementPage() {
  const [items, setItems] = useState<VehicleRow[]>(initialVehicles);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(formTemplate);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.licensePlate, item.vehicleType, item.depot, item.note, item.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "ACTIVE").length,
      maintenance: items.filter((item) => item.status === "MAINTENANCE").length,
      idle: items.filter((item) => item.status === "IDLE").length,
      capacity: items.reduce((sum, item) => sum + Number(item.seatCount || 0), 0),
    }),
    [items],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: VehicleRow) => {
    setEditingId(item.id);
    setForm({
      licensePlate: item.licensePlate,
      vehicleType: item.vehicleType,
      seatCount: item.seatCount,
      mileageKm: item.mileageKm,
      lastMaintenance: item.lastMaintenance,
      status: item.status,
      depot: item.depot,
      note: item.note,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const normalized: VehicleRow = {
      id: editingId || crypto.randomUUID(),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      vehicleType: form.vehicleType.trim(),
      seatCount: form.seatCount.trim(),
      mileageKm: form.mileageKm.trim(),
      lastMaintenance: form.lastMaintenance.trim(),
      status: form.status,
      depot: form.depot.trim(),
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
            <Bus className="h-3.5 w-3.5" />
            Quản lý phương tiện
          </div>
          <h2 className="mt-2 text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Quản lý phương tiện
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            CRUD đầy đủ cho xe, biển số, sức chứa, số km và trạng thái bảo trì.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm phương tiện
        </button>
      </div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {[
            { label: "Đang hoạt động", value: String(summary.active), note: "Xe sẵn sàng vận hành" },
            { label: "Bảo trì", value: String(summary.maintenance), note: "Cần kiểm tra kỹ thuật" },
            { label: "Nhàn rỗi", value: String(summary.idle), note: "Đang chờ phân bổ" },
            { label: "Tổng sức chứa", value: String(summary.capacity), note: "Cộng dồn toàn đội xe" },
        ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
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
                Danh sách phương tiện
              </h3>
              <p className="mt-1 text-[12px] font-medium text-slate-500">
                Quản lý xe, sức chứa, bảo trì và khu vực đỗ.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm biển số, loại xe..."
                className="w-44 bg-transparent text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.15rem] border border-slate-100">
            <div className="grid grid-cols-[1fr_1.35fr_0.7fr_0.95fr_1fr_0.95fr_1.1fr] gap-3.5 border-b border-slate-100 bg-slate-50 px-4.5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <span>Biển số</span>
              <span>Loại xe</span>
              <span>Ghế</span>
              <span>Km</span>
              <span>Bảo trì gần nhất</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1.35fr_0.7fr_0.95fr_1fr_0.95fr_1.1fr] gap-3.5 border-b border-slate-100 px-4.5 py-3.5 last:border-b-0 hover:bg-slate-50/60"
              >
                <div className="text-[12px] font-bold text-slate-900">{item.licensePlate}</div>
                <div>
                  <div className="text-[12px] font-bold text-slate-900">{item.vehicleType}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{item.depot}</div>
                </div>
                <div className="text-[12px] font-bold text-slate-900">{item.seatCount}</div>
                <div className="text-[12px] font-bold text-slate-900">{formatMileage(item.mileageKm)}</div>
                <div className="text-[12px] font-medium text-slate-500">{item.lastMaintenance}</div>
                <div>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusMeta[item.status].badge}`}>
                    {statusMeta[item.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 text-[12px] font-medium leading-relaxed text-slate-500">
                    {item.note}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-primary"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Xoá"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                  {editingId ? "Chỉnh sửa phương tiện" : "Tạo phương tiện mới"}
                </div>
                <h3 className="mt-1 text-[1.35rem] font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật phương tiện" : "Thêm phương tiện vào đội xe"}
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["licensePlate", "Biển số", "VD: B-1029"],
                ["vehicleType", "Loại xe", "VD: Xe khách - 50 chỗ"],
                ["seatCount", "Số ghế", "VD: 50"],
                ["mileageKm", "Số km", "VD: 120500"],
                ["lastMaintenance", "Bảo trì gần nhất", "YYYY-MM-DD"],
                ["depot", "Bến / Depot", "VD: Hà Nội"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="space-y-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={form[key as keyof VehicleForm] as string}
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
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as VehicleStatus }))}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="IDLE">Nhàn rỗi</option>
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
                Lưu phương tiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
