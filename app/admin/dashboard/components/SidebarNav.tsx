import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: NavItem[];
  isMobile?: boolean;
}

export function SidebarNav({ items, isMobile }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Menu Utama
        </p>
        {items.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-crimson-950/50 text-crimson-200 shadow-sm border-l-2 border-crimson-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60 border-l-2 border-transparent"
                }
              `}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-crimson-400"
                    : "text-gray-500 group-hover:text-white"
                }`}
              />
              <span className="truncate">{item.title}</span>
              {isActive && !isMobile && (
                <ChevronRight className="ml-auto h-4 w-4 text-crimson-400 opacity-70" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
