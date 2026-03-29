import { UserRound } from "lucide-react";

type ClientAvatarProps = {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
};

const sizeClassMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const iconSizeClassMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const getInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "U";

  const parts = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.map((part) => part[0]).join("").toUpperCase();
};

export function ClientAvatar({
  name = "",
  avatarUrl = "",
  size = "md",
  className = "",
  textClassName = "",
}: ClientAvatarProps) {
  const normalizedAvatarUrl = avatarUrl.trim();
  const initials = getInitials(name || "User");

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 ${sizeClassMap[size]} ${className}`}
      aria-label={name ? `${name} avatar` : "avatar"}
    >
      {normalizedAvatarUrl ? (
        <img
          src={normalizedAvatarUrl}
          alt={name ? `${name} avatar` : "avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={`select-none font-black tracking-tight text-brand-primary ${textClassName}`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

export function ClientAvatarIconFallback({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 ${sizeClassMap[size]}`}
      aria-hidden="true"
    >
      <UserRound className={`${iconSizeClassMap[size]} text-brand-primary`} />
    </div>
  );
}
