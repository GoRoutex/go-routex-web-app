import { useMemo, useState } from "react";
import {
  Edit2,
  Plus,
  Route,
  Save,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

type TripStatus = "ACTIVE" | "DRAFT" | "PAUSED";

type TripRow = {
  id: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: string;
  duration: string;
  tripsPerDay: string;
  assignedVehicle: string;
  status: TripStatus;
  note: string;
};

type TripForm = Omit<TripRow, "id">;

const initialTrips: TripRow[] = [
  {
    id: "1",
    routeCode: "TRP-101",
    routeName: "Hà Nội - Hải Phòng",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    distanceKm: "120",
    duration: "2h 30m",
    tripsPerDay: "8",
    assignedVehicle: "B-1029",
    status: "ACTIVE",
    note: "Tuyến trọng điểm miền Bắc",
  },
  {
    id: "2",
    routeCode: "TRP-204",
    routeName: "TP.HCM - Nha Trang",
    origin: "TP.HCM",
    destination: "Nha Trang",
    distanceKm: "400",
    duration: "8h 00m",
    tripsPerDay: "5",
    assignedVehicle: "V-0544",
    status: "ACTIVE",
    note: "Tuyến du lịch đông khách",
  },
  {
    id: "3",
    routeCode: "TRP-307",
    routeName: "Đà Nẵng - Huế",
    origin: "Đà Nẵng",
    destination: "Huế",
    distanceKm: "100",
    duration: "2h 00m",
    tripsPerDay: "10",
    assignedVehicle: "B-2011",
    status: "DRAFT",
    note: "Đang cấu hình lịch chạy",
  },
];

const statusMeta: Record<TripStatus, { label: string; badge: string }> = {
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

const formTemplate: TripForm = {
  routeCode: "",
  routeName: "",
  origin: "",
  destination: "",
  distanceKm: "0",
  duration: "",
  tripsPerDay: "0",
  assignedVehicle: "",
  status: "ACTIVE",
  note: "",
};

export function TripManagementPage() {
  const [items, setItems] = useState<TripRow[]>(initialTrips);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TripForm>(formTemplate);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.routeCode, item.routeName, item.origin, item.destination, item.assignedVehicle, item.note]
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
      tripsPerDay: items.reduce((sum, item) => sum + Number(item.tripsPerDay || 0), 0),
    }),
    [items],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: TripRow) => {
    setEditingId(item.id);
    setForm({
      routeCode: item.routeCode,
      routeName: item.routeName,
      origin: item.origin,
      destination: item.destination,
      distanceKm: item.distanceKm,
      duration: item.duration,
      tripsPerDay: item.tripsPerDay,
      assignedVehicle: item.assignedVehicle,
      status: item.status,
      note: item.note,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const normalized: TripRow = {
      id: editingId || crypto.randomUUID(),
      routeCode: form.routeCode.trim(),
      routeName: form.routeName.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      distanceKm: form.distanceKm.trim(),
      duration: form.duration.trim(),
      tripsPerDay: form.tripsPerDay.trim(),
      assignedVehicle: form.assignedVehicle.trim(),
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">
            <Route className="h-4 w-4" />
            Routes Management
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            Quản lý chuyến xe
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
            CRUD đầy đủ cho các chuyến xe, lịch chạy, phương tiện gắn tuyến và trạng thái khai thác.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          Thêm chuyến
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Đang chạy", value: String(summary.active), note: "Tuyến live" },
          { label: "Bản nháp", value: String(summary.draft), note: "Chờ bật khai thác" },
          { label: "Tạm dừng", value: String(summary.paused), note: "Không bán vé" },
          { label: "Tổng chuyến/ngày", value: String(summary.tripsPerDay), note: "Tần suất khai thác" },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-2 text-sm font-medium text-slate-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                Danh sách chuyến xe
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Mỗi chuyến có thể gán phương tiện, điều chỉnh tần suất và trạng thái.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm chuyến, điểm đi, điểm đến..."
                className="w-56 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-slate-100">
            <div className="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.9fr_0.8fr_0.7fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              <span>Mã chuyến</span>
              <span>Tuyến</span>
              <span>Khoảng cách</span>
              <span>Thời gian</span>
              <span>Xe gắn</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.9fr_0.8fr_0.7fr_1fr] gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50/60"
              >
                <div className="font-bold text-slate-900">{item.routeCode}</div>
                <div>
                  <div className="font-bold text-slate-900">{item.routeName}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.origin} → {item.destination}
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{item.distanceKm} km</div>
                <div className="text-sm font-bold text-slate-900">{item.duration}</div>
                <div className="text-sm font-bold text-slate-900">{item.assignedVehicle}</div>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${statusMeta[item.status].badge}`}>
                    {statusMeta[item.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-500">{item.tripsPerDay}/ngày</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-primary"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Xoá"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Quy tắc chuyến xe
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Phân luồng route theo khai thác và phương tiện gắn kèm.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                "ACTIVE sẽ xuất hiện trên UI khách hàng.",
                "DRAFT chỉ dùng nội bộ để chuẩn bị lịch khai thác.",
                "PAUSED giữ lịch sử nhưng không cho đặt vé.",
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary" />
                  <p className="text-sm font-medium leading-relaxed text-slate-600">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/5 via-white to-brand-accent/5 p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Gợi ý tối ưu khai thác
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Điều chỉnh tần suất và phương tiện theo nhu cầu.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                "Tuyến du lịch nên giữ trạng thái ACTIVE trong giờ cao điểm.",
                "Tuyến ngắn có thể gán xe 16 chỗ để tối ưu tải.",
                "Các tuyến liên tỉnh đêm nên kiểm tra xe và tài xế trước khi mở.",
              ].map((tip) => (
                <div key={tip} className="rounded-2xl border border-white/80 bg-white p-4 text-sm text-slate-600 shadow-sm">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-primary">
                  {editingId ? "Chỉnh sửa chuyến xe" : "Tạo chuyến xe mới"}
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật chuyến xe" : "Thêm chuyến xe khai thác"}
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["routeCode", "Mã chuyến", "VD: TRP-101"],
                ["routeName", "Tên tuyến", "VD: Hà Nội - Hải Phòng"],
                ["origin", "Điểm đi", "Điểm xuất phát"],
                ["destination", "Điểm đến", "Điểm kết thúc"],
                ["distanceKm", "Khoảng cách (km)", "Số km"],
                ["duration", "Thời gian", "VD: 2h 30m"],
                ["tripsPerDay", "Chuyến / ngày", "VD: 8"],
                ["assignedVehicle", "Xe gắn", "VD: B-1029"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="space-y-2">
                  <span className="ml-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={form[key as keyof TripForm] as string}
                    onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                  />
                </label>
              ))}
              <label className="space-y-2">
                <span className="ml-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Trạng thái
                </span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as TripStatus }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="ACTIVE">Đang chạy</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PAUSED">Tạm dừng</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="ml-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Ghi chú
                </span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                  rows={4}
                  placeholder="Ghi chú vận hành"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-2xl border border-slate-100 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                <Save className="h-4 w-4" />
                Lưu chuyến
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
