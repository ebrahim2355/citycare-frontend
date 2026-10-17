"use client";

import { useEffect } from "react";
import { BrandLoader } from "@/components/shared/brand-loader";
import { NAVIGATION_END } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useOverlayStore } from "@/stores/overlay-store";

const GIVE_UP_AFTER = 12000;

export function TransitionOverlay() {
  const overlay = useOverlayStore((state) => state.overlay);
  const leaving = useOverlayStore((state) => state.leaving);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const timer = window.setTimeout(hideOverlay, GIVE_UP_AFTER);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        hideOverlay();
      }
    };

    window.addEventListener(NAVIGATION_END, hideOverlay);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(NAVIGATION_END, hideOverlay);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [overlay, hideOverlay]);

  if (!overlay) {
    return null;
  }

  return (
    <div className={cn("transition-opacity duration-200", leaving && "pointer-events-none opacity-0")}>
      <BrandLoader fullScreen title={overlay.title} description={overlay.description} />
    </div>
  );
}
