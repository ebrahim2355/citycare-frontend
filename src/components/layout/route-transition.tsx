"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [route, setRoute] = useState({ pathname, navigated: false });

  if (route.pathname !== pathname) {
    setRoute({ pathname, navigated: true });
  }

  return (
    <div key={pathname} className={route.navigated ? "animate-page-in" : undefined}>
      {children}
    </div>
  );
}
