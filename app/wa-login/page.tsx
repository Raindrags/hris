"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const errorMessages: Record<string, string> = {
    missing_token: "Token tidak ditemukan dalam tautan.",
    BACKEND_API_URL_tidak_dikonfigurasi: "Sistem sedang dalam pemeliharaan.",
    Unauthorized:
      "Token tidak valid atau kadaluarsa. Silakan minta link baru melalui WhatsApp.",
    Token_tidak_valid_atau_kadaluarsa:
      "Token sudah tidak berlaku (mungkin lebih dari 5 menit). Silakan minta link baru.",
    session_expired:
      "Sesi Anda telah berakhir. Silakan login kembali melalui WhatsApp.",
    default: "Terjadi kesalahan saat masuk. Silakan coba lagi.",
  };

  const displayMessage =
    message ||
    (error
      ? errorMessages[error] || errorMessages.default
      : "Silakan login melalui WhatsApp untuk mengakses dashboard.");

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-xl">
            {error ? "Gagal Masuk" : "Selamat Datang"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {error
              ? "Terjadi masalah saat memverifikasi identitas Anda"
              : "Gunakan WhatsApp untuk masuk dengan aman"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {displayMessage}
          </p>

          <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="mb-1 font-semibold text-slate-300">
              Cara mendapatkan link login:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-left">
              <li>Kirim pesan WhatsApp ke nomor bot kami.</li>
              <li>Pilih menu &quot;Dashboard Pegawai&quot; (6).</li>
              <li>Masukkan NIY Anda.</li>
              <li>Klik link yang dikirimkan.</li>
            </ol>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-slate-300 text-lg">Memuat...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
