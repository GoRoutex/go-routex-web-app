import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Route,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  POINT_SERVICE_BASE_URL,
  ROUTE_SERVICE_BASE_URL,
} from "../../utils/api";
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

type RoutePointSourceType = "OPERATION_POINT" | "FREE_STOP";

type RouteOperationPointForm = {
  id?: string;
  sourceType: RoutePointSourceType;
  operationOrder: string;
  operationPointId: string;
  stopName: string;
  stopAddress: string;
  stopCity: string;
  stopLatitude: string;
  stopLongitude: string;
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
  assignedVehicle: string;
  assignedDriver: string;
  operationPoints: RouteOperationPointForm[];
};

type ProvinceOption = {
  id: string;
  name: string;
  code: string;
  label: string;
};

type OperationPointOption = {
  id: string;
  code: string;
  name: string;
  type: string;
  label: string;
};

type RouteRow = {
  id: string;
  creator: string;
  routeCode: string;
  routeName: string;
  origin: string;
  destination: string;
  pickupBranch: string;
  plannedStartTimeRaw: string;
  plannedEndTimeRaw: string;
  departureTime: string;
  arrivalTime: string;
  actualStartTimeRaw: string;
  actualStartTime: string;
  actualEndTimeRaw: string;
  actualEndTime: string;
  assignedVehicle: string;
  licensePlate: string;
  assignedDriver: string;
  status: RouteStatus;
  statusText: string;
  stopLocation: string;
  stopInfo: string;
  stopPoints: StopPoint[];
  routePoints: RouteOperationPointForm[];
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

const toDateTimeLocalInputValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed.length >= 16 ? trimmed.slice(0, 16) : trimmed;
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate(),
  )}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const toDateOnlyValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed.slice(0, 10);

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
    parsed.getDate(),
  )}`;
};

const formatDateLabel = (value: string) => {
  const normalized = toDateOnlyValue(value);
  if (!normalized) return "";
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return normalized;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
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
  assignedVehicle: "",
  assignedDriver: "",
  operationPoints: [
    {
      sourceType: "OPERATION_POINT",
      operationOrder: "1",
      operationPointId: "",
      stopName: "",
      stopAddress: "",
      stopCity: "",
      stopLatitude: "",
      stopLongitude: "",
      plannedArrivalTime: "",
      plannedDepartureTime: "",
      note: "",
    },
  ],
});

const createOperationPointFormTemplate = (
  operationOrder: string,
): RouteOperationPointForm => ({
  id: "",
  sourceType: "OPERATION_POINT",
  operationOrder,
  operationPointId: "",
  stopName: "",
  stopAddress: "",
  stopCity: "",
  stopLatitude: "",
  stopLongitude: "",
  plannedArrivalTime: "",
  plannedDepartureTime: "",
  note: "",
});

const fieldSelectClassName =
  "h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white";

const fieldInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white";

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
  const label = [name, code ? `(${code})` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();

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

    allItems.push(
      ...rawItems.map((item, index) => mapProvinceOption(item, index)),
    );

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
    return (
      array.findIndex(
        (entry) =>
          `${entry.name || entry.code || entry.id}`.toLowerCase() === key,
      ) === index
    );
  });
};

const mapOperationPointOption = (
  rawItem: unknown,
  index: number,
): OperationPointOption => {
  const item = rawItem as Record<string, unknown>;
  const id =
    extractStringValue(item, ["id", "pointId", "operationPointId", "uuid"]) ||
    `operation-point-${index + 1}`;
  const code = extractStringValue(item, ["code", "pointCode"]);
  const name = extractStringValue(item, ["name", "pointName", "title"]);
  const type = extractStringValue(item, ["type", "pointType"]);
  const label = [name, code ? `(${code})` : ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id,
    code,
    name,
    type,
    label: label || name || code || `Điểm dừng ${index + 1}`,
  };
};

const loadAllOperationPointOptions = async (
  signal: AbortSignal,
): Promise<OperationPointOption[]> => {
  const allItems: OperationPointOption[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  while (pageNumber <= totalPages) {
    const authToken = localStorage.getItem("authToken") || "";
    const url = new URL(POINT_SERVICE_BASE_URL);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/management/point-service/fetch`;
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
      throw new Error(
        `Không thể tải danh sách OperationPoint (${response.status})`,
      );
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

    allItems.push(
      ...rawItems.map((item, index) => mapOperationPointOption(item, index)),
    );

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
    const key = `${item.id || item.code || item.name}`.toLowerCase();
    return (
      array.findIndex(
        (entry) =>
          `${entry.id || entry.code || entry.name}`.toLowerCase() === key,
      ) === index
    );
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
      : "Chưa có tên lịch chuyến");
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
    creator: extractStringValue(item, ["creator", "createdBy", "owner"]),
    routeCode,
    routeName: routeName.toUpperCase(),
    origin,
    destination,
    pickupBranch,
    plannedStartTimeRaw:
      extractStringValue(item, [
        "plannedStartTime",
        "departureTime",
        "departure",
        "startTime",
        "startAt",
        "departAt",
      ]) ||
      extractDisplayValue(item, [
        "plannedStartTime",
        "departureTime",
        "departure",
        "startTime",
        "startAt",
        "departAt",
      ]),
    plannedEndTimeRaw:
      extractStringValue(item, [
        "plannedEndTime",
        "arrivalTime",
        "arrival",
        "endTime",
        "endAt",
        "arriveAt",
      ]) ||
      extractDisplayValue(item, [
        "plannedEndTime",
        "arrivalTime",
        "arrival",
        "endTime",
        "endAt",
        "arriveAt",
      ]),
    departureTime: plannedStartTime,
    arrivalTime: plannedEndTime,
    actualStartTimeRaw:
      extractStringValue(item, [
        "actualStartTime",
        "realStartTime",
        "startedAt",
        "departureTime",
      ]) ||
      extractDisplayValue(item, [
        "actualStartTime",
        "realStartTime",
        "startedAt",
        "departureTime",
      ]),
    actualEndTimeRaw:
      extractStringValue(item, [
        "actualEndTime",
        "realEndTime",
        "endedAt",
        "arrivalTime",
      ]) ||
      extractDisplayValue(item, [
        "actualEndTime",
        "realEndTime",
        "endedAt",
        "arrivalTime",
      ]),
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
    routePoints: extractArrayValue(item, [
      "routePoints",
      "points",
      "operations",
      "operationPoints",
    ]).map((point, pointIndex) => {
      const routePoint = point as Record<string, unknown>;
      const operationPointId = extractStringValue(routePoint, [
        "operationPointId",
        "pointId",
        "linkedPointId",
      ]);
      const stopName = extractStringValue(routePoint, [
        "stopName",
        "name",
        "location",
      ]);
      const stopAddress = extractStringValue(routePoint, [
        "stopAddress",
        "address",
      ]);
      const stopCity = extractStringValue(routePoint, ["stopCity", "city"]);
      const stopLatitude = extractStringValue(routePoint, [
        "stopLatitude",
        "latitude",
        "lat",
      ]);
      const stopLongitude = extractStringValue(routePoint, [
        "stopLongitude",
        "longitude",
        "lng",
        "lon",
      ]);

      return {
        id:
          extractStringValue(routePoint, ["id", "routePointId", "uuid"]) ||
          `${pageNumber}-${index}-route-point-${pointIndex}`,
        sourceType:
          operationPointId.trim().length > 0 ? "OPERATION_POINT" : "FREE_STOP",
        operationOrder:
          extractStringValue(routePoint, [
            "operationOrder",
            "order",
            "sequence",
          ]) || String(pointIndex + 1),
        operationPointId,
        stopName,
        stopAddress,
        stopCity,
        stopLatitude,
        stopLongitude,
        plannedArrivalTime:
          extractStringValue(routePoint, [
            "plannedArrivalTime",
            "arrivalTime",
            "arrival",
            "estimatedArrivalTime",
          ]) ||
          extractDisplayValue(routePoint, [
            "plannedArrivalTime",
            "arrivalTime",
            "arrival",
            "estimatedArrivalTime",
          ]),
        plannedDepartureTime:
          extractStringValue(routePoint, [
            "plannedDepartureTime",
            "departureTime",
            "departure",
            "estimatedDepartureTime",
          ]) ||
          extractDisplayValue(routePoint, [
            "plannedDepartureTime",
            "departureTime",
            "departure",
            "estimatedDepartureTime",
          ]),
        note: extractStringValue(routePoint, [
          "note",
          "description",
          "remarks",
          "memo",
        ]),
      };
    }),
    note,
  };
};

