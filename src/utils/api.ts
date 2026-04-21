const GATEWAY_BASE_URL = "http://localhost:8080/api/v1";

export const API_BASE_URL = `${GATEWAY_BASE_URL}/`;
export const ROUTE_SERVICE_BASE_URL = GATEWAY_BASE_URL;
export const PROVINCES_SERVICE_BASE_URL = GATEWAY_BASE_URL;
export const POINT_SERVICE_BASE_URL = GATEWAY_BASE_URL;
export const VEHICLE_SERVICE_BASE_URL = GATEWAY_BASE_URL;
export const MERCHANT_SERVICE_BASE_URL = `${GATEWAY_BASE_URL}/management/merchant-service`;
export const MERCHANT_APPLICATION_SERVICE_BASE_URL = `${GATEWAY_BASE_URL}/management/application-form`;
export const ADMIN_MERCHANT_ACTION_BASE_URL = `${GATEWAY_BASE_URL}/merchant-service`;
export const MEDIA_UPLOAD_URL = "management/media/upload";
export const RECENT_ACTIVITIES_URL = "management/recent-activities";

export const REGISTER_URL = "user-service/authentication/register";
export const LOGIN_URL = "user-service/authentication/login";
export const REFRESH_TOKEN_URL = "user-service/refresh-token";
export const FORGOT_PASSWORD_URL = "user-service/authentication/forgot-password";
export const CHANGE_PASSWORD_URL = "user-service/authentication/change-password";
export const RESET_PASSWORD_URL = "user-service/authentication/reset-password";
export const LOGOUT_URL = "user-service/authentication/logout";
export const RESEND_VERIFICATION_URL = "user-service/authentication/resend-verification";
export const VERIFY_URL = "user-service/authentication/verify";
export const UPLOAD_AVATAR_URL = "user-service/profile/avatar";
export const COMPLETE_PROFILE_URL = "user-service/profile/complete-profile";
export const PROFILE_ME_URL = "user-service/profile/me";
export const PROFILE_UPDATE_URL = "user-service/profile/update";
export const USER_MANAGEMENT_SERVICE_BASE_URL = `${GATEWAY_BASE_URL}/management/user-service`;



