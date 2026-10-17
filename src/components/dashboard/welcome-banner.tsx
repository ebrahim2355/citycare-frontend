import type { ReactNode } from "react";

const todayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });

interface WelcomeBannerProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function WelcomeBanner({ title, description, actions, children }: WelcomeBannerProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-navy px-5 py-6 text-navy-foreground shadow-raised sm:px-8 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[36px_36px] mask-[radial-gradient(ellipse_70%_90%_at_90%_0%,black,transparent)]" />
        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-mint/15 blur-3xl" />
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-mint uppercase" suppressHydrationWarning>
            {todayFormat.format(new Date())}
          </p>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold text-balance text-white sm:text-[2.1rem]">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-navy-muted sm:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export const bannerPrimaryButton = "bg-mint text-navy hover:bg-mint/90";

export const bannerOutlineButton =
  "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10";
