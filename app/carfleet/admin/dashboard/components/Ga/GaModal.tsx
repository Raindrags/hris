import { useState, useEffect, useRef } from "react";
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
import { Loader2, Save } from "lucide-react";

// ==========================================
// INTERFACES
// ==========================================
export interface Vehicle {
  id: string;
  name: string;
  platNumber?: string;
  plat?: string;
}

// ==========================================
// MODAL TOLAK
// ==========================================
interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
  requestData: any; 
  isSubmitting: boolean;
}

export function RejectModal({ isOpen, onClose, onSubmit, requestData, isSubmitting }: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestData?.id) {
      onSubmit(requestData.id, reason);
      setReason("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Tolak Peminjaman</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk <b>{requestData?.userName || requestData?.employeeName}</b>.
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
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Memproses..." : "Kirim Penolakan"}
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
interface ReturnValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  vehicleData: any;
  isSubmitting: boolean;
}

export function ReturnValidationModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleData,
  isSubmitting,
}: ReturnValidationModalProps) {
  const [formData, setFormData] = useState({
    kmAkhir: "",
    saldoEtoll: "",
    indikatorBbm: "",
    kondisi: "",
    isiBbmBaru: false,
    topUpEtoll: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        kmAkhir: "",
        saldoEtoll: "",
        indikatorBbm: "",
        kondisi: "",
        isiBbmBaru: false,
        topUpEtoll: false,
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: vehicleData?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
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
                onChange={(e) => setFormData({ ...formData, kmAkhir: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Sisa Saldo e-Toll (Rp)</Label>
              <Input
                type="number"
                value={formData.saldoEtoll}
                onChange={(e) => setFormData({ ...formData, saldoEtoll: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Indikator Sisa BBM</Label>
            <Input
              required
              placeholder="Cth: Setengah Tangki"
              value={formData.indikatorBbm}
              onChange={(e) => setFormData({ ...formData, indikatorBbm: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="p-4 bg-slate-100 rounded-lg space-y-3">
            <Label className="text-sm font-bold">Tindakan GA (Opsional):</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cbBBM"
                checked={formData.isiBbmBaru}
                onCheckedChange={(c) => setFormData({ ...formData, isiBbmBaru: c as boolean })}
                disabled={isSubmitting}
              />
              <label htmlFor="cbBBM" className="text-sm cursor-pointer">
                Isi BBM baru
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cbEtoll"
                checked={formData.topUpEtoll}
                onCheckedChange={(c) => setFormData({ ...formData, topUpEtoll: c as boolean })}
                disabled={isSubmitting}
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
              onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" className="bg-slate-900" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : "Simpan & Selesaikan"}
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
interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  vehicles: Vehicle[];
  isSubmitting: boolean;
}

export function ServiceFormModal({ isOpen, onClose, onSubmit, vehicles, isSubmitting }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    vehicleId: "",
    date: "",
    km: "",
    serviceType: "",
    cost: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: "",
        date: "",
        km: "",
        serviceType: "",
        cost: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
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
              onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(vehicles) && vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.platNumber || v.plat || "-"})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-vehicles" disabled>
                    Data kendaraan tidak tersedia
                  </SelectItem>
                )}
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
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>KM Saat Ini</Label>
              <Input
                type="number"
                required
                placeholder="Cth: 45000"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Servis</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(val) => setFormData({ ...formData, serviceType: val })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Servis Rutin">Servis Rutin</SelectItem>
                  <SelectItem value="Ganti Oli">Ganti Oli</SelectItem>
                  <SelectItem value="Ganti Ban/Aki">Ganti Ban/Aki</SelectItem>
                  <SelectItem value="Perbaikan Mesin">Perbaikan Mesin</SelectItem>
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
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Upload Nota / Kuitansi</Label>
            <Input type="file" accept="image/*,.pdf" className="cursor-pointer" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label>Catatan Tambahan</Label>
            <Textarea
              rows={2}
              placeholder="Ganti kampas rem depan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" className="bg-red-700 hover:bg-red-800 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Data Servis"}
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
export interface FuelFormData {
  vehicleId: string;
  date: string;
  km: string | number;
  fuelType: string;
  liters: string | number;
  cost: string | number;
}

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  vehicles: Vehicle[];
  isSubmitting: boolean;
}

export function FuelFormModal({ isOpen, onClose, onSubmit, vehicles = [], isSubmitting }: FuelFormModalProps) {
  const [formData, setFormData] = useState<FuelFormData>({
    vehicleId: "",
    date: "",
    km: "",
    fuelType: "",
    liters: "",
    cost: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ vehicleId: "", date: "", km: "", fuelType: "", liters: "", cost: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      km: Number(formData.km),
      liters: Number(formData.liters),
      cost: Number(formData.cost),
    };
    
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const formPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => formPayload.append(key, String(value)));
      formPayload.append("receipt", file);
      onSubmit(formPayload);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
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
              onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(vehicles) && vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.platNumber ?? v.plat ?? "-"})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    Tidak ada kendaraan tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Isi BBM</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>KM Saat Ini</Label>
              <Input
                type="number"
                required
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2 col-span-1">
              <Label>Jenis BBM</Label>
              <Input
                required
                placeholder="Cth: Pertalite"
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
             <div className="space-y-2 col-span-1">
              <Label>Jumlah (Liter)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
             <div className="space-y-2 col-span-1">
              <Label>Biaya (Rp)</Label>
              <Input
                type="number"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Struk SPBU</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="cursor-pointer"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Data BBM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM KENDARAAN (TAMBAH & EDIT)
// ==========================================
interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any; // Tambahkan ini agar tidak error di komponen yang menerimanya
}

export function VehicleFormModal({
  isOpen,
  onClose,
  onRefresh,
  initialData,
}: VehicleFormModalProps) {
  const [name, setName] = useState("");
  const [platNumber, setPlatNumber] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [status, setStatus] = useState("Tersedia");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setPlatNumber(initialData.platNumber || "");
        setCapacity(initialData.capacity || "");
        setStatus(initialData.status || "Tersedia");
      } else {
        setName("");
        setPlatNumber("");
        setCapacity("");
        setStatus("Tersedia");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      platNumber,
      capacity: capacity ? Number(capacity) : null,
      status,
    };

    try {
      const isEdit = !!initialData;
      const url = isEdit ? `/api/ga/vehicles/${initialData.id}` : "/api/ga/vehicles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isEdit ? "Data kendaraan berhasil diperbarui!" : "Kendaraan baru berhasil ditambahkan!");
        onRefresh(); 
        onClose(); 
      } else {
        toast.error(result.message || "Gagal menyimpan data kendaraan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = initialData ? "Edit Data Kendaraan" : "Tambah Kendaraan Baru";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kendaraan</Label>
            <Input
              id="name"
              placeholder="Contoh: Toyota Avanza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platNumber">Nomor Polisi</Label>
            <Input
              id="platNumber"
              placeholder="Contoh: B 1234 CD"
              value={platNumber}
              onChange={(e) => setPlatNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas (Orang)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Contoh: 7"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> {initialData ? "Simpan Perubahan" : "Simpan Kendaraan"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MODAL FORM JADWAL RUTIN (TAMBAH & EDIT)
// ==========================================
interface RoutineScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  vehicles: Vehicle[];
  isSubmitting: boolean;
  initialData?: any; // Tambahkan props ini
}

export function RoutineScheduleFormModal({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  isSubmitting,
  initialData, 
}: RoutineScheduleFormModalProps) {
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    rute: string;
    vehicleId: string;
    time: string;
    hari: string;
  }>({
    name: "",
    rute: "",
    vehicleId: "",
    time: "",
    hari: "",
  });

  // Pre-fill data jika mode edit aktif
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          rute: initialData.rute || "",
          vehicleId: initialData.vehicleId || "",
          time: initialData.time || "",
          hari: initialData.hari || "",
        });
      } else {
        setFormData({ name: "", rute: "", vehicleId: "", time: "", hari: "" });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mengirim formData ke fungsi parent (GaDashboardView)
    // Jika formData.id ada, parent akan melakukan PUT. Jika tidak, POST.
    onSubmit(formData); 
  };

  const modalTitle = initialData ? "Edit Jadwal Rutin" : "Tambah Jadwal Rutin";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Jadwal operasional tetap seperti antar-jemput siswa.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Kegiatan</Label>
            <Input
              required
              disabled={isSubmitting}
              placeholder="Cth: Antar Jemput Siswa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Rute / Tujuan</Label>
            <Input
              required
              disabled={isSubmitting}
              placeholder="Cth: Perum. Anggrek - Sekolah"
              value={formData.rute}
              onChange={(e) => setFormData({ ...formData, rute: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Kendaraan yang Ditugaskan</Label>
            <Select
              disabled={isSubmitting || vehicles.length === 0}
              value={formData.vehicleId}
              onValueChange={(val) => setFormData({ ...formData, vehicleId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {/* Dukungan fallback untuk nama properti dari berbagai versi interface */}
                      {v.name || v.brand} ({v.platNumber || v.plateNumber || v.plat || "-"})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    Tidak ada kendaraan tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Waktu Operasional</Label>
              <Input
                required
                disabled={isSubmitting}
                placeholder="Cth: 06:00 & 15:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hari</Label>
              <Input
                required
                disabled={isSubmitting}
                placeholder="Cth: Senin - Jumat"
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.vehicleId}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> {initialData ? "Simpan Perubahan" : "Simpan Jadwal"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}