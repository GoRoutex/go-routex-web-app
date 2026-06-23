export const API_BASE_URL = "http://localhost:8080/api/v1/merchant-service";
export const ANALYTICS_BASE_URL = "http://localhost:8080/api/v1/analytics-service";

export const ROUTE_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/routes/fetch`,
    CREATE: `${API_BASE_URL}/routes/create`,
    UPDATE: `${API_BASE_URL}/routes/update`,
    DELETE: `${API_BASE_URL}/routes/delete`,
    DETAIL: `${API_BASE_URL}/routes/detail`,
};

export const TRIP_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/trips/fetch`,
    CREATE: `${API_BASE_URL}/trips/create`,
    UPDATE: `${API_BASE_URL}/trips/update`,
    DELETE: `${API_BASE_URL}/trips/delete`, // Assuming delete exists or will be needed
    DETAIL: `${API_BASE_URL}/trips/detail`,
    ASSIGN: `${API_BASE_URL}/trips/assign`,
    BATCH_CREATE: `${API_BASE_URL}/trips/batch-create`,
};

export const DEPARTMENT_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/department/fetch`,
    CREATE: `${API_BASE_URL}/department/create`,
    UPDATE: `${API_BASE_URL}/department/update`,
    DELETE: `${API_BASE_URL}/department/delete`,
};

export const VEHICLE_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/vehicles/fetch`,
};

export const VEHICLE_TEMPLATE_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/vehicle-templates/fetch`,
    CREATE: `${API_BASE_URL}/vehicle-templates/create`,
    UPDATE: `${API_BASE_URL}/vehicle-templates/update`,
    DELETE: `${API_BASE_URL}/vehicle-templates/delete`,
    DETAIL: `${API_BASE_URL}/vehicle-templates/detail`,
};

export const STAFF_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/drivers/fetch`,
};

export const PROVINCE_ENDPOINTS = {
    SEARCH: `${API_BASE_URL}/provinces/search`,
};

export const DASHBOARD_ENDPOINTS = {
    GET: `${ANALYTICS_BASE_URL}/dashboard`,
};

export const TICKET_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/tickets/fetch`,
    SEARCH: `${API_BASE_URL}/tickets/search`,
    DETAIL: `${API_BASE_URL}/tickets/detail`,
    UPDATE: `${API_BASE_URL}/tickets/update`,
};

export const CAMPAIGN_ENDPOINTS = {
    FETCH: `${API_BASE_URL}/campaigns/fetch`,
    CREATE: `${API_BASE_URL}/campaigns/create`,
    VALIDATE: `${API_BASE_URL}/campaigns/validate`,
    APPLY: `${API_BASE_URL}/campaigns/apply`,
};

export const AI_SERVICE_BASE_URL = "http://localhost:8000/api/v1/ai";

export const AI_ENDPOINTS = {
    FORECAST: `${AI_SERVICE_BASE_URL}/forecast`,
    SCHEDULE: `${API_BASE_URL}/trips/schedule-async`,
    PRICING: `${AI_SERVICE_BASE_URL}/pricing`,
};

