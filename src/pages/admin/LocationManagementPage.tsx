import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  MapPinned,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PROVINCES_SERVICE_BASE_URL } from "../../utils/api";
import {
  createRequestEnvelopeHeaders,
  createRequestMeta,
} from "../../utils/requestMeta";
import {
  extractArrayValue,
  extractNumberValue,
  extractStringValue,
} from "../../utils/responseExtractors";

type ProvinceRow = {
  id: string;
  name: string;
  code: string;
  updatedAt: string;
};

type ProvinceForm = {
  name: string;
  code: string;
};

const PAGE_SIZE = 10;

const formTemplate: ProvinceForm = {
  name: "",
  code: "",
};

const provinceServiceUrl = (endpoint: string) => {
  const url = new URL(PROVINCES_SERVICE_BASE_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/management/provinces-service/${endpoint}`;
  return url;
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

const mapProvinceRow = (rawItem: unknown, index: number): ProvinceRow => {
  const item = rawItem as Record<string, unknown>;

  return {
    id:
      extractStringValue(item, ["id", "provinceId", "uuid"]) ||
      `province-${index + 1}`,
    name:
      extractStringValue(item, ["name", "provinceName", "title", "label"]) ||
      "Chưa có tên",
    code:
      extractStringValue(item, ["code", "provinceCode", "shortCode"]) || "-",
    updatedAt:
      extractStringValue(item, [
        "updatedAt",
        "updatedTime",
        "modifiedAt",
        "lastModifiedTime",
        "updatedDateTime",
      ]) || "-",
  };
};

export function LocationManagementPage() {
  const [items, setItems] = useState<ProvinceRow[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<ProvinceForm>(formTemplate);

  useEffect(() => {
    const controller = new AbortController();

    const loadProvinces = async () => {
      setIsLoading(true);
      setError("");
      setItems([]);

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const endpoint = searchQuery.trim() ? "search" : "fetch";
        const url = provinceServiceUrl(endpoint);

        if (searchQuery.trim()) {
          url.searchParams.set("keyword", searchQuery.trim());
          url.searchParams.set("page", String(pageNumber));
          url.searchParams.set("size", String(PAGE_SIZE));
        } else {
          url.searchParams.set("pageNumber", String(pageNumber));
          url.searchParams.set("pageSize", String(PAGE_SIZE));
        }

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
            `Không thể tải danh sách địa điểm (${response.status})`,
          );
          throw new Error(message);
        }

        const body: unknown = await response.json();
        const rawItems = extractArrayValue(body, [
          "content",
          "items",
          "data",
          "provinces",
          "result",
          "list",
        ]);

        const normalizedItems = rawItems.map((item, index) =>
          mapProvinceRow(item, index),
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
            : "Đã xảy ra lỗi khi tải danh sách địa điểm",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProvinces();

    return () => controller.abort();
  }, [pageNumber, reloadNonce, searchQuery]);

  useEffect(() => {
    if (!isLoading && totalPages > 0 && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [isLoading, pageNumber, totalPages]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  const summary = useMemo(
    () => ({
      total: totalElements,
      displayed: items.length,
      page: `${Math.min(pageNumber, totalPages)}/${Math.max(totalPages, 1)}`,
    }),
    [items.length, pageNumber, totalElements, totalPages],
  );

  const pageInfo = useMemo(() => {
    const current = Math.min(Math.max(pageNumber, 1), Math.max(totalPages, 1));
    const start = totalElements === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
    const end =
      totalElements === 0
        ? 0
        : Math.min((current - 1) * PAGE_SIZE + items.length, totalElements);

    return { current, total: Math.max(totalPages, 1), start, end };
  }, [items.length, pageNumber, totalElements, totalPages]);

  const pageButtons = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | "ellipsis"> = [1];
    const windowStart = Math.max(2, pageInfo.current - 1);
    const windowEnd = Math.min(totalPages - 1, pageInfo.current + 1);

    if (windowStart > 1) pages.push("ellipsis");
    for (let page = windowStart; page <= windowEnd; page += 1) {
      pages.push(page);
    }
    if (windowEnd < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  }, [pageInfo, totalPages]);

  const openCreate = () => {
    setEditingId(null);
    setSubmitError("");
    setForm(formTemplate);
    setModalOpen(true);
  };

  const openEdit = (item: ProvinceRow) => {
    setEditingId(item.id);
    setSubmitError("");
    setForm({
      name: item.name,
      code: item.code,
    });
    setModalOpen(true);
  };

  const handleDelete = async (item: ProvinceRow) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá địa điểm ${item.name} không?`,
    );
    if (!confirmed) return;

    try {
      const meta = createRequestMeta();
      const response = await fetch(provinceServiceUrl("delete").toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...createRequestEnvelopeHeaders(meta),
        },
        body: JSON.stringify({
          requestId: meta.requestId,
          requestDateTime: meta.requestDateTime,
          channel: "ONL",
          data: { id: item.id },
        }),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Không thể xoá địa điểm (${response.status})`,
        );
        throw new Error(message);
      }

      setReloadNonce((value) => value + 1);
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xoá địa điểm",
      );
    }
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();

    if (!name || !code) {
      setSubmitError("Vui lòng nhập đầy đủ tên và mã địa điểm.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");

    try {
      const meta = createRequestMeta();
      const isEditing = Boolean(editingId);
      const response = await fetch(
        provinceServiceUrl(isEditing ? "update" : "create").toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...createRequestEnvelopeHeaders(meta),
          },
          body: JSON.stringify({
            requestId: meta.requestId,
            requestDateTime: meta.requestDateTime,
            channel: "ONL",
            data: isEditing
              ? {
                  id: editingId,
                  name,
                  code,
                }
              : {
                  name,
                  code,
                },
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          isEditing
            ? `Không thể cập nhật địa điểm (${response.status})`
            : `Không thể tạo địa điểm (${response.status})`,
        );
        throw new Error(message);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(formTemplate);
      setPageNumber(1);
      setReloadNonce((value) => value + 1);
    } catch (submitErrorValue) {
      setSubmitError(
        submitErrorValue instanceof Error
          ? submitErrorValue.message
          : editingId
            ? "Không thể cập nhật địa điểm"
            : "Không thể tạo địa điểm",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSearch = () => {
    setPageNumber(1);
    setSearchQuery(searchInput.trim());
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
            <MapPinned className="h-3.5 w-3.5" />
            Quản lý địa điểm
          </div>
          <h2 className="mt-2 text-[1.25rem] font-black tracking-tight text-slate-900 sm:text-[1.5rem]">
            Quản lý tỉnh thành khai thác
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12px] font-medium leading-relaxed text-slate-500">
            CRUD cho danh sách tỉnh/thành phố thông qua `provinces-service`.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadNonce((value) => value + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            <Loader2 className="h-3.5 w-3.5" />
            Tải lại
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm địa điểm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng địa điểm",
            value: String(totalElements),
            note: `Đang được khai thác`,
          },
          {
            label: "Đang hiển thị",
            value: String(summary.displayed),
            note: `Trang ${summary.page}`,
          },
          {
            label: "Trang hiện tại",
            value: String(pageInfo.current),
            note: `Tối đa ${pageInfo.total} trang`,
          },
          {
            label: "Kết quả tìm kiếm",
            value: String(items.length),
            note: searchQuery ? `Từ khóa: ${searchQuery}` : "Chưa lọc",
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
              Danh sách địa điểm đang quản lý
            </h3>
            <p className="mt-1 text-[12px] font-medium text-slate-500">
              Tên tỉnh/thành và mã địa điểm được lấy trực tiếp từ API.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Tìm tỉnh, thành phố..."
              className="w-44 bg-transparent text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition-colors hover:border-brand-primary/20 hover:text-brand-primary"
            >
              Tìm
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-b border-slate-100 px-5 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            Quản lý địa điểm khai thác theo tỉnh, thành phố
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Trang {pageInfo.current} / {pageInfo.total}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải địa điểm...
            </div>
          </div>
        ) : error ? (
          <div className="bg-white px-4 py-12">
            <div className="flex items-start gap-3 rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4 text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">
                  Không thể tải địa điểm
                </div>
                <div className="mt-1 text-[12px] font-medium leading-relaxed">
                  {error}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReloadNonce((value) => value + 1)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-rose-700 transition-colors hover:bg-rose-100"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
            <div className="text-center">
              <div className="text-[13px] font-bold text-slate-900">
                {searchQuery
                  ? "Không tìm thấy địa điểm phù hợp"
                  : "Chưa có địa điểm nào trong hệ thống"}
              </div>
              <div className="mt-1 text-[12px] font-medium text-slate-500">
                Hãy thử tìm với từ khóa khác hoặc tạo địa điểm mới.
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid grid-cols-[1.5fr_0.7fr_1fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <span>Tên địa điểm</span>
              <span>Mã</span>
              <span>Cập nhật</span>
              <span className="text-right">Thao tác</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.5fr_0.7fr_1fr_0.8fr] gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50/60"
              >
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">
                    {item.name}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                    {item.code}
                  </span>
                </div>
                <div className="flex items-center text-[12px] text-slate-700">
                  {item.updatedAt}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-primary"
                    title="Sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Xoá"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            {totalElements > 0 ? (
              <>
                Hiển thị {pageInfo.start}-{pageInfo.end} trên {totalElements}{" "}
                địa điểm
              </>
            ) : (
              "Không có dữ liệu để hiển thị"
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              disabled={pageInfo.current === 1 || isLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-brand-primary/20 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Trước
            </button>

            {pageButtons.map((pageItem, index) =>
              pageItem === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-9 items-center justify-center px-2 text-slate-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageItem}
                  type="button"
                  onClick={() => setPageNumber(pageItem)}
                  disabled={isLoading}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-[11px] font-black transition-colors ${
                    pageItem === pageInfo.current
                      ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {pageItem}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setPageNumber((value) =>
                  Math.min(Math.max(pageInfo.total, 1), value + 1),
                )
              }
              disabled={pageInfo.current >= pageInfo.total || isLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-brand-primary/20 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div
            className="mt-4 mb-4 max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-y-auto rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
                  <Plus className="h-3.5 w-3.5" />
                  {editingId ? "Sửa địa điểm" : "Thêm địa điểm"}
                </div>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {editingId ? "Cập nhật địa điểm" : "Tạo địa điểm mới"}
                </h3>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  Nhập tên tỉnh/thành và mã địa điểm để lưu vào
                  provinces-service.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitError ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-700">
                {submitError}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Tên tỉnh / thành
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Hà Nội"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Mã địa điểm
                </span>
                <input
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="HN"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-white transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {submitLoading
                  ? editingId
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : editingId
                    ? "Cập nhật địa điểm"
                    : "Tạo địa điểm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
