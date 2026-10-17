import { cn } from "@/lib/utils";

export function LostMapIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" aria-hidden className={cn("h-auto w-60", className)}>
      <rect x="1" y="1" width="238" height="168" rx="18" className="fill-card stroke-border" strokeWidth="2" />
      <g className="stroke-border" strokeWidth="6" strokeLinecap="round">
        <path d="M24 52H216" />
        <path d="M24 118H216" />
        <path d="M70 18V152" />
        <path d="M150 18V152" />
      </g>
      <g className="stroke-border" strokeWidth="2" opacity="0.8">
        <path d="M110 18V152" />
        <path d="M24 86H216" />
        <path d="M190 18L216 46" />
      </g>
      <path
        d="M40 140C62 140 70 118 92 118S128 96 132 86s14-26 42-30"
        className="animate-dash stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="5 8"
      />
      <circle cx="40" cy="140" r="7" className="fill-primary" />
      <circle cx="40" cy="140" r="13" className="stroke-primary/30" strokeWidth="2" />
      <g className="origin-[182px_58px] animate-float-slow">
        <path d="M182 14c-12.2 0-22 9.5-22 21.4 0 15.6 22 36.6 22 36.6s22-21 22-36.6C204 23.5 194.2 14 182 14Z" className="fill-navy dark:fill-mint" />
        <text x="182" y="43" textAnchor="middle" className="fill-white font-sans text-[22px] font-bold dark:fill-navy">
          ?
        </text>
      </g>
    </svg>
  );
}

export function RoadworksIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" aria-hidden className={cn("h-auto w-52", className)}>
      <ellipse cx="100" cy="150" rx="78" ry="10" className="fill-muted" />
      <rect x="22" y="104" width="156" height="14" rx="4" className="fill-navy dark:fill-white/15" />
      <g className="fill-brass">
        <path d="M30 104h24l-8 14H22z" />
        <path d="M78 104h24l-8 14H70z" />
        <path d="M126 104h24l-8 14h-24z" />
      </g>
      <rect x="34" y="118" width="8" height="30" rx="2" className="fill-navy/70 dark:fill-white/20" />
      <rect x="158" y="118" width="8" height="30" rx="2" className="fill-navy/70 dark:fill-white/20" />
      <g className="origin-[100px_96px] animate-float-slow">
        <path d="M88 20h24l20 76H68z" className="fill-orange-500" />
        <path d="M84 38h32l5 18H79z" className="fill-white" />
        <path d="M76 68h48l4 14H72z" className="fill-white" />
        <rect x="60" y="94" width="80" height="10" rx="3" className="fill-orange-600" />
      </g>
    </svg>
  );
}
