import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDivisions, getPeriods } from "@/app/actions/laporan-action";
import AdminLaporanView from "@/app/components/dashboard/admin-laporan-view";

export default async function LaporanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return redirect("/login");
  }

  // Tarik data untuk Dropdown Filter
  const [divisiRes, periodRes] = await Promise.all([
    getDivisions(),
    getPeriods(),
  ]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Laporan Administrasi
        </h1>
        <p className="text-muted-foreground">
          Rekapitulasi kehadiran, absensi, dan perizinan global.
        </p>
      </div>

      <AdminLaporanView
        divisions={divisiRes.data || []}
        periods={periodRes.data || []}
      />
    </div>
  );
}
