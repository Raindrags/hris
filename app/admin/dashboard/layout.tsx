"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package2,
  Search,
  Users,
  LogOut,
  Settings,
  LifeBuoy,
  CalendarDays,
  FileText,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface UserProfile {
  name?: string;
  email?: string;
  image?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setUser({
          name: "Admin Sekolah",
          email: "admin@maitreyawira.sch.id",
        });
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    { title: "Pegawai", href: "/admin/dashboard/pegawai", icon: Users },
    { title: "Absensi", href: "/admin/dashboard/absensi", icon: CalendarDays },
    {
      title: "Form Cuti",
      href: "/admin/dashboard/form-cuti",
      icon: FileText,
    },
    {
      title: "Form Izin",
      href: "/admin/dashboard/form-izin",
      icon: FileText,
    },
    { title: "Jadwal", href: "/admin/dashboard/jadwal", icon: CalendarDays },
    { title: "Laporan", href: "/admin/dashboard/laporan", icon: LineChart },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-gray-950 text-gray-100">
      {/* --- SIDEBAR DESKTOP (DIPERHALUS) --- */}
      <aside className="hidden md:flex flex-col border-r border-gray-800 bg-gray-900/80 backdrop-blur-sm print:hidden">
        {/* Logo & Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson-900/40 text-crimson-400">
            <Package2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">
              HRIS MAITREYAWIRA
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
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
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-crimson-400 opacity-70" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Bawah Sidebar */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800/40 transition-colors cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <CircleUser className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Memuat..."}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md px-4 md:px-6 print:hidden">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-gray-900 border-r border-gray-800 text-gray-100 p-0 w-72"
            >
              {/* Logo di mobile sheet */}
              <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson-900/40 text-crimson-400">
                  <Package2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-white">
                  HRIS MAITREYAWIRA
                </span>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Menu Utama
                  </p>
                  {navItems.map((item) => {
                    const isActive =
                      item.href === "/admin/dashboard"
                        ? pathname === "/admin/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-crimson-950/50 text-crimson-200 border-l-2 border-crimson-500"
                              : "text-gray-400 hover:text-white hover:bg-gray-800/60 border-l-2 border-transparent"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-crimson-400"
                              : "text-gray-500 group-hover:text-white"
                          }`}
                        />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search bar */}
          <div className="w-full flex-1">
            <form>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Cari pegawai..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-800 border-gray-700 text-gray-200 rounded-lg placeholder:text-gray-500 focus:border-crimson-700 focus:ring-crimson-500/20 transition-all"
                />
              </div>
            </form>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 transition-colors">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <CircleUser className="h-5 w-5 text-gray-300" />
              )}
              <span className="sr-only">User menu</span>
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
                className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = "mailto:support@maitreyawira.sch.id")
                }
                className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer hover:bg-red-950/20 focus:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 bg-gray-950">{children}</main>
      </div>
    </div>
  );
}
