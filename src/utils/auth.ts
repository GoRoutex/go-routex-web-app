import { API_BASE_URL, REFRESH_TOKEN_URL } from "./api";
import { createRequestMeta } from "./requestMeta";

const normalizeRole = (value: string) => value.trim().toUpperCase();

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token expires in less than 30 seconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + 30;
};

export const getAccessToken = () => localStorage.getItem("authToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const refreshTokens = async () => {
  const refresh = getRefreshToken();
  if (!refresh) {
    logout();
    return null;
  }

  try {
    const response = await fetch(API_BASE_URL + REFRESH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createRequestMeta(),
        channel: "OFF",
        data: { refreshToken: refresh }
      }),
    });

    if (!response.ok) throw new Error("Refresh failed");

    const body = await response.json();
    const { accessToken, refreshToken, userId } = body.data || {};

    if (accessToken) localStorage.setItem("authToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (userId) localStorage.setItem("userId", userId);

    return accessToken;
  } catch (error) {
    logout();
    return null;
  }
};

const readStoredStringArray = (key: string) => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Fall through and treat as a single comma-separated string.
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getStoredRoles = () => {
  const roleKeys = ["userRoles", "authorities", "profileAuthorities"];
  const roles = new Set<string>();

  for (const key of roleKeys) {
    for (const role of readStoredStringArray(key)) {
      roles.add(normalizeRole(role));
    }
  }

  const singleRoleKeys = ["userRole", "profileRole", "role"];
  for (const key of singleRoleKeys) {
    const value = localStorage.getItem(key);
    if (value?.trim()) {
      roles.add(normalizeRole(value));
    }
  }

  return Array.from(roles);
};

const isPermissionLikeRole = (role: string) => role.includes(":");

const isDisplayRole = (role: string) => {
  const normalized = normalizeRole(role);
  return (
    normalized === "ADMIN" ||
    normalized.includes("ADMIN") ||
    normalized.includes("STAFF") ||
    normalized.includes("DRIVER") ||
    normalized.includes("MANAGER") ||
    normalized.includes("OPERATOR")
  );
};

export const getPrimaryDisplayRole = () => {
  const roles = getStoredRoles();
  const preferred = roles.find(isDisplayRole);
  if (preferred) return preferred;

  const nonPermissionRole = roles.find((role) => !isPermissionLikeRole(role));
  return nonPermissionRole || roles[0] || "";
};

export const hasAdminRole = () =>
  getStoredRoles().some((role) => role === "ADMIN" || role.includes("ADMIN"));

export const hasMerchantRole = () => {
  const roles = getStoredRoles();
  return roles.some((role) => 
    role === "MERCHANT" || 
    role.includes("MERCHANT") || 
    role.includes("MANAGER") || 
    role.includes("OPERATOR")
  );
};

export const hasMerchantOwnerRole = () => {
  const roles = getStoredRoles();
  return roles.some(role => 
    role === "ROLE_MERCHANT_OWNER" || 
    role === "MERCHANT_OWNER"
  );
};

export const isBothAdminAndMerchant = () => {
  return hasAdminRole() && hasMerchantOwnerRole();
};

export const getPrimaryRole = () => getPrimaryDisplayRole();

export const getClientHomeRoute = () =>
  localStorage.getItem("isLoggedIn") === "true" ? "/home" : "/";

export const logout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRoles");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  window.location.href = "/";
};
