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

export const hasAdminRole = () =>
  getStoredRoles().some((role) => role === "ADMIN" || role.includes("ADMIN"));

export const getPrimaryRole = () => getStoredRoles()[0] || "";

export const getClientHomeRoute = () =>
  localStorage.getItem("isLoggedIn") === "true" ? "/home" : "/";
