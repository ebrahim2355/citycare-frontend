"use client";

import { useIsFetching } from "@tanstack/react-query";
import { ChevronRight, ExternalLink, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { findNavItem } from "@/components/dashboard/nav-config";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/layout/logo";
import { RouteTransition } from "@/components/layout/route-transition";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/hooks/use-session";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { User } from "@/types";

const AREA_LABEL = { CITIZEN: "My CityCare", STAFF: "Staff desk", ADMIN: "City admin" } as const;

const roleLine = (user: User) => `${ROLE_LABEL[user.role]}${user.department ? ` · ${user.department.name}` : ""}`;

function Breadcrumbs({ user }: { user: User }) {
  const pathname = usePathname();
  const current = findNavItem(user.role, pathname);
  const home = ROLE_HOME[user.role];
  const isDeeper = current && pathname !== current.href;

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
      <Link href={home} className="font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground">
        {AREA_LABEL[user.role]}
      </Link>
      {current && current.href !== home && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
          {isDeeper ? (
            <Link href={current.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
              {current.label}
            </Link>
          ) : (
            <span className="truncate font-semibold">{current.label}</span>
          )}
        </>
      )}
      {isDeeper && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
          <span className="truncate font-semibold">Details</span>
        </>
      )}
    </nav>
  );
}

function SyncIndicator() {
  const fetching = useIsFetching() > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(fetching), fetching ? 300 : 500);

    return () => window.clearTimeout(timer);
  }, [fetching]);

  return (
    <span
      aria-hidden
      className={cn(
        "hidden items-center gap-2 text-xs font-medium text-muted-foreground transition-opacity duration-300 sm:flex",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="size-3.5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
      Syncing
    </span>
  );
}

function SidebarUser({ user, collapsed }: { user: User; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex justify-center">
            <UserAvatar name={user.name} src={user.avatarUrl} size={34} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          {user.name} · {roleLine(user)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent p-2.5">
      <UserAvatar name={user.name} src={user.avatarUrl} size={34} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{user.name}</p>
        <p className="truncate text-xs text-sidebar-foreground/70">{roleLine(user)}</p>
      </div>
    </div>
  );
}

const sidebarAction =
  "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export function AppShell({ user: initialUser, children }: { user: User; children: ReactNode }) {
  const { user: sessionUser } = useSession();
  const user = sessionUser ?? initialUser;
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  useEffect(() => {
    useUiStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out lg:flex",
          collapsed ? "w-19" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
          <Logo href={ROLE_HOME[user.role]} compact={collapsed} surface="dark" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-color:rgb(255_255_255/0.15)_transparent]">
          <SidebarNav role={user.role} collapsed={collapsed} />
        </div>
        <div className={cn("space-y-3 border-t border-sidebar-border p-3", collapsed && "flex flex-col items-center")}>
          <SidebarUser user={user} collapsed={collapsed} />
          <div className={cn("space-y-0.5", collapsed && "flex flex-col items-center")}>
            <Link href="/" className={cn(sidebarAction, collapsed && "w-10 justify-center px-0")}>
              <ExternalLink className="size-4 shrink-0" aria-hidden />
              <span className={cn(collapsed && "sr-only")}>Public site</span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className={cn(sidebarAction, collapsed && "w-10 justify-center px-0")}
            >
              {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
              <span className={cn(collapsed && "sr-only")}>Collapse</span>
            </button>
          </div>
        </div>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground **:data-[slot=sheet-close]:text-sidebar-foreground **:data-[slot=sheet-close]:hover:bg-sidebar-accent **:data-[slot=sheet-close]:hover:text-white"
        >
          <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
            <SheetTitle asChild>
              <div>
                <Logo href={ROLE_HOME[user.role]} surface="dark" />
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <SidebarNav role={user.role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <SidebarUser user={user} collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <Menu />
          </Button>
          <div className="lg:hidden">
            <Logo href={ROLE_HOME[user.role]} compact />
          </div>
          <Breadcrumbs user={user} />
          <div className="ml-auto flex items-center gap-2">
            <SyncIndicator />
            <CommandPalette role={user.role} />
            <span className="hidden rounded-md border bg-card px-2 py-1 text-xs font-medium text-muted-foreground xl:inline">{roleLine(user)}</span>
            <ThemeToggle />
            <UserMenu user={user} showName />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </div>
  );
}
