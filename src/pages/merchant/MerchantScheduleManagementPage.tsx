import { useState, useEffect, useRef } from "react";
import {
    Plus, MapPin, Clock, ArrowRight,
    Edit3,
    X, Loader2, Save,
    Navigation, Building, Info, Search, Activity, MoreHorizontal,
    Timer, TrendingUp, Sparkles, DollarSign, Users, CheckCircle,
    ChevronDown, ChevronUp, Calendar
} from "lucide-react";

import { toast } from "react-toastify";
import { ROUTE_ENDPOINTS, TRIP_ENDPOINTS, AI_ENDPOINTS, STAFF_ENDPOINTS } from "../../utils/api-constants";
import { createRequestMeta, createXAuthorizedHeaders } from "../../utils/requestMeta";
import { Pagination } from "../../Components/common/Pagination";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip
} from "recharts";

import { getMerchantId } from "../../utils/auth";
import { ADMIN_MERCHANT_ACTION_BASE_URL } from "../../utils/api";
import { useNotifications } from "../../contexts/NotificationContext";
import { useSearchParams } from "react-router-dom";

const handledNotifications = new Set<string>();

interface RoutePoint {
    id?: string;
    stopOrder: string;
    routeId?: string;
    note: string;
    departmentId: string;
    realOperationPointId?: string;
    provinceId?: string;
    stopName: string;
    stopAddress: string;
    stopCity: string;
    stopLatitude: number;
    stopLongitude: number;
    timeAtDepartment: number;
}

interface RouteItem {
    id: string;
    originCode: string;
    originName: string;
    destinationCode: string;
    destinationName: string;
    originProvinceId?: string;
    destinationProvinceId?: string;
    originDepartmentId?: string;
    destinationDepartmentId?: string;
    duration: number;
    status: string;
    creator: string;
    routePoints?: RoutePoint[];
}

interface Province {
    id: string;
    code: string;
    name: string;
    slug: string;
}

