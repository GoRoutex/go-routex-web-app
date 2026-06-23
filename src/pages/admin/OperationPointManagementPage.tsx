import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Edit2,
  ChevronDown,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { POINT_SERVICE_BASE_URL } from "../../utils/api";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import {
  extractArrayValue,
  extractDisplayValue,
  extractNumberValue,
  extractStringValue,
} from "../../utils/responseExtractors";

type OperationPointStatus = "ACTIVE" | "INACTIVE" | "PAUSED" | "UNKNOWN";
type OperationPointType = "OPERATION_POINT" | "PUBLIC_STATION";

type OperationPointRow = {
  id: string;
  name: string;
  type: OperationPointType | string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  status: OperationPointStatus;
  updatedAt: string;
};

type OperationPointForm = Omit<OperationPointRow, "id" | "updatedAt">;

const PAGE_SIZE = 10;
const OPERATION_POINT_TYPES: OperationPointType[] = [
  "OPERATION_POINT",
  "PUBLIC_STATION",
];
const DEFAULT_OPERATION_POINT_TYPE: OperationPointType = "OPERATION_POINT";

const statusMeta: Record<
  OperationPointStatus,
  { label: string; badge: string }
> = {
  ACTIVE: {
    label: "Hoạt động",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  INACTIVE: {
    label: "Ngưng",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  PAUSED: {
    label: "Tạm dừng",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  UNKNOWN: {
    label: "Chưa rõ",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const formTemplate: OperationPointForm = {
  name: "",
  type: DEFAULT_OPERATION_POINT_TYPE,
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  status: "ACTIVE",
};

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

const getVisiblePageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 1) pages.push("ellipsis");
  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }
  if (windowEnd < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
};

const buildPointServiceUrl = (endpoint: string) => {
  const url = new URL(POINT_SERVICE_BASE_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/management/point-service/${endpoint}`;
  return url;
};

const normalizeStatus = (value: string): OperationPointStatus => {
  const upper = value.trim().toUpperCase();
  if (upper === "ACTIVE" || upper === "INACTIVE" || upper === "PAUSED") {
    return upper;
  }
  return "UNKNOWN";
};

const normalizeOperationPointType = (value: string): OperationPointType =>
  value.trim().toUpperCase() === "PUBLIC_STATION"
    ? "PUBLIC_STATION"
    : "OPERATION_POINT";

const isSupportedOperationPointType = (value: string) =>
  OPERATION_POINT_TYPES.includes(
    value.trim().toUpperCase() as OperationPointType,
  );

const getOperationPointTypeLabel = (value: string) =>
  normalizeOperationPointType(value) === "PUBLIC_STATION"
    ? "Trạm công cộng"
    : "Điểm vận hành";

const formatCoordinate = (value: string) => {
  if (!value.trim()) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value.trim();
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 6,
  }).format(parsed);
};

const mapOperationPointRow = (
  rawItem: unknown,
  index: number,
  pageNumber: number,
): OperationPointRow => {
  const item = rawItem as Record<string, unknown>;
  const name = extractStringValue(item, ["name", "pointName", "title"]);
  const type =
    extractStringValue(item, ["type", "pointType"]) ||
    DEFAULT_OPERATION_POINT_TYPE;
  const id =
    extractStringValue(item, ["id", "pointId", "operationPointId", "uuid"]) ||
    name ||
    `operation-point-${pageNumber}-${index + 1}`;

  return {
    id,
    name,
    type,
    address: extractStringValue(item, ["address", "streetAddress", "location"]),
    city: extractStringValue(item, ["city", "province", "area"]),
    latitude: extractDisplayValue(item, ["latitude", "lat"]),
    longitude: extractDisplayValue(item, ["longitude", "lng", "lon"]),
    status: normalizeStatus(extractStringValue(item, ["status", "state"])),
    updatedAt:
      extractDisplayValue(item, [
        "updatedAt",
        "lastUpdatedAt",
        "modifiedAt",
        "updatedDate",
        "createdAt",
      ]) || "Vừa đồng bộ",
  };
};

export function OperationPointManagementPage() {
  const [items, setItems] = useState<OperationPointRow[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OperationPointForm>(formTemplate);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadPoints = async () => {
      setIsLoading(true);
      setError("");
      setItems([]);
      setSelectedIds([]);

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const url = buildPointServiceUrl("fetch");
        url.searchParams.set("pageNumber", String(pageNumber));
        url.searchParams.set("pageSize", String(PAGE_SIZE));

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...createXAuthorizedHeaders(),
            ...(authToken.trim()
              ? { Authorization: `Bearer ${authToken.trim()}` }
              : {}),
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const message = await extractErrorMessage(
            response,
            `Không thể tải danh sách điểm vận hành (${response.status})`,
          );
          throw new Error(message);
        }

        const body: unknown = await response.json();
        const rawItems = extractArrayValue(body, [
          "content",
          "items",
          "data",
          "points",
          "result",
          "list",
        ]);

        const normalizedItems = rawItems.flatMap((item, index) => {
          const mapped = mapOperationPointRow(item, index, pageNumber);
          if (!mapped.type || isSupportedOperationPointType(mapped.type)) {
            return [mapped];
          }
          return [];
        });

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
            : "Đã xảy ra lỗi khi tải danh sách điểm vận hành",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPoints();

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
      [item.name, item.address, item.city, item.status, item.type]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const visibleSelectedItems = useMemo(
    () => filteredItems.filter((item) => selectedIds.includes(item.id)),
    [filteredItems, selectedIds],
  );
  const allVisibleSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));
  const someVisibleSelected =
    filteredItems.some((item) => selectedIds.includes(item.id)) &&
    !allVisibleSelected;

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "ACTIVE").length,
      paused: items.filter((item) => item.status === "PAUSED").length,
      inactive: items.filter((item) => item.status === "INACTIVE").length,
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

  const pageButtons = useMemo(
    () =>
      getVisiblePageItems(
        Math.min(Math.max(pageNumber, 1), totalPages),
        Math.max(totalPages, 1),
      ),
    [pageNumber, totalPages],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: OperationPointRow) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      type: isSupportedOperationPointType(item.type)
        ? normalizeOperationPointType(item.type)
        : DEFAULT_OPERATION_POINT_TYPE,
      address: item.address,
      city: item.city,
      latitude: item.latitude,
      longitude: item.longitude,
      status: item.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(formTemplate);
  };

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (selectedId) => !filteredItems.some((item) => item.id === selectedId),
        ),
      );
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      filteredItems.forEach((item) => next.add(item.id));
      return Array.from(next);
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const openSelectedForEdit = () => {
    if (selectedIds.length !== 1) {
      window.alert("Vui lòng chỉ chọn 1 điểm vận hành để chỉnh sửa.");
      return;
    }

    const item = items.find((row) => row.id === selectedIds[0]);
    if (!item) {
      window.alert("Không tìm thấy bản ghi đã chọn.");
      return;
    }

    openEdit(item);
  };

  const deleteByIds = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá ${uniqueIds.length} điểm vận hành đã chọn không?`,
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        uniqueIds.map(async (id) => {
          const meta = createRequestMeta();
          const authToken = localStorage.getItem("authToken") || "";
          const response = await fetch(
            buildPointServiceUrl("delete").toString(),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...createXAuthorizedHeaders(meta),
                ...(authToken.trim()
                  ? { Authorization: `Bearer ${authToken.trim()}` }
                  : {}),
              },
              body: JSON.stringify({
                requestId: meta.requestId,
                requestDateTime: meta.requestDateTime,
                channel: "ONL",
                data: { id },
              }),
            },
          );

          if (!response.ok) {
            const message = await extractErrorMessage(
              response,
              `Không thể xoá điểm vận hành (${response.status})`,
            );
            throw new Error(message);
          }
        })
      );

      clearSelection();
      setReloadNonce((value) => value + 1);
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xoá điểm vận hành",
      );
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      type: normalizeOperationPointType(form.type),
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      status: form.status,
    };

    if (!payload.name || !payload.address || !payload.city) {
      window.alert("Vui lòng nhập đầy đủ mã, tên, địa chỉ và thành phố.");
      return;
    }

    if (
      !Number.isFinite(payload.latitude) ||
      !Number.isFinite(payload.longitude)
    ) {
      window.alert("Vĩ độ và kinh độ phải là số hợp lệ.");
      return;
    }

    setSubmitting(true);

    try {
      const meta = createRequestMeta();
      const authToken = localStorage.getItem("authToken") || "";
      const response = await fetch(
        buildPointServiceUrl(editingId ? "update" : "create").toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...createXAuthorizedHeaders(meta),
            ...(authToken.trim()
              ? { Authorization: `Bearer ${authToken.trim()}` }
              : {}),
          },
          body: JSON.stringify({
            requestId: meta.requestId,
            requestDateTime: meta.requestDateTime,
            channel: editingId ? "ONL" : "OFF",
            data: editingId
              ? {
                  id: editingId,
                  ...payload,
                }
              : payload,
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          editingId
            ? `Không thể cập nhật điểm vận hành (${response.status})`
            : `Không thể tạo điểm vận hành (${response.status})`,
        );
        throw new Error(message);
      }

      closeModal();
      setPageNumber(1);
      setReloadNonce((value) => value + 1);
    } catch (submitError) {
      window.alert(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu điểm vận hành",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10" data-reload-nonce={reloadNonce}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Quản lý điểm vận hành
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi, cập nhật và quản lý các địa điểm, trạm đón trả khách.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all self-start"
          >
            <Plus size={14} />
            Thêm điểm vận hành
          </button>
          <button
            type="button"
            onClick={() => setReloadNonce((value) => value + 1)}
            className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl font-bold border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} className="text-slate-400" />
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Đang hoạt động",
            value: String(summary.active),
            note: "Đang được khai thác",
          },
          {
            label: "Tạm dừng",
            value: String(summary.paused),
            note: "Tạm khóa vận hành",
          },
          {
            label: "Ngưng hoạt động",
            value: String(summary.inactive),
            note: "Đã dừng sử dụng",
          },
          {
            label: "Đang tải",
            value: String(summary.totalLoaded),
            note: "Số dòng ở trang hiện tại",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/40"
          >
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {item.label}
            </div>
            <div className="text-xl font-black text-slate-900">
              {item.value}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="flex min-h-[calc(100vh-320px)] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">
              Danh sách điểm vận hành
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              Quản lý danh sách điểm dừng, trạm đón trả khách trên hệ thống.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-b border-slate-50 px-6 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-md shadow-slate-900/10"
              title="Thêm điểm vận hành"
            >
              <Plus size={12} />
              Thêm
            </button>
            <button
              type="button"
              onClick={openSelectedForEdit}
              disabled={selectedIds.length !== 1}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Sửa điểm vận hành đã chọn"
            >
              <Edit2 size={12} />
              Sửa
            </button>
            <button
              type="button"
              onClick={() =>
                deleteByIds(visibleSelectedItems.map((item) => item.id))
              }
              disabled={visibleSelectedItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Xoá các điểm vận hành đã chọn"
            >
              <Trash2 size={12} />
              Xoá
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 w-full lg:max-w-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm..."
              className="bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-[0.3fr_1.5fr_0.8fr_1.8fr_1.2fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(element) => {
                  if (element) {
                    element.indeterminate = someVisibleSelected;
                  }
                }}
                onChange={toggleAllVisible}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                aria-label="Chọn tất cả"
              />
            </div>
            <span>Tên & Loại</span>
            <span>Thành phố</span>
            <span>Địa chỉ</span>
            <span>Tọa độ</span>
            <span>Trạng thái</span>
            <span>Cập nhật</span>
            <span className="text-right">Thao tác</span>
          </div>

          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                Đang tải điểm vận hành...
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-[0.3fr_1.5fr_0.8fr_1.8fr_1.2fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-slate-50 px-6 py-5 last:border-b-0 hover:bg-slate-50/50 transition-all group items-center ${
                  selectedIds.includes(item.id) ? "bg-slate-50/30" : ""
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelectedId(item.id)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                    aria-label={`Chọn điểm vận hành ${item.name || item.id}`}
                  />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">
                    {item.name || "Chưa có"}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400 font-bold">
                    {item.type
                      ? getOperationPointTypeLabel(item.type)
                      : "Chưa xác định"}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {item.city || "Chưa có"}
                </div>
                <div className="text-xs font-bold text-slate-500 break-words pr-2">
                  {item.address || "Chưa có"}
                </div>
                <div className="text-xs font-semibold text-slate-600 space-y-0.5">
                  <div>Lat: {formatCoordinate(item.latitude) || "N/A"}</div>
                  <div>Lng: {formatCoordinate(item.longitude) || "N/A"}</div>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${statusMeta[item.status].badge}`}
                  >
                    {statusMeta[item.status].label}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {item.updatedAt}
                </div>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-black hover:text-white transition-all"
                    title="Sửa"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteByIds([item.id])}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                    title="Xoá"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-60 items-center justify-center bg-white px-4 py-16">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-400 shadow-sm animate-bounce">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {search.trim()
                    ? "Không tìm thấy điểm vận hành phù hợp"
                    : "Chưa có điểm vận hành nào"}
                </div>
                <div className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">
                  {search.trim()
                    ? "Hãy thử đổi từ khóa tìm kiếm hoặc tải lại dữ liệu."
                    : "Nhấn Thêm để tạo Operation Point đầu tiên."}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {totalElements > 0 ? (
              <>
                Hiển thị {pageInfo.start}-{pageInfo.end} trên {totalElements} bản ghi
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
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {pageButtons.map((pageItem, index) =>
                pageItem === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-xs font-black text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pageItem}
                    type="button"
                    onClick={() => setPageNumber(pageItem)}
                    className={`min-w-9 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      pageItem === pageNumber
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {pageItem}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setPageNumber((value) =>
                  Math.min(Math.max(totalPages, 1), value + 1),
                )
              }
              disabled={pageNumber >= totalPages || isLoading}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-primary mb-1">
                  {editingId ? "Chỉnh sửa" : "Tạo mới"}
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật điểm vận hành" : "Thêm điểm vận hành"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-84px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Tên điểm
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    placeholder="Điểm vận hành Hà Nội"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Thành phố
                  </span>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    placeholder="Hà Nội"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Loại điểm
                  </span>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          type: normalizeOperationPointType(event.target.value),
                        }))
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    >
                      <option value="OPERATION_POINT">Điểm vận hành</option>
                      <option value="PUBLIC_STATION">Trạm công cộng</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Trạng thái
                  </span>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: normalizeStatus(event.target.value),
                        }))
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Ngưng hoạt động</option>
                      <option value="PAUSED">Tạm dừng</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Địa chỉ
                  </span>
                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    placeholder="Số nhà, đường, khu vực..."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Vĩ độ
                  </span>
                  <input
                    value={form.latitude}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        latitude: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    placeholder="21.028511"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Kinh độ
                  </span>
                  <input
                    value={form.longitude}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        longitude: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10"
                    placeholder="105.834160"
                  />
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {submitting
                    ? "Đang lưu..."
                    : editingId
                      ? "Cập nhật"
                      : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
