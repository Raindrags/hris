"use client";

import { useState } from "react";
import { FileCheck2, MapPin, CarFront, Check, X, Inbox } from "lucide-react";
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
import { mockPersetujuan } from "../../lib/mockdata";
import { FormTolakPeminjaman } from "../modals/FormTolakPeminjaman";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";

export default function PersetujuanPage() {
  const { persetujuan: requests, setPersetujuan: setRequests } = useDashboard();
  
  // State untuk Modal Tolak
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{id: string, pemohon: string} | null>(null);

  // Aksi Setuju Langsung
  const handleApprove = (id: string) => {
    setRequests(requests.filter((req) => req.id !== id));
    alert("Peminjaman disetujui! Notifikasi WhatsApp terkirim."); 
  };

  // Aksi Buka Modal Tolak
  const openRejectModal = (id: string, pemohon: string) => {
    setSelectedRequest({ id, pemohon });
    setIsRejectOpen(true);
  };

  // Aksi Submit dari dalam Modal Tolak
  const handleRejectConfirm = (alasan: string) => {
    if (selectedRequest) {
      setRequests(requests.filter((req) => req.id !== selectedRequest.id));
      alert(`Peminjaman ditolak. Alasan: ${alasan}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck2 size={20} className="text-slate-900" />
            Daftar Permohonan Baru
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Pemohon & Tujuan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Kendaraan</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6">Jadwal</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-4 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.pemohon.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold text-[15px]">{item.pemohon}</strong>
                        <span className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                          <MapPin size={12} /> {item.tujuan}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-slate-800 border border-slate-200">
                      <CarFront size={14} /> {item.kendaraan}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <strong className="block text-slate-900 text-[14px]">{item.tanggal}</strong>
                    <span className="text-slate-500 text-xs">{item.waktu}</span>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleApprove(item.id)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5">
                        <Check size={16} /> Setuju
                      </Button>
                      <Button onClick={() => openRejectModal(item.id, item.pemohon)} variant="destructive" className="bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-700 font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 border-0 shadow-none">
                        <X size={16} /> Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={32} className="opacity-50 mb-2" />
                    <p>Tidak ada pengajuan yang menunggu persetujuan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Panggil Modal Disini */}
      <FormTolakPeminjaman 
        isOpen={isRejectOpen} 
        onClose={() => setIsRejectOpen(false)} 
        pemohon={selectedRequest?.pemohon || ""}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}