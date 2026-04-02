import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
  Loader2,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Save,
  X,
} from "lucide-react";
import { ROUTE_SERVICE_BASE_URL } from "../../utils/api";
import {
  createRequestEnvelopeHeaders,
  createRequestMeta,
} from "../../utils/requestMeta";
import { PROVINCES_SERVICE_BASE_URL } from "../../utils/api";
import {
  extractArrayValue,
  extractBooleanValue,
  extractDisplayValue,
  extractNumberValue,
  extractStringValue,
} from "../../utils/responseExtractors";

type RouteStatus =
  | "PLANNED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELED"
  | "ACTIVE"
  | "DRAFT"
  | "PAUSED"
  | "UNKNOWN";

type StopPoint = {
  id: string;
  stopOrder: string;
  location: string;
  note: string;
  plannedArrivalTime: string;
  plannedDepartureTime: string;
};

type RouteOperationPointForm = {
  operationOrder: string;
  plannedArrivalTime: string;
  plannedDepartureTime: string;
  note: string;
};

type RouteCreateForm = {
  creator: string;
  pickupBranch: string;
  origin: string;
  destination: string;
  plannedStartTime: string;
  plannedEndTime: string;
  operationPoints: RouteOperationPointForm[];
};

type ProvinceOption = {
  id: string;
  name: string;
  code: string;
  label: string;
};

type RouteRow = {
  id: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  pickupBranch: string;
  departureTime: string;
  arrivalTime: string;
  actualStartTime: string;
  actualEndTime: string;
  assignedVehicle: string;
  licensePlate: string;
  assignedDriver: string;
  status: RouteStatus;
  statusText: string;
  stopLocation: string;
  stopInfo: string;
  stopPoints: StopPoint[];
  note: string;
};

const PAGE_SIZE = 10;
const UTC_PLUS_7 = "+07:00";

