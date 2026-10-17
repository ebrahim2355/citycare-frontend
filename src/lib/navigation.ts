export const NAVIGATION_START = "citycare:navigation-start";
export const NAVIGATION_END = "citycare:navigation-end";

export const announceNavigation = (url: string) => {
  window.dispatchEvent(new CustomEvent(NAVIGATION_START, { detail: url }));
};

export const isSameLocation = (url: string) => {
  try {
    const next = new URL(url, window.location.href);

    return next.origin === window.location.origin && next.pathname === window.location.pathname && next.search === window.location.search;
  } catch {
    return false;
  }
};