export function RouteManagementPage() {
  const [items, setItems] = useState<RouteRow[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);
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
  const [operationPointOptions, setOperationPointOptions] = useState<
    OperationPointOption[]
  >([]);
  const [operationPointLoading, setOperationPointLoading] = useState(false);
  const [operationPointError, setOperationPointError] = useState("");
  const [operationPointLoaded, setOperationPointLoaded] = useState(false);
  const [createMinDateTime, setCreateMinDateTime] = useState("");
  const [search, setSearch] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [routeModalMode, setRouteModalMode] = useState<
    "create" | "edit" | "assign"
  >("create");
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadRoutes = async () => {
      setIsLoading(true);
      setError("");
      setItems([]);

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const allItems: RouteRow[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
          const url = new URL(ROUTE_SERVICE_BASE_URL);
          url.pathname = `${url.pathname.replace(/\/$/, "")}/route-service/fetch`;
          url.searchParams.set("pageNumber", String(currentPage));
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
              `Không thể tải danh sách lịch chuyến (${response.status})`,
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

          allItems.push(
            ...rawItems.map((item, index) =>
              mapRouteRow(item, index, currentPage),
            ),
          );

          const resolvedTotalPages = extractNumberValue(body, [
            "totalPages",
            "pages",
            "pageCount",
            "total_page",
          ]);

          if (
            typeof resolvedTotalPages === "number" &&
            resolvedTotalPages > 0
          ) {
            totalPagesToFetch = resolvedTotalPages;
          } else if (rawItems.length < PAGE_SIZE) {
            totalPagesToFetch = currentPage;
          }

          currentPage += 1;
        }

        setItems(allItems);
        setTotalElements(allItems.length);
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
            : "Đã xảy ra lỗi khi tải danh sách lịch chuyến",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();

    return () => controller.abort();
  }, [reloadNonce]);

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
    if (!createModalOpen || operationPointLoaded) {
      return;
    }

    const controller = new AbortController();

    const loadOperationPoints = async () => {
      setOperationPointLoading(true);
      setOperationPointError("");

      try {
        const points = await loadAllOperationPointOptions(controller.signal);
        setOperationPointOptions(points);
        setOperationPointLoaded(true);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setOperationPointError(
          loadError instanceof Error
            ? loadError.message
            : "Đã xảy ra lỗi khi tải danh sách OperationPoint",
        );
      } finally {
        setOperationPointLoading(false);
      }
    };

    loadOperationPoints();

    return () => controller.abort();
  }, [createModalOpen, operationPointLoaded]);

  useEffect(() => {
    if (!createModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [createModalOpen]);

  useEffect(() => {
    setPageNumber(1);
  }, [routeFilter, scheduleDate, search]);

  const summary = useMemo(
    () => ({
      active: items.filter((item) => item.status === "ACTIVE").length,
      draft: items.filter((item) => item.status === "DRAFT").length,
      paused: items.filter((item) => item.status === "PAUSED").length,
      totalLoaded: items.length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) =>
      [
        item.routeCode,
        item.routeName,
        item.origin,
        item.destination,
        item.pickupBranch,
        item.assignedVehicle,
        item.assignedDriver,
        item.licensePlate,
        item.stopLocation,
        item.statusText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  const filteredAndScopedItems = useMemo(() => {
    const dateFilter = scheduleDate.trim();
    const routeFilterValue = routeFilter.trim();

    return filteredItems.filter((item) => {
      const itemDate = toDateOnlyValue(item.plannedStartTimeRaw);
      const matchesDate = dateFilter ? itemDate === dateFilter : true;
      const matchesRoute =
        routeFilterValue === "ALL"
          ? true
          : (item.routeCode || item.id) === routeFilterValue;

      return matchesDate && matchesRoute;
    });
  }, [filteredItems, routeFilter, scheduleDate]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAndScopedItems.length / PAGE_SIZE)),
    [filteredAndScopedItems.length],
  );

  const currentPage = Math.min(Math.max(pageNumber, 1), totalPages);
  const pageSliceStart = (currentPage - 1) * PAGE_SIZE;

  const pageInfo = useMemo(() => {
    const start = filteredAndScopedItems.length === 0 ? 0 : pageSliceStart + 1;
    const end =
      filteredAndScopedItems.length === 0
        ? 0
        : Math.min(pageSliceStart + PAGE_SIZE, filteredAndScopedItems.length);

    return { current: currentPage, total: totalPages, start, end };
  }, [currentPage, filteredAndScopedItems.length, pageSliceStart, totalPages]);

  const pageButtons = useMemo(
    () => getVisiblePageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const displayedItems = useMemo(
    () =>
      filteredAndScopedItems.slice(pageSliceStart, pageSliceStart + PAGE_SIZE),
    [filteredAndScopedItems, pageSliceStart],
  );

  const routeOptions = useMemo(
    () =>
      Array.from(
        new Map(
          items.map((item) => [
            item.routeCode || item.id,
            item.routeName || item.routeCode || item.id,
          ]),
        ).entries(),
      ).map(([value, label]) => ({ value, label })),
    [items],
  );

  const openCreateModal = () => {
    setEditingRouteId(null);
    setRouteModalMode("create");
    setCreateError("");
    setCreateForm(createRouteFormTemplate());
    setCreateMinDateTime(getCurrentLocalDateTimeValue());
    setCreateModalOpen(true);
    if (provinceOptions.length === 0) {
      setProvinceLoaded(false);
    }
    if (operationPointOptions.length === 0) {
      setOperationPointLoaded(false);
    }
  };

  const closeCreateModal = () => {
    if (createSubmitting) return;
    setCreateModalOpen(false);
    setEditingRouteId(null);
    setRouteModalMode("create");
    setCreateError("");
  };

  const openEditModal = (item: RouteRow) => {
    setCreateError("");
    setRouteModalMode("edit");
    setEditingRouteId(item.id);
    setCreateMinDateTime(
      toDateTimeLocalInputValue(item.plannedStartTimeRaw) ||
        getCurrentLocalDateTimeValue(),
    );
    setCreateForm({
      creator: item.creator || localStorage.getItem("userName") || "demo_user",
      pickupBranch: item.pickupBranch,
      origin: item.origin,
      destination: item.destination,
      plannedStartTime: toDateTimeLocalInputValue(item.plannedStartTimeRaw),
      plannedEndTime: toDateTimeLocalInputValue(item.plannedEndTimeRaw),
      assignedVehicle: item.assignedVehicle || "",
      assignedDriver: item.assignedDriver || "",
      operationPoints:
        item.routePoints.length > 0
          ? item.routePoints.map((point, pointIndex) => ({
              id: point.id || "",
              sourceType: point.sourceType,
              operationOrder: point.operationOrder || String(pointIndex + 1),
              operationPointId: point.operationPointId || "",
              stopName: point.stopName || "",
              stopAddress: point.stopAddress || "",
              stopCity: point.stopCity || "",
              stopLatitude: point.stopLatitude || "",
              stopLongitude: point.stopLongitude || "",
              plannedArrivalTime: toDateTimeLocalInputValue(
                point.plannedArrivalTime,
              ),
              plannedDepartureTime: toDateTimeLocalInputValue(
                point.plannedDepartureTime,
              ),
              note: point.note || "",
            }))
          : item.stopPoints.length > 0
            ? item.stopPoints.map((stop, stopIndex) => ({
                id: "",
                sourceType: "FREE_STOP",
                operationOrder: String(stopIndex + 1),
                operationPointId: "",
                stopName: stop.location || stop.note || "",
                stopAddress: "",
                stopCity: "",
                stopLatitude: "",
                stopLongitude: "",
                plannedArrivalTime: toDateTimeLocalInputValue(
                  stop.plannedArrivalTime,
                ),
                plannedDepartureTime: toDateTimeLocalInputValue(
                  stop.plannedDepartureTime,
                ),
                note: stop.note || "",
              }))
            : [createOperationPointFormTemplate("1")],
    });
    setCreateModalOpen(true);
    if (provinceOptions.length === 0) {
      setProvinceLoaded(false);
    }
    if (operationPointOptions.length === 0) {
      setOperationPointLoaded(false);
    }
  };

  const openAssignModal = (item: RouteRow) => {
    setCreateError("");
    setRouteModalMode("assign");
    setEditingRouteId(item.id);
    setCreateMinDateTime(
      toDateTimeLocalInputValue(item.plannedStartTimeRaw) ||
        getCurrentLocalDateTimeValue(),
    );
    setCreateForm({
      creator: item.creator || localStorage.getItem("userName") || "demo_user",
      pickupBranch: item.pickupBranch,
      origin: item.origin,
      destination: item.destination,
      plannedStartTime: toDateTimeLocalInputValue(item.plannedStartTimeRaw),
      plannedEndTime: toDateTimeLocalInputValue(item.plannedEndTimeRaw),
      assignedVehicle: item.assignedVehicle || "",
      assignedDriver: item.assignedDriver || "",
      operationPoints:
        item.routePoints.length > 0
          ? item.routePoints.map((point, pointIndex) => ({
              id: point.id || "",
              sourceType: point.sourceType,
              operationOrder: point.operationOrder || String(pointIndex + 1),
              operationPointId: point.operationPointId || "",
              stopName: point.stopName || "",
              stopAddress: point.stopAddress || "",
              stopCity: point.stopCity || "",
              stopLatitude: point.stopLatitude || "",
              stopLongitude: point.stopLongitude || "",
              plannedArrivalTime: toDateTimeLocalInputValue(
                point.plannedArrivalTime,
              ),
              plannedDepartureTime: toDateTimeLocalInputValue(
                point.plannedDepartureTime,
              ),
              note: point.note || "",
            }))
          : [createOperationPointFormTemplate("1")],
    });
    setCreateModalOpen(true);
    if (provinceOptions.length === 0) {
      setProvinceLoaded(false);
    }
    if (operationPointOptions.length === 0) {
      setOperationPointLoaded(false);
    }
  };

  const cancelRoute = async (item: RouteRow) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn huỷ lịch chuyến ${item.routeCode || item.id} không?`,
    );
    if (!confirmed) return;

    try {
      const meta = createRequestMeta();
      const response = await fetch(
        `${ROUTE_SERVICE_BASE_URL}/management/route-service/update`,
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
            routeId: item.id,
            creator:
              item.creator || localStorage.getItem("userName") || "demo_user",
            data: {
              pickupBranch: item.pickupBranch,
              origin: item.origin,
              destination: item.destination,
              plannedStartTime: item.plannedStartTimeRaw,
              plannedEndTime: item.plannedEndTimeRaw,
              actualStartTime: item.actualStartTimeRaw,
              actualEndTime: item.actualEndTimeRaw,
              status: "CANCELED",
              routePoints: item.routePoints.map((point) => {
                const payloadPoint = { ...point };
                delete payloadPoint.id;
                return payloadPoint;
              }),
            },
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          `Không thể huỷ lịch chuyến (${response.status})`,
        );
        throw new Error(message);
      }

      setReloadNonce((value) => value + 1);
    } catch (cancelError) {
      window.alert(
        cancelError instanceof Error
          ? cancelError.message
          : "Không thể huỷ lịch chuyến",
      );
    }
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

  const updateOperationPointSourceType = (
    index: number,
    sourceType: RoutePointSourceType,
  ) => {
    setCreateForm((current) => ({
      ...current,
      operationPoints: current.operationPoints.map((point, pointIndex) => {
        if (pointIndex !== index) return point;

        if (sourceType === "OPERATION_POINT") {
          return {
            ...point,
            sourceType,
            operationPointId: point.operationPointId,
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: "",
            stopLongitude: "",
          };
        }

        return {
          ...point,
          sourceType,
          operationPointId: "",
        };
      }),
    }));
  };

  const addOperationPoint = () => {
    setCreateForm((current) => ({
      ...current,
      operationPoints: [
        ...current.operationPoints,
        createOperationPointFormTemplate(
          String(current.operationPoints.length + 1),
        ),
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
            : [createOperationPointFormTemplate("1")],
      };
    });
  };

  const handleSubmitRoute = async () => {
    const isEditing = editingRouteId !== null;
    const currentRoute = isEditing
      ? items.find((item) => item.id === editingRouteId) || null
      : null;
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

    let validationError = "";
    const normalizedRoutePoints = createForm.operationPoints.reduce<
      Array<{
        id?: string;
        operationOrder: string;
        plannedArrivalTime: string;
        plannedDepartureTime: string;
        note: string;
        operationPointId?: string;
        stopName?: string;
        stopAddress?: string;
        stopCity?: string;
        stopLatitude?: number;
        stopLongitude?: number;
      }>
    >((accumulator, point, index) => {
      const operationOrder = point.operationOrder.trim() || String(index + 1);
      const plannedArrival = formatLocalDateTimeWithOffset(
        point.plannedArrivalTime,
      );
      const plannedDeparture = formatLocalDateTimeWithOffset(
        point.plannedDepartureTime,
      );
      const note = point.note.trim();
      const operationPointId = point.operationPointId.trim();
      const stopName = point.stopName.trim();
      const stopAddress = point.stopAddress.trim();
      const stopCity = point.stopCity.trim();
      const stopLatitude = point.stopLatitude.trim();
      const stopLongitude = point.stopLongitude.trim();

      const hasLinkedPoint = operationPointId.length > 0;
      const hasFreePointFields =
        stopName.length > 0 ||
        stopAddress.length > 0 ||
        stopCity.length > 0 ||
        stopLatitude.length > 0 ||
        stopLongitude.length > 0;
      const hasAnyPointData =
        operationOrder.length > 0 ||
        plannedArrival.length > 0 ||
        plannedDeparture.length > 0 ||
        note.length > 0 ||
        hasLinkedPoint ||
        hasFreePointFields;

      if (!hasAnyPointData) {
        return accumulator;
      }

      if (hasLinkedPoint && hasFreePointFields) {
        validationError = `Điểm dừng #${index + 1}: chỉ được chọn một trong hai kiểu: liên kết OperationPoint hoặc nhập điểm tự do.`;
        return accumulator;
      }

      if (!hasLinkedPoint && !stopName) {
        validationError = `Điểm dừng #${index + 1}: vui lòng chọn OperationPoint hoặc nhập tên điểm dừng tự do.`;
        return accumulator;
      }

      if (stopLatitude.length > 0 !== stopLongitude.length > 0) {
        validationError = `Điểm dừng #${index + 1}: vĩ độ và kinh độ phải được nhập cùng lúc.`;
        return accumulator;
      }

      if (hasLinkedPoint) {
        accumulator.push({
          ...(point.id ? { id: point.id } : {}),
          operationOrder,
          plannedArrivalTime: plannedArrival,
          plannedDepartureTime: plannedDeparture,
          note,
          operationPointId,
        });
        return accumulator;
      }

      const parsedLatitude =
        stopLatitude.length > 0 ? Number(stopLatitude) : undefined;
      const parsedLongitude =
        stopLongitude.length > 0 ? Number(stopLongitude) : undefined;

      if (
        (typeof parsedLatitude === "number" && Number.isNaN(parsedLatitude)) ||
        (typeof parsedLongitude === "number" && Number.isNaN(parsedLongitude))
      ) {
        validationError = `Điểm dừng #${index + 1}: vĩ độ và kinh độ phải là số hợp lệ.`;
        return accumulator;
      }

      accumulator.push({
        ...(point.id ? { id: point.id } : {}),
        operationOrder,
        plannedArrivalTime: plannedArrival,
        plannedDepartureTime: plannedDeparture,
        note,
        stopName,
        stopAddress,
        stopCity,
        ...(typeof parsedLatitude === "number"
          ? { stopLatitude: parsedLatitude }
          : {}),
        ...(typeof parsedLongitude === "number"
          ? { stopLongitude: parsedLongitude }
          : {}),
      });

      return accumulator;
    }, []);

    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateSubmitting(true);
    setCreateError("");

    try {
      const meta = createRequestMeta();
      const routePointsPayload = isEditing
        ? normalizedRoutePoints
        : normalizedRoutePoints.map((point) => {
            const payloadPoint = { ...point };
            delete payloadPoint.id;
            return payloadPoint;
          });

      const response = await fetch(
        isEditing
          ? `${ROUTE_SERVICE_BASE_URL}/management/route-service/update`
          : `${ROUTE_SERVICE_BASE_URL}/management/route-service/create`,
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
            channel: isEditing ? "ONL" : "OFF",
            ...(isEditing ? { routeId: editingRouteId || "" } : {}),
            creator: createForm.creator.trim() || "demo_user",
            data: isEditing
              ? {
                  pickupBranch,
                  origin,
                  destination,
                  plannedStartTime,
                  plannedEndTime,
                  assignedVehicle: createForm.assignedVehicle.trim(),
                  assignedDriver: createForm.assignedDriver.trim(),
                  actualStartTime: currentRoute?.actualStartTimeRaw || "",
                  actualEndTime: currentRoute?.actualEndTimeRaw || "",
                  status: currentRoute?.status || "PLANNED",
                  routePoints: routePointsPayload,
                }
              : {
                  pickupBranch,
                  origin,
                  destination,
                  plannedStartTime,
                  plannedEndTime,
                  assignedVehicle: createForm.assignedVehicle.trim(),
                  assignedDriver: createForm.assignedDriver.trim(),
                  routePoints: routePointsPayload,
                },
          }),
        },
      );

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          isEditing
            ? `Không thể cập nhật chuyến (${response.status})`
            : `Không thể tạo chuyến (${response.status})`,
        );
        throw new Error(message);
      }

      setCreateModalOpen(false);
      setEditingRouteId(null);
      setPageNumber(1);
      setReloadNonce((value) => value + 1);
    } catch (createRouteError) {
      setCreateError(
        createRouteError instanceof Error
          ? createRouteError.message
          : isEditing
            ? "Không thể cập nhật chuyến"
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
            Lịch chuyến
          </div>
          <h2 className="mt-2 text-[1.25rem] font-bold tracking-tight text-slate-900 sm:text-[1.5rem] uppercase">
            Quản lý lịch chuyến
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo lịch mới
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
            label: "Tổng chuyến",
            value: String(totalElements),
            note: `Đang được khai thác`,
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

      <div className="flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2.5 px-5 pt-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
              Danh sách lịch chuyến đang vận hành
            </h3>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Trang {pageInfo.current} / {pageInfo.total}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-b border-slate-100 px-5 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            Quản lý danh sách lịch chuyến và điểm dừng vận hành
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm lịch chuyến, xe, tài xế..."
              className="w-44 bg-transparent text-[12px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="overflow-hidden rounded-[1.15rem] border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-4.5 py-3">
              <div className="relative">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 pr-4 text-[12px] font-semibold text-slate-900 outline-none transition-colors scheme-light focus:border-slate-300 focus:ring-4 focus:ring-brand-primary/10"
                />
              </div>
              <div className="relative min-w-44">
                <select
                  value={routeFilter}
                  onChange={(event) => setRouteFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-300 focus:ring-4 focus:ring-brand-primary/10"
                >
                  <option value="ALL">Tất cả lịch chuyến</option>
                  {routeOptions.map((route) => (
                    <option key={route.value} value={route.value}>
                      {route.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="ml-auto text-[12px] font-medium text-slate-500">
                {filteredAndScopedItems.length} chuyến trong danh sách
              </div>
            </div>

            <div className="grid grid-cols-[0.95fr_1.65fr_0.9fr_1fr_0.55fr] gap-3 border-b border-slate-100 bg-white px-4.5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <span>Mã chuyến</span>
              <span>Thông tin lịch chuyến</span>
              <span>Khởi hành</span>
              <span>Trạng thái</span>
              <span className="text-right">Thao tác</span>
            </div>

            {isLoading ? (
              <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải các chuyến xe...
                </div>
              </div>
            ) : error ? (
              <div className="bg-white px-4 py-12">
                <div className="flex items-start gap-3 rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4 text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold">
                      Không thể tải các chuyến xe
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
            ) : displayedItems.length === 0 ? (
              <div className="flex min-h-60 items-center justify-center bg-white px-4 py-12">
                <div className="text-center">
                  <div className="text-[13px] font-bold text-slate-900">
                    {search.trim() || scheduleDate || routeFilter !== "ALL"
                      ? "Không tìm thấy chuyến xe phù hợp"
                      : "Không có chuyến xe nào đang vận hành"}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-slate-500">
                    Hãy thử đổi từ khóa tìm kiếm hoặc thêm chuyến mới.
                  </div>
                </div>
              </div>
            ) : (
              displayedItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[0.95fr_1.65fr_0.9fr_1fr_0.55fr] gap-3 border-b border-slate-100 px-4.5 py-4 last:border-b-0 hover:bg-slate-50/60"
                >
                  <div>
                    <div className="text-[13px] font-black tracking-tight text-slate-900">
                      {item.routeCode}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {item.stopLocation || item.pickupBranch || "Chưa có"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-900">
                      {item.routeName}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Xe: {item.assignedVehicle || "Chưa có"} • Tài xế:{" "}
                      {item.assignedDriver || "Chưa có"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-[12px] text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateLabel(item.plannedStartTimeRaw) || "Chưa có"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      {item.departureTime || "--:--"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${statusMeta[item.status].badge}`}
                    >
                      {statusMeta[item.status].label ||
                        item.statusText ||
                        "Trạng thái"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    {item.status === "IN_PROGRESS" ? null : (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-primary"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {item.status === "PLANNED" ? (
                          <button
                            type="button"
                            onClick={() => openAssignModal(item)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="Gán chuyến"
                          >
                            <Route className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => cancelRoute(item)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Huỷ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[12px] font-medium text-slate-500">
            {filteredAndScopedItems.length > 0 ? (
              <>
                Hiển thị {pageInfo.start}-{pageInfo.end} trên{" "}
                {filteredAndScopedItems.length} lịch chuyến
              </>
            ) : (
              "Không có dữ liệu để hiển thị"
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1 || isLoading}
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
                    pageItem === currentPage
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
              disabled={currentPage >= totalPages || isLoading}
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
                  {routeModalMode === "assign"
                    ? "Gán chuyến"
                    : editingRouteId
                      ? "Sửa lịch"
                      : "Tạo lịch"}
                </div>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                  {routeModalMode === "assign"
                    ? "Gán chuyến cho lịch"
                    : editingRouteId
                      ? "Cập nhật lịch chuyến"
                      : "Tạo lịch chuyến mới"}
                </h3>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  {routeModalMode === "assign"
                    ? "Nhập xe và tài xế muốn phân công cho lịch chuyến này."
                    : "Nhập thông tin chuyến, thời gian dự kiến và các điểm dừng vận hành."}
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
                <div className="relative">
                  <select
                    value={createForm.origin}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        origin: event.target.value,
                      }))
                    }
                    disabled={provinceLoading}
                    className={fieldSelectClassName}
                  >
                    <option value="">
                      {provinceLoading
                        ? "Đang tải địa điểm..."
                        : "Chọn điểm đi"}
                    </option>
                    {provinceOptions.map((province) => (
                      <option
                        key={province.id}
                        value={province.name || province.label}
                        disabled={
                          (createForm.destination.trim().length > 0 &&
                            (province.name || province.label)
                              .trim()
                              .toLowerCase() ===
                              createForm.destination.trim().toLowerCase()) ||
                          (createForm.origin.trim().length > 0 &&
                            (province.name || province.label)
                              .trim()
                              .toLowerCase() ===
                              createForm.origin.trim().toLowerCase())
                        }
                      >
                        {province.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Điểm đến
                </span>
                <div className="relative">
                  <select
                    value={createForm.destination}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        destination: event.target.value,
                      }))
                    }
                    disabled={provinceLoading}
                    className={fieldSelectClassName}
                  >
                    <option value="">
                      {provinceLoading
                        ? "Đang tải địa điểm..."
                        : "Chọn điểm đến"}
                    </option>
                    {provinceOptions.map((province) => (
                      <option
                        key={province.id}
                        value={province.name || province.label}
                        disabled={
                          (createForm.origin.trim().length > 0 &&
                            (province.name || province.label)
                              .trim()
                              .toLowerCase() ===
                              createForm.origin.trim().toLowerCase()) ||
                          (createForm.destination.trim().length > 0 &&
                            (province.name || province.label)
                              .trim()
                              .toLowerCase() ===
                              createForm.destination.trim().toLowerCase())
                        }
                      >
                        {province.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
              <label className="space-y-2">
                <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Giờ khởi hành
                </span>
                <input
                  type="datetime-local"
                  min={editingRouteId ? undefined : createMinDateTime}
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
                  min={
                    editingRouteId
                      ? createForm.plannedStartTime || undefined
                      : createForm.plannedStartTime || createMinDateTime
                  }
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

            <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                  <h4 className="text-[13px] font-black tracking-tight text-slate-900">
                    Gán chuyến
                  </h4>
                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    Phân công xe và tài xế cho lịch chuyến này.
                  </p>
                </div>
                {routeModalMode === "assign" ? (
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
                    Chế độ gán
                  </div>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Xe được gán
                  </span>
                  <input
                    type="text"
                    value={createForm.assignedVehicle}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        assignedVehicle: event.target.value,
                      }))
                    }
                    placeholder="VD: B-1029"
                    className={fieldInputClassName}
                  />
                </label>
                <label className="space-y-2">
                  <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Tài xế được gán
                  </span>
                  <input
                    type="text"
                    value={createForm.assignedDriver}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        assignedDriver: event.target.value,
                      }))
                    }
                    placeholder="VD: Nguyễn Văn A"
                    className={fieldInputClassName}
                  />
                </label>
              </div>
            </div>

            <div className="mt-3 min-h-14">
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
              {operationPointError ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                  <span>{operationPointError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOperationPointLoaded(false);
                      setOperationPointError("");
                    }}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    Tải lại OperationPoint
                  </button>
                </div>
              ) : operationPointLoading ? (
                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                  Đang tải danh sách OperationPoint...
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

                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
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
                            Kiểu điểm dừng
                          </span>
                          <div className="relative">
                            <select
                              value={point.sourceType}
                              onChange={(event) =>
                                updateOperationPointSourceType(
                                  index,
                                  event.target.value as RoutePointSourceType,
                                )
                              }
                              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                            >
                              <option value="OPERATION_POINT">
                                Liên kết OperationPoint
                              </option>
                              <option value="FREE_STOP">Điểm dừng tự do</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>

                        {point.sourceType === "OPERATION_POINT" ? (
                          <label className="space-y-2 md:col-span-2">
                            <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                              OperationPoint
                            </span>
                            <div className="relative">
                              <select
                                value={point.operationPointId}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    operationPointId: event.target.value,
                                  })
                                }
                                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                                disabled={operationPointLoading}
                              >
                                <option value="">
                                  {operationPointLoading
                                    ? "Đang tải OperationPoint..."
                                    : "Chọn OperationPoint"}
                                </option>
                                {operationPointOptions.map((operationPoint) => (
                                  <option
                                    key={operationPoint.id}
                                    value={operationPoint.id}
                                  >
                                    {operationPoint.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                          </label>
                        ) : (
                          <>
                            <label className="space-y-2 md:col-span-2">
                              <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Tên điểm dừng
                              </span>
                              <input
                                type="text"
                                value={point.stopName}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    stopName: event.target.value,
                                  })
                                }
                                placeholder="Trạm dừng / điểm đón"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                              />
                            </label>
                            <label className="space-y-2 md:col-span-2">
                              <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Địa chỉ điểm dừng
                              </span>
                              <input
                                type="text"
                                value={point.stopAddress}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    stopAddress: event.target.value,
                                  })
                                }
                                placeholder="Số nhà, đường, khu vực..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Thành phố
                              </span>
                              <input
                                type="text"
                                value={point.stopCity}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    stopCity: event.target.value,
                                  })
                                }
                                placeholder="Hồ Chí Minh"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Vĩ độ
                              </span>
                              <input
                                type="text"
                                value={point.stopLatitude}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    stopLatitude: event.target.value,
                                  })
                                }
                                placeholder="10.776889"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                Kinh độ
                              </span>
                              <input
                                type="text"
                                value={point.stopLongitude}
                                onChange={(event) =>
                                  updateOperationPoint(index, {
                                    stopLongitude: event.target.value,
                                  })
                                }
                                placeholder="106.700981"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                              />
                            </label>
                          </>
                        )}

                        <label className="space-y-2 md:col-span-2">
                          <span className="ml-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Ghi chú
                          </span>
                          <input
                            type="text"
                            value={point.note}
                            onChange={(event) =>
                              updateOperationPoint(index, {
                                note: event.target.value,
                              })
                            }
                            placeholder="Dừng tại Tiền Giang"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-colors focus:border-slate-300 focus:bg-white"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
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
                onClick={handleSubmitRoute}
                disabled={createSubmitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-white transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {createSubmitting
                  ? routeModalMode === "assign"
                    ? "Đang gán..."
                    : editingRouteId
                      ? "Đang cập nhật..."
                      : "Đang tạo..."
                  : routeModalMode === "assign"
                    ? "Gán chuyến"
                    : editingRouteId
                      ? "Cập nhật lịch chuyến"
                      : "Tạo lịch chuyến"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