const statusMeta: Record<RouteStatus, { label: string; badge: string }> = {
  PLANNED: {
    label: "Đã lên kế hoạch",
    badge: "bg-sky-50 text-sky-700 border-sky-100",
  },
  ASSIGNED: {
    label: "Đã phân công",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
  },
  IN_PROGRESS: {
    label: "Đang diễn ra",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  DELAYED: {
    label: "Bị trì hoãn",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  CANCELED: {
    label: "Đã huỷ",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
  },
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
  UNKNOWN: {
    label: "Trạng thái",
    badge: "bg-sky-50 text-sky-700 border-sky-100",
  },
};

const normalizeStatus = (rawValue: unknown): RouteStatus => {
  if (typeof rawValue === "boolean") {
    return rawValue ? "ACTIVE" : "PAUSED";
  }

  if (typeof rawValue !== "string") {
    return "UNKNOWN";
  }

  const value = rawValue.trim().toLowerCase();
  if (!value) return "UNKNOWN";

  if (
    [
      "active",
      "running",
      "opened",
      "enabled",
      "published",
      "available",
    ].includes(value)
  ) {
    return "ACTIVE";
  }

  if (
    ["planned", "plan", "scheduled", "schedule", "open", "ready"].includes(
      value,
    )
  ) {
    return "PLANNED";
  }

  if (["assigned", "allocated", "booked"].includes(value)) {
    return "ASSIGNED";
  }

  if (
    [
      "in_progress",
      "inprogress",
      "progress",
      "ongoing",
      "running_now",
    ].includes(value)
  ) {
    return "IN_PROGRESS";
  }

  if (["completed", "done", "finished", "success"].includes(value)) {
    return "COMPLETED";
  }

  if (["delayed", "late", "postponed", "rescheduled", "hold"].includes(value)) {
    return "DELAYED";
  }

  if (
    ["canceled", "cancelled", "void", "aborted", "terminated"].includes(value)
  ) {
    return "CANCELED";
  }

  if (["draft", "pending", "new"].includes(value)) {
    return "DRAFT";
  }

  if (
    [
      "paused",
      "inactive",
      "disabled",
      "suspended",
      "stopped",
      "closed",
    ].includes(value)
  ) {
    return "PAUSED";
  }

  return "UNKNOWN";
};

const formatTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 16) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const formatLocalDateTimeWithOffset = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00${UTC_PLUS_7}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}${UTC_PLUS_7}`;
  }
  return trimmed;
};

const getCurrentLocalDateTimeValue = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const parseLocalDateTimeValue = (value: string) => {
  if (!value.trim()) return Number.NaN;
  const parsed = new Date(value);
  return parsed.getTime();
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

const createRouteFormTemplate = (): RouteCreateForm => ({
  creator:
    localStorage.getItem("userName") ||
    localStorage.getItem("userId") ||
    "demo_user",
  pickupBranch: "",
  origin: "",
  destination: "",
  plannedStartTime: "",
  plannedEndTime: "",
  operationPoints: [
    {
      operationOrder: "1",
      plannedArrivalTime: "",
      plannedDepartureTime: "",
      note: "",
    },
  ],
});

const mapProvinceOption = (rawItem: unknown, index: number): ProvinceOption => {
  const item = rawItem as Record<string, unknown>;
  const name = extractStringValue(item, [
    "name",
    "provinceName",
    "province",
    "title",
    "label",
  ]);
  const code = extractStringValue(item, [
    "code",
    "provinceCode",
    "shortCode",
    "abbreviation",
  ]);
  const id =
    extractStringValue(item, ["id", "provinceId", "uuid"]) ||
    code ||
    name ||
    `province-${index + 1}`;
  const label = [name, code ? `(${code})` : ""].filter(Boolean).join(" ").trim();

  return {
    id,
    name,
    code,
    label: label || name || code || `Địa điểm ${index + 1}`,
  };
};

const loadAllProvinceOptions = async (
  signal: AbortSignal,
): Promise<ProvinceOption[]> => {
  const allItems: ProvinceOption[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  while (pageNumber <= totalPages) {
    const authToken = localStorage.getItem("authToken") || "";
    const url = new URL(PROVINCES_SERVICE_BASE_URL);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/management/provinces-service/fetch`;
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
      signal,
    });

    if (!response.ok) {
      throw new Error(`Không thể tải danh sách địa điểm (${response.status})`);
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

    allItems.push(...rawItems.map((item, index) => mapProvinceOption(item, index)));

    const resolvedTotalPages = extractNumberValue(body, [
      "totalPages",
      "pages",
      "pageCount",
      "total_page",
    ]);
    if (typeof resolvedTotalPages === "number" && resolvedTotalPages > 0) {
      totalPages = resolvedTotalPages;
    } else if (rawItems.length < PAGE_SIZE) {
      totalPages = pageNumber;
    }

    pageNumber += 1;
  }

  return allItems.filter((item, index, array) => {
    const key = `${item.name || item.code || item.id}`.toLowerCase();
    return array.findIndex((entry) => `${entry.name || entry.code || entry.id}`.toLowerCase() === key) === index;
  });
};

