import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Icons } from "./icons";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/zustand";

export function UserButton() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { openModal } = useModalStore();

  const handleLogout = async () => {
    await logout();
    window.location.reload();
    setInterval(() => router.push("/"), 1000);
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 p-0 shadow-sm transition-all hover:border-slate-300 hover:bg-white"
              >
                <Avatar className="size-8 ring-2 ring-cyan-100">
                  <AvatarImage src={user?.profilePicture || ""} />
                  <AvatarFallback>
                    {user?.displayName
                      ?.split(" ")
                      .map((part: string) => part.charAt(0))
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-xl border-slate-200/80 bg-white/95 p-1.5 shadow-xl" forceMount>
              <DropdownMenuItem className="flex cursor-default flex-col items-start rounded-lg bg-slate-50 p-3 focus:bg-slate-50">
                <div className="text-sm font-semibold text-slate-900">{user?.displayName}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={"/dashboard"}>
                  <Icons.dashboard className="mr-2 size-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/dashboard/settings"}>
                  <Icons.settings className="mr-2 size-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <Icons.logout className="mr-2 size-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button onClick={() => openModal("connectAccountModal")}>
            Sign in
          </Button>
        </>
      )}
    </div>
  );
}
