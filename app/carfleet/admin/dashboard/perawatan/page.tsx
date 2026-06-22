"use client";

import { useState } from "react";
import { Wrench, Fuel, History, ArrowRight, Car, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";
import { mockRiwayat } from "../../lib/mockdata";
import { FormCatatServis } from "../modals/FormCatatServis";
import { FormCatatBBM } from "../modals/FormCatatBBM";

// Import data & context

export default function PerawatanPage() {
  const { kendaraan, setKendaraan } = useDashboard();
  const [riwayat, setRiwayat] = useState(mockRiwayat);
  
  // State untuk Modals
  const [isServisOpen, setIsServisOpen] = useState(false);
  const [isBBMOpen, setIsBBMOpen] = useState(false);
  
  // State untuk menyimpan data mobil yang dipilih dari tabel untuk diservis
  const [selectedKendaraan, setSelectedKendaraan] = useState<{id: string, nama: string, plat: string} | null>(null);

  // Ambil hanya kendaraan yang statusnya "Servis"
  const mobilSedangServis = kendaraan.filter((k) => k.status === "Servis");

  // Handler buka modal Servis dari tabel
  const handleBukaFormServis = (id: string, nama: string, plat: string) => {
    setSelectedKendaraan({ id, nama, plat });
    setIsServisOpen(true);
  };

  // Handler Buka modal Servis Manual (Card atas)
  const handleBukaFormServisManual = () => {
    setSelectedKendaraan(null); // Kosongkan agar bisa diinput manual
    setIsServisOpen(true);
  };

  // Handler saat form disubmit (baik Servis maupun BBM)
  const handleAddRiwayat = (newData: any, kendaraanId?: string) => {
    setRiwayat([newData, ...riwayat]); // Tambahkan ke tabel riwayat
    
    // Jika ada kendaraanId, berarti mobil selesai servis, ubah statusnya kembali Tersedia
    if (kendaraanId) {
      setKendaraan(kendaraan.map((k) => 
        k.id === kendaraanId ? { ...k, status: "Tersedia" } : k
      ));
      alert(`Servis Selesai! Riwayat ditambahkan dan status mobil kembali menjadi "Tersedia".`);
    } else {
      alert(`Data ${newData.tipe} berhasil ditambahkan secara manual!`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CARDS PENCATATAN MANUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card onClick={handleBukaFormServisManual} className="p-6 border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer flex items-center gap-4 rounded-2xl group">
          <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center shrink-0 bg-red-100 text-red-700">
            <Wrench size={28} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Input Servis Bengkel Luar</p>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 group-hover:text-red-700 transition-colors">Catat Manual <ArrowRight size={18} /></h3>
          </div>
        </Card>

        <Card onClick={() => setIsBBMOpen(true)} className="p-6 border-slate-200 shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer flex items-center gap-4 rounded-2xl group">
          <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
            <Fuel size={28} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Catat Pengisian BBM</p>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">Input Struk <ArrowRight size={18} /></h3>
          </div>
        </Card>
      </div>

      {/* 2. TABEL MOBIL SEDANG SERVIS (BARU) */}
      <Card className="border-red-200 shadow-sm rounded-2xl overflow-hidden border-2">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-red-700 flex items-center gap-2">
            <Car size={20} className="text-red-700" />
            Daftar Mobil Sedang Dalam Perbaikan
          </h2>
          <Badge className="bg-red-600 hover:bg-red-600 text-white border-0">{mobilSedangServis.length} Unit</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Kendaraan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Plat Nomor</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mobilSedangServis.length > 0 ? (
              mobilSedangServis.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-4">
                    <strong className="block text-slate-900 font-bold text-[15px]">{item.nama}</strong>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="inline-block bg-slate-900 text-white font-bold tracking-widest px-3 py-1 rounded-md text-sm">{item.plat}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 flex items-center gap-1 w-fit"><Wrench size={12}/> Masuk Bengkel</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button 
                      onClick={() => handleBukaFormServis(item.id, item.nama, item.plat)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 ml-auto"
                    >
                      <CheckCircle size={16} /> Selesai & Catat
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500 font-medium">
                  Yeay! Tidak ada mobil yang sedang rusak di bengkel saat ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 3. TABEL RIWAYAT (YANG SUDAH ADA SEBELUMNYA) */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <History size={20} className="text-slate-900" />
            Riwayat Servis & BBM
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Kendaraan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Jenis</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Tanggal & KM</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Total Biaya</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riwayat.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="px-6 py-5">
                  <strong className="block text-slate-900 font-bold text-[15px]">{item.kendaraan}</strong>
                  <span className="text-slate-500 text-xs">{item.plat}</span>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Badge variant="outline" className={`px-3 py-1 font-bold text-xs uppercase tracking-wide border-transparent flex items-center gap-1 w-fit ${item.tipe === "BBM" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {item.tipe === "BBM" ? <Fuel size={12} /> : <Wrench size={12} />}
                    {item.jenis}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <strong className="block text-slate-900 text-[14px]">{item.tanggal}</strong>
                  <span className="text-slate-500 text-xs">KM: {item.km}</span>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <strong className="text-slate-900 text-[15px]">{item.biaya}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Panggil Modals */}
      <FormCatatServis 
        isOpen={isServisOpen} 
        onClose={() => setIsServisOpen(false)} 
        onConfirm={handleAddRiwayat}
        kendaraanInfo={selectedKendaraan} // Oper data jika dibuka dari tabel "Mobil Sedang Servis"
      />
      <FormCatatBBM isOpen={isBBMOpen} onClose={() => setIsBBMOpen(false)} onConfirm={handleAddRiwayat} />
    </div>
  );
}