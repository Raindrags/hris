"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LeaveForm } from "@/app/components/forms/cuti-form";

// Komponen terpisah yang menggunakan useSearchParams
function FormCutiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ sisaCuti: number } | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan minta link baru dari WhatsApp.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/auth/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Token tidak valid atau kadaluarsa.");
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        setUserData({
          sisaCuti: data.user.sisaCuti ?? 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 text-center">
          <p className="text-slate-300">Memverifikasi token...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Gagal Login</h1>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Form Pengajuan Cuti
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Harap isi form di bawah ini dengan lengkap.
        </p>

        <LeaveForm
          user={{ sisaCuti: userData?.sisaCuti ?? 0 }}
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}

// Komponen utama halaman yang membungkus Content dengan Suspense
export default function FormCutiPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 text-center">
            <p className="text-slate-300">Memuat halaman...</p>
          </div>
        </main>
      }
    >
      <FormCutiContent />
    </Suspense>
  );
}
