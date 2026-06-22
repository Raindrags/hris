"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FormTambahJadwal({ isOpen, onClose, onConfirm }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Tambah Jadwal Rutin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="agenda">Nama Agenda / Pengguna</Label>
            <Input id="agenda" required placeholder="Cth: Antar Jemput Siswa TK" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rute">Rute Perjalanan</Label>
            <Input id="rute" required placeholder="Cth: Sekolah - Perumahan Anggrek" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kendaraan">Kendaraan yang Digunakan</Label>
            <Input id="kendaraan" required placeholder="Cth: Toyota Hiace (B 1111 SCH)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hari">Hari / Frekuensi</Label>
              <Input id="hari" required placeholder="Cth: Setiap Hari Kerja" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktu">Waktu Operasional</Label>
              <Input id="waktu" required placeholder="Cth: 06:00 & 15:00 WIB" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base font-bold text-white">
            Simpan Jadwal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}