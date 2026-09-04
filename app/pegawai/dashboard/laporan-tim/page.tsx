"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LaporanTimView from "@/app/components/dashboard/laporan-team-view"; // Sesuaikan path jika perlu
import { getInitialTeamData } from "@/app/actions/team-report-action";

export default function LaporanTimPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<any[]>([]);
  const [subordinates, setSubordinates] = useState<any[]>([]);

  // 1. Tambahkan state untuk userName
  const [userName, setUserName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await getInitialTeamData();

        if (response.redirect) {
          router.push("/login");
          return;
        }

        if (!response.success) {
          throw new Error(response.error);
        }

        setPeriods(response.periods || []);
        setSubordinates(response.subordinates || []);

        // 2. Simpan userName dari response ke dalam state
        if (response.userName) {
          setUserName(response.userName);
        }

        // Bantuan debug: Cek apakah nama berhasil ditangkap dari backend
        console.log("Nama Atasan dari server:", response.userName);
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-300">Memuat data tim...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-red-900 text-white p-8 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2 text-red-500">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            Laporan Rekap Tim
          </h1>
          <p className="text-gray-400 mt-1">
            Lihat dan unduh laporan absensi bulanan untuk seluruh tim Anda.
          </p>
        </div>

        {/* 3. Teruskan userName ke LaporanTimView */}
        <LaporanTimView
          periods={periods}
          subordinates={subordinates}
          userName={userName}
        />
      </div>
    </main>
  );
}
