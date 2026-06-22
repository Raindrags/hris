"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const pathname = usePathname();
  
  // Simple mapping untuk judul halaman
  const titleMap: Record<string, string> = {
    "/dashboard": "Ringkasan General Affairs",
    "/dashboard/persetujuan": "Persetujuan Peminjaman",
    "/dashboard/pengembalian": "Validasi Pengembalian",
    "/dashboard/perawatan": "Servis & BBM",
    "/dashboard/master": "Master & Jadwal Rutin",
  };

  const pageTitle = titleMap[pathname] || "Dashboard GA";

  return (
    <header className="h-[72px] bg-white px-8 flex items-center justify-between border-b border-slate-200 sticky top-0 z-40">
      <h1 className="text-xl font-extrabold text-slate-900">{pageTitle}</h1>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">
          <Bell size={20} />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}