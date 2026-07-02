// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, FileCheck2, KeyRound, Wrench, Car, ClipboardPenLine, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "../../context/DashboardContext";

export function Sidebar() {
  const pathname = usePathname();
  // Ambil state global untuk persetujuan dan pengembalian
  const { persetujuan, pengembalian } = useDashboard(); 

  // Pindahkan menuItems ke dalam komponen agar bisa membaca variabel state
  const menuItems = [
    { title: "Ringkasan GA", icon: LayoutDashboard, href: "/carfleet/admin/dashboard" },
    { 
      title: "Persetujuan", 
      icon: FileCheck2, 
      href: "/carfleet/admin/dashboard/persetujuan", 
      badge: persetujuan.length > 0 ? persetujuan.length : null // <-- Dinamis
    },
    { 
      title: "Validasi Kembali", 
      icon: KeyRound, 
      href: "/carfleet/admin/dashboard/pengembalian", 
      badge: pengembalian.length > 0 ? pengembalian.length : null, // <-- Dinamis
      badgeColor: "bg-emerald-500" 
    },
    { title: "Servis & BBM", icon: Wrench, href: "/carfleet/admin/dashboard/perawatan" },
    { title: "Riwayat Pemakaian", icon: ClipboardList, href: "/carfleet/admin/dashboard/history" },
    { title: "Pengajuan Servis", icon: ClipboardPenLine, href: "/carfleet/admin/dashboard/pengajuan-servis" },
    { title: "Master Data", icon: Car, href: "/carfleet/admin/dashboard/master" },
  ];

  return (
    <aside className="w-[260px] bg-slate-900 text-white fixed h-screen left-0 top-0 flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">SekolahApp</h1>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">General Affairs</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}>
                <Icon size={20} />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className={`ml-auto ${item.badgeColor || ''}`}>
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-sm">GA</div>
        <div>
          <h4 className="text-sm font-bold">Admin Sarpras</h4>
          <p className="text-xs text-slate-400">admin.ga@sekolah.sch.id</p>
        </div>
      </div>
    </aside>
  );
}