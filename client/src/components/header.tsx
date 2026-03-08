"use client";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "./shared/user-button";
import { SiteLogo } from "./shared/site-logo";
import { Button } from "./ui/button";

const navItems: { name: string; href: string }[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      : pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/75 px-3 backdrop-blur-xl md:px-4">
      <div className="mx-auto flex h-16 w-full items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <SiteLogo />
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <UserButton />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 py-3 md:hidden">
          <nav className="mb-3 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="pt-2">
            <UserButton />
          </div>
        </div>
      )}
    </header>
  );
}
