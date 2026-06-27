"use client";

import { Suspense } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { LeaveForm } from "@/app/components/forms/cuti-form";
import { usePegawaiAuth } from "@/app/form-cuti/hooks/usePegawaiAuth";

function FormCutiContent() {
  const { loading, error, userData, handleSuccess, handleBack } =
    usePegawaiAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 z-10">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        <p className="text-slate-400 font-medium animate-pulse">
          Memverifikasi identitas Anda...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-red-900/50 shadow-2xl rounded-3xl w-full max-w-md z-10">
        <CardContent className="pt-8 px-6 pb-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-red-400">Autentikasi Gagal</h1>
          <p className="text-sm text-slate-400">{error}</p>
          <Button
            onClick={handleBack}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
          >
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 rounded-3xl overflow-visible">
        <CardHeader className="space-y-3 pb-8 border-b border-slate-700/50 bg-slate-800/30 px-6 sm:px-8 pt-8 rounded-t-3xl">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-indigo-400" />
            Pengajuan Cuti Saya
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Harap isi formulir di bawah ini dengan lengkap untuk mengajukan cuti
            Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 px-6 sm:px-8 pb-8">
          {/* Komponen LeaveForm murni hanya menerima props */}
          <LeaveForm
            user={{ sisaCuti: userData?.sisaCuti ?? 0 }}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function FormCutiPage() {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 text-slate-100 font-sans">
      {/* Decorative Ambient Backgrounds */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Boundary Suspense untuk Next.js useSearchParams */}
      <Suspense
        fallback={
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full z-10"></div>
        }
      >
        <FormCutiContent />
      </Suspense>
    </main>
  );
}
