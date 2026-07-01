// src/components/FormValidasiPengembalian.tsx (Sesuaikan lokasi filenya)
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  kendaraan: string;
  // Tambahkan props ini untuk melempar data form ke halaman utama
  onSubmitData: (data: any) => void;
}

export function FormValidasiPengembalian({ isOpen, onClose, kendaraan, onSubmitData }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Ambil semua data dari form secara otomatis
    const formData = new FormData(e.currentTarget);
    const data = {
      km: formData.get("km"),
      etoll: formData.get("etoll"),
      bbm: formData.get("bbm"),
      isiBBM: formData.get("cbBBM") === "on",
      topUpEtoll: formData.get("cbEtoll") === "on",
      kondisi: formData.get("kondisi"),
    };

    // Kirim data ke halaman parent
    onSubmitData(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            Validasi Fisik Kendaraan ({kendaraan})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="km">Kilometer Akhir</Label>
              <Input name="km" id="km" type="number" required placeholder="Contoh: 45000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="etoll">Sisa Saldo e-Toll (Rp)</Label>
              <Input name="etoll" id="etoll" type="number" placeholder="Contoh: 150000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bbm">Indikator Sisa BBM (Manual)</Label>
            <Input name="bbm" id="bbm" required placeholder="Contoh: Setengah Tangki" />
          </div>

          <div className="p-4 bg-slate-100 rounded-xl space-y-3 border border-slate-200">
            <Label className="font-bold text-slate-800">Tindakan GA (Opsional):</Label>
            <div className="flex items-center space-x-2">
              <Checkbox name="cbBBM" id="cbBBM" />
              <label htmlFor="cbBBM" className="text-sm font-medium leading-none cursor-pointer">
                Saya mengisi BBM baru
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox name="cbEtoll" id="cbEtoll" />
              <label htmlFor="cbEtoll" className="text-sm font-medium leading-none cursor-pointer">
                Saya Top-up saldo e-Toll
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kondisi">Kondisi & Kerusakan</Label>
            <Textarea name="kondisi" id="kondisi" rows={3} required placeholder="Jelaskan jika ada lecet atau kerusakan baru..." />
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-bold">
            Simpan & Selesaikan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}