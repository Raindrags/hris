import AdminDashboardView from "@/app/components/dashboard/admin-dashboard-view";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Ambil token dari cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Jika tidak ada token, langsung arahkan ke login
  if (!token) {
    console.log("DEBUG: Token tidak ditemukan di cookies. Redirect ke /login");
    redirect("/login");
  }

  // URL backend - Pastikan diatur di Vercel Environment Variables!
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3434";

  try {
    const endpoint = `${backendUrl}/dashboard/admin`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Mencegah caching agar data selalu segar (Dynamic Rendering)
    });

    // ==========================================
    // AREA DEBUGGING KE BACKEND
    // ==========================================
    console.log("=== DEBUGGING KE BACKEND ===");
    console.log("Mencoba fetch ke URL:", endpoint);
    console.log("Status HTTP dari Backend:", res.status);

    if (!res.ok) {
      const errBody = await res.text();
      console.log("Pesan Error dari Backend:", errBody);

      if (res.status === 401 || res.status === 403) {
        throw new Error(
          `Akses ditolak (Status: ${res.status}). Token mungkin expired atau tidak valid.`,
        );
      }

      if (res.status === 404) {
        throw new Error(
          `Endpoint tidak ditemukan (404) di Backend! Pastikan alamat URL di NestJS benar-benar "${endpoint}".`,
        );
      }

      throw new Error(`Backend mengembalikan status ${res.status}`);
    }
    console.log("============================");

    // Parsing data JSON dari backend
    const data = await res.json();

    if (!data) {
      throw new Error("Data yang diterima dari backend kosong");
    }

    // Tampilkan komponen UI dengan data dari backend
    return (
      <AdminDashboardView
        user={data.user}
        totalEmployees={data.totalEmployees}
        divisions={data.divisions}
        totalDivisions={data.totalDivisions}
        leaveHistory={data.leaveHistory}
      />
    );
  } catch (error: unknown) {
    // PERBAIKAN 1: Mengubah 'error: any' menjadi 'error: unknown' agar lolos TypeScript Vercel
    console.error("Gagal memuat data dashboard:", error);

    // PERBAIKAN 2: Ekstraksi pesan error yang aman untuk Strict Mode
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";

    // Tampilan darurat di layar jika terjadi error
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Terjadi Error!
          </h2>
          <div className="text-gray-700 text-sm mb-4">
            <p>Pesan Error:</p>
            <strong className="text-red-500 break-words">{errorMessage}</strong>
          </div>
          <p className="text-gray-700 text-xs">
            Sistem gagal memuat halaman. Silakan periksa log server di dashboard
            Vercel.
          </p>
        </div>
      </main>
    );
  }
}
