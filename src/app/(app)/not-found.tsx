import { LostMapIllustration } from "@/components/shared/illustrations";
import { DashboardHomeButton } from "@/components/dashboard/dashboard-home-button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <LostMapIllustration className="w-52" />
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-primary">NOT FOUND</p>
        <h1 className="font-display text-3xl font-semibold">We could not find that</h1>
        <p className="max-w-md text-muted-foreground">The report or page does not exist, was removed, or belongs to someone else.</p>
      </div>
      <DashboardHomeButton />
    </div>
  );
}
