import { CreditCard, Phone, ShieldCheck } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/services", label: "Services and fees" },
      { href: "/track", label: "Track a report" },
      { href: "/map", label: "City issue map" },
      { href: "/faq", label: "Questions and answers" },
    ],
  },
  {
    title: "City",
    links: [
      { href: "/about", label: "About CityCare" },
      { href: "/contact", label: "Contact the city team" },
      { href: SITE.apiDocsUrl, label: "Public API docs" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
      { href: "/dashboard/complaints/new", label: "Report a problem" },
    ],
  },
];

async function CurrentYear() {
  "use cache";
  cacheLife("days");

  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-transparent bg-navy text-navy-foreground dark:border-white/8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-size-[44px_44px] mask-[linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div className="container-page relative grid gap-12 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-5">
          <Logo surface="dark" tagline />
          <p className="max-w-xs text-sm leading-relaxed text-navy-muted">
            One place for the people of {SITE.city} to report problems, request city services and follow every step until the work is
            done.
          </p>
          <a
            href="tel:999"
            className="inline-flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm transition-colors hover:bg-white/10"
          >
            <Phone className="size-4 text-brass" aria-hidden />
            In an emergency call <span className="font-semibold">999</span>
          </a>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-4">
            <h2 className="text-xs font-semibold tracking-[0.14em] text-navy-muted uppercase">{column.title}</h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm text-navy-foreground/85 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {SITE.name}. Built for the city of {SITE.city}.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="size-3.5" aria-hidden />
              Payments by Stripe
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden />
              Card details never touch our servers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
