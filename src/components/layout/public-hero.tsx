import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PublicHeroProps {
  page: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function PublicHero({ page, title, description, actions, aside, className }: PublicHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-navy text-navy-foreground", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.045)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_80%_90%_at_75%_0%,black,transparent)]" />
        <div className="absolute -top-40 -right-24 size-120 rounded-full bg-mint/10 blur-3xl" />
      </div>
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-medium text-navy-muted">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span aria-current="page" className="text-white">
            {page}
          </span>
        </nav>
        <div className={cn("grid gap-10", aside && "lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16")}>
          <div className="min-w-0 animate-fade-up space-y-5">
            <h1 className="max-w-3xl font-display text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-5xl">{title}</h1>
            {description && <p className="max-w-2xl text-lg leading-relaxed text-pretty text-navy-muted">{description}</p>}
            {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
          </div>
          {aside && <div className="min-w-0 animate-fade-up [animation-delay:120ms]">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export const heroPrimaryButton = "h-11 bg-mint px-5 text-navy hover:bg-mint/90";

export const heroOutlineButton =
  "h-11 border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10";
