"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { isSameLocation, NAVIGATION_END, NAVIGATION_START } from "@/lib/navigation";

const SHOW_AFTER = 120;
const GIVE_UP_AFTER = 15000;

function RouteWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.dispatchEvent(new Event(NAVIGATION_END));
  }, [pathname, searchParams]);

  return null;
}

export function RouteProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    let running = false;
    let shown = false;
    let value = 0;
    let showTimer = 0;
    let trickleTimer = 0;
    let hideTimer = 0;
    let giveUpTimer = 0;
    let skeletonObserver: MutationObserver | null = null;

    const paint = (next: number, opacity = 1) => {
      value = next;
      bar.style.transform = `scaleX(${next / 100})`;
      bar.style.opacity = String(opacity);
    };

    const stopTimers = () => {
      window.clearTimeout(showTimer);
      window.clearInterval(trickleTimer);
      window.clearTimeout(giveUpTimer);
    };

    const waitForSkeletons = () => {
      if (!document.querySelector("[data-route-loading]")) {
        return false;
      }

      skeletonObserver?.disconnect();
      skeletonObserver = new MutationObserver(() => {
        if (!document.querySelector("[data-route-loading]")) {
          skeletonObserver?.disconnect();
          skeletonObserver = null;
          finish();
        }
      });
      skeletonObserver.observe(document.body, { childList: true, subtree: true });

      return true;
    };

    const finish = (force = false) => {
      if (!running || (!force && waitForSkeletons())) {
        return;
      }

      running = false;
      stopTimers();

      if (!shown) {
        return;
      }

      paint(100);
      hideTimer = window.setTimeout(() => {
        shown = false;
        bar.style.opacity = "0";
      }, 260);
    };

    const start = (url: string) => {
      if (running || isSameLocation(url)) {
        return;
      }

      running = true;
      window.clearTimeout(hideTimer);

      showTimer = window.setTimeout(() => {
        shown = true;
        bar.style.transition = "none";
        paint(0);
        void bar.offsetWidth;
        bar.style.transition = "";
        paint(14);
        trickleTimer = window.setInterval(() => paint(value + (94 - value) * 0.09), 260);
      }, SHOW_AFTER);

      giveUpTimer = window.setTimeout(() => {
        skeletonObserver?.disconnect();
        skeletonObserver = null;
        finish(true);
      }, GIVE_UP_AFTER);
    };

    const onStart = (event: Event) => start((event as CustomEvent<string>).detail);
    const onEnd = () => finish();

    window.addEventListener(NAVIGATION_START, onStart);
    window.addEventListener(NAVIGATION_END, onEnd);

    return () => {
      stopTimers();
      skeletonObserver?.disconnect();
      window.clearTimeout(hideTimer);
      window.removeEventListener(NAVIGATION_START, onStart);
      window.removeEventListener(NAVIGATION_END, onEnd);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.75">
        <div
          ref={barRef}
          className="h-full origin-left bg-linear-to-r from-primary/70 to-primary shadow-[0_0_10px_var(--primary)] transition-[transform,opacity] duration-300 ease-out"
          style={{ transform: "scaleX(0)", opacity: 0 }}
        />
      </div>
      <Suspense fallback={null}>
        <RouteWatcher />
      </Suspense>
    </>
  );
}
