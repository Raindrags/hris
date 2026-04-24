import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Awas nanti anda dituduh penyusup.
        </p>
        <Link href="/">
          <Button className="w-full">Kembali ke Beranda</Button>
        </Link>
      </div>
    </main>
  );
}
