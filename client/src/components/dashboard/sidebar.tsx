"use client";

import { cn } from "@/lib/utils";
import {
  FolderKanban,
  GaugeCircle,
  Home,
  Plus,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElementType } from "react";
import { useAppSettings } from "@/hooks/use-app-settings";

export const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-[290px] border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 lg:block">
      {SidebarContent()}
    </aside>
  );
};

const SidebarContent = () => {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const sidebarItems = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
    },
    {
      icon: GaugeCircle,
      label: "Overview",
      href: "/dashboard/overview",
    },
    {
      icon: FolderKanban,
      label: "Results",
      href: "/dashboard/results",
    },
    {
      icon: Settings,
      label: "Project Settings",
      href: "/dashboard/project-settings",
    },
    {
      icon: SlidersHorizontal,
      label: "Global Settings",
      href: "/dashboard/global-settings",
    },
  ];

  return (
    <div className="flex h-full flex-col text-slate-100">
      <nav className="flex-grow p-6">
        <ul role="list" className="flex flex-col flex-grow space-y-4">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {sidebarItems.map((item) => (
                <Navlink key={item.label} path={pathname} link={item} />
              ))}
            </ul>
          </li>
          <li className="pt-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Projects
              </span>
              <button
                type="button"
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Add project"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/dashboard"
                  className="group flex h-9 items-center gap-x-2 rounded-md bg-cyan-500/15 px-3 text-sm font-medium text-cyan-200 hover:bg-cyan-500/25"
                >
                  <FolderKanban className="size-4 shrink-0" />
                  <span className="truncate">{settings.projectName}</span>
                  <span className="ml-auto rounded bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100">
                    New
                  </span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const Navlink = ({
  path,
  link,
}: {
  path: string;
  link: {
    icon: ElementType;
    label: string;
    href: string;
    target?: string;
  };
}) => {
  const isActive =
    link.href === "/dashboard"
      ? path === "/dashboard"
      : path === link.href || path.startsWith(`${link.href}/`);

  return (
    <li key={link.label}>
      <Link
        href={link.href}
        target={link.target}
        className={cn(
          "group flex h-9 items-center gap-x-3 rounded-md px-3 text-sm font-semibold leading-5 text-slate-300",
          isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-800 hover:text-white"
        )}
      >
        <link.icon className="size-4 shrink-0" />
        {link.label}
      </Link>
    </li>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
