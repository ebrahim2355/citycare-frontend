export type Role = "CITIZEN" | "STAFF" | "ADMIN";

export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  provider: "LOCAL" | "GOOGLE";
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  departmentId: string | null;
  acceptsAssignments: boolean;
  department: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface StaffWorkload {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  acceptsAssignments: boolean;
  department: { id: string; name: string } | null;
  activeAssignments: number;
  capacity: number;
  isAvailable: boolean;
}
