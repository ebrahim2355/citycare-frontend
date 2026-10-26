"use client";

import { ArrowRight, ChevronRight, CircleHelp, House, Landmark, LayoutGrid, type LucideIcon, Mail, MapPinned, Menu, Phone, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { ROLE_HOME } from "@/lib/roles";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/services", label: "Services", icon: LayoutGrid },
  { href: "/track", label: "Track", icon: Search },
  { href: "/map", label: "Issue map", icon: MapPinned },
  { href: "/about", label: "About", icon: Landmark },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/contact", label: "Contact", icon: Mail },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

function UtilityBar() {
  return (
    <div className="bg-navy text-navy-foreground">
      <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
        <p className="truncate text-navy-muted">
          <span className="font-semibold text-navy-foreground">{SITE.name}</span>
          <span className="hidden sm:inline"> · The city complaint and service platform for {SITE.city}</span>
        </p>
        <div className="flex shrink-0 items-center gap-5">
          <a href="tel:999" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-mint">
            <Phone className="size-3.5 text-brass" aria-hidden />
            Emergency 999
          </a>
          <Link href="/track" className="hidden text-navy-muted transition-colors hover:text-navy-foreground sm:inline">
            Track a report
          </Link>
          <Link href="/faq" className="hidden text-navy-muted transition-colors hover:text-navy-foreground md:inline">
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthActions({ onNavigate, stacked = false }: { onNavigate?: () => void; stacked?: boolean }) {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <Skeleton className={cn("h-9 rounded-lg", stacked ? "w-full" : "w-44")} />;
  }

  if (user) {
    return (
      <div className={cn("flex items-center gap-2", stacked && "flex-col items-stretch")}>
        <Button asChild size="lg" className={cn(!stacked && "hidden sm:inline-flex")}>
          <Link href={ROLE_HOME[user.role]} onClick={onNavigate}>
            Open dashboard
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        {!stacked && <UserMenu user={user} />}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", stacked && "flex-col-reverse items-stretch")}>
      <Button asChild variant={stacked ? "outline" : "ghost"} size="lg">
        <Link href="/login" onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Button asChild size="lg">
        <Link href="/dashboard/complaints/new" onClick={onNavigate}>
          Report a problem
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 max-w-[86vw] gap-0">
        <SheetHeader className="border-b">
          <SheetTitle asChild>
            <div>
              <Logo tagline />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
            >
              <link.icon className="size-4.5 text-muted-foreground group-aria-[current=page]:text-primary" aria-hidden />
              {link.label}
              <ChevronRight className="ml-auto size-4 text-muted-foreground/60" aria-hidden />
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4 border-t p-4">
          <AuthActions stacked onNavigate={() => setOpen(false)} />
          <a href="tel:999" className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
            <Phone className="size-4 text-destructive" aria-hidden />
            In an emergency call <span className="font-semibold">999</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <UtilityBar />
      <header className="header-elevate sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/75">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Logo tagline />
          <nav aria-label="Main" className="hidden h-full items-stretch gap-1 lg:flex">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className="relative flex items-center px-3 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100 aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden md:block">
              <AuthActions />
            </div>
            <MobileMenu pathname={pathname} />
          </div>
        </div>
      </header>
    </>
  );
}
