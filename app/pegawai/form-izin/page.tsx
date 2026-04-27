"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PermissionForm from "@/app/components/forms/izin-form";

function FormIzinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name: string;
    divisi?: { name: string } | null;
  } | null>(null);

  useEffect(() => {
    if (token) {
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
            name: data.user.name,
            divisi: data.user.divisi || null,
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      verifyToken();
      return;
    }

    // Mode akses langsung (sudah login via cookie)
    const checkAuth = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.status === 401) {
          setError("Anda belum login. Silakan login via WhatsApp.");
          setLoading(false);
          return;
        }
        const meData = await meRes.json();
        setUserData({
          name: meData.user?.name,
          divisi: meData.user?.divisi || null,
        });
      } catch (err: any) {
        setError("Gagal memeriksa sesi.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, router]);

  const handleSuccess = () => {
    router.push("/pegawai/dashboard");
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
            onClick={() => router.push("/pegawai/dashboard")}
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
          Form Pengajuan Izin
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Pengajuan izin harian, terlambat, atau pulang awal.
        </p>

        {userData && (
          <PermissionForm user={userData as any} onSuccess={handleSuccess} />
        )}
      </div>
    </main>
  );
}

export default function FormIzinPage() {
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
      <FormIzinContent />
    </Suspense>
  );
}
