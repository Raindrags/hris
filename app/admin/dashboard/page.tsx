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

  // URL backend
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3434";

  try {
    // PERBAIKAN: Menghapus awalan "/api" karena NestJS Anda sepertinya tidak memakainya.
    // Sesuaikan "/dashboard/admin" dengan @Controller() di NestJS Anda!
    const endpoint = `${backendUrl}/dashboard/admin`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Jangan gunakan cache agar data selalu baru
    });

    // ==========================================
    // AREA DEBUGGING KE BACKEND
    // ==========================================
    console.log("=== DEBUGGING KE BACKEND ===");
    console.log("Mencoba fetch ke URL:", endpoint);
    console.log("Token yang dikirim:", token);
    console.log("Status HTTP dari Backend:", res.status);

    if (!res.ok) {
      const errBody = await res.text();
      console.log("Pesan Error dari Backend:", errBody);

      // Jika status 401 atau 403, lempar error masalah token
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          `Akses ditolak (Status: ${res.status}). Token mungkin expired atau tidak valid.`,
        );
      }

      // Jika status 404, artinya controller NestJS untuk alamat ini tidak ada
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
  } catch (error: any) {
    console.error("Gagal memuat data dashboard:", error);

    // Tampilan darurat di layar jika terjadi error
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Terjadi Error!
          </h2>
          <div className="text-gray-700 text-sm mb-4">
            <p>Pesan Error:</p>
            <strong className="text-red-500 break-words">
              {error.message}
            </strong>
          </div>
          <p className="text-gray-700 text-xs">
            Sistem gagal memuat halaman. Silakan buka{" "}
            <strong>Terminal VSCode / CMD</strong> untuk melihat log lengkapnya.
          </p>
        </div>
      </main>
    );
  }
}
