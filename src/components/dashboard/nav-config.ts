import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FilePlus2,
  FolderKanban,
  Gauge,
  History,
  Inbox,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Map,
  MapPinned,
  Settings,
  Tags,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "messages" | "notifications";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAVIGATION: Record<Role, NavSection[]> = {
  CITIZEN: [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/complaints", label: "My reports", icon: ClipboardList },
        { href: "/dashboard/complaints/new", label: "New report", icon: FilePlus2, exact: true },
        { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
        { href: "/dashboard/profile", label: "Profile", icon: UserRound },
      ],
    },
  ],
  STAFF: [
    {
      items: [
        { href: "/staff", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/staff/tasks", label: "My tasks", icon: ListChecks },
        { href: "/staff/map", label: "Jobs map", icon: MapPinned },
        { href: "/staff/performance", label: "Performance", icon: BarChart3 },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/staff/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
        { href: "/staff/profile", label: "Profile and availability", icon: UserRound },
      ],
    },
  ],
  ADMIN: [
    {
      items: [
        { href: "/admin", label: "Overview", icon: Gauge, exact: true },
        { href: "/admin/complaints", label: "Complaints", icon: FolderKanban },
        { href: "/admin/map", label: "City map", icon: Map },
        { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "messages" },
        { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
      ],
    },
    {
      title: "People",
      items: [
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/staff", label: "Staff workload", icon: UsersRound },
      ],
    },
    {
      title: "City setup",
      items: [
        { href: "/admin/departments", label: "Departments", icon: Building2 },
        { href: "/admin/categories", label: "Categories and fees", icon: Tags },
      ],
    },
    {
      title: "Reports",
      items: [
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/audit-logs", label: "Audit log", icon: History },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
};

export const isNavActive = (pathname: string, item: NavItem) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

export const findNavItem = (role: Role, pathname: string) => {
  const items = NAVIGATION[role].flatMap((section) => section.items);

  return items.filter((item) => isNavActive(pathname, item)).sort((a, b) => b.href.length - a.href.length)[0] ?? null;
};
