import { Metadata } from "next";
import GaDashboardView from "./Components/Ga/GaDashboardView";

// Anda bisa menambahkan metadata khusus untuk SEO / Judul Tab Browser
export const metadata: Metadata = {
  title: "Dashboard General Affairs | SekolahApp",
  description: "Panel manajemen peminjaman dan perawatan kendaraan sekolah",
};

export default async function GaDashboardPage() {
  return <GaDashboardView />;
}
