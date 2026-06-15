import { useRouter } from "next/navigation";
import { CircleUser, LogOut, Settings, LifeBuoy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: { name?: string; email?: string; image?: string } | null;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 focus-visible:outline-none transition-colors">
        {user?.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <CircleUser className="h-5 w-5 text-gray-300" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-gray-900 border-gray-800 text-gray-100 shadow-xl"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">
              {user?.name || "Memuat..."}
            </p>
            <p className="text-xs text-gray-400">{user?.email || ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="hover:bg-gray-800 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" /> <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            (window.location.href = "mailto:support@maitreyawira.sch.id")
          }
          className="hover:bg-gray-800 cursor-pointer"
        >
          <LifeBuoy className="mr-2 h-4 w-4" /> <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-400 hover:bg-red-950/20 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> <span>Log out</span>
          <DropdownMenuShortcut> ⇧⌘ Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
