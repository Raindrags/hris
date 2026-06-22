"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any, kendaraanId?: string) => void; 
  kendaraanInfo?: { id: string; nama: string; plat: string } | null; 
}

export function FormCatatServis({ isOpen, onClose, onConfirm, kendaraanInfo }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newData = {
      id: Date.now(),
      kendaraan: kendaraanInfo ? kendaraanInfo.nama : formData.get("kendaraan"),
      plat: kendaraanInfo ? kendaraanInfo.plat : formData.get("plat"),
      jenis: formData.get("jenis"),
      tipe: "SERVIS",
      tanggal: formData.get("tanggal"),
      km: formData.get("km"),
      biaya: `Rp ${formData.get("biaya")}`,
    };

    // Kirim data riwayat sekaligus ID kendaraan untuk diubah statusnya
    onConfirm(newData, kendaraanInfo?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            {kendaraanInfo ? "Selesaikan & Catat Servis" : "Catat Riwayat Servis Manual"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kendaraan">Kendaraan</Label>
              <Input 
                id="kendaraan" 
                name="kendaraan" 
                required 
                defaultValue={kendaraanInfo?.nama}
                readOnly={!!kendaraanInfo} // Terkunci jika ada datanya
                className={kendaraanInfo ? "bg-slate-100" : ""}
                placeholder="Cth: Toyota Hiace" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plat">Plat Nomor</Label>
              <Input 
                id="plat" 
                name="plat" 
                required 
                defaultValue={kendaraanInfo?.plat}
                readOnly={!!kendaraanInfo}
                className={kendaraanInfo ? "bg-slate-100" : ""}
                placeholder="Cth: B 1234 SCH" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal Selesai</Label>
              <Input id="tanggal" name="tanggal" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">Kilometer (KM)</Label>
              <Input id="km" name="km" type="number" required placeholder="Cth: 50000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenis">Detail Perbaikan / Servis</Label>
            <Textarea id="jenis" name="jenis" rows={2} required placeholder="Cth: Ganti Oli Mesin & Kampas Rem" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biaya">Total Biaya (Rp)</Label>
            <Input id="biaya" name="biaya" type="number" required placeholder="Cth: 1500000" />
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 h-11 text-base font-bold text-white">
            Simpan Data Servis
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}