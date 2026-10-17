import { LayoutDashboard, Lock } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function PaymentLayout({ children }: LayoutProps<"/payment">) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-muted/40">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <header className="border-b bg-background/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo href="/dashboard" />
            <span className="hidden items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              <Lock className="size-3.5 text-primary" aria-hidden />
              Secure payment
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              My dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="container-page flex flex-1 items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
