import { CircleCheck, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { formatHours, formatNumber } from "@/lib/format";
import { getPublicStats } from "@/lib/server/public-api";

const points = [
  { icon: CircleCheck, text: "A tracking code and a deadline for every report" },
  { icon: Clock3, text: "See who works on it and every status change" },
  { icon: ShieldCheck, text: "Safe Stripe payments, refunded if the city says no" },
];

async function BrandPanel() {
  const stats = await getPublicStats();

  return (
    <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_25rem_at_100%_0%,rgb(255_255_255/0.14),transparent),radial-gradient(30rem_20rem_at_0%_100%,rgb(0_0_0/0.18),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:40px_40px]"
      />
      <p className="relative text-sm font-medium opacity-80">The city complaint and service platform of Dhaka</p>
      <div className="relative space-y-8">
        <h2 className="max-w-md text-4xl font-bold tracking-tight text-balance">Your street, fixed by the people who own it.</h2>
        <ul className="space-y-4">
          {points.map((point) => (
            <li key={point.text} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/12">
                <point.icon className="size-5" aria-hidden />
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>
      {stats ? (
        <dl className="relative grid grid-cols-3 gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur">
          <div>
            <dd className="text-2xl font-bold tabular-nums">{formatNumber(stats.totalComplaints)}</dd>
            <dt className="text-xs opacity-80">reports so far</dt>
          </div>
          <div>
            <dd className="text-2xl font-bold tabular-nums">{stats.resolutionRate}%</dd>
            <dt className="text-xs opacity-80">resolved</dt>
          </div>
          <div>
            <dd className="text-2xl font-bold tabular-nums">{formatHours(stats.averageResolutionHours)}</dd>
            <dt className="text-xs opacity-80">average fix time</dt>
          </div>
        </dl>
      ) : (
        <span />
      )}
    </aside>
  );
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,0.9fr)]">
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-xl">{children}</div>
        </main>
      </div>
      <BrandPanel />
    </div>
  );
}
