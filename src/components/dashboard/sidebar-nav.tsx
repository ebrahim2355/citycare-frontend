"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAVIGATION, type NavItem } from "@/components/dashboard/nav-config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { statsQueries } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

function MessagesBadge({ collapsed }: { collapsed: boolean }) {
  const { data } = useQuery({ ...statsQueries.admin(), select: (stats) => stats.messages.new });

  if (!data) {
    return null;
  }

  return (
    <span
      className={cn(
        "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[11px] font-semibold text-sidebar-primary-foreground",
        collapsed && "absolute top-1 right-1 ml-0 min-w-4 px-1 text-[10px]"
      )}
      aria-label={`${data} new messages`}
    >
      {data}
    </span>
  );
}

function NavLink({ item, active, collapsed, onNavigate }: { item: NavItem; active: boolean; collapsed: boolean; onNavigate?: () => void }) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <span
        className={cn(
          "absolute top-2 bottom-2 left-0 w-1 origin-center rounded-r-full bg-sidebar-primary transition-transform duration-300",
          active ? "scale-y-100" : "scale-y-0"
        )}
        aria-hidden
      />
      <item.icon className={cn("size-4.5 shrink-0 transition-colors", active && "text-sidebar-primary")} aria-hidden />
      <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
      {item.badge === "messages" && <MessagesBadge collapsed={collapsed} />}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function SidebarNav({ role, collapsed = false, onNavigate }: { role: Role; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const sections = NAVIGATION[role];
  const activeHref = sections
    .flatMap((section) => section.items)
    .filter((item) => isNavActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Dashboard" className="space-y-6">
      {sections.map((section, index) => (
        <div key={section.title ?? index} className="space-y-1">
          {section.title && (
            <p
              className={cn(
                "px-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/50 uppercase",
                collapsed && "sr-only"
              )}
            >
              {section.title}
            </p>
          )}
          {section.items.map((item) => (
            <NavLink key={item.href} item={item} active={item.href === activeHref} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}
