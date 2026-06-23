import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NOTIFICATION_STREAM_URL, NOTIFY_REST_BASE_URL } from "../utils/api";
import { createRequestMeta, createXAuthorizedHeaders } from "../utils/requestMeta";
import { toast } from "react-toastify";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface NotificationData {
  merchantId: string;
  userEmail: string;
  title: string;
  message: string;
  notificationType: string;
  referenceId: string;
  /** ISO timestamp */
  receivedAt: string;
  /** Read flag */
  read: boolean;
  /** Internal ID / React key */
  _id: string;
}

interface NotificationContextValue {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Consumer Hook ───────────────────────────────────────────────────────────
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside <NotificationProvider>");
  }
  return ctx;
}

// Helper to safely parse whatever fields the backend returns (SSE or REST DB representation)
function mapBackendToNotification(item: any): NotificationData {
  return {
    merchantId: item.merchantId || "",
    userEmail: item.userEmail || item.email || "",
    title: item.title || "",
    message: item.message || item.body || "",
    notificationType: item.notificationType || item.type || "INFO",
    referenceId: item.referenceId || item.deepLink || "",
    receivedAt: item.receivedAt || item.sentAt || item.createdAt || new Date().toISOString(),
    read: typeof item.read === "boolean" ? item.read : item.status === "READ" || false,
    _id: item.id || item._id || crypto.randomUUID(),
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_NOTIFICATIONS = 100;
const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

// ─── Provider ────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for SSE lifecycle
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_MS);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ── Derive auth params from localStorage ──
  const getMerchantId = useCallback(
    () => localStorage.getItem("merchantId") || "",
    [],
  );
  const getUserEmail = useCallback(
    () => localStorage.getItem("userEmail") || "",
    [],
  );

  // ── Push a new notification into state ──
  const pushNotification = useCallback((raw: Omit<NotificationData, "_id" | "receivedAt" | "read">) => {
    const entry = mapBackendToNotification(raw);
    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS));
    return entry;
  }, []);

  // ── Fetch history via REST GET ──
  const fetchHistory = useCallback(async () => {
    const merchantId = getMerchantId();
    const email = getUserEmail();

    if (!merchantId && !email) return;

    try {
      const params = new URLSearchParams();
      if (merchantId) params.set("merchantId", merchantId);
      if (email) params.set("email", email);
      params.set("page", "1");
      params.set("size", "50");

      const response = await fetch(`${NOTIFY_REST_BASE_URL}?${params.toString()}`, {
        method: "GET",
        headers: createXAuthorizedHeaders(),
      });

      if (!response.ok) throw new Error("Fetch notification list failed");

      const result = await response.json();
      // Support: result.data.items, result.content, result.data, result
      const list = result.data?.items || result.content || result.data || result;
      if (Array.isArray(list)) {
        const mapped = list.map(mapBackendToNotification);
        // Sort descending (newest first)
        mapped.sort(
          (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        );
        setNotifications(mapped);
      }
    } catch (err) {
      console.error("[Notification REST] Failed to load history:", err);
    }
  }, [getMerchantId, getUserEmail]);

  // ── Mark as read via POST ──
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );

    const meta = createRequestMeta();
    const headers = {
      ...createXAuthorizedHeaders(meta),
      "Content-Type": "application/json",
      "accept": "*/*"
    };
    console.log(`[Notification REST] markAsRead posting ID: ${id}`, headers);

    try {
      await fetch(`${NOTIFY_REST_BASE_URL}/read?id=${id}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(meta),
      });
    } catch (err) {
      console.error(`[Notification REST] Failed to mark read for ${id}:`, err);
    }
  }, []);

  // ── Mark all as read via POST ──
  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const merchantId = getMerchantId();
    const email = getUserEmail();

    const meta = createRequestMeta();
    const headers = {
      ...createXAuthorizedHeaders(meta),
      "Content-Type": "application/json",
      "accept": "*/*"
    };
    console.log(`[Notification REST] markAllAsRead posting merchantId: ${merchantId}, email: ${email}`, headers);

    try {
      const params = new URLSearchParams();
      if (merchantId) params.set("merchantId", merchantId);
      if (email) params.set("email", email);

      await fetch(`${NOTIFY_REST_BASE_URL}/read-all?${params.toString()}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(meta),
      });
    } catch (err) {
      console.error("[Notification REST] Failed to mark all read:", err);
    }
  }, [getMerchantId, getUserEmail]);

  const clearAll = useCallback(async () => {
    // Optimistic UI update
    setNotifications([]);

    const merchantId = getMerchantId();
    const email = getUserEmail();
    const meta = createRequestMeta();
    const headers = {
      ...createXAuthorizedHeaders(meta),
      "Content-Type": "application/json",
      "accept": "*/*"
    };

    try {
      await fetch(`${NOTIFY_REST_BASE_URL}/delete-all`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          ...meta,
          merchantId,
          email
        }),
      });
    } catch (err) {
      console.error("[Notification REST] Failed to delete all:", err);
    }
  }, [getMerchantId, getUserEmail]);

  // ── Delete one via POST ──
  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n._id !== id));

    const meta = createRequestMeta();
    const headers = {
      ...createXAuthorizedHeaders(meta),
      "Content-Type": "application/json",
      "accept": "*/*"
    };
    
    try {
      await fetch(`${NOTIFY_REST_BASE_URL}/delete`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          ...meta,
          id
        }),
      });
    } catch (err) {
      console.error(`[Notification REST] Failed to delete ${id}:`, err);
    }
  }, []);

  // ── SSE Connect / Reconnect ──
  const connect = useCallback(() => {
    // Cleanup any previous connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const merchantId = getMerchantId();
    const email = getUserEmail();

    // Skip connection if we don't have credentials yet
    if (!merchantId && !email) {
      return;
    }

    const params = new URLSearchParams();
    if (merchantId) params.set("merchantId", merchantId);
    if (email) params.set("email", email);

    const url = `${NOTIFICATION_STREAM_URL}?${params.toString()}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // ── CONNECTED event ──
    es.addEventListener("CONNECTED", (event) => {
      if (!mountedRef.current) return;
      console.log("[SSE] Connected:", JSON.parse(event.data));
      setIsConnected(true);
      retryDelayRef.current = INITIAL_RETRY_MS; // reset backoff
    });

    // ── NOTIFICATION event ──
    es.addEventListener("NOTIFICATION", (event) => {
      if (!mountedRef.current) return;
      try {
        const payload = JSON.parse(event.data);
        const entry = pushNotification(payload);

        // Display interactive toast notification
        const toastContent = (
          <div className="cursor-pointer">
            <p className="font-black text-xs text-slate-900 mb-0.5">{entry.title}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed truncate">{entry.message}</p>
          </div>
        );

        const options = {
          onClick: () => {
            const currentPath = window.location.pathname;
            const notificationId = entry._id;
            if (currentPath.startsWith("/merchant")) {
              window.location.href = `/merchant/notifications/${notificationId}`;
            } else if (currentPath.startsWith("/admin")) {
              window.location.href = `/admin/notifications/${notificationId}`;
            } else {
              window.location.href = `/notifications/${notificationId}`;
            }
          }
        };

        if (entry.notificationType === "SUCCESS" || entry.notificationType === "AI_OPTIMIZATION_COMPLETED") {
          toast.success(toastContent, options);
        } else if (entry.notificationType === "WARNING") {
          toast.warning(toastContent, options);
        } else if (entry.notificationType === "ERROR") {
          toast.error(toastContent, options);
        } else {
          toast.info(toastContent, options);
        }
      } catch (err) {
        console.error("[SSE] Failed to parse NOTIFICATION:", err);
      }
    });

    // ── Error handling with exponential backoff reconnect ──
    es.onerror = () => {
      if (!mountedRef.current) return;
      console.warn("[SSE] Connection error — scheduling reconnect…");
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_MS);

      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [getMerchantId, getUserEmail, pushNotification]);

  // ── Lifecycle: mount / unmount ──
  useEffect(() => {
    mountedRef.current = true;

    // Load initial database list & start SSE listener
    fetchHistory();
    connect();

    // Listen for network changes
    const handleOnline = () => {
      console.log("[SSE] Network online — reconnecting…");
      retryDelayRef.current = INITIAL_RETRY_MS;
      fetchHistory();
      connect();
    };
    const handleOffline = () => {
      console.log("[SSE] Network offline");
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect, fetchHistory]);

  // ── Derived state ──
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isConnected, markAsRead, markAllAsRead, clearAll, deleteNotification, fetchHistory }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
