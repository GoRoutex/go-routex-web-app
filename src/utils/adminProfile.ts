import { getPrimaryRole } from "./auth";

const clean = (value: string | null | undefined) => value?.trim() || "";

const formatRoleLabel = (role: string) => {
  const normalized = role.trim().toUpperCase();
  if (!normalized) return "Admin";
  if (normalized.includes("ADMIN")) return "Admin";
  if (normalized.includes("STAFF")) return "Staff";
  if (normalized.includes("DRIVER")) return "Driver";
  if (normalized.includes(":")) return "Admin";
  return normalized.replace(/_/g, " ");
};

const initialsFromName = (name: string) => {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const readAdminProfileSummary = () => {
  const name =
    clean(localStorage.getItem("profileFullName")) ||
    clean(localStorage.getItem("userName")) ||
    clean(localStorage.getItem("displayName")) ||
    clean(localStorage.getItem("fullName")) ||
    "Admin User";
  const email =
    clean(localStorage.getItem("userEmail")) ||
    clean(localStorage.getItem("profileEmail")) ||
    clean(localStorage.getItem("email")) ||
    "";
  const role =
    clean(localStorage.getItem("profileRole")) ||
    clean(localStorage.getItem("userRole")) ||
    getPrimaryRole() ||
    "ADMIN";
  const avatarText =
    clean(localStorage.getItem("profileAvatarInitials")) ||
    initialsFromName(name);

  return {
    name,
    email,
    role,
    roleLabel: formatRoleLabel(role),
    avatarText,
  };
};
