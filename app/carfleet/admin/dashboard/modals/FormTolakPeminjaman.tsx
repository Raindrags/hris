"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pemohon: string;
}

export function FormTolakPeminjaman({ isOpen, onClose, pemohon }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Penolakan untuk ${pemohon} telah dikirim via WA!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-red-600">
            Tolak Peminjaman
          </DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan agar pemohon mengetahuinya (akan dikirim via WhatsApp).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Penolakan</Label>
            <Textarea 
              id="alasan" 
              rows={4} 
              required 
              placeholder="Contoh: Mobil sedang jadwal servis rutin hari ini." 
            />
          </div>

          <Button type="submit" variant="destructive" className="w-full h-11 text-base font-bold">
            Kirim Penolakan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}