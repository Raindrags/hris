"use client";

import { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPengembalian } from "../../lib/mockdata";
import { FormValidasiPengembalian } from "../modals/FormValidasiPengembalian";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";

export default function PengembalianPage() {
  const { pengembalian: returns, setPengembalian: setReturns } = useDashboard();
  
  // State untuk Modal Validasi
  const [isValidasiOpen, setIsValidasiOpen] = useState(false);
  const [selectedKendaraan, setSelectedKendaraan] = useState<{id: string, nama: string} | null>(null);

  // Buka Modal
  const openValidasiModal = (id: string, namaKendaraan: string) => {
    setSelectedKendaraan({ id, nama: namaKendaraan });
    setIsValidasiOpen(true);
  };

  // Submit Modal
  const handleValidasiConfirm = () => {
    if (selectedKendaraan) {
      setReturns(returns.filter((ret) => ret.id !== selectedKendaraan.id));
      alert(`Validasi untuk ${selectedKendaraan.nama} berhasil disimpan! Mobil siap digunakan kembali.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <KeyRound size={20} className="text-slate-900" />
            Validasi Pengembalian Kunci & Kendaraan
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Kendaraan / Unit</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Peminjam</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Waktu Kembali</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.length > 0 ? (
              returns.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-5">
                    <strong className="block text-slate-900 font-bold text-[15px]">{item.kendaraan}</strong>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-slate-700 font-medium">{item.peminjam}</TableCell>
                  <TableCell className="px-6 py-5 text-slate-600 text-sm">{item.waktuKembali}</TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge variant="outline" className="px-3 py-1 font-bold text-xs uppercase tracking-wide border-transparent bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                      <CheckCircle2 size={12} /> {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Button onClick={() => openValidasiModal(item.id, item.kendaraan)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 ml-auto">
                      <ShieldAlert size={16} /> Validasi Fisik
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={32} className="opacity-50 mb-2" />
                    <p>Semua kendaraan telah divalidasi dan aman di garasi.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <FormValidasiPengembalian 
        isOpen={isValidasiOpen}
        onClose={() => setIsValidasiOpen(false)}
        kendaraan={selectedKendaraan?.nama || ""}
        onConfirm={handleValidasiConfirm}
      />
    </div>
  );
}