import type { Role } from "@/types";

export const ROLE_HOME: Record<Role, string> = {
  CITIZEN: "/dashboard",
  STAFF: "/staff",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "Citizen",
  STAFF: "Field staff",
  ADMIN: "City admin",
};

const ROLE_AREAS: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "CITIZEN" },
  { prefix: "/payment", role: "CITIZEN" },
  { prefix: "/staff", role: "STAFF" },
  { prefix: "/admin", role: "ADMIN" },
];

export const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export const getAreaRole = (pathname: string) => ROLE_AREAS.find((area) => matches(pathname, area.prefix))?.role ?? null;

export const isGuestOnlyPath = (pathname: string) => GUEST_ONLY_PATHS.some((path) => matches(pathname, path));

export const getSafeRedirect = (value: string | null | undefined, role: Role) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return ROLE_HOME[role];
  }

  const area = getAreaRole(value.split("?")[0] ?? value);

  return area && area !== role ? ROLE_HOME[role] : value;
};
