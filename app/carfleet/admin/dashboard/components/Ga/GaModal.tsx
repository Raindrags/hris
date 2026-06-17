import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// ==========================================
// MODAL TOLAK
// ==========================================
export function RejectModal({ isOpen, onClose, onSubmit, requestData }: any) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(requestData.id, reason);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Tolak Peminjaman</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk <b>{requestData?.userName}</b>.
            Alasan ini akan dikirim via WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Alasan Penolakan</Label>
            <Textarea
              required
              rows={3}
              placeholder="Contoh: Kendaraan sedang servis..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="destructive">
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL VALIDASI PENGEMBALIAN
// ==========================================
export function ReturnValidationModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleData,
}: any) {
  const [formData, setFormData] = useState({
    kmAkhir: "",
    saldoEtoll: "",
    indikatorBbm: "",
    kondisi: "",
    isiBbmBaru: false,
    topUpEtoll: false,
  });

  useEffect(() => {
    if (isOpen)
      setFormData({
        kmAkhir: "",
        saldoEtoll: "",
        indikatorBbm: "",
        kondisi: "",
        isiBbmBaru: false,
        topUpEtoll: false,
      });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: vehicleData?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Validasi Fisik Kendaraan</DialogTitle>
          <DialogDescription>
            Cek kondisi <b>{vehicleData?.vehicleName}</b> dari{" "}
            <b>{vehicleData?.userName}</b>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kilometer Akhir</Label>
              <Input
                type="number"
                required
                value={formData.kmAkhir}
                onChange={(e) =>
                  setFormData({ ...formData, kmAkhir: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Sisa Saldo e-Toll (Rp)</Label>
              <Input
                type="number"
                value={formData.saldoEtoll}
                onChange={(e) =>
                  setFormData({ ...formData, saldoEtoll: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Indikator Sisa BBM</Label>
            <Input
              required
              placeholder="Cth: Setengah Tangki"
              value={formData.indikatorBbm}
              onChange={(e) =>
                setFormData({ ...formData, indikatorBbm: e.target.value })
              }
            />
          </div>
          <div className="p-4 bg-slate-100 rounded-lg space-y-3">
            <Label className="text-sm font-bold">Tindakan GA (Opsional):</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cbBBM"
                checked={formData.isiBbmBaru}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, isiBbmBaru: c as boolean })
                }
              />
              <label htmlFor="cbBBM" className="text-sm cursor-pointer">
                Isi BBM baru
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cbEtoll"
                checked={formData.topUpEtoll}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, topUpEtoll: c as boolean })
                }
              />
              <label htmlFor="cbEtoll" className="text-sm cursor-pointer">
                Top-up e-Toll
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kondisi & Kerusakan</Label>
            <Textarea
              required
              rows={2}
              value={formData.kondisi}
              onChange={(e) =>
                setFormData({ ...formData, kondisi: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-slate-900">
              Simpan & Selesaikan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM CATAT SERVIS MOBIL
// ==========================================
export function ServiceFormModal({ isOpen, onClose, onSubmit, vehicles }: any) {
  const [formData, setFormData] = useState({
    vehicleId: "",
    date: "",
    km: "",
    serviceType: "",
    cost: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen)
      setFormData({
        vehicleId: "",
        date: "",
        km: "",
        serviceType: "",
        cost: "",
        notes: "",
      });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Catat Riwayat Servis</DialogTitle>
          <DialogDescription>
            Masukkan data servis rutin atau perbaikan kendaraan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kendaraan</Label>
            <Select
              value={formData.vehicleId}
              onValueChange={(val) =>
                setFormData({ ...formData, vehicleId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {/* Diperbaiki: Defensive array dan platNumber */}
                {(vehicles || []).map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.platNumber || v.plat})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Servis</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>KM Saat Ini</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 45000"
                value={formData.km}
                onChange={(e) =>
                  setFormData({ ...formData, km: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Servis</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(val) =>
                  setFormData({ ...formData, serviceType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Servis Rutin">Servis Rutin</SelectItem>
                  <SelectItem value="Ganti Oli">Ganti Oli</SelectItem>
                  <SelectItem value="Ganti Ban/Aki">Ganti Ban/Aki</SelectItem>
                  <SelectItem value="Perbaikan Mesin">
                    Perbaikan Mesin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Biaya (Rp)</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 1500000"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Upload Nota / Kuitansi</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label>Catatan Tambahan</Label>
            <Textarea
              rows={2}
              placeholder="Ganti kampas rem depan..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              Simpan Data Servis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM PENGISIAN BBM
// ==========================================
export function FuelFormModal({ isOpen, onClose, onSubmit, vehicles }: any) {
  const [formData, setFormData] = useState({
    vehicleId: "",
    date: "",
    km: "",
    fuelType: "",
    liters: "",
    cost: "",
  });

  useEffect(() => {
    if (isOpen)
      setFormData({
        vehicleId: "",
        date: "",
        km: "",
        fuelType: "",
        liters: "",
        cost: "",
      });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Catat Pengisian BBM</DialogTitle>
          <DialogDescription>
            Masukkan data struk pengisian bahan bakar kendaraan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kendaraan</Label>
            <Select
              value={formData.vehicleId}
              onValueChange={(val) =>
                setFormData({ ...formData, vehicleId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {/* Diperbaiki: Defensive array dan platNumber */}
                {(vehicles || []).map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.platNumber || v.plat})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Isi</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>KM Saat Ini</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 45000"
                value={formData.km}
                onChange={(e) =>
                  setFormData({ ...formData, km: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Jenis BBM</Label>
            <Select
              value={formData.fuelType}
              onValueChange={(val) =>
                setFormData({ ...formData, fuelType: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis BBM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pertamax">Pertamax</SelectItem>
                <SelectItem value="Pertalite">Pertalite</SelectItem>
                <SelectItem value="Dexlite">Dexlite</SelectItem>
                <SelectItem value="Pertamina Dex">Pertamina Dex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah Liter</Label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="Cth: 20.5"
                value={formData.liters}
                onChange={(e) =>
                  setFormData({ ...formData, liters: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Total Biaya (Rp)</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 250000"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Upload Struk SPBU</Label>
            <Input
              type="file"
              accept="image/*"
              className="cursor-pointer"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Simpan Data BBM
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM KENDARAAN BARU (KINI TERHUBUNG API)
// ==========================================
export function VehicleFormModal({ isOpen, onClose, onRefresh }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platNumber: "",
    capacity: "",
    type: "Standard Operasional",
  });

  useEffect(() => {
    if (isOpen)
      setFormData({
        name: "",
        platNumber: "",
        capacity: "",
        type: "Standard Operasional",
      });
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        platNumber: formData.platNumber.toUpperCase(), // Pastikan huruf kapital
        capacity: parseInt(formData.capacity),
        type: formData.type,
      };

      const res = await fetch("/api/ga/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Kendaraan berhasil ditambahkan ke database!");
        if (onRefresh) onRefresh(); // Panggil fungsi fetch dari GaTabs agar tabel ter-update
        onClose();
      } else {
        toast.error(result.message || "Gagal menyimpan kendaraan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Kendaraan Baru</DialogTitle>
          <DialogDescription>
            Masukkan data spesifikasi kendaraan operasional sekolah.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Kendaraan / Merk</Label>
            <Input
              required
              placeholder="Cth: Toyota Hiace Commuter"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plat Nomor</Label>
              <Input
                required
                className="uppercase"
                placeholder="Cth: B 1234 SCH"
                value={formData.platNumber}
                onChange={(e) =>
                  setFormData({ ...formData, platNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Kapasitas Penumpang</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 15"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipe / Kategori</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData({ ...formData, type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard Operasional">
                  Standard Operasional
                </SelectItem>
                <SelectItem value="VIP / Eksekutif">VIP / Eksekutif</SelectItem>
                <SelectItem value="Rombongan Besar">Rombongan Besar</SelectItem>
                <SelectItem value="Logistik / Barang">Logistik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Kendaraan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM JADWAL RUTIN
// ==========================================
export function RoutineScheduleFormModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
}: any) {
  const [formData, setFormData] = useState({
    name: "",
    rute: "",
    vehicleId: "",
    time: "",
    hari: "",
  });

  useEffect(() => {
    if (isOpen)
      setFormData({ name: "", rute: "", vehicleId: "", time: "", hari: "" });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: `r${Date.now()}` });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Rutin</DialogTitle>
          <DialogDescription>
            Jadwal operasional tetap seperti antar-jemput siswa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Kegiatan</Label>
            <Input
              required
              placeholder="Cth: Antar Jemput Siswa"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Rute / Tujuan</Label>
            <Input
              required
              placeholder="Cth: Perum. Anggrek - Sekolah"
              value={formData.rute}
              onChange={(e) =>
                setFormData({ ...formData, rute: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Kendaraan yang Ditugaskan</Label>
            <Select
              value={formData.vehicleId}
              onValueChange={(val) =>
                setFormData({ ...formData, vehicleId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {/* Diperbaiki: Defensive array dan platNumber */}
                {(vehicles || []).map((v: any) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.platNumber || v.plat})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Waktu Operasional</Label>
              <Input
                required
                placeholder="Cth: 06:00 & 15:30"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hari</Label>
              <Input
                required
                placeholder="Cth: Senin - Jumat"
                value={formData.hari}
                onChange={(e) =>
                  setFormData({ ...formData, hari: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-slate-900 text-white">
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}