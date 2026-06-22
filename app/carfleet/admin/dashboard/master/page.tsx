"use client";

import { useState } from "react";
import { CalendarClock, Plus, CarFront, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockKendaraan } from "../../lib/mockdata";
import { FormTambahKendaraan } from "../modals/FormTambahKendaraan";
import { FormTambahJadwal } from "../modals/FormTambahJadwal";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";

// Import mock data dan form

export default function MasterPage() {
  // State untuk Kendaraan
 const { kendaraan: kendaraanList, setKendaraan: setKendaraanList } = useDashboard();
  const [isKendaraanOpen, setIsKendaraanOpen] = useState(false);

  // State untuk Jadwal
  const [isJadwalOpen, setIsJadwalOpen] = useState(false);

  // Handler submit kendaraan
  const handleKendaraanAdded = (newData: any) => {
    setKendaraanList([newData, ...kendaraanList]);
    alert(`${newData.nama} berhasil ditambahkan ke database kendaraan!`);
  };

  // Handler submit jadwal
  const handleJadwalAdded = () => {
    alert("Jadwal rutin berhasil ditambahkan ke dalam database!");
  };

  // Helper untuk warna badge status kendaraan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Tersedia":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 flex items-center gap-1"><CheckCircle2 size={12}/> Tersedia</Badge>;
      case "Servis":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 flex items-center gap-1"><Wrench size={12}/> Servis</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 flex items-center gap-1"><AlertCircle size={12}/> {status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: MASTER KENDARAAN */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CarFront size={20} className="text-slate-900" />
            Master Data Kendaraan
          </h2>
          <Button
            onClick={() => setIsKendaraanOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={16} /> Tambah Kendaraan
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Kendaraan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Plat Nomor</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Tipe & Kapasitas</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kendaraanList.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="px-6 py-4">
                  <strong className="block text-slate-900 font-bold text-[15px]">{item.nama}</strong>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="inline-block bg-slate-900 text-white font-bold tracking-widest px-3 py-1 rounded-md text-sm">
                    {item.plat}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <strong className="block text-slate-900 text-[14px]">{item.tipe}</strong>
                  <span className="text-slate-500 text-xs">{item.kapasitas}</span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getStatusBadge(item.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* SECTION 2: JADWAL RUTIN */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarClock size={20} className="text-slate-900" />
            Jadwal Pemakaian Rutin
          </h2>
          <Button
            onClick={() => setIsJadwalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus size={16} /> Tambah Jadwal
          </Button>
        </div>

        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center bg-white">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <CalendarClock size={32} className="text-slate-400" />
          </div>
          <p className="text-base font-medium text-slate-900">Belum ada jadwal yang ditampilkan.</p>
          <p className="text-sm mt-1">Daftar jadwal shuttle bus atau operasional rutin akan tampil di sini.</p>
        </div>
      </Card>

      {/* Panggil Modals */}
      <FormTambahKendaraan 
        isOpen={isKendaraanOpen} 
        onClose={() => setIsKendaraanOpen(false)} 
        onConfirm={handleKendaraanAdded}
      />
      
      <FormTambahJadwal 
        isOpen={isJadwalOpen} 
        onClose={() => setIsJadwalOpen(false)} 
        onConfirm={handleJadwalAdded}
      />
    </div>
  );
}