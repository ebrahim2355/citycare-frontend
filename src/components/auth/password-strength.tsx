import { cn } from "@/lib/utils";

const checks = [
  (value: string) => value.length >= 8,
  (value: string) => /[A-Za-z]/.test(value) && /[0-9]/.test(value),
  (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  (value: string) => /[^A-Za-z0-9]/.test(value) || value.length >= 12,
];

const levels = [
  { label: "Too weak", className: "bg-red-500" },
  { label: "Weak", className: "bg-orange-500" },
  { label: "Good", className: "bg-amber-500" },
  { label: "Strong", className: "bg-emerald-500" },
  { label: "Very strong", className: "bg-emerald-600" },
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) {
    return null;
  }

  const score = checks.filter((check) => check(value)).length;
  const level = levels[score] ?? levels[0];

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {checks.map((_, index) => (
          <span key={index} className={cn("h-1.5 rounded-full", index < score ? level.className : "bg-muted")} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{level.label}</span>
      </p>
    </div>
  );
}
