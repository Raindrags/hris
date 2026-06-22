"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function FormTambahKendaraan({ isOpen, onClose, onConfirm }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newData = {
      id: `k-${Date.now()}`,
      nama: formData.get("nama"),
      plat: formData.get("plat"),
      tipe: formData.get("tipe"),
      kapasitas: `${formData.get("kapasitas")} Penumpang`,
      status: "Tersedia", // Default status saat baru ditambah
    };

    onConfirm(newData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Tambah Kendaraan Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="nama">Merek & Nama Kendaraan</Label>
            <Input id="nama" name="nama" required placeholder="Cth: Toyota Avanza Veloz" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plat">Plat Nomor</Label>
            <Input id="plat" name="plat" required placeholder="Cth: B 3333 SCH" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe Kendaraan</Label>
              <Input id="tipe" name="tipe" required placeholder="Cth: MPV / Minibus" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitas">Kapasitas (Orang)</Label>
              <Input id="kapasitas" name="kapasitas" type="number" required placeholder="Cth: 7" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-bold text-white">
            Simpan Kendaraan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}