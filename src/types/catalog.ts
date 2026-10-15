export type CategoryType = "COMPLAINT" | "SERVICE";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { categories: number };
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: CategoryType;
  fee: string;
  slaHours: number;
  isActive: boolean;
  department: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}
