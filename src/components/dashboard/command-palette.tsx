"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlarmClock,
  CircleDollarSign,
  FilePlus2,
  FileText,
  Inbox,
  Laptop,
  ListChecks,
  LogOut,
  type LucideIcon,
  Moon,
  Search,
  SearchCheck,
  Sun,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { NAVIGATION } from "@/components/dashboard/nav-config";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { useLogout } from "@/hooks/use-session";
import { complaintQueries } from "@/lib/query/options";
import type { Role } from "@/types";

interface PaletteAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const ROLE_ACTIONS: Record<Role, PaletteAction[]> = {
  CITIZEN: [
    { id: "new-report", label: "Report a new problem", icon: FilePlus2, href: "/dashboard/complaints/new" },
    { id: "pay", label: "Requests waiting for payment", icon: CircleDollarSign, href: "/dashboard/complaints?status=PENDING_PAYMENT" },
  ],
  STAFF: [
    { id: "waiting", label: "Jobs waiting to start", icon: ListChecks, href: "/staff/tasks?status=ASSIGNED" },
    { id: "overdue", label: "My overdue jobs", icon: AlarmClock, href: "/staff/tasks?overdue=true" },
  ],
  ADMIN: [
    { id: "unassigned", label: "Reports with nobody assigned", icon: UserX, href: "/admin/complaints?status=SUBMITTED&unassigned=true" },
    { id: "overdue", label: "Overdue reports", icon: AlarmClock, href: "/admin/complaints?overdue=true" },
    { id: "messages", label: "New contact messages", icon: Inbox, href: "/admin/messages?status=NEW" },
  ],
};

const DETAIL_PATH: Record<Role, (id: string) => string> = {
  CITIZEN: (id) => `/dashboard/complaints/${id}`,
  STAFF: (id) => `/staff/tasks/${id}`,
  ADMIN: (id) => `/admin/complaints/${id}`,
};

const THEMES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Match my device", icon: Laptop },
];

const subscribe = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

const matches = (label: string, query: string) => label.toLowerCase().includes(query.trim().toLowerCase());

function ReportResults({ query, role, onOpen }: { query: string; role: Role; onOpen: (href: string) => void }) {
  const search = useQuery({ ...complaintQueries.list({ searchTerm: query, sortBy: "updatedAt" }), enabled: query.length >= 2 });
  const items = query.length >= 2 ? (search.data?.items.slice(0, 6) ?? []) : [];

  if (query.length < 2) {
    return null;
  }

  return (
    <CommandGroup heading="Reports">
      {search.isFetching && items.length === 0 && (
        <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
          <span className="size-3.5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden />
          Searching reports
        </div>
      )}
      {items.map((complaint) => (
        <CommandItem key={complaint.id} value={`report:${complaint.id}`} onSelect={() => onOpen(DETAIL_PATH[role](complaint.id))}>
          <FileText className="text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{complaint.title}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {complaint.trackingCode} · {complaint.area}
            </p>
          </div>
          <StatusBadge status={complaint.status} className="hidden sm:inline-flex" />
        </CommandItem>
      ))}
      {!search.isFetching && search.data && items.length === 0 && (
        <p className="px-2 py-3 text-sm text-muted-foreground">No reports match “{query}”.</p>
      )}
    </CommandGroup>
  );
}

export function CommandPalette({ role }: { role: Role }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const query = useDebounce(text.trim(), 250);
  const mac = useSyncExternalStore(subscribe, isMac, () => false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const changeOpen = (value: boolean) => {
    setOpen(value);

    if (!value) {
      setText("");
    }
  };

  const go = (href: string) => {
    changeOpen(false);
    router.push(href);
  };

  const pages = NAVIGATION[role].flatMap((section) => section.items).filter((item) => matches(item.label, text));
  const actions = [...ROLE_ACTIONS[role], { id: "track", label: "Track a report by its code", icon: SearchCheck, href: "/track" }].filter((action) =>
    matches(action.label, text)
  );
  const themes = THEMES.filter((theme) => matches(theme.label, text));
  const showSignOut = matches("Sign out", text);
  const nothing = !pages.length && !actions.length && !themes.length && !showSignOut && query.length < 2;

  return (
    <>
      <button
        type="button"
        onClick={() => changeOpen(true)}
        className="hidden h-9 w-60 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground md:flex lg:w-72"
      >
        <Search className="size-4" aria-hidden />
        <span className="truncate">Search or jump to…</span>
        <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          {mac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </button>
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search or jump to" onClick={() => changeOpen(true)}>
        <Search />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={changeOpen}
        title="Search CityCare"
        description="Search your reports or jump to a page"
        className="sm:max-w-xl"
      >
        <Command shouldFilter={false} loop className="rounded-none! p-0">
          <div className="border-b p-2">
            <CommandInput
              value={text}
              onValueChange={setText}
              placeholder="Search reports by title or tracking code, or type a page"
              className="h-9"
            />
          </div>
          <CommandList className="max-h-[min(60vh,26rem)] p-1">
            {nothing && <CommandEmpty>Nothing matches “{text}”.</CommandEmpty>}
            <ReportResults query={query} role={role} onOpen={go} />
            {pages.length > 0 && (
              <CommandGroup heading="Go to">
                {pages.map((item) => (
                  <CommandItem key={item.href} value={`page:${item.href}`} onSelect={() => go(item.href)}>
                    <item.icon className="text-muted-foreground" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {actions.length > 0 && (
              <CommandGroup heading="Quick actions">
                {actions.map((action) => (
                  <CommandItem key={action.id} value={`action:${action.id}`} onSelect={() => go(action.href)}>
                    <action.icon className="text-muted-foreground" />
                    {action.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {(themes.length > 0 || showSignOut) && <CommandSeparator className="my-1" />}
            {themes.length > 0 && (
              <CommandGroup heading="Appearance">
                {themes.map((theme) => (
                  <CommandItem
                    key={theme.value}
                    value={`theme:${theme.value}`}
                    onSelect={() => {
                      setTheme(theme.value);
                      changeOpen(false);
                    }}
                  >
                    <theme.icon className="text-muted-foreground" />
                    {theme.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showSignOut && (
              <CommandGroup heading="Account">
                <CommandItem
                  value="account:sign-out"
                  onSelect={() => {
                    changeOpen(false);
                    logout.mutate();
                  }}
                >
                  <LogOut className="text-muted-foreground" />
                  Sign out
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to move · <kbd className="font-mono">↵</kbd> to open
          </span>
          <span>
            <kbd className="font-mono">esc</kbd> to close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
