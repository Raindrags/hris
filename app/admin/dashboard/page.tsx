import AdminDashboardView from "@/app/components/dashboard/admin-dashboard-view";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// ==========================================
// 1. KOMPONEN UTAMA (Render Instan)
// ==========================================
export default function DashboardPage() {
  return (
    // Suspense akan memunculkan 'fallback' (Skeleton) selama DashboardDataFetcher masih loading
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataFetcher />
    </Suspense>
  );
}

// ==========================================
// 2. SUB-KOMPONEN FETCHING DATA
// ==========================================
async function DashboardDataFetcher() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Jika tidak ada token, langsung arahkan ke login
  if (!token) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3434";

  try {
    const endpoint = `${backendUrl}/dashboard/admin`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Jangan gunakan cache agar data selalu real-time
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          `Akses ditolak. Token mungkin expired atau tidak valid.`,
        );
      }
      if (res.status === 404) {
        throw new Error(`Endpoint tidak ditemukan (404) di Backend!`);
      }
      throw new Error(`Backend mengembalikan status ${res.status}`);
    }

    // Parsing data JSON dari backend
    const data = await res.json();

    if (!data) {
      throw new Error("Data yang diterima dari backend kosong");
    }

    // Kembalikan komponen View yang sudah diisi data statisnya
    return (
      <AdminDashboardView
        user={data.user}
        totalEmployees={data.totalEmployees}
        divisions={data.divisions}
        totalDivisions={data.totalDivisions}
      />
    );
  } catch (error: unknown) {
    console.error("Gagal memuat data dashboard:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";

    // Tampilan darurat di layar jika terjadi error
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Terjadi Error!
          </h2>
          <div className="text-gray-300 text-sm mb-4">
            <p>Pesan Error:</p>
            <strong className="text-red-500 break-words">{errorMessage}</strong>
          </div>
          <p className="text-gray-400 text-xs">
            Sistem gagal memuat halaman dashboard utama.
          </p>
        </div>
      </main>
    );
  }
}

// ==========================================
// 3. SKELETON / LOADING STATE
// ==========================================
function DashboardSkeleton() {
  return (
    <div className="min-h-[80vh] bg-gray-950 flex flex-col items-center justify-center text-gray-400">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
      <p className="text-lg font-medium animate-pulse">
        Memuat Data Dashboard...
      </p>
    </div>
  );
}
