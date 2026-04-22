import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminReportData } from "@/app/actions/laporan-action";
import AdminLaporanView from "@/app/components/dashboard/admin-laporan-view";

export default async function LaporanPage() {
  const cookieStore = await cookies();

  // Sesuaikan dengan nama cookie di sistem login Anda
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return redirect("/login");
  }

  // Fetch data di server menggunakan token yang ditemukan
  const reportResponse = await getAdminReportData();
  const initialData = reportResponse.success ? reportResponse.data : null;

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

      <AdminLaporanView initialData={initialData} />
    </div>
  );
}
