"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-session";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/roles";
import type { User } from "@/types";

const PROFILE_PATH = { CITIZEN: "/dashboard/profile", STAFF: "/staff/profile", ADMIN: "/admin/settings" } as const;

export function UserMenu({ user, showName = false }: { user: User; showName?: boolean }) {
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 rounded-full px-1.5 sm:pr-3" aria-label={showName ? undefined : "Open account menu"}>
          <UserAvatar name={user.name} src={user.avatarUrl} size={30} />
          {showName && <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{user.name}</span>}
          {showName && <span className="sr-only">Open account menu</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs font-medium text-primary">{ROLE_LABEL[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={ROLE_HOME[user.role]}>
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PROFILE_PATH[user.role]}>
              <UserRound /> {user.role === "ADMIN" ? "Settings" : "Profile"}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={() => logout.mutate()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
