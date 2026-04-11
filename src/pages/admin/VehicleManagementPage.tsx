import { useEffect, useMemo, useState } from "react";
import { Bus, Edit2, Plus, Save, Search, Trash2, X } from "lucide-react";
import { VEHICLE_SERVICE_BASE_URL } from "../../utils/api";
import {
  createRequestEnvelopeHeaders,
  createRequestMeta,
} from "../../utils/requestMeta";
import {
  extractArrayValue,
  extractBooleanValue,
  extractNumberValue,
  extractStringValue,
} from "../../utils/responseExtractors";

type VehicleStatus = "IN_SERVICE" | "MAINTENANCE" | "INACTIVE" | "UNKNOWN";

type VehicleRow = {
  id: string;
  creator: string;
  type: string;
  vehiclePlate: string;
  seatCapacity: string;
  manufacturer: string;
  hasFloor: boolean;
  status: VehicleStatus;
  updatedAt: string;
};

type VehicleForm = Omit<VehicleRow, "id" | "updatedAt">;

const PAGE_SIZE = 10;

const statusMeta: Record<VehicleStatus, { label: string; badge: string }> = {
  IN_SERVICE: {
    label: "Đang hoạt động",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  INACTIVE: {
    label: "Ngưng hoạt động",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  UNKNOWN: {
    label: "Chưa rõ",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const getDefaultCreator = () =>
  localStorage.getItem("userName") ||
  localStorage.getItem("userId") ||
  "admin";

const createVehicleFormTemplate = (): VehicleForm => ({
  creator: getDefaultCreator(),
  type: "BUS",
  vehiclePlate: "",
  seatCapacity: "45",
  manufacturer: "",
  hasFloor: false,
  status: "IN_SERVICE",
});

const extractErrorMessage = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    return (
      body?.message || body?.error || body?.detail || body?.title || fallback
    );
  } catch {
    return fallback;
  }
};

const buildVehicleServiceUrl = (endpoint: string) => {
  const url = new URL(VEHICLE_SERVICE_BASE_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/management/vehicle-service/${endpoint}`;
  return url;
};

const normalizeBooleanValue = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(lower)) return true;
    if (["false", "0", "no", "n"].includes(lower)) return false;
  }
  return undefined;
};

const normalizeStatus = (value: string): VehicleStatus => {
  const upper = value.trim().toUpperCase();
  if (
    ["IN_SERVICE", "ACTIVE", "AVAILABLE", "RUNNING"].includes(upper)
  ) {
    return "IN_SERVICE";
  }
  if (["MAINTENANCE", "SERVICE", "REPAIR"].includes(upper)) {
    return "MAINTENANCE";
  }
  if (
    ["INACTIVE", "DISABLED", "PAUSED", "STOPPED", "DELETED"].includes(upper)
  ) {
    return "INACTIVE";
  }
  return "UNKNOWN";
};

const formatUpdatedAt = (value: string) => {
  const trimmed = value.trim();
  return trimmed || "Vừa đồng bộ";
};

const mapVehicleRow = (
  rawItem: unknown,
  index: number,
  pageNumber: number,
): VehicleRow => {
  const item = rawItem as Record<string, unknown>;
  const id =
    extractStringValue(item, ["vehicleId", "id", "uuid", "code"]) ||
    `vehicle-${pageNumber}-${index + 1}`;
  const creator = extractStringValue(item, ["creator", "createdBy", "owner"]);
  const type = extractStringValue(item, ["type", "vehicleType", "category"]);
  const vehiclePlate = extractStringValue(item, [
    "vehiclePlate",
    "plate",
    "licensePlate",
    "vehicleNo",
  ]);
  const seatCapacity = extractStringValue(item, [
    "seatCapacity",
    "seatCount",
    "capacity",
  ]);
  const manufacturer = extractStringValue(item, [
    "manufacturer",
    "brand",
    "maker",
  ]);
  const hasFloor =
    normalizeBooleanValue(
      extractBooleanValue(item, ["hasFloor", "floorLow", "lowFloor"]),
    ) ??
    normalizeBooleanValue(
      extractStringValue(item, ["hasFloor", "floorLow", "lowFloor"]),
    ) ??
    false;
  const status = normalizeStatus(
    extractStringValue(item, ["status", "vehicleStatus", "state"]),
  );
  const updatedAt = formatUpdatedAt(
    extractStringValue(item, [
      "updatedAt",
      "lastUpdatedAt",
      "modifiedAt",
      "updatedDate",
      "createdAt",
    ]),
  );

  return {
    id,
    creator,
    type,
    vehiclePlate,
    seatCapacity,
    manufacturer,
    hasFloor,
    status,
    updatedAt,
  };
};

const formatSeatCapacity = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat("vi-VN").format(parsed);
};

export function VehicleManagementPage() {
  const [items, setItems] = useState<VehicleRow[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(createVehicleFormTemplate);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadVehicles = async () => {
      setIsLoading(true);
      setError("");
      setItems([]);

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const url = buildVehicleServiceUrl("fetch");
        url.searchParams.set("pageNumber", String(pageNumber));
        url.searchParams.set("pageSize", String(PAGE_SIZE));

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...createRequestEnvelopeHeaders(),
            ...(authToken.trim()
              ? { Authorization: `Bearer ${authToken.trim()}` }
              : {}),
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await extractErrorMessage(
            response,
            `Không thể tải danh sách phương tiện (${response.status})`,
          );
          throw new Error(message);
        }

        const body: unknown = await response.json();
        const rawItems = extractArrayValue(body, [
          "content",
          "items",
          "data",
          "vehicles",
          "result",
          "list",
        ]);

        const normalizedItems = rawItems.map((item, index) =>
          mapVehicleRow(item, index, pageNumber),
        );

        const resolvedTotalElements = extractNumberValue(body, [
          "totalElements",
          "total",
          "count",
          "totalCount",
        ]);
        const resolvedTotalPages = extractNumberValue(body, [
          "totalPages",
          "pages",
          "pageCount",
          "total_page",
        ]);

        setItems(normalizedItems);
        setTotalElements(
          typeof resolvedTotalElements === "number"
            ? resolvedTotalElements
            : normalizedItems.length,
        );
        setTotalPages(
          typeof resolvedTotalPages === "number"
            ? Math.max(1, resolvedTotalPages)
            : Math.max(
                1,
                Math.ceil(
                  (typeof resolvedTotalElements === "number"
                    ? resolvedTotalElements
                    : normalizedItems.length) / PAGE_SIZE,
                ),
              ),
        );
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Đã xảy ra lỗi khi tải danh sách phương tiện",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();

    return () => controller.abort();
  }, [pageNumber, reloadNonce]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.vehiclePlate,
        item.type,
        item.manufacturer,
        item.status,
        item.creator,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "IN_SERVICE").length,
      maintenance: items.filter((item) => item.status === "MAINTENANCE").length,
      inactive: items.filter((item) => item.status === "INACTIVE").length,
      capacity: items.reduce(
        (sum, item) => sum + Number(item.seatCapacity || 0),
        0,
      ),
      totalLoaded: items.length,
    }),
    [items],
  );

  const pageInfo = useMemo(() => {
    const total = Math.max(totalPages, 1);
    const current = Math.min(Math.max(pageNumber, 1), total);
    const start = totalElements === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
    const end =
      totalElements === 0 ? 0 : (current - 1) * PAGE_SIZE + items.length;

    return { current, total, start, end };
  }, [items.length, pageNumber, totalElements, totalPages]);

  const openCreate = () => {
    setEditingId(null);
    setForm(createVehicleFormTemplate());
    setModalOpen(true);
  };

  const openEdit = (item: VehicleRow) => {
    setEditingId(item.id);
    setForm({
      creator: item.creator || getDefaultCreator(),
      type: item.type,
      vehiclePlate: item.vehiclePlate,
      seatCapacity: item.seatCapacity,
      manufacturer: item.manufacturer,
      hasFloor: item.hasFloor,
      status: item.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(createVehicleFormTemplate());
  };

  const handleDelete = async (item: VehicleRow) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá xe ${item.vehiclePlate || item.id} không?`,
    );
    if (!confirmed) return;

    try {
      const meta = createRequestMeta();
      const authToken = localStorage.getItem("authToken") || "";
      const response = await fetch(buildVehicleServiceUrl("delete").toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...createRequestEnvelopeHeaders(meta),
          ...(authToken.trim()
            ? { Authorization: `Bearer ${authToken.trim()}` }
            : {}),
        },
        body: JSON.stringify({
          requestId: meta.requestId,
          requestDateTime: meta.requestDateTime,
          channel: "ONL",
          data: {
            creator: item.creator || getDefaultCreator(),
            vehicleId: item.id,
          },
        }),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Không thể xoá phương tiện (${response.status})`,
        );
        throw new Error(message);
      }

      setReloadNonce((value) => value + 1);
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xoá phương tiện",
      );
    }
  };

  const handleSave = async () => {
    const creator = form.creator.trim() || getDefaultCreator();
    const type = form.type.trim().toUpperCase();
    const vehiclePlate = form.vehiclePlate.trim().toUpperCase();
    const seatCapacity = form.seatCapacity.trim();
    const manufacturer = form.manufacturer.trim();

    if (!type || !vehiclePlate || !seatCapacity || !manufacturer) {
      window.alert(
        "Vui lòng nhập đầy đủ loại xe, biển số, sức chứa và hãng xe.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const meta = createRequestMeta();
      const authToken = localStorage.getItem("authToken") || "";
      const response = await fetch(
        buildVehicleServiceUrl(editingId ? "update" : "add").toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...createRequestEnvelopeHeaders(meta),
            ...(authToken.trim()
              ? { Authorization: `Bearer ${authToken.trim()}` }
              : {}),
          },
          body: JSON.stringify({
            requestId: meta.requestId,
            requestDateTime: meta.requestDateTime,
            channel: "ONL",
            data: editingId
              ? {
                  creator,
                  vehicleId: editingId,
                  type,
                  vehiclePlate,
                  seatCapacity,
                  manufacturer,
                  hasFloor: form.hasFloor,
                  status: form.status,
                }
              : {
                  creator,
                  type,
                  vehiclePlate,
                  seatCapacity,
                  manufacturer,
                  hasFloor: form.hasFloor,
                  status: form.status,
                },
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          editingId
            ? `Không thể cập nhật phương tiện (${response.status})`
            : `Không thể tạo phương tiện (${response.status})`,
        );
        throw new Error(message);
      }

      closeModal();
      setPageNumber(1);
      setReloadNonce((value) => value + 1);
    } catch (saveError) {
      window.alert(
        saveError instanceof Error
          ? saveError.message
          : editingId
            ? "Không thể cập nhật phương tiện"
            : "Không thể tạo phương tiện",
      );
    } finally {
      setSubmitting(false);
    }
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
            CRUD đầy đủ cho xe, biển số, sức chứa, hãng xe và trạng thái khai
            thác.
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
          {
            label: "Đang hoạt động",
            value: String(summary.active),
            note: "Xe sẵn sàng vận hành",
          },
          {
            label: "Bảo trì",
            value: String(summary.maintenance),
            note: "Cần kiểm tra kỹ thuật",
          },
          {
            label: "Ngưng hoạt động",
            value: String(summary.inactive),
            note: "Đã dừng khai thác",
          },
          {
            label: "Tổng sức chứa",
            value: String(summary.capacity),
            note: "Cộng dồn toàn đội xe",
          },
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
            <div className="mt-0.5 text-[11px] text-slate-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2.5 px-5 pt-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">
              Danh sách phương tiện
            </h3>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              Quản lý xe, sức chứa, hãng xe và khu vực đỗ.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-b border-slate-100 px-5 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            Danh sách phương tiện đang khai thác
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

        <div className="px-5 py-5">
          <div className="overflow-hidden rounded-[1.15rem] border border-slate-100">
            <div className="grid grid-cols-[1fr_1fr_0.8fr_0.95fr_0.8fr_0.95fr_1.05fr_0.9fr] gap-3.5 border-b border-slate-100 bg-slate-50 px-4.5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <span>Biển số</span>
              <span>Loại xe</span>
              <span>Hãng xe</span>
              <span>Ghế</span>
              <span>Sàn thấp</span>
              <span>Trạng thái</span>
              <span>Cập nhật</span>
              <span>Thao tác</span>
            </div>

            {isLoading ? (
              <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                  Đang tải danh sách phương tiện...
                </div>
              </div>
            ) : error ? (
              <div className="bg-white px-4 py-12">
                <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4 text-rose-700">
                  <div className="text-[13px] font-bold">
                    Không thể tải danh sách phương tiện
                  </div>
                  <div className="mt-1 text-[12px] font-medium leading-relaxed">
                    {error}
                  </div>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
                <div className="text-center">
                  <div className="text-[13px] font-bold text-slate-900">
                    {search.trim()
                      ? "Không tìm thấy phương tiện phù hợp"
                      : "Chưa có phương tiện nào"}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-slate-500">
                    {search.trim()
                      ? "Hãy thử đổi từ khóa tìm kiếm hoặc tải lại dữ liệu."
                      : "Nhấn Thêm phương tiện để tạo xe đầu tiên."}
                  </div>
                </div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_1fr_0.8fr_0.95fr_0.8fr_0.95fr_1.05fr_0.9fr] gap-3.5 border-b border-slate-100 px-4.5 py-3.5 last:border-b-0 hover:bg-slate-50/60"
                >
                  <div>
                    <div className="text-[12px] font-bold text-slate-900">
                      {item.vehiclePlate || "Chưa có"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {item.creator || "Chưa rõ người tạo"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-900">
                      {item.type || "Chưa có"}
                    </div>
                  </div>
                  <div className="text-[12px] font-medium text-slate-600">
                    {item.manufacturer || "Chưa có"}
                  </div>
                  <div className="text-[12px] font-bold text-slate-900">
                    {formatSeatCapacity(item.seatCapacity)}
                  </div>
                  <div className="text-[12px] font-medium text-slate-600">
                    {item.hasFloor ? "Có" : "Không"}
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusMeta[item.status].badge}`}
                    >
                      {statusMeta[item.status].label}
                    </span>
                  </div>
                  <div className="text-[12px] font-medium text-slate-500">
                    {item.updatedAt}
                  </div>
                  <div className="flex items-center justify-end gap-1">
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
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      title="Xoá"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            {totalElements > 0 ? (
              <>
                Hiển thị {pageInfo.start}-{pageInfo.end} trên {totalElements}{" "}
                bản ghi
              </>
            ) : (
              "Chưa có dữ liệu để hiển thị"
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              disabled={pageNumber === 1 || isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() =>
                setPageNumber((value) =>
                  Math.min(Math.max(totalPages, 1), value + 1),
                )
              }
              disabled={pageNumber >= totalPages || isLoading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
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
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Loại xe
                </span>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, type: e.target.value }))
                  }
                  placeholder="BUS"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Biển số
                </span>
                <input
                  type="text"
                  value={form.vehiclePlate}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      vehiclePlate: e.target.value,
                    }))
                  }
                  placeholder="51F1-268.99"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Sức chứa
                </span>
                <input
                  type="text"
                  value={form.seatCapacity}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      seatCapacity: e.target.value,
                    }))
                  }
                  placeholder="45"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Hãng xe
                </span>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      manufacturer: e.target.value,
                    }))
                  }
                  placeholder="THACO"
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Sàn thấp
                </span>
                <select
                  value={form.hasFloor ? "true" : "false"}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      hasFloor: e.target.value === "true",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="false">Không</option>
                  <option value="true">Có</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Trạng thái
                </span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as VehicleStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[12px] font-semibold text-slate-900 outline-none transition-all focus:border-brand-primary/30 focus:bg-white focus:ring-4 focus:ring-brand-primary/5"
                >
                  <option value="IN_SERVICE">Đang hoạt động</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="INACTIVE">Ngưng hoạt động</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-xl border border-slate-100 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {submitting
                  ? editingId
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : editingId
                    ? "Cập nhật phương tiện"
                    : "Lưu phương tiện"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
