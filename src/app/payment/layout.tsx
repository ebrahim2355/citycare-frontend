import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function PaymentLayout({ children }: LayoutProps<"/payment">) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
