"use client";

import React, { useState } from "react";
import { User, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // (BLOK SIMULASI CANVAS BISA ANDA HAPUS ATAU BIARKAN JIKA MASIH PERLU)

      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email/Username atau password salah");
      }

      // ✨ MODIFIKASI DIMULAI DI SINI ✨

      // 1. Simpan data user ke localStorage (atau state management seperti Zustand/Redux)
      // agar komponen Dashboard tahu siapa yang sedang login (karena kita tidak pakai JWT lagi).
      if (typeof window !== "undefined") {
         localStorage.setItem("adminUser", JSON.stringify(data.user));
      }

      // 2. Baca role dari respons API
      const userRole = data.user?.role;

      // 3. Arahkan ke dashboard berdasarkan role
      if (userRole === "ADMIN_GA") {
        router.push("/admin/ga-dashboard"); // Arahkan ke Dashboard GA (Carfleet)
      } else if (userRole === "ADMIN_HRIS") {
        router.push("/admin/hris-dashboard"); // Arahkan ke Dashboard HRIS Utama
      } else {
        // Jika role tidak dikenali atau ini admin super (opsional)
        router.push("/admin/dashboard"); 
      }
      
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 relative overflow-hidden p-4 sm:p-6 font-sans">
      {/* Decorative Ambient Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-600/15 blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500 ease-out">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="bg-slate-900/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner mb-4 relative overflow-hidden group">
              {/* Efek shine (kilauan) pada icon */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <ShieldCheck className="h-8 w-8 text-rose-400" />
            </div>
            <CardTitle className="text-white">
              Sistem Pegawai{" "}
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent block mt-1 sm:inline sm:mt-0">
                (Admin)
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Masuk dengan kredensial administrator Anda untuk mengakses
              *dashboard*.
            </CardDescription>
          </CardHeader>

          <CardContent className="bg-slate-900/80">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Alert Error Modern */}
              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-sm flex items-start gap-3 backdrop-blur-sm">
                    <span className="text-lg leading-none shrink-0">•</span>
                    <p className="pt-[2px]">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-slate-300">
                  Email atau Username
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none transition-colors duration-200 group-focus-within:text-rose-400 text-slate-500">
                    <User className="h-[18px] w-[18px]" />
                  </div>
                  <Input
                    id="identifier"
                    placeholder="admin@sekolah.id"
                    className="pl-12 bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    value={identifier}
                    onChange={(e: any) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">
                    Kata Sandi
                  </Label>
                  <a
                    href="#"
                    className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none transition-colors duration-200 group-focus-within:text-rose-400 text-slate-500">
                    <Lock className="h-[18px] w-[18px]" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 font-medium tracking-widest placeholder:tracking-normal placeholder:font-normal bg-slate-950/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memverifikasi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Masuk ke Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Definisi keyframes untuk animasi tambahan */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
