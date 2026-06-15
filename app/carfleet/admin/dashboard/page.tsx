import { Metadata } from "next";
import GaDashboardView from "./Components/Ga/GaDashboardView";

// Anda bisa menambahkan metadata khusus untuk SEO / Judul Tab Browser
export const metadata: Metadata = {
  title: "Dashboard General Affairs | SekolahApp",
  description: "Panel manajemen peminjaman dan perawatan kendaraan sekolah",
};

export default async function GaDashboardPage() {
  /* ========================================================
    OPSIONAL: LOGIKA SERVER-SIDE (BACKEND) BISA DITARUH DI SINI
    ========================================================
    Jika Anda menggunakan autentikasi (seperti NextAuth atau JWT cookie),
    Anda bisa mengecek sesi user di sini sebelum me-render halaman.
    
    Contoh:
    const session = await getServerSession();
    if (!session || session.user.role !== "GA") {
      redirect("/login");
    }
  */

  return <GaDashboardView />;
}
