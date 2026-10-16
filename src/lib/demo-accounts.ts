import { Building2, HardHat, type LucideIcon, UserRound } from "lucide-react";
import type { Role } from "@/types";

export interface DemoAccount {
  role: Role;
  label: string;
  email: string;
  password: string;
  description: string;
  icon: LucideIcon;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "City admin",
    email: "admin@citycare.com",
    password: "Admin12345",
    description: "Assign work, manage departments and fees, see analytics",
    icon: Building2,
  },
  {
    role: "CITIZEN",
    label: "Citizen",
    email: "citizen@citycare.com",
    password: "Citizen12345",
    description: "Report problems, pay for services and track every step",
    icon: UserRound,
  },
  {
    role: "STAFF",
    label: "Field staff",
    email: "roads.staff@citycare.com",
    password: "Staff12345",
    description: "Roads team member. Start and resolve assigned jobs",
    icon: HardHat,
  },
];
