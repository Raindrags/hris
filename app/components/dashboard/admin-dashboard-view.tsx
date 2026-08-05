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
    localStorage.removeItem("adminUser");
    router.push("/login");
  };

  // Deteksi Super Admin (True jika role-nya mutlak "ADMIN")
  const isSuperAdmin = user?.role === "ADMIN";

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

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card Total Pegawai dinamis (Hanya jumlah pegawai div tersebut jika admin div) */}
          <StatCard
            title="Total Pegawai"
            value={totalEmployees}
            description={
              isSuperAdmin
                ? "Jumlah seluruh pegawai"
                : `Total pegawai ${user?.customDivName || ""}`
            }
            icon={Users}
          />
          <StatCard
            title={
              isSuperAdmin
                ? "Total Divisi"
                : `Kepala Sekolah ${user?.customDivName || ""}`
            }
            value={
              isSuperAdmin ? totalDivisions : user?.customHeadmaster || "-"
            }
            description={
              isSuperAdmin ? "Jumlah seluruh divisi" : "Pimpinan Divisi"
            }
            icon={Building2}
          />
        </div>

        {/* Mengoper prop isSuperAdmin ke LeaveHistoryTable */}
        <LeaveHistoryTable
          leaveHistory={leaveHistory}
          divisions={divisions}
          isSuperAdmin={isSuperAdmin}
        />
      </main>
    </div>
  );
}
