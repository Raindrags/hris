import { Bell } from "lucide-react";

export function GaTopbar({ activeTab }: { activeTab: string }) {
  const pageTitles: Record<string, string> = {
    dashboard: "Ringkasan GA",
    persetujuan: "Persetujuan Peminjaman",
    pengembalian: "Validasi Pengembalian",
    perawatan: "Servis & BBM",
    master: "Master & Jadwal Rutin",
  };

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-xl font-extrabold text-slate-800">
        {pageTitles[activeTab] || "Dashboard"}
      </h2>
      <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 relative transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-0 right-0 bg-red-500 border-2 border-white text-white w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center">
          3
        </span>
      </button>
    </header>
  );
}
