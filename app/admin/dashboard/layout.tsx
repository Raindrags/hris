"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  LineChart,
  Menu,
  Package2,
  Search,
  Users,
  CalendarDays,
  FileText,
  CircleUser,
  CalendarRange,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "./components/UserMenu";
import { SidebarNav } from "./components/SidebarNav";

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Home },
  { title: "Pegawai", href: "/admin/dashboard/pegawai", icon: Users },
  { title: "Absensi", href: "/admin/dashboard/absensi", icon: CalendarDays },
  { title: "Periode", href: "/admin/dashboard/periods", icon: CalendarRange },
  { title: "Form Cuti", href: "/admin/dashboard/form-cuti", icon: FileText },
  { title: "Form Izin", href: "/admin/dashboard/form-izin", icon: FileText },
  { title: "Jadwal", href: "/admin/dashboard/jadwal", icon: CalendarDays },
  { title: "Laporan", href: "/admin/dashboard/laporan", icon: LineChart },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    setUser({ name: "Admin Sekolah", email: "admin@maitreyawira.sch.id" });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-gray-950 text-gray-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col border-r border-gray-800 bg-gray-900/80 backdrop-blur-sm print:hidden">
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson-900/40 text-crimson-400">
            <Package2 />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              HRIS MAITREYAWIRA
            </span>
          </div>
        </div>

        {/* Menggunakan Komponen Reusable */}
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900/90 px-4 md:px-6 print:hidden">
          {/* SIDEBAR MOBILE */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-gray-900 border-gray-800 p-0 w-72"
            >
              {/* Menggunakan Komponen Reusable yang SAMA! */}
              <SidebarNav items={navItems} isMobile />
            </SheetContent>
          </Sheet>

          {/* SEARCH BAR */}
          <div className="w-full flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Cari pegawai..."
                className="w-full pl-9 py-2 bg-gray-800 border-gray-700 text-gray-200 rounded-lg"
              />
            </div>
          </div>

          {/* USER MENU */}
          <UserMenu user={user} onLogout={handleLogout} />
        </header>

        <main className="flex-1 bg-gray-950">{children}</main>
      </div>
    </div>
  );
}
