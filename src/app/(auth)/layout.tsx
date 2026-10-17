import { ArrowLeft, CircleCheck, Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LogoMark, Logo } from "@/components/layout/logo";
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
    <aside className="relative isolate hidden overflow-hidden bg-navy text-navy-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.045)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_90%_80%_at_80%_20%,black,transparent)]" />
        <div className="absolute -top-40 -right-32 size-136 rounded-full bg-mint/14 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 size-120 rounded-full bg-info/20 blur-3xl" />
        <LogoMark surface="dark" className="absolute -right-24 -bottom-24 size-112 rotate-[-8deg] opacity-[0.06]" />
      </div>
      <p className="inline-flex items-center gap-2.5 text-sm text-navy-muted">
        <span className="size-2 rounded-full bg-mint" aria-hidden />
        The city complaint and service platform of Dhaka
      </p>
      <div className="space-y-10">
        <h2 className="max-w-md font-display text-4xl leading-[1.12] font-semibold text-balance text-white xl:text-5xl">
          Your street, fixed by <span className="text-mint italic">the people who own it.</span>
        </h2>
        <ul className="space-y-4">
          {points.map((point) => (
            <li key={point.text} className="flex items-center gap-3.5">
              <span className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <point.icon className="size-5 text-mint" aria-hidden />
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>
      {stats ? (
        <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          {[
            { label: "reports so far", value: formatNumber(stats.totalComplaints) },
            { label: "resolved", value: `${stats.resolutionRate}%` },
            { label: "average fix time", value: formatHours(stats.averageResolutionHours) },
          ].map((item) => (
            <div key={item.label} className="px-5 py-4">
              <dt className="text-xs text-navy-muted">{item.label}</dt>
              <dd className="mt-0.5 font-display text-2xl font-semibold text-white tabular-nums lining-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <span />
      )}
    </aside>
  );
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,0.92fr)]">
      <div className="flex flex-col">
        <header className="flex h-18 items-center justify-between border-b px-4 sm:px-8 lg:border-b-0">
          <Logo tagline />
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-xl">{children}</div>
        </main>
        <footer className="px-4 pb-6 text-center text-xs text-muted-foreground sm:px-8">
          Your session is kept in secure, HTTP-only cookies that page scripts cannot read.
        </footer>
      </div>
      <BrandPanel />
    </div>
  );
}
