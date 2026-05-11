export const API_BASE_URL = "http://localhost:8080/api/v1/merchant-service";

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
