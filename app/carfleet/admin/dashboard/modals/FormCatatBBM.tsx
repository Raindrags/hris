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

export function FormCatatBBM({ isOpen, onClose, onConfirm }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newData = {
      id: Date.now(),
      kendaraan: formData.get("kendaraan"),
      plat: formData.get("plat"),
      jenis: `Isi BBM ${formData.get("jenisBbm")}`,
      tipe: "BBM",
      tanggal: formData.get("tanggal"),
      km: formData.get("km"),
      biaya: `Rp ${formData.get("biaya")}`,
    };

    onConfirm(newData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Catat Pengisian BBM</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="kendaraan">Kendaraan & Plat</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input id="kendaraan" name="kendaraan" required placeholder="Toyota Innova" />
              <Input id="plat" name="plat" required placeholder="B 5678 SCH" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal Isi</Label>
              <Input id="tanggal" name="tanggal" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">Kilometer Saat Isi</Label>
              <Input id="km" name="km" type="number" required placeholder="Cth: 45200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenisBbm">Jenis BBM</Label>
            <Input id="jenisBbm" name="jenisBbm" required placeholder="Cth: Pertamax / Dexlite" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biaya">Total Biaya (Rp)</Label>
            <Input id="biaya" name="biaya" type="number" required placeholder="Cth: 350000" />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-bold text-white">
            Simpan Data BBM
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}