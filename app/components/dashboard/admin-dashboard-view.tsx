"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Building2 } from "lucide-react";
import { StatCard } from "@/app/admin/dashboard/components/StatCard";
import { LeaveHistoryTable } from "@/app/admin/dashboard/components/LeaveHistoryTable";

export default function AdminDashboardView({
  leaveHistory,
  user,
  totalEmployees,
  divisions,
  totalDivisions,
}: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="gap-2 bg-red-600 text-white"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </Button>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">
            Selamat datang kembali, {user?.name || "Admin"}
          </p>
        </div>

        {/* Panggil StatCard berulang kali dengan Props berbeda */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Total Pegawai"
            value={totalEmployees}
            description="Jumlah seluruh pegawai"
            icon={Users}
          />
          <StatCard
            title="Total Divisi"
            value={totalDivisions}
            description="Jumlah seluruh divisi"
            icon={Building2}
          />
        </div>

        {/* Komponen Tabel yang sangat bersih */}
        <LeaveHistoryTable leaveHistory={leaveHistory} divisions={divisions} />
      </main>
    </div>
  );
}
