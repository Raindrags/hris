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
  CalendarRange,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "./components/UserMenu";
import { SidebarNav } from "./components/SidebarNav";

// 1. Definisikan array role apa saja yang diizinkan untuk melihat menu tertentu
const allNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    allowedRoles: ["ADMIN", "ADMIN_SD", "ADMIN_SMP", "ADMIN_SMA"],
  },
  {
    title: "Pegawai",
    href: "/admin/dashboard/pegawai",
    icon: Users,
    allowedRoles: ["ADMIN"], // Hanya Super Admin
  },
  {
    title: "Absensi",
    href: "/admin/dashboard/absensi",
    icon: CalendarDays,
    allowedRoles: ["ADMIN"], // Hanya Super Admin
  },
  {
    title: "Periode",
    href: "/admin/dashboard/period",
    icon: CalendarRange,
    allowedRoles: ["ADMIN"], // Hanya Super Admin
  },
  {
    title: "Form Cuti",
    href: "/admin/dashboard/form-cuti",
    icon: FileText,
    allowedRoles: ["ADMIN", "ADMIN_SD", "ADMIN_SMP", "ADMIN_SMA"],
  },
  {
    title: "Form Izin",
    href: "/admin/dashboard/form-izin",
    icon: FileText,
    allowedRoles: ["ADMIN", "ADMIN_SD", "ADMIN_SMP", "ADMIN_SMA"],
  },
  {
    title: "Jadwal",
    href: "/admin/dashboard/jadwal",
    icon: CalendarDays,
    allowedRoles: ["ADMIN"], // Hanya Super Admin
  },
  {
    title: "Laporan",
    href: "/admin/dashboard/laporan",
    icon: LineChart,
    allowedRoles: ["ADMIN", "ADMIN_SD", "ADMIN_SMP", "ADMIN_SMA"],
  },
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
    role?: string;
  } | null>(null);

  useEffect(() => {
    // TODO: Idealnya ini memanggil endpoint backend (misal /api/auth/me)
    // atau mengambil data dari localStorage/decode cookie yang berisi `role` asli
    setUser({
      name: "Admin Sekolah",
      email: "admin@maitreyawira.sch.id",
      role: "ADMIN", // Contoh: ubah ini jadi "ADMIN_SD" untuk mencoba test hide menu
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // 2. Filter menu berdasarkan role yang dimiliki oleh user
  const filteredNavItems = allNavItems.filter((item) => {
    if (!user || !user.role) return false;
    return item.allowedRoles.includes(user.role);
  });

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

        {/* 3. Gunakan filteredNavItems */}
        <SidebarNav items={filteredNavItems} />
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
              {/* 4. Gunakan filteredNavItems untuk versi Mobile */}
              <SidebarNav items={filteredNavItems} isMobile />
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
