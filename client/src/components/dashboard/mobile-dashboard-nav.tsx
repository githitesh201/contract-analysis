"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FolderKanban, GaugeCircle, Home, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/overview", label: "Overview", icon: GaugeCircle },
  { href: "/dashboard/results", label: "Results", icon: FolderKanban },
  { href: "/dashboard/project-settings", label: "Settings", icon: Settings },
];

export function MobileDashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur lg:hidden">
      <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "min-w-[86px] flex-shrink-0 rounded-xl px-3 py-2 text-center text-[11px] font-medium",
              isActive(item.href)
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700"
            )}
          >
            <item.icon className="mx-auto mb-1 size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
