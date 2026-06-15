import {
  LayoutDashboard,
  FileCheck2,
  KeyRound,
  Wrench,
  Car,
  ShieldCheck,
} from "lucide-react";

interface GaSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  returnCount: number;
}

export function GaSidebar({
  activeTab,
  setActiveTab,
  pendingCount,
  returnCount,
}: GaSidebarProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Ringkasan GA" },
    {
      id: "persetujuan",
      icon: FileCheck2,
      label: "Persetujuan",
      badge: pendingCount,
      badgeColor: "bg-red-500",
    },
    {
      id: "pengembalian",
      icon: KeyRound,
      label: "Validasi Kembali",
      badge: returnCount,
      badgeColor: "bg-emerald-500",
    },
    { id: "perawatan", icon: Wrench, label: "Servis & BBM" },
    { id: "master", icon: Car, label: "Master & Jadwal Rutin" },
  ];

  return (
    <aside className="w-[260px] bg-slate-900 text-white flex flex-col fixed h-screen shadow-xl z-20">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SekolahApp</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
            General Affairs
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {item.badge ? (
              <span
                className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${item.badgeColor} text-white`}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-sm">
            GA
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Admin Sarpras</span>
            <span className="text-xs text-slate-400">admin.ga@sekolah.id</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
