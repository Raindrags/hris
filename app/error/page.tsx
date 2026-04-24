"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "unknown";
  const router = useRouter();

  const messages: Record<string, { title: string; description: string }> = {
    expired: {
      title: "Link Sudah Kadaluarsa",
      description:
        "Link sudah kadaluarsa, mohon untuk ajukan ke Maitreyawira Bot.",
    },
    "500": {
      title: "Kesalahan Server",
      description: "Terjadi kesalahan terhadap server, sabar ya.",
    },
    "401": {
      title: "Tidak Terotorisasi",
      description: "Ayooo anda mau bobol sistem ini ya?",
    },
    "404": {
      title: "Halaman Tidak Ditemukan",
      description: "Awas nanti anda dituduh penyusup.",
    },
  };

  const { title, description } = messages[code] || {
    title: "Terjadi Kesalahan",
    description: "Silakan coba lagi nanti.",
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">{title}</h1>
        <p className="text-sm text-slate-400 mb-6">{description}</p>
        <Button onClick={() => router.push("/")} className="w-full">
          Kembali ke Beranda
        </Button>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
          Memuat...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
