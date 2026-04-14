const normalizeRole = (value: string) => value.trim().toUpperCase();

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
  localStorage.clear();
  window.location.href = "/";
};