const mapRouteRow = (
  rawItem: unknown,
  index: number,
  pageNumber: number,
): RouteRow => {
  const item = rawItem as Record<string, unknown>;
  const origin = extractStringValue(item, [
    "origin",
    "from",
    "startPoint",
    "startLocation",
    "departurePoint",
  ]);
  const destination = extractStringValue(item, [
    "destination",
    "to",
    "endPoint",
    "endLocation",
    "arrivalPoint",
  ]);
  const routeCode =
    extractStringValue(item, [
      "routeCode",
      "code",
      "routeId",
      "routeNo",
      "routeNumber",
    ]) || `ROUTE-${(pageNumber - 1) * PAGE_SIZE + index + 1}`;
  const routeName =
    extractStringValue(item, ["routeName", "name", "title", "label"]) ||
    (origin && destination
      ? `${origin} - ${destination}`
      : "Chưa có tên tuyến");
  const plannedStartTime = formatTime(
    extractDisplayValue(item, [
      "plannedStartTime",
      "departureTime",
      "departure",
      "startTime",
      "startAt",
      "departAt",
    ]),
  );
  const plannedEndTime = formatTime(
    extractDisplayValue(item, [
      "plannedEndTime",
      "arrivalTime",
      "arrival",
      "endTime",
      "endAt",
      "arriveAt",
    ]),
  );
  const actualStartTime = formatTime(
    extractDisplayValue(item, [
      "actualStartTime",
      "realStartTime",
      "startedAt",
      "departureTime",
    ]),
  );
  const actualEndTime = formatTime(
    extractDisplayValue(item, [
      "actualEndTime",
      "realEndTime",
      "endedAt",
      "arrivalTime",
    ]),
  );
  const assignedVehicle = extractStringValue(item, [
    "assignedVehicle",
    "vehicle",
    "vehicleName",
    "bus",
    "vehicleCode",
  ]);
  const licensePlate = extractStringValue(item, [
    "licensePlate",
    "plate",
    "vehiclePlate",
  ]);
  const assignedDriver = extractStringValue(item, [
    "assignedDriver",
    "driver",
    "driverName",
  ]);
  const pickupBranch = extractStringValue(item, [
    "pickupBranch",
    "boardingPoint",
    "startBranch",
    "branch",
    "depot",
  ]);
  const stopPoints = extractArrayValue(item, [
    "stopPoints",
    "stops",
    "waypoints",
  ]).map((stop, stopIndex) => {
    const stopItem = stop as Record<string, unknown>;
    return {
      id:
        extractStringValue(stopItem, ["id", "stopId", "uuid"]) ||
        `${pageNumber}-${index}-stop-${stopIndex}`,
      stopOrder:
        extractStringValue(stopItem, ["stopOrder", "order", "sequence"]) ||
        String(stopIndex + 1),
      location: extractStringValue(stopItem, [
        "location",
        "stopLocation",
        "place",
        "address",
        "name",
      ]),
      note: extractStringValue(stopItem, [
        "note",
        "description",
        "remarks",
        "memo",
      ]),
      plannedArrivalTime: formatTime(
        extractDisplayValue(stopItem, [
          "plannedArrivalTime",
          "arrivalTime",
          "arrival",
          "estimatedArrivalTime",
        ]),
      ),
      plannedDepartureTime: formatTime(
        extractDisplayValue(stopItem, [
          "plannedDepartureTime",
          "departureTime",
          "departure",
          "estimatedDepartureTime",
        ]),
      ),
    };
  });
  const stopLocation =
    extractStringValue(item, [
      "stopLocation",
      "stopAt",
      "stopPlace",
      "stopPoint",
      "restStop",
      "breakPoint",
    ]) ||
    stopPoints[0]?.location ||
    pickupBranch;
  const stopInfo =
    extractStringValue(item, [
      "stopInfo",
      "stopDescription",
      "stopNote",
      "stopSummary",
    ]) ||
    stopPoints[0]?.note ||
    (stopPoints.length > 0 ? `${stopPoints.length} điểm dừng` : "");
  const note = extractStringValue(item, [
    "note",
    "description",
    "remarks",
    "memo",
  ]);

  const isActive = extractBooleanValue(item, ["isActive", "active", "enabled"]);
  const statusText = extractStringValue(item, [
    "status",
    "routeStatus",
    "state",
  ]);
  const rawStatus =
    statusText ||
    (isActive === true ? "ACTIVE" : isActive === false ? "PAUSED" : "");

  return {
    id:
      extractStringValue(item, ["id", "routeId", "uuid"]) ||
      `${pageNumber}-${index}-${routeCode}`,
    routeCode,
    routeName: routeName.toUpperCase(),
    origin,
    destination,
    pickupBranch,
    departureTime: plannedStartTime,
    arrivalTime: plannedEndTime,
    assignedVehicle,
    licensePlate,
    assignedDriver,
    status: normalizeStatus(rawStatus),
    statusText,
    actualStartTime,
    actualEndTime,
    stopLocation,
    stopInfo,
    stopPoints,
    note,
  };
};

