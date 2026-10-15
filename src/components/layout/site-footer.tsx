import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/services", label: "Services and fees" },
      { href: "/track", label: "Track a complaint" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "City",
    links: [
      { href: "/about", label: "About CityCare" },
      { href: "/contact", label: "Contact the team" },
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
    <footer className="border-t bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            One place for the people of {SITE.city} to report problems, request city services and see every step until the work is done.
          </p>
          <p className="text-sm text-muted-foreground">
            In an emergency call <span className="font-semibold text-foreground">999</span>.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {SITE.name}. Built for the city of {SITE.city}.
          </p>
          <p>Payments are handled by Stripe. Card details never touch our servers.</p>
        </div>
      </div>
    </footer>
  );
}
