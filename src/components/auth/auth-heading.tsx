import type { ReactNode } from "react";

export function AuthHeading({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <div className="mb-8 space-y-2 text-center">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