export function RouteManagementPage() {
  const [items, setItems] = useState<RouteRow[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>(
    {},
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState<RouteCreateForm>(
    createRouteFormTemplate,
  );
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [provinceError, setProvinceError] = useState("");
  const [provinceLoaded, setProvinceLoaded] = useState(false);
  const [createMinDateTime, setCreateMinDateTime] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadRoutes = async () => {
      setIsLoading(true);
      setError("");
      setItems([]);

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const url = new URL(ROUTE_SERVICE_BASE_URL);
        url.pathname = `${url.pathname.replace(/\/$/, "")}/route-service/fetch`;
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
            `Không thể tải danh sách các tuyến xe (${response.status})`,
          );
          throw new Error(message);
        }

        const body: unknown = await response.json();
        const rawItems = extractArrayValue(body, [
          "content",
          "items",
          "data",
          "routes",
          "result",
          "list",
        ]);

        const normalizedItems = rawItems.map((item, index) =>
          mapRouteRow(item, index, pageNumber),
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
            : "Đã xảy ra lỗi khi tải danh sách tuyến xe",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();

    return () => controller.abort();
  }, [pageNumber, reloadNonce]);

  useEffect(() => {
    if (!createModalOpen || provinceLoaded) {
      return;
    }

    const controller = new AbortController();

    const loadProvinces = async () => {
      setProvinceLoading(true);
      setProvinceError("");

      try {
        const provinces = await loadAllProvinceOptions(controller.signal);
        setProvinceOptions(provinces);
        setProvinceLoaded(true);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setProvinceError(
          loadError instanceof Error
            ? loadError.message
            : "Đã xảy ra lỗi khi tải danh sách địa điểm",
        );
      } finally {
        setProvinceLoading(false);
      }
    };

    loadProvinces();

    return () => controller.abort();
  }, [createModalOpen, provinceLoaded]);

  useEffect(() => {
    if (!createModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [createModalOpen]);

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "ACTIVE").length,
      draft: items.filter((item) => item.status === "DRAFT").length,
      paused: items.filter((item) => item.status === "PAUSED").length,
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

  const renderBadge = (label: string, value: string, tone = "bg-white") => (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm ${tone}`}
    >
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      <span className="font-medium text-slate-800">{value}</span>
    </span>
  );

  const toggleStopExpansion = (stopId: string) => {
    setExpandedStops((current) => ({
      ...current,
      [stopId]: !current[stopId],
    }));
  };

  const openCreateModal = () => {
    setCreateError("");
    setCreateForm(createRouteFormTemplate());
    setCreateMinDateTime(getCurrentLocalDateTimeValue());
    setCreateModalOpen(true);
    if (provinceOptions.length === 0) {
      setProvinceLoaded(false);
    }
  };

  const closeCreateModal = () => {
    if (createSubmitting) return;
    setCreateModalOpen(false);
    setCreateError("");
  };

  const updateOperationPoint = (
    index: number,
    patch: Partial<RouteOperationPointForm>,
  ) => {
    setCreateForm((current) => ({
      ...current,
      operationPoints: current.operationPoints.map((point, pointIndex) =>
        pointIndex === index ? { ...point, ...patch } : point,
      ),
    }));
  };

  const addOperationPoint = () => {
    setCreateForm((current) => ({
      ...current,
      operationPoints: [
        ...current.operationPoints,
        {
          operationOrder: String(current.operationPoints.length + 1),
          plannedArrivalTime: "",
          plannedDepartureTime: "",
          note: "",
        },
      ],
    }));
  };

  const removeOperationPoint = (index: number) => {
    setCreateForm((current) => {
      const nextPoints = current.operationPoints.filter(
        (_, pointIndex) => pointIndex !== index,
      );
      return {
        ...current,
        operationPoints:
          nextPoints.length > 0
            ? nextPoints.map((point, pointIndex) => ({
                ...point,
                operationOrder: String(pointIndex + 1),
              }))
            : [
                {
                  operationOrder: "1",
                  plannedArrivalTime: "",
                  plannedDepartureTime: "",
                  note: "",
                },
              ],
      };
    });
  };

  const handleCreateRoute = async () => {
    const pickupBranch = createForm.pickupBranch.trim();
    const origin = createForm.origin.trim();
    const destination = createForm.destination.trim();
    const plannedStartTime = formatLocalDateTimeWithOffset(
      createForm.plannedStartTime,
    );
  const plannedEndTime = formatLocalDateTimeWithOffset(
      createForm.plannedEndTime,
    );
    if (
      !pickupBranch ||
      !origin ||
      !destination ||
      !plannedStartTime ||
      !plannedEndTime
    ) {
      setCreateError("Vui lòng nhập đầy đủ thông tin chuyến trước khi tạo.");
      return;
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setCreateError("Điểm đi và điểm đến không được trùng nhau.");
      return;
    }

    if (
      parseLocalDateTimeValue(createForm.plannedStartTime) <
        parseLocalDateTimeValue(createMinDateTime) ||
      parseLocalDateTimeValue(createForm.plannedEndTime) <
        parseLocalDateTimeValue(createMinDateTime)
    ) {
      setCreateError("Không được chọn ngày giờ trong quá khứ.");
      return;
    }

    setCreateSubmitting(true);
    setCreateError("");

    try {
      const meta = createRequestMeta();
      const response = await fetch(
        `${ROUTE_SERVICE_BASE_URL}/management/route-service/create`,
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
            channel: "OFF",
            data: {
              creator: createForm.creator.trim() || "demo_user",
              pickupBranch,
              origin,
              destination,
              plannedStartTime,
              plannedEndTime,
              operationPoints: createForm.operationPoints
                .map((point, index) => ({
                  operationOrder:
                    point.operationOrder.trim() || String(index + 1),
                  plannedArrivalTime: formatLocalDateTimeWithOffset(
                    point.plannedArrivalTime,
                  ),
                  plannedDepartureTime: formatLocalDateTimeWithOffset(
                    point.plannedDepartureTime,
                  ),
                  note: point.note.trim(),
                }))
                .filter(
                  (point) =>
                    point.operationOrder ||
                    point.plannedArrivalTime ||
                    point.plannedDepartureTime ||
                    point.note,
                ),
            },
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Không thể tạo chuyến (${response.status})`,
        );
        throw new Error(message);
      }

      setCreateModalOpen(false);
      setPageNumber(1);
      setReloadNonce((value) => value + 1);
    } catch (createRouteError) {
      setCreateError(
        createRouteError instanceof Error
          ? createRouteError.message
          : "Không thể tạo chuyến",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
            <Route className="h-3.5 w-3.5" />
            Quản lý tuyến xe
          </div>
          <h2 className="mt-2 text-[1.25rem] font-bold tracking-tight text-slate-900 sm:text-[1.5rem] uppercase">
            Quản lý các tuyến xe
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo Chuyến
          </button>
          <button
            type="button"
            onClick={() => setReloadNonce((value) => value + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng routes",
            value: String(totalElements),
          },
          {
            label: "Đang hiển thị",
            value: String(summary.totalLoaded),
            note: `Trang ${pageInfo.current}/${pageInfo.total}`,
          },
          {
            label: "Đang chạy",
            value: String(summary.active),
            note: "Trên trang hiện tại",
          },
          {
            label: "Nháp / tạm dừng",
            value: `${summary.draft + summary.paused}`,
            note: "Trên trang hiện tại",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
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

      <div className="rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
              Danh sách các tuyến xe đang vận hành
            </h3>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Trang {pageInfo.current} / {pageInfo.total}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải các tuyến xe...
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4 text-rose-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold">
                    Không thể tải các tuyến xe
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
            <div className="flex min-h-60 items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/60">
              <div className="text-center">
                <div className="text-[13px] font-bold text-slate-900">
                  Không có tuyến xe nào đang vận hành
                </div>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.35rem] border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-5 mb-5">
                          <div className="text-[15px] font-black tracking-tight text-slate-900">
                            {item.routeName}
                          </div>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${statusMeta[item.status].badge}`}
                          >
                            {statusMeta[item.status].label ||
                              item.statusText ||
                              "Trạng thái"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                            <Route className="h-3.5 w-3.5 text-slate-400" />
                            {item.routeCode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {item.origin || "Chưa có điểm đi"}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-semibold text-slate-600 shadow-sm">
                            <Map className="h-3.5 w-3.5 text-slate-400" />
                            {item.destination || "Chưa có điểm đến"}
                          </span>
                          {item.departureTime ? (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/5 px-2.5 py-1.25 font-bold text-brand-primary shadow-sm ring-1 ring-brand-primary/10">
                                <Clock3 className="h-3.5 w-3.5" />
                                Bắt đầu: {item.departureTime}
                              </span>
                            </>
                          ) : null}
                          {item.arrivalTime ? (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.25 font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
                                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                Kết thúc: {item.arrivalTime}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {!item.assignedDriver || !item.assignedVehicle ? (
                        <button
                          type="button"
                          className="inline-flex h-fit items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
                        >
                          Gán Chuyến
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-5 text-[12px]">
                  {renderBadge("Tài xế", item.assignedDriver || "Chưa có")}
                  {renderBadge("Xe", item.assignedVehicle || "Chưa có")}
                  {renderBadge("Biển số", item.licensePlate || "Chưa có")}
                  {renderBadge(
                    "Điểm Xuất Phát",
                    item.stopLocation || item.pickupBranch || "Chưa có",
                    "bg-slate-50",
                  )}
                </div>

                {item.stopPoints.length > 0 ? (
                  <div className="mt-4 rounded-[1.1rem] border border-slate-100 bg-white/80 p-3.5">
                    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Điểm dừng chân
                    </div>
                    <div className="space-y-2">
                      {item.stopPoints.map((stop) => (
                        <div
                          key={stop.id}
                          className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => toggleStopExpansion(stop.id)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                                  Trạm {stop.stopOrder}
                                </span>
                                <span className="text-[12px] font-bold text-slate-900">
                                  {stop.location ||
                                    stop.note ||
                                    "Trạm dừng chân"}
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] font-medium text-slate-500">
                                {stop.plannedArrivalTime ||
                                stop.plannedDepartureTime ? (
                                  <>
                                    {stop.plannedArrivalTime || "--:--"} -{" "}
                                    {stop.plannedDepartureTime || "--:--"}
                                  </>
                                ) : (
                                  "Chưa có thời gian chi tiết"
                                )}
                              </div>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                                expandedStops[stop.id] ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {expandedStops[stop.id] ? (
                            <div className="border-t border-slate-100 bg-white px-3 py-3">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Vị trí điểm dừng
                                  </div>
                                  <div className="mt-1 text-[12px] font-bold text-slate-900">
                                    {stop.location || "Chưa có thông tin"}
                                  </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Số thứ tự
                                  </div>
                                  <div className="mt-1 text-[12px] font-bold text-slate-900">
                                    {stop.stopOrder}
                                  </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Giờ đến
                                  </div>
                                  <div className="mt-1 text-[12px] font-bold text-slate-900">
                                    {stop.plannedArrivalTime || "Chưa có"}
                                  </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Giờ rời
                                  </div>
                                  <div className="mt-1 text-[12px] font-bold text-slate-900">
                                    {stop.plannedDepartureTime || "Chưa có"}
                                  </div>
                                </div>
                              </div>

                              {stop.note ? (
                                <div className="mt-3 rounded-xl border border-brand-primary/10 bg-brand-primary/5 px-3 py-2.5">
                                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-primary">
                                    Thông tin điểm dừng
                                  </div>
                                  <div className="mt-1 text-[12px] font-medium leading-relaxed text-slate-700">
                                    {stop.note}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-500">
                                  Chưa có mô tả chi tiết cho điểm dừng này.
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            {totalElements > 0 ? (
              <>
                Hiển thị {pageInfo.start}-{pageInfo.end} trên {totalElements}{" "}
                routes
              </>
            ) : (
              "Không có dữ liệu để hiển thị"
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              disabled={pageNumber === 1 || isLoading}
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
                    pageItem === pageNumber
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
                  Math.min(Math.max(totalPages, 1), value + 1),
                )
              }
              disabled={pageNumber >= totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-brand-primary/20 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {createModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
          <div
            className="mt-4 mb-4 max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
                  <Plus className="h-3.5 w-3.5" />
                  Tạo Chuyến
                </div>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  Tạo chuyến mới
                </h3>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  Nhập thông tin chuyến, thời gian dự kiến và các điểm dừng vận hành.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-700">
                {createError}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Người tạo
                </span>
                <input
                  type="text"
                  value={createForm.creator}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      creator: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Điểm xuất phát
                </span>
                <input
                  type="text"
                  value={createForm.pickupBranch}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      pickupBranch: event.target.value,
                    }))
                  }
                  placeholder="Bến xe Miền Tây, TP.HCM"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Điểm đi
                </span>
                <select
                  value={createForm.origin}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      origin: event.target.value,
                    }))
                  }
                  disabled={provinceLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {provinceLoading ? "Đang tải địa điểm..." : "Chọn điểm đi"}
                  </option>
                  {provinceOptions.map((province) => (
                    <option
                      key={province.id}
                      value={province.name || province.label}
                      disabled={
                        (createForm.destination.trim().length > 0 &&
                          (province.name || province.label).trim().toLowerCase() ===
                            createForm.destination.trim().toLowerCase()) ||
                        (createForm.origin.trim().length > 0 &&
                          (province.name || province.label).trim().toLowerCase() ===
                            createForm.origin.trim().toLowerCase())
                      }
                    >
                      {province.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Điểm đến
                </span>
                <select
                  value={createForm.destination}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      destination: event.target.value,
                    }))
                  }
                  disabled={provinceLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {provinceLoading ? "Đang tải địa điểm..." : "Chọn điểm đến"}
                  </option>
                  {provinceOptions.map((province) => (
                    <option
                      key={province.id}
                      value={province.name || province.label}
                      disabled={
                        (createForm.origin.trim().length > 0 &&
                          (province.name || province.label).trim().toLowerCase() ===
                            createForm.origin.trim().toLowerCase()) ||
                        (createForm.destination.trim().length > 0 &&
                          (province.name || province.label).trim().toLowerCase() ===
                            createForm.destination.trim().toLowerCase())
                      }
                    >
                      {province.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Giờ khởi hành
                </span>
                <input
                  type="datetime-local"
                  min={createMinDateTime}
                  value={createForm.plannedStartTime}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      plannedStartTime: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Giờ kết thúc
                </span>
                <input
                  type="datetime-local"
                  min={createForm.plannedStartTime || createMinDateTime}
                  value={createForm.plannedEndTime}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      plannedEndTime: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-3 min-h-[56px]">
              {provinceError ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                  <span>{provinceError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProvinceLoaded(false);
                      setProvinceError("");
                    }}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    Tải lại địa điểm
                  </button>
                </div>
              ) : provinceLoading ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                  Đang tải danh sách địa điểm khai thác...
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-[13px] font-black tracking-tight text-slate-900">
                  Điểm dừng vận hành
                </h4>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                    Thêm các điểm dừng chân theo thứ tự vận hành.
                </p>
                </div>
                <button
                  type="button"
                  onClick={addOperationPoint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm điểm dừng
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {createForm.operationPoints.map((point, index) => (
                  <div
                    key={`${point.operationOrder}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                          Điểm {index + 1}
                      </div>
                      {createForm.operationPoints.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeOperationPoint(index)}
                          className="text-[11px] font-black uppercase tracking-[0.12em] text-rose-500 transition-colors hover:text-rose-700"
                        >
                          Xoá
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Số thứ tự
                        </span>
                        <input
                          type="text"
                          value={point.operationOrder}
                          onChange={(event) =>
                            updateOperationPoint(index, {
                              operationOrder: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Ghi chú
                        </span>
                        <input
                          type="text"
                          value={point.note}
                          onChange={(event) =>
                            updateOperationPoint(index, { note: event.target.value })
                          }
                          placeholder="Dừng tại Tiền Giang"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Giờ đến
                        </span>
                        <input
                          type="datetime-local"
                          value={point.plannedArrivalTime}
                          onChange={(event) =>
                            updateOperationPoint(index, {
                              plannedArrivalTime: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Giờ rời
                        </span>
                        <input
                          type="datetime-local"
                          value={point.plannedDepartureTime}
                          onChange={(event) =>
                            updateOperationPoint(index, {
                              plannedDepartureTime: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={createSubmitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateRoute}
                disabled={createSubmitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-white transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {createSubmitting ? "Đang tạo..." : "Tạo chuyến"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
