// src/app/dashboard/pengajuan-servis/page.tsx
"use client";

import { useState } from "react";
import { Wrench, ClipboardPenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/app/carfleet/context/DashboardContext";

export default function PengajuanServisPage() {
  const { kendaraan, setKendaraan } = useDashboard();
  const [selectedKendaraanId, setSelectedKendaraanId] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedKendaraanId) {
      alert("Pilih kendaraan terlebih dahulu!");
      return;
    }

    // Update status kendaraan yang dipilih menjadi "Servis"
    const updatedKendaraan = kendaraan.map((k) => 
      k.id === selectedKendaraanId ? { ...k, status: "Servis" } : k
    );
    
    setKendaraan(updatedKendaraan);
    
    // Reset Form
    e.currentTarget.reset();
    setSelectedKendaraanId("");
    
    alert("Permintaan servis berhasil dikirim! Status kendaraan di Master Data kini menjadi 'Servis'.");
  };

  // Filter hanya kendaraan yang tidak sedang diservis
  const kendaraanTersedia = kendaraan.filter((k) => k.status !== "Servis");

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <ClipboardPenLine size={20} className="text-slate-900" />
          <h2 className="text-lg font-extrabold text-slate-900">Form Permintaan Servis Bengkel</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kendaraan">Pilih Kendaraan yang Bermasalah</Label>
            {/* Menggunakan elemen select bawaan HTML tapi di-styling ala Shadcn */}
            <select 
              id="kendaraan"
              required
              value={selectedKendaraanId}
              onChange={(e) => setSelectedKendaraanId(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              <option value="" disabled>-- Pilih Kendaraan --</option>
              {kendaraanTersedia.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.plat}) - {item.status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Rencana Tanggal Masuk Bengkel</Label>
            <Input id="tanggal" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keluhan">Keluhan / Alasan Servis</Label>
            <Textarea 
              id="keluhan" 
              rows={4} 
              required 
              placeholder="Jelaskan kendala kendaraan (Misal: Rem blong, AC tidak dingin, Waktunya ganti oli...)" 
            />
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-bold text-white flex items-center gap-2">
            <Wrench size={18} /> Ajukan Servis
          </Button>
        </form>
      </Card>
    </div>
  );
}