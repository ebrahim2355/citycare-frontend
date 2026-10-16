import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileQuestion className="size-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">We could not find that</h1>
        <p className="max-w-md text-muted-foreground">
          The report or page does not exist, was removed, or belongs to someone else.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go to the home page</Link>
      </Button>
    </div>
  );
}
