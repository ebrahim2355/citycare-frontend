"use client";

import { ChevronRight, ExternalLink, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { findNavItem } from "@/components/dashboard/nav-config";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/layout/logo";
import { RouteTransition } from "@/components/layout/route-transition";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { User } from "@/types";

const AREA_LABEL = { CITIZEN: "My CityCare", STAFF: "Staff desk", ADMIN: "City admin" } as const;

function Breadcrumbs({ user }: { user: User }) {
  const pathname = usePathname();
  const current = findNavItem(user.role, pathname);
  const home = ROLE_HOME[user.role];
  const isDeeper = current && pathname !== current.href;

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
      <Link href={home} className="text-muted-foreground hover:text-foreground">
        {AREA_LABEL[user.role]}
      </Link>
      {current && current.href !== home && (
        <>
          <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
          {isDeeper ? (
            <Link href={current.href} className="text-muted-foreground hover:text-foreground">
              {current.label}
            </Link>
          ) : (
            <span className="truncate font-medium">{current.label}</span>
          )}
        </>
      )}
      {isDeeper && (
        <>
          <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium">Details</span>
        </>
      )}
    </nav>
  );
}

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
    <div className="flex min-h-dvh bg-muted/30">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-0")}>
          <Logo href={ROLE_HOME[user.role]} compact={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav role={user.role} collapsed={collapsed} />
        </div>
        <div className={cn("space-y-1 border-t p-3", collapsed && "flex flex-col items-center")}>
          <Link
            href="/"
            className={cn(
              "flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "w-10 justify-center px-0"
            )}
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            <span className={cn(collapsed && "sr-only")}>Public site</span>
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "w-10 justify-center px-0"
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
            <span className={cn(collapsed && "sr-only")}>Collapse</span>
          </button>
        </div>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] bg-sidebar p-0">
          <SheetHeader className="h-16 justify-center border-b px-4">
            <SheetTitle>
              <Logo href={ROLE_HOME[user.role]} />
            </SheetTitle>
            <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-5">
            <SidebarNav role={user.role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <Menu />
          </Button>
          <div className="lg:hidden">
            <Logo href={ROLE_HOME[user.role]} compact />
          </div>
          <Breadcrumbs user={user} />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground sm:inline">
              {ROLE_LABEL[user.role]}
              {user.department ? ` · ${user.department.name}` : ""}
            </span>
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
