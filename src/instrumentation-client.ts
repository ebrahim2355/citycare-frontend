import { announceNavigation } from "@/lib/navigation";

export function onRouterTransitionStart(url: string) {
  announceNavigation(url);
}