export function MerchantScheduleManagementPage() {
    const { notifications } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const aiJobId = searchParams.get("view_ai_job");
        if (aiJobId) {
            fetchOptimizationDetail(aiJobId);
            searchParams.delete("view_ai_job");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);
    const lastNotificationRef = useRef<string | null>(null);

    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingDetail, setFetchingDetail] = useState(false);

    // AI Dispatch states
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiRoute, setAiRoute] = useState<RouteItem | null>(null);

    useEffect(() => {
        if (aiRoute && aiRoute.creator === "AI" && routes.length > 0) {
            const realRoute = routes.find(r => r.id === aiRoute.id);
            if (realRoute) {
                setAiRoute(realRoute);
            }
        }
    }, [routes, aiRoute]);

    const [forecastDays, setForecastDays] = useState(30);
    const [forecasting, setForecasting] = useState(false);
    const [forecastResults, setForecastResults] = useState<any[]>([]);
    const [selectedForecastDates, setSelectedForecastDates] = useState<string[]>([]);
    const [schedulerConfig, setSchedulerConfig] = useState({
        base_price: 250000,
        operating_cost_per_trip: 1200000,
        bus_capacity: 34,
        max_trips_allowed: 6,
        min_load_factor: 0.40,
        startHour: 5,
        endHour: 22
    });
    const [optimizing, setOptimizing] = useState(false);
    const [batchOptimizedSchedules, setBatchOptimizedSchedules] = useState<Record<string, any>>({});
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
    const [optimizeProgress, setOptimizeProgress] = useState<{ current: number; total: number } | null>(null);
    const [publishProgress, setPublishProgress] = useState<{ current: number; total: number } | null>(null);
    const [dispatching, setDispatching] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [autoCreatedTrips, setAutoCreatedTrips] = useState<any[]>([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
    const [allOperationPoints, setAllOperationPoints] = useState<any[]>([]);
    const [originDepartments, setOriginDepartments] = useState<any[]>([]);
    const [destinationDepartments, setDestinationDepartments] = useState<any[]>([]);

    // Form states matching create payload
    const [formData, setFormData] = useState({
        creator: "",
        originName: "",
        destinationName: "",
        originProvinceId: "",
        originDepartmentId: "",
        destinationProvinceId: "",
        destinationDepartmentId: "",
        duration: 0,
        routePoints: [] as RoutePoint[]
    });

    const fetchRoutes = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ROUTE_ENDPOINTS.FETCH}?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${statusFilter}&search=${searchTerm}`,
                {
                    headers: createXAuthorizedHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setRoutes(result.data.items);
                setTotalItems(result.data.pagination?.totalElements || 0);
            }
        } catch (err: any) {
            toast.error("Không thể tải danh sách tuyến đường: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/provinces/fetch?pageNumber=1&pageSize=100`,
                {
                    headers: createXAuthorizedHeaders()
                }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                const sorted = result.data.items.toSorted((a: any, b: any) =>
                    (a.name || "").localeCompare(b.name || "", 'vi', { sensitivity: 'base' })
                );
                setProvinces(sorted);
            }
        } catch (err) {
            console.error("Lỗi fetch provinces:", err);
        }
    };

    const fetchOperationPoints = async () => {
        try {
            const params = new URLSearchParams({
                pageNumber: "1",
                pageSize: "200"
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?${params.toString()}`,
                { headers: createXAuthorizedHeaders() }
            );
            const result = await response.json();
            if (result.data && result.data.items) {
                setAllOperationPoints(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi fetch operation points:", err);
        }
    };

    const fetchDepartmentsByProvince = async (provinceId: string, type: 'origin' | 'destination') => {
        if (!provinceId) {
            if (type === 'origin') setOriginDepartments([]);
            else setDestinationDepartments([]);
            return;
        }

        try {
            const params = new URLSearchParams({
                pageNumber: "1",
                pageSize: "200",
                provinceId: provinceId
            });
            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/department/fetch?${params.toString()}`,
                { headers: createXAuthorizedHeaders() }
            );
            const result = await response.json();
            const items = result.data?.items || [];
            if (type === 'origin') setOriginDepartments(items);
            else setDestinationDepartments(items);
        } catch (err) {
            console.error("Lỗi fetch departments:", err);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await fetch(`${STAFF_ENDPOINTS.FETCH}?pageNumber=1&pageSize=100&status=AVAILABLE`, {
                headers: createXAuthorizedHeaders()
            });
            const result = await response.json();
            if (result.data && result.data.items) {
                setDrivers(result.data.items);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách nhân viên:", err);
        }
    };

    const fetchAllResources = async () => {
        await Promise.all([
            fetchOperationPoints(),
            fetchProvinces(),
            fetchDrivers()
        ]);
    };



    useEffect(() => {
        fetchRoutes(page);
    }, [page, statusFilter, searchTerm]);

    useEffect(() => {
        fetchAllResources();
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            if (latest._id !== lastNotificationRef.current && !handledNotifications.has(latest._id) && !latest.read) {
                lastNotificationRef.current = latest._id;
                handledNotifications.add(latest._id);
                if (latest.notificationType === 'AI_OPTIMIZATION_COMPLETED' || latest.notificationType === 'SCHEDULE_OPTIMIZATION_SUCCESS') {
                    toast.success(`Tối ưu hóa thành công: ${latest.message}`);
                    if (latest.referenceId) {
                        fetchOptimizationDetail(latest.referenceId);
                    } else {
                        fetchRoutes(page);
                    }
                }
            }
        }
    }, [notifications, page]);

    const fetchOptimizationDetail = async (jobId: string) => {
        try {
            const meta = createRequestMeta();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/merchant-service/trips/schedule-async/detail?jobId=${jobId}`, {
                method: "GET",
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    "Content-Type": "application/json",
                    "accept": "*/*"
                }
            });
            if (!response.ok) throw new Error("Không thể lấy thông tin chi tiết kết quả tối ưu");
            const result = await response.json();
            const payload = result.data;
            if (payload && payload.recommendationsPayload) {
                const payloadStr = typeof payload.recommendationsPayload === "string"
                    ? payload.recommendationsPayload
                    : JSON.stringify(payload.recommendationsPayload);
                const parsed = JSON.parse(payloadStr);
                const schedulesArray = parsed.schedules || parsed;
                const scheduleMap: Record<string, any> = {};

                if (Array.isArray(schedulesArray)) {
                    schedulesArray.forEach((item: any) => {
                        scheduleMap[item.date] = item;
                    });
                } else {
                    Object.assign(scheduleMap, schedulesArray);
                }

                if (parsed.createdTrips) {
                    setAutoCreatedTrips(parsed.createdTrips);
                } else {
                    setAutoCreatedTrips([]);
                }

                if (payload.routeId) {
                    setAiRoute(prev => {
                        if (prev && prev.id === payload.routeId) return prev;
                        // If routes array is not fully loaded yet, provide a fallback so the modal can render
                        const found = routes.find(r => r.id === payload.routeId);
                        if (found) return found;
                        return {
                            id: payload.routeId,
                            originName: "Tuyến đường",
                            destinationName: "Đã chọn",
                            originCode: "...",
                            destinationCode: "...",
                            duration: 0,
                            status: "ACTIVE",
                            creator: "AI"
                        } as RouteItem;
                    });
                }

                setBatchOptimizedSchedules(scheduleMap);
                setIsResultModalOpen(true);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi lấy chi tiết lịch tối ưu: " + error.message);
        }
    };



    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedRoute(null);
        setFormData({
            creator: localStorage.getItem("userName") || "",
            originName: "",
            destinationName: "",
            originProvinceId: "",
            originDepartmentId: "",
            destinationProvinceId: "",
            destinationDepartmentId: "",
            duration: 0,
            routePoints: []
        });
        setOriginDepartments([]);
        setDestinationDepartments([]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (route: RouteItem) => {
        setIsEditing(true);
        setSelectedRoute(route);
        setIsModalOpen(true);
        setFetchingDetail(true);

        try {
            const merchantId = getMerchantId();
            const routeId = route.id;

            if (!merchantId) {
                toast.error("Không tìm thấy thông tin nhà xe trong phiên đăng nhập");
                setFetchingDetail(false);
                return;
            }

            const response = await fetch(
                `${ADMIN_MERCHANT_ACTION_BASE_URL}/routes/fetch/detail?routeId=${routeId}&merchantId=${merchantId}`,
                {
                    headers: createXAuthorizedHeaders()
                }
            );

            if (!response.ok) throw new Error("Không thể tải thông tin chi tiết tuyến đường");

            const result = await response.json();
            const detailedRoute = result.data;

            if (detailedRoute) {
                const originDeptId = detailedRoute.originDepartmentId || "";
                const destDeptId = detailedRoute.destinationDepartmentId || "";

                const originBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === originDeptId);
                const destBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === destDeptId);

                const originProvId = detailedRoute.originProvinceId || originBranch?.provinceId || "";
                const destProvId = detailedRoute.destinationProvinceId || destBranch?.provinceId || "";

                setFormData({
                    creator: detailedRoute.creator || "",
                    originName: detailedRoute.originName || detailedRoute.origin || "",
                    destinationName: detailedRoute.destinationName || detailedRoute.destination || "",
                    originProvinceId: originProvId,
                    originDepartmentId: originDeptId,
                    destinationProvinceId: destProvId,
                    destinationDepartmentId: destDeptId,
                    duration: detailedRoute.duration || 0,
                    routePoints: (detailedRoute.routePoints || detailedRoute.operationPoints || detailedRoute.departments || []).map((p: any, i: number) => {
                        const deptId = p.departmentId || p.operationPointId || p.id;
                        const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                        return {
                            ...p,
                            stopOrder: (i + 1).toString(),
                            departmentId: deptId,
                            realOperationPointId: deptId,
                            provinceId: p.provinceId || deptInfo?.provinceId || "",
                            timeAtDepartment: p.timeAtDepartment || 0,
                        };
                    })
                });
                if (originProvId) fetchDepartmentsByProvince(originProvId, 'origin');
                if (destProvId) fetchDepartmentsByProvince(destProvId, 'destination');
            } else {
                const originDeptId = route.originDepartmentId || "";
                const destDeptId = route.destinationDepartmentId || "";

                const originBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === originDeptId);
                const destBranch = allOperationPoints.find(d => (d.id || d.operationPointId) === destDeptId);

                const originProvId = route.originProvinceId || originBranch?.provinceId || "";
                const destProvId = route.destinationProvinceId || destBranch?.provinceId || "";

                setFormData({
                    creator: route.creator || "",
                    originName: route.originName || "",
                    destinationName: route.destinationName,
                    originProvinceId: originProvId,
                    originDepartmentId: originDeptId,
                    destinationProvinceId: destProvId,
                    destinationDepartmentId: destDeptId,
                    duration: route.duration || 0,
                    routePoints: (route.routePoints || []).map((p: any, i: number) => {
                        const deptId = p.departmentId || p.operationPointId || p.id;
                        const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                        return {
                            ...p,
                            stopOrder: (i + 1).toString(),
                            departmentId: deptId,
                            realOperationPointId: deptId,
                            provinceId: p.provinceId || deptInfo?.provinceId || "",
                            timeAtDepartment: p.timeAtDepartment || 0,
                        };
                    })
                });
                if (originProvId) fetchDepartmentsByProvince(originProvId, 'origin');
                if (destProvId) fetchDepartmentsByProvince(destProvId, 'destination');
            }
        } catch (err: any) {
            toast.error("Lỗi khi tải chi tiết: " + err.message);
            // Fallback to list data on error
            setFormData({
                creator: route.creator || "",
                originName: route.originName || "",
                destinationName: route.destinationName || "",
                originProvinceId: route.originProvinceId || "",
                originDepartmentId: route.originDepartmentId || "",
                destinationProvinceId: route.destinationProvinceId || "",
                destinationDepartmentId: route.destinationDepartmentId || "",
                duration: route.duration || 0,
                routePoints: (route.routePoints || []).map((p: any, i: number) => {
                    const deptId = p.departmentId || p.operationPointId || p.id;
                    const deptInfo = allOperationPoints.find(d => (d.id || d.operationPointId) === deptId);
                    return {
                        ...p,
                        stopOrder: (i + 1).toString(),
                        departmentId: deptId,
                        realOperationPointId: deptId,
                        provinceId: p.provinceId || deptInfo?.provinceId || "",
                        timeAtDepartment: p.timeAtDepartment || 0,
                    };
                })
            });
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleAddPoint = () => {
        const newPoint: RoutePoint = {
            stopOrder: (formData.routePoints.length + 1).toString(),
            note: "",
            departmentId: "",
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: 0,
            stopLongitude: 0,
            timeAtDepartment: 0
        };
        setFormData({
            ...formData,
            routePoints: [...formData.routePoints, newPoint]
        });
    };

    const handleRemovePoint = (index: number) => {
        const updated = formData.routePoints.filter((_, i) => i !== index);
        const reordered = updated.map((p, i) => ({ ...p, stopOrder: (i + 1).toString() }));
        setFormData({ ...formData, routePoints: reordered });
    };

    const updatePoint = (index: number, field: keyof RoutePoint, value: any) => {
        const updated = [...formData.routePoints];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, routePoints: updated });
    };

    const populatePointData = (index: number, data: any) => {
        if (!data) return;
        const updated = [...formData.routePoints];
        updated[index] = {
            ...updated[index],
            // Use the id for display in the input field
            departmentId: data.id || data.operationPointId || updated[index].departmentId,
            // Store the real internal ID (UUID) for the backend
            realOperationPointId: data.operationPointId || data.id,
            stopName: data.name || updated[index].stopName,
            stopAddress: data.address || updated[index].stopAddress,
            stopCity: data.city || updated[index].stopCity,
            stopLatitude: data.latitude || updated[index].stopLatitude,
            stopLongitude: data.longitude || updated[index].stopLongitude,
            provinceId: data.provinceId || updated[index].provinceId
        };
        setFormData({ ...formData, routePoints: updated });
        toast.success(`Đã tìm thấy: ${data.name}`);
    };

    const clearPointData = (index: number) => {
        const updated = [...formData.routePoints];
        updated[index] = {
            ...updated[index],
            departmentId: "",
            realOperationPointId: "",
            stopName: "",
            stopAddress: "",
            stopCity: "",
            stopLatitude: 0,
            stopLongitude: 0,
        };
        setFormData({ ...formData, routePoints: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const meta = createRequestMeta();
            const body: any = {
                ...meta,
                channel: "OFF",
            };

            const dataPayload: any = {
                creator: formData.creator || (isEditing ? selectedRoute?.creator : ""),
                originName: formData.originName,
                destinationName: formData.destinationName,
                originDepartmentId: formData.originDepartmentId,
                destinationDepartmentId: formData.destinationDepartmentId,
                duration: formData.duration,
                routePoints: formData.routePoints.map(p => ({
                    stopOrder: p.stopOrder,
                    note: p.note || "",
                    departmentId: p.realOperationPointId || p.departmentId,
                    stopName: p.stopName,
                    stopAddress: p.stopAddress,
                    stopCity: p.stopCity,
                    stopLatitude: p.stopLatitude,
                    stopLongitude: p.stopLongitude,
                    timeAtDepartment: p.timeAtDepartment
                }))
            };

            if (isEditing && selectedRoute) {
                body.routeId = selectedRoute.id;
                body.data = {
                    ...dataPayload,
                    status: selectedRoute?.status || "ACTIVE"
                };
            } else {
                body.data = dataPayload;
            }

            const response = await fetch(isEditing ? ROUTE_ENDPOINTS.UPDATE : ROUTE_ENDPOINTS.CREATE, {
                method: 'POST',
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(isEditing ? "Cập nhật thành công" : "Tạo tuyến đường thành công");
                setIsModalOpen(false);
                fetchRoutes(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi hệ thống");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (route: RouteItem) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến đường template này?`)) {
            return;
        }

        try {
            const meta = createRequestMeta();
            const body = {
                ...meta,
                data: {
                    creator: localStorage.getItem("userName") || "System",
                    routeId: route.id
                }
            };

            const response = await fetch(ROUTE_ENDPOINTS.DELETE, {
                method: 'POST',
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success("Xóa tuyến đường thành công");
                fetchRoutes(page);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi khi xóa tuyến đường");
            }
        } catch (err: any) {
            toast.error("Lỗi: " + err.message);
        }
    };

    const handleOpenAiDispatch = (route: RouteItem) => {
        setAiRoute(route);
        setForecastResults([]);
        setBatchOptimizedSchedules({});
        setExpandedDates({});
        setSelectedForecastDates([]);
        setOptimizeProgress(null);
        setPublishProgress(null);
        setForecastDays(30);
        setSchedulerConfig({
            base_price: 250000,
            operating_cost_per_trip: 1200000,
            bus_capacity: 34,
            max_trips_allowed: 6,
            min_load_factor: 0.40,
            startHour: 5,
            endHour: 22
        });
        setIsAiModalOpen(true);
    };

    const runForecast = async () => {
        if (!aiRoute) return;
        setForecasting(true);
        try {
            const response = await fetch(AI_ENDPOINTS.FORECAST, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    route_id: aiRoute.id,
                    periods: forecastDays
                })
            });

            if (!response.ok) throw new Error("Dự báo thất bại");

            const result = await response.json();
            if (result.predictions && result.predictions.length > 0) {
                setForecastResults(result.predictions);
                // Auto-select all dates
                const allDates = result.predictions.map((p: any) => p.date);
                setSelectedForecastDates(allDates);
                setBatchOptimizedSchedules({});
                setExpandedDates({});
                toast.success("Dự báo nhu cầu AI thành công!");
            }
        } catch (err: any) {
            toast.error("Lỗi khi chạy dự báo: " + err.message);
        } finally {
            setForecasting(false);
        }
    };

    const runOptimization = async () => {
        if (!aiRoute || selectedForecastDates.length === 0) {
            toast.warning("Vui lòng chạy dự báo và chọn ít nhất một ngày vận hành.");
            return;
        }
        if (isNaN(schedulerConfig.operating_cost_per_trip) || isNaN(schedulerConfig.max_trips_allowed) || isNaN(schedulerConfig.min_load_factor)) {
            toast.warning("Vui lòng nhập đầy đủ các thông số cấu hình tối ưu lịch chạy.");
            return;
        }
        setOptimizing(true);

        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                toast.error("Không tìm thấy thông tin nhà xe trong phiên đăng nhập");
                return;
            }

            const demands = selectedForecastDates.map((date) => {
                const match = forecastResults.find(p => p.date === date);
                const demand = match ? Math.round(match.ensemble_demand * 10) / 10 : 0;
                return { date, demand };
            });

            const userEmail = localStorage.getItem("userEmail") || "";

            const meta = createRequestMeta();
            const body = {
                ...meta,
                channel: "ONL",
                userEmail: userEmail,
                data: {
                    routeId: aiRoute.id,
                    demands: demands,
                    operatingHours: [schedulerConfig.startHour, schedulerConfig.endHour],
                    operatingCostPerTrip: schedulerConfig.operating_cost_per_trip,
                    maxTripsAllowed: schedulerConfig.max_trips_allowed,
                    minLoadFactor: schedulerConfig.min_load_factor
                }
            };

            const response = await fetch(AI_ENDPOINTS.SCHEDULE, {
                method: "POST",
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error("Tối ưu hóa lịch trình thất bại");
            }

            const result = await response.json();
            const payload = result.data || result;
            const jobId = payload.jobId || "N/A";

            toast.success(`Khởi động tối ưu AI thành công! Hệ thống đang xử lý tác vụ dưới nền. Mã tiến trình (Job ID): ${jobId}`);
            setIsAiModalOpen(false); // Close AI modal as it runs in the background
        } catch (err: any) {
            toast.error("Lỗi khi gửi yêu cầu tối ưu: " + err.message);
        } finally {
            setOptimizing(false);
        }
    };

    const handlePublishSchedule = async () => {
        if (!aiRoute || Object.keys(batchOptimizedSchedules).length === 0) {
            toast.warning("Vui lòng tối ưu hóa lịch chạy trước khi phát hành.");
            return;
        }
        setDispatching(true);
        setPublishProgress({ current: 0, total: 0 });

        try {
            const meta = createRequestMeta();
            const tripsToCreate: any[] = [];
            const tripAssociations: { vehicleId: string; date: string; departureTimeStr: string }[] = [];

            selectedForecastDates.forEach((date) => {
                const schedule = batchOptimizedSchedules[date];
                if (!schedule || !schedule.optimal_trips) return;

                schedule.optimal_trips.forEach((t: any) => {
                    const [hours, minutes] = t.departure_time.split(":");
                    const localISO = `${date}T${hours}:${minutes}:00+07:00`;
                    const [year, month, day] = date.split("-");

                    tripsToCreate.push({
                        departureTime: localISO,
                        rawDepartureTime: t.departure_time,
                        rawDepartureDate: `${day}/${month}/${year}`
                    });

                    tripAssociations.push({
                        vehicleId: t.assigned_vehicle?.vehicle_id || "",
                        date: date,
                        departureTimeStr: t.departure_time
                    });
                });
            });

            if (tripsToCreate.length === 0) {
                toast.warning("Không có chuyến xe nào để phát hành.");
                setDispatching(false);
                return;
            }

            const body = {
                ...meta,
                channel: "ONL",
                data: {
                    routeId: aiRoute.id,
                    trips: tripsToCreate
                }
            };

            const response = await fetch(TRIP_ENDPOINTS.BATCH_CREATE, {
                method: "POST",
                headers: {
                    ...createXAuthorizedHeaders(meta),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const responseData = await response.json();
                const tripIds = responseData.data?.tripIds || [];

                if (tripIds.length > 0) {
                    toast.info(`Đang tiến hành điều phối xe cho ${tripIds.length} chuyến...`);
                    const creatorName = localStorage.getItem("userName") || "System";

                    const assignableTrips = tripIds.map((tripId: string, index: number) => ({
                        tripId,
                        association: tripAssociations[index],
                        originalIndex: index
                    })).filter((item: any) => item.association && item.association.vehicleId);

                    setPublishProgress({ current: 0, total: assignableTrips.length });

                    const assignPromises = assignableTrips.map(async (item: any, idx: any) => {
                        const { tripId, association } = item;
                        const vehicleId = association.vehicleId;
                        const driverId = drivers.length > 0 ? drivers[idx % drivers.length].id : "";

                        if (!driverId) {
                            throw new Error("Không có tài xế khả dụng để điều phối chuyến xe.");
                        }

                        const assignMeta = createRequestMeta();
                        const assignBody = {
                            ...assignMeta,
                            channel: "ONL",
                            data: {
                                creator: creatorName,
                                tripId: tripId,
                                vehicleId: vehicleId,
                                driverId: driverId
                            }
                        };

                        const assignRes = await fetch(TRIP_ENDPOINTS.ASSIGN, {
                            method: "POST",
                            headers: {
                                ...createXAuthorizedHeaders(assignMeta),
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(assignBody)
                        });

                        if (!assignRes.ok) {
                            const errData = await assignRes.json();
                            throw new Error(errData.message || `Lỗi điều phối xe cho chuyến xe tại ${association.date} lúc ${association.departureTimeStr}`);
                        }

                        setPublishProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
                        return { success: true };
                    });

                    await Promise.all(assignPromises);
                }

                toast.success(`Đã phát hành và điều phối thành công lô ${tripsToCreate.length} chuyến xe cho ${selectedForecastDates.length} ngày!`);
                setIsAiModalOpen(false);
            } else {
                const err = await response.json();
                throw new Error(err.message || "Lỗi khi tạo chuyến xe");
            }
        } catch (err: any) {
            toast.error("Lỗi phát hành lịch xe: " + err.message);
        } finally {
            setDispatching(false);
            setPublishProgress(null);
        }
    };
    const optimizedDates = Object.keys(batchOptimizedSchedules);
    const totalTrips = optimizedDates.reduce((sum, d) => sum + (batchOptimizedSchedules[d]?.optimal_trips?.length || 0), 0);
    const avgFleetUtilization = optimizedDates.length > 0
        ? optimizedDates.reduce((sum, d) => sum + (batchOptimizedSchedules[d]?.fleet_utilization || 0), 0) / optimizedDates.length
        : 0;
    const totalExpectedProfit = optimizedDates.reduce((sum, d) => sum + (batchOptimizedSchedules[d]?.total_expected_profit || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Quản lý Tuyến Đường</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                        Hạng mục vận hành · Lộ trình cố định
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} />
                        Tạo tuyến mới
                    </button>
                </div>
            </div>

            {/* KPI Panels Section */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Panel 1: Total Routes */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng tuyến đường</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{totalItems}</h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all">
                                <Navigation size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Active Routes */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuyến dự kiến</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-700">
                                {routes.filter(r => r.status === 'ACTIVE' || r.status === 'PLANNED').length}
                            </h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <Activity size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Total Stops */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạm dừng</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-700">
                                {routes.reduce((acc, current) => acc + ((current.routePoints)?.length || 0), 0)}
                            </h3>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <MapPin size={16} />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tuyến đường..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-100 flex-1 md:flex-none">
                        <Activity size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-2 mr-1 hidden sm:block">Trạng thái</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer pr-2 py-2 min-w-[120px]"
                        >
                            <option value="">Tất cả (ALL)</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Đang kết nối cơ sở dữ liệu...</p>
                </div>
            ) : totalItems === 0 ? (
                <div className="h-[450px] flex flex-col items-center justify-center gap-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200">
                        <Navigation size={48} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-950 mb-1 tracking-tight">Vùng vận hành đang trống</h3>
                        <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">Thiết lập tuyến đường đầu tiên để khởi tạo các chuyến xe trong hệ thống.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                    >
                        Bắt đầu ngay
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tuyến vận hành</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời lượng</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hạ tầng</th>
                                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {routes.map((route) => (
                                    <tr
                                        key={route.id}
                                        onClick={() => handleOpenEdit(route)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                                    <Navigation size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-slate-900">{route.originName}</span>
                                                        <ArrowRight size={12} className="text-slate-300" />
                                                        <span className="text-sm font-black text-slate-900">{route.destinationName}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Người tạo: {route.creator || "Quản trị viên"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                    <Clock size={12} className="text-brand-primary" />
                                                    {route.duration || 0} phút
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400">
                                                    Ước tính di chuyển
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <MapPin size={12} className="text-slate-300" />
                                                    {(route.routePoints)?.length || 0} Trạm
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${route.status === 'ACTIVE' || route.status === 'PLANNED'
                                                ? 'bg-slate-100 text-slate-700'
                                                : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${route.status === 'ACTIVE' || route.status === 'PLANNED' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`} />
                                                {route.status || 'PLANNED'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenAiDispatch(route);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                                    title="Tối ưu lịch xe bằng AI"
                                                >
                                                    <Sparkles size={12} /> Lập lịch AI
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(route);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                                    title="Xóa template này"
                                                >
                                                    <X size={14} /> Xóa
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-7xl h-full max-h-[92vh] rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-[1.5rem] bg-brand-primary text-white flex items-center justify-center shadow-xl shadow-brand-primary/20">
                                    {isEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 tracking-tight">
                                        {isEditing ? "Cập nhật Tuyến đường" : "Tuyến Đường Vận Hành"}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {isEditing ? `Mã tuyến: ${selectedRoute?.id}` : "Tạo mới lộ trình chạy xe"}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-1">
                                            Người tạo: {formData.creator || "Chưa rõ"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:scale-110 transition-all shadow-sm bg-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10 bg-white relative">
                            {fetchingDetail && (
                                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang truy xuất dữ liệu chi tiết...</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Section 1: Basic & Entity Info */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                                            <Building size={14} className="text-slate-400" />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em]">Thông tin hoạch định</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Tên nhân viên tạo (Creator)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                    value={formData.creator}
                                                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                                                    placeholder="Tên quản trị viên"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Thời gian di chuyển (Phút)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all pr-12"
                                                        value={formData.duration === 0 ? "" : formData.duration}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                                                        placeholder="VD: 360"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MIN</div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                                                <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest leading-relaxed">
                                                    <Info size={10} className="inline mr-1" />
                                                    Lưu ý: Tuyến đường này sẽ là mẫu cố định. Sau này bạn sẽ dùng mẫu này để tạo các chuyến xe chạy hàng ngày.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Journey & Designer */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                                    <Navigation size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Chi tiết lộ trình</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thứ tự các điểm xe sẽ ghé qua</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddPoint}
                                                className="flex items-center gap-2 text-[9px] font-black text-white px-5 py-2.5 bg-brand-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                                            >
                                                <Plus size={14} /> THÊM TRẠM DỪNG
                                            </button>
                                        </div>

                                        {/* Vertical Timeline Designer */}
                                        <div className="relative pl-10 space-y-12">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-primary via-slate-200 to-slate-900 rounded-full" />

                                            {/* Node 1: Origin */}
                                            <div className="relative">
                                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-brand-primary border-4 border-white shadow-lg z-10 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Tỉnh/Thành xuất phát</label>
                                                            <select
                                                                required
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                value={formData.originProvinceId}
                                                                onChange={(e) => {
                                                                    const provId = e.target.value;
                                                                    const provName = provinces.find(p => p.id === provId)?.name || "";
                                                                    setFormData({
                                                                        ...formData,
                                                                        originProvinceId: provId,
                                                                        originDepartmentId: "",
                                                                        originName: provName
                                                                    });
                                                                    fetchDepartmentsByProvince(provId, 'origin');
                                                                }}
                                                            >
                                                                <option value="">-- Chọn Tỉnh/Thành đi --</option>
                                                                {provinces.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2 block">Chi nhánh xuất phát</label>
                                                            <select
                                                                required
                                                                disabled={!formData.originProvinceId}
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                                                value={formData.originDepartmentId}
                                                                onChange={(e) => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        originDepartmentId: e.target.value
                                                                    });
                                                                }}
                                                            >
                                                                <option value="">-- Chọn chi nhánh đi --</option>
                                                                {originDepartments.map(p => (
                                                                    <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Intermediate Nodes: Transit Points */}
                                            <div className="space-y-8">
                                                {formData.routePoints.length === 0 ? (
                                                    <div className="bg-white/40 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center">
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chưa có trạm trung chuyển nào được gán</p>
                                                    </div>
                                                ) : (
                                                    formData.routePoints.map((point, index) => (
                                                        <div key={index} className="relative group/node">
                                                            <div className="absolute -left-[31px] top-8 w-6 h-6 rounded-full bg-white border-2 border-slate-200 shadow-md z-10 flex items-center justify-center group-hover/node:border-brand-primary transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/node:bg-brand-primary transition-colors" />
                                                            </div>

                                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group-hover/node:border-brand-primary/20 transition-all relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePoint(index)}
                                                                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/node:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                                <div className="space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Tỉnh/Thành trạm dừng</label>
                                                                            <select
                                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                                value={point.provinceId || ""}
                                                                                onChange={(e) => {
                                                                                    const provId = e.target.value;
                                                                                    const updated = [...formData.routePoints];
                                                                                    updated[index] = {
                                                                                        ...updated[index],
                                                                                        provinceId: provId,
                                                                                        departmentId: "",
                                                                                        realOperationPointId: "",
                                                                                        stopName: "",
                                                                                        stopAddress: "",
                                                                                        stopCity: "",
                                                                                        stopLatitude: 0,
                                                                                        stopLongitude: 0,
                                                                                    };
                                                                                    setFormData({ ...formData, routePoints: updated });
                                                                                }}
                                                                            >
                                                                                <option value="">-- Chọn Tỉnh/Thành --</option>
                                                                                {provinces.map(p => (
                                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Chi nhánh tại trạm</label>
                                                                            <select
                                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                                value={point.departmentId}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (!val) {
                                                                                        clearPointData(index);
                                                                                    } else {
                                                                                        const selected = allOperationPoints.find(p => (p.id || p.operationPointId) === val);
                                                                                        if (selected) populatePointData(index, selected);
                                                                                        else updatePoint(index, 'departmentId', val);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <option value="">-- Chọn chi nhánh --</option>
                                                                                {allOperationPoints.flatMap(p => {
                                                                                    const matchesProvince = !point.provinceId || p.provinceId === point.provinceId;
                                                                                    if (!matchesProvince) return [];
                                                                                    return [
                                                                                        <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                                    ];
                                                                                })}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên hiển thị trạm dừng (Stop Name)</label>
                                                                            <div className="flex items-center gap-4">
                                                                                <input
                                                                                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                                                                    value={point.stopName}
                                                                                    onChange={(e) => updatePoint(index, 'stopName', e.target.value)}
                                                                                    placeholder="VD: Trạm dừng chân ABC"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thời gian tại trạm (phút)</label>
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="relative flex-1">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all pr-12"
                                                                                        value={point.timeAtDepartment}
                                                                                        onChange={(e) => updatePoint(index, 'timeAtDepartment', parseInt(e.target.value) || 0)}
                                                                                        placeholder="VD: +45 hoặc -30"
                                                                                    />
                                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">MIN</div>
                                                                                </div>
                                                                                <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black min-w-[100px] text-center uppercase tracking-widest shadow-lg h-full flex items-center justify-center">
                                                                                    STOP #{point.stopOrder}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Node Last: Destination */}
                                            <div className="relative">
                                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-slate-900 border-4 border-white shadow-lg z-10 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Tỉnh/Thành đích</label>
                                                            <select
                                                                required
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer"
                                                                value={formData.destinationProvinceId}
                                                                onChange={(e) => {
                                                                    const provId = e.target.value;
                                                                    const provName = provinces.find(p => p.id === provId)?.name || "";
                                                                    setFormData({
                                                                        ...formData,
                                                                        destinationProvinceId: provId,
                                                                        destinationDepartmentId: "",
                                                                        destinationName: provName
                                                                    });
                                                                    fetchDepartmentsByProvince(provId, 'destination');
                                                                }}
                                                            >
                                                                <option value="">-- Chọn Tỉnh/Thành đến --</option>
                                                                {provinces.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Chi nhánh đích</label>
                                                            <select
                                                                required
                                                                disabled={!formData.destinationProvinceId}
                                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-brand-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                                                value={formData.destinationDepartmentId}
                                                                onChange={(e) => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        destinationDepartmentId: e.target.value
                                                                    });
                                                                }}
                                                            >
                                                                <option value="">-- Chọn chi nhánh đến --</option>
                                                                {destinationDepartments.map(p => (
                                                                    <option key={p.id || p.departmentId} value={p.id || p.departmentId || p.operationPointId}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-950 uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Hủy lệnh
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {isEditing ? "Lưu thay đổi" : "Tạo tuyến mới"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Smart Dispatch Request Modal */}
            {isAiModalOpen && aiRoute && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-500">

                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                    <Sparkles size={22} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 tracking-tight">AI Smart Dispatch</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                                        <Navigation size={12} className="text-slate-400" />
                                        Tối ưu hóa & Lập lịch cho tuyến: <span className="text-indigo-600 font-extrabold">{aiRoute.originName} → {aiRoute.destinationName}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="w-10 h-10 rounded-2xl border border-slate-150 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content - Dual Column Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 bg-slate-50/40">

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Left Side: Forecast Column */}
                                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="text-indigo-600" size={18} />
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Dự Báo Nhu Cầu Đi Lại (Demand Forecast)</h4>
                                        </div>
                                        <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">Prophet + LSTM</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-end gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Số ngày dự báo</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="7"
                                                    max="90"
                                                    value={forecastDays}
                                                    onChange={(e) => setForecastDays(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <span className="text-sm font-black text-slate-700 w-12 text-right">{forecastDays} ngày</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={runForecast}
                                            disabled={forecasting}
                                            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                                        >
                                            {forecasting ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                            Chạy Dự Báo
                                        </button>
                                    </div>

                                    {/* Forecast Chart */}
                                    {forecastResults.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="relative h-64 w-full min-w-0">
                                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                    <AreaChart data={forecastResults}>
                                                        <defs>
                                                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                                        />
                                                        <Area type="monotone" dataKey="ensemble_demand" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemand)" name="Nhu cầu khách" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Date Selector */}
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                                                        Chọn các ngày vận hành ({selectedForecastDates.length}/{forecastResults.length})
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedForecastDates(forecastResults.map(p => p.date))}
                                                            className="text-[9px] font-black uppercase text-indigo-600 hover:underline"
                                                        >
                                                            Chọn tất cả
                                                        </button>
                                                        <span className="text-[9px] text-slate-350">|</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedForecastDates([])}
                                                            className="text-[9px] font-black uppercase text-rose-500 hover:underline"
                                                        >
                                                            Bỏ chọn
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-200/60 rounded-xl bg-white p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {forecastResults.map((pred) => {
                                                        const isSelected = selectedForecastDates.includes(pred.date);
                                                        const demand = Math.round(pred.ensemble_demand * 10) / 10;
                                                        return (
                                                            <label
                                                                key={pred.date}
                                                                className={`flex items-center justify-between p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                                                                    isSelected
                                                                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 font-bold"
                                                                        : "bg-slate-50/30 border-slate-100 text-slate-650 hover:bg-slate-50 hover:border-slate-200"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => {
                                                                            if (isSelected) {
                                                                                setSelectedForecastDates(selectedForecastDates.filter(d => d !== pred.date));
                                                                            } else {
                                                                                setSelectedForecastDates([...selectedForecastDates, pred.date]);
                                                                            }
                                                                        }}
                                                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                                                    />
                                                                    <span className="font-mono truncate">{pred.date}</span>
                                                                </div>
                                                                <span className={`text-[9px] px-1 py-0.2 rounded font-black whitespace-nowrap ${
                                                                    isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-150 text-slate-500"
                                                                }`}>
                                                                    {demand} khách
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                            <TrendingUp size={36} className="mb-2 text-slate-200" />
                                            <p className="text-xs font-bold text-slate-400">Vui lòng bấm "Chạy Dự Báo" để tính toán nhu cầu đi lại.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Schedule Configurations */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                            <Timer className="text-indigo-600" size={18} />
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Cấu Hình Tối Ưu Hóa Lịch Trình</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Chi phí / chuyến (VND)</label>
                                                <input
                                                    type="number"
                                                    value={isNaN(schedulerConfig.operating_cost_per_trip) ? "" : schedulerConfig.operating_cost_per_trip}
                                                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, operating_cost_per_trip: e.target.value === "" ? NaN : parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Chuyến tối đa / ngày</label>
                                                <input
                                                    type="number"
                                                    value={isNaN(schedulerConfig.max_trips_allowed) ? "" : schedulerConfig.max_trips_allowed}
                                                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, max_trips_allowed: e.target.value === "" ? NaN : parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Hệ số lấp đầy tối thiểu</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    min="0.1"
                                                    max="1"
                                                    value={isNaN(schedulerConfig.min_load_factor) ? "" : schedulerConfig.min_load_factor}
                                                    onChange={(e) => setSchedulerConfig({ ...schedulerConfig, min_load_factor: e.target.value === "" ? NaN : parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {optimizing && optimizeProgress && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] font-black text-slate-550 uppercase tracking-widest">
                                                    <span>Đang xử lý tối ưu...</span>
                                                    <span>{optimizeProgress.current} / {optimizeProgress.total} ngày</span>
                                                </div>
                                                <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600 transition-all duration-300"
                                                        style={{ width: `${(optimizeProgress.current / optimizeProgress.total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={runOptimization}
                                            disabled={optimizing || selectedForecastDates.length === 0}
                                            className="w-full py-4 bg-slate-950 text-white hover:bg-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                                        >
                                            {optimizing ? (
                                                <>
                                                    <Loader2 className="animate-spin animate-duration-1000" size={14} />
                                                    Đang Tối Ưu Lịch Chạy...
                                                </>
                                            ) : (
                                                <>
                                                    <Timer size={14} />
                                                    Tối Ưu Lịch Chạy ({selectedForecastDates.length} Ngày)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* AI Result Modal */}
            {isResultModalOpen && aiRoute && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative border border-white/50 animate-in zoom-in-95 duration-500">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                                    <CheckCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 tracking-tight">Kết Quả Phát Hành Lịch Trình Tự Động</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                                        <Navigation size={12} className="text-slate-400" />
                                        Tuyến đường: <span className="text-indigo-600 font-extrabold">{aiRoute.originName} → {aiRoute.destinationName}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsResultModalOpen(false)}
                                className="w-10 h-10 rounded-2xl border border-slate-150 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 bg-slate-50/40">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <CheckCircle className="text-emerald-500" size={18} />
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Chi Tiết Các Chuyến Xe Đã Được Tạo</h4>
                                </div>

                                {/* Key Performance Indicators */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số chuyến xe</p>
                                            <h5 className="text-2xl font-black text-slate-900">{totalTrips} chuyến</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Timer size={18} />
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hiệu suất đội xe</p>
                                            <h5 className="text-2xl font-black text-slate-900">{Math.round(avgFleetUtilization * 100)}%</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Users size={18} />
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doanh thu dự kiến</p>
                                            <h5 className="text-2xl font-black text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalExpectedProfit)}</h5>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                            <DollarSign size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Daily Schedules */}
                                <div className="space-y-4">
                                    {optimizedDates.map((date) => {
                                        const daySchedule = batchOptimizedSchedules[date];
                                        if (!daySchedule) return null;
                                        const isExpanded = expandedDates[date] ?? true;
                                        const dailyTripsCount = daySchedule.optimal_trips?.length || 0;
                                        const dailyProfit = daySchedule.total_expected_profit || 0;

                                        return (
                                            <div key={date} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
                                                {/* Day Header */}
                                                <div
                                                    onClick={() => setExpandedDates(prev => ({ ...prev, [date]: !isExpanded }))}
                                                    className="bg-slate-50/70 p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100 transition-all border-b border-slate-100/60"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Calendar size={16} className="text-indigo-650" />
                                                        <span className="font-mono font-black text-slate-900 text-sm">{date}</span>
                                                        <span className="text-[11px] text-slate-400 font-bold">({dailyTripsCount} chuyến xe)</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                                            +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dailyProfit)}
                                                        </span>
                                                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                    </div>
                                                </div>

                                                {/* Day Table */}
                                                {isExpanded && (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-100/30 border-b border-slate-100">
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">STT</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Giờ đi</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Xe phân bổ</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Dự báo khách</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá Vé</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lợi nhuận</th>
                                                                    <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Tỉ lệ lấp đầy</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {(daySchedule.optimal_trips || []).map((trip: any) => (
                                                                    <tr key={trip.trip_index} className="hover:bg-slate-50/30 transition-colors">
                                                                        <td className="px-5 py-2.5 text-xs font-black text-slate-650">{trip.trip_index}</td>
                                                                        <td className="px-5 py-2.5 text-xs font-black text-indigo-600">{trip.departure_time}</td>
                                                                        <td className="px-5 py-2.5 text-xs font-bold text-slate-700">
                                                                            {trip.assigned_vehicle ? (
                                                                                <div>
                                                                                    <span className="font-black text-slate-900 block">{trip.assigned_vehicle.vehicle_plate}</span>
                                                                                    <span className="text-[9px] text-slate-400 block font-normal">{trip.assigned_vehicle.vehicle_model} ({trip.assigned_vehicle.seat_capacity} chỗ)</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-slate-400 italic">Chưa phân bổ</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-5 py-2.5 text-xs font-bold text-slate-700">{trip.expected_passengers} khách</td>
                                                                        <td className="px-5 py-2.5 text-xs font-black text-slate-900">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.ticket_price)}
                                                                        </td>
                                                                        <td className="px-5 py-2.5 text-xs font-bold text-emerald-600">
                                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.expected_profit)}
                                                                        </td>
                                                                        <td className="px-5 py-2.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, trip.load_factor * 100)}%` }} />
                                                                                </div>
                                                                                <span className="text-xs font-bold text-slate-605">{Math.round(trip.load_factor * 100)}%</span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-150 bg-slate-50 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsResultModalOpen(false)}
                                className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-md"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Container */}
            <Pagination
                currentPage={page}
                totalPages={Math.ceil(totalItems / pageSize) || 1}
                totalItems={totalItems}
                onPageChange={setPage}
                itemLabel="tuyến đường"
            />
        </div>
    );
}
