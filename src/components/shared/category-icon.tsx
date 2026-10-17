import { createElement } from "react";
import { getCategoryIcon } from "@/lib/category-icons";

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getCategoryIcon(name), { className, "aria-hidden": true });
}
