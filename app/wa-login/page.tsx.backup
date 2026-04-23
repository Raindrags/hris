"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyToken } from "@/lib/api-client";

// Komponen yang menggunakan useSearchParams
function WaLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan.");
      return;
    }

    const doVerify = async () => {
      try {
        const user = await verifyToken(token);
        localStorage.setItem("user", JSON.stringify(user));
        router.replace("/dashboard");
      } catch (err: any) {
        setError(err.message || "Token tidak valid.");
      }
    };

    doVerify();
  }, [token, router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-400 mb-2">Gagal Login</h1>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-slate-300 text-lg">Memverifikasi token...</div>
    </main>
  );
}

// Halaman utama dengan Suspense
export default function WaLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-slate-300 text-lg">Memuat...</div>
        </main>
      }
    >
      <WaLoginContent />
    </Suspense>
  );
}
