// app/admin/no-fp/page.tsx
"use client";

import { toast } from "sonner"; // Pastikan import library toast yang Bos gunakan (sonner/react-hot-toast)
import { useRouter } from "next/navigation";
import NoFpAdminForm from "./components/nofpadminform";

export default function AdminNoFpPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Menampilkan toast tambahan dari halaman ini
    toast.success("Halaman merespon: Data berhasil disimpan ke database!");

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Halaman */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Manajemen Kehadiran
          </h1>
          <p className="text-sm text-slate-400">
            Gunakan formulir di bawah ini untuk memasukkan data absensi secara
            manual.
          </p>
        </div>

        {/* Memanggil Komponen Form dan mengoper fungsi handleSuccess */}
        <NoFpAdminForm onSuccess={handleSuccess} />
      </div>
    </main>
  );
}
