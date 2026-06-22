// src/app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { FileClock, KeyRound, Activity, BusFront, Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "../../context/DashboardContext";
import { mockAktivitas } from "../lib/mockdata";

export default function DashboardPage() {
  // Ambil state global dari Context
  const { persetujuan, pengembalian } = useDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card Menunggu Persetujuan */}
        <Link href="/carfleet/admin/dashboard/persetujuan">
          <Card className="p-6 border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer flex items-center gap-4 rounded-2xl">
            <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
              <FileClock size={28} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Menunggu Persetujuan
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {persetujuan.length} Pengajuan {/* <-- Angka Dinamis */}
              </h3>
            </div>
          </Card>
        </Link>

        {/* Card Menunggu Validasi Kembali */}
        <Link href="/carfleet/admin/dashboard/pengembalian">
          <Card className="p-6 border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer flex items-center gap-4 rounded-2xl">
            <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
              <KeyRound size={28} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Menunggu Validasi (Kembali)
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {pengembalian.length} Unit {/* <-- Angka Dinamis */}
              </h3>
            </div>
          </Card>
        </Link>
      </div>

      {/* Tabel Aktivitas & Jadwal (Tetap Statis Sementara) */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Activity size={20} className="text-slate-900" />
            Aktivitas & Jadwal Terdekat
          </h2>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">
                Agenda / Pengguna
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">
                Kendaraan
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">
                Jadwal
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAktivitas.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {item.tipeKendaraan === "bus" ? (
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <BusFront size={18} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.pengguna.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <strong className="block text-slate-900 font-bold text-[15px]">
                        {item.pengguna}
                      </strong>
                      <span className="text-slate-500 text-xs">
                        {item.tipeKendaraan === "bus" ? "Rute: " : ""}
                        {item.rute}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-slate-800 border border-slate-200">
                    <Car size={14} />
                    {item.kendaraan}
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <strong className="block text-slate-900 text-[14px]">
                    {item.jadwal}
                  </strong>
                  <span className="text-slate-500 text-xs">{item.waktu}</span>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 font-bold text-xs uppercase tracking-wide border-transparent ${
                      item.status === "Jadwal Rutin"
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}