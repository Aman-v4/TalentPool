import {
  Bell,
  BriefcaseBusiness,
  CheckSquare,
  CircleDollarSign,
  Compass,
  FolderKanban,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTalentPool } from "../../state/TalentPoolContext";
import { PortalToggle } from "./PortalToggle";

const navigation = [
  { name: "Discover", href: "/consultant", icon: Compass },
  { name: "My Pools", href: "/consultant/my-pools", icon: FolderKanban },
  { name: "Workspaces", href: "/consultant/workspaces", icon: BriefcaseBusiness },
  { name: "Tasks", href: "/consultant/tasks", icon: CheckSquare },
  { name: "Payments", href: "/consultant/payments", icon: CircleDollarSign },
];

export function ConsultantAppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { consultantNotifications, consultantProfile } = useTalentPool();
  const unread = consultantNotifications.filter((notification) => !notification.read).length;
  const initials = consultantProfile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-white/95 backdrop-blur-md">
        <div className="page-container flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button className="focus-ring rounded-full p-2 text-ink-700 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/consultant" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-sm font-extrabold text-white">V</div>
            <span className="hidden text-lg font-bold text-ink-900 sm:inline">VirtUp</span>
          </Link>

          <div className="hidden min-w-0 flex-1 px-4 md:flex md:justify-center">
            <div className="search-pill max-w-xl">
              <Search className="h-4 w-4 shrink-0" />
              <span>Search pools, tasks, payments</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <PortalToggle />
            </div>
            <Link to="/consultant/notifications" className="focus-ring relative rounded-full border border-ink-200 bg-white p-2.5 text-ink-600 shadow-soft" aria-label={`${unread} unread notifications`}>
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">{initials}</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">{consultantProfile.name}</p>
                <p className="text-xs text-ink-500">Consultant</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden border-t border-ink-100/80 lg:block">
          <div className="page-container flex items-center gap-1 px-4 sm:px-6 lg:px-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/consultant"}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-semibold transition ${isActive ? "border-b-2 border-ink-900 text-ink-900" : "text-ink-500 hover:text-ink-800"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="page-container px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation backdrop" />
          <aside className="relative h-full w-80 max-w-[88vw] bg-white px-4 py-5 shadow-panel">
            <button className="focus-ring absolute right-4 top-4 rounded-full p-2 text-ink-700" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 mt-2 sm:hidden">
              <PortalToggle />
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/consultant"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"}`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
