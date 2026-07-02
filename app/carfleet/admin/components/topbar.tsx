"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "../../lib/utils/api";

export function Topbar() {
  const pathname = usePathname();
  
  // State & Ref untuk Dropdown Lonceng
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Simple mapping untuk judul halaman
  const titleMap: Record<string, string> = {
    "/dashboard": "Ringkasan General Affairs",
    "/dashboard/persetujuan": "Persetujuan Peminjaman",
    "/dashboard/pengembalian": "Validasi Pengembalian",
    "/dashboard/perawatan": "Servis & BBM",
    "/dashboard/master": "Master & Jadwal Rutin",
    "/dashboard/history": "Riwayat Pemakaian", // Tambahan untuk halaman baru
  };

  const pageTitle = titleMap[pathname] || "Dashboard GA";

  // Klik di luar untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const handleLogout = async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Gagal memberitahu server tentang logout", error);
  } finally {
    // Paling krusial: Hapus token dari aplikasi
    localStorage.removeItem("access_token");
    // atau hapus cookies jika pakai cookies
    window.location.href = "/login";
  }
};

  return (
    <header className="h-[72px] bg-white px-8 flex items-center justify-between border-b border-slate-200 sticky top-0 z-40">
      <h1 className="text-xl font-extrabold text-slate-900">{pageTitle}</h1>
      
      <div className="flex items-center gap-4">
        
        {/* WRAPPER DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          {/* TOMBOL LONCENG */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
          >
            <Bell size={20} />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white">
              3
            </Badge>
          </Button>

          {/* MENU DROPDOWN (Nama Akun & Logout) */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-md shadow-lg border border-slate-200 z-50">
              
              {/* Info Akun */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-md">
                <p className="text-xs text-slate-500 mb-1">Masuk sebagai</p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  Admin General Affairs
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md flex items-center transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar Akun
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}