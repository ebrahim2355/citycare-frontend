import {
  ClipboardList,
  Construction,
  Container,
  Droplets,
  Footprints,
  Lightbulb,
  type LucideIcon,
  Recycle,
  Scissors,
  Sofa,
  Trash2,
  TreeDeciduous,
  Truck,
  Waves,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  [/tanker/i, Truck],
  [/septic/i, Container],
  [/trim/i, Scissors],
  [/\btrees?\b/i, TreeDeciduous],
  [/bulk|furniture/i, Sofa],
  [/garbage|collect/i, Recycle],
  [/dump|waste|litter/i, Trash2],
  [/light|lamp|electric/i, Lightbulb],
  [/drain|sewer/i, Waves],
  [/leak|water|pipe/i, Droplets],
  [/footpath|sidewalk|pavement/i, Footprints],
  [/pothole|road/i, Construction],
];

export const getCategoryIcon = (name: string) => RULES.find(([pattern]) => pattern.test(name))?.[1] ?? ClipboardList;
