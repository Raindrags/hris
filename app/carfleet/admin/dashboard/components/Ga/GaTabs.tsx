import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Check,
  X,
  MapPin,
  CarFront,
  BusFront,
  ClipboardCheck,
  History,
  Wrench,
  Fuel,
  Plus,
  FileClock,
  KeyRound,
  Activity,
  Loader2,
  Pencil, // Tambahan icon Pencil untuk Edit
  Trash2, // Tambahan icon Trash untuk Hapus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleFormModal } from "./GaModal";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface ActivityItem {
  type: string;
  initials?: string;
  name: string;
  desc: string;
  vehicle: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
}

export interface RequestItem {
  id: string;
  userInitials: string;
  userName: string;
  destination: string;
  vehicleName: string;
  date: string;
  time: string;
}

export interface ReturnItem {
  id: string;
  vehicleName: string;
  userName: string;
  timeReturned: string;
}

export interface MaintenanceHistoryItem {
  vehicle: string;
  plat: string;
  type: string;
  date: string;
  km: number | string;
  cost: number | string;
}

export interface RoutineItem {
  id: string;
  name: string;
  rute: string;
  hari: string;
  time: string;
  vehicleId: string;
}

export interface VehicleItem {
  id: string;
  name: string;
  platNumber: string;
  capacity?: number;
  status?: string;
}

interface DashboardTabProps {
  pendingCount: number;
  returnCount: number;
  activities: ActivityItem[];
  setTab: (tab: string) => void;
}

interface ApprovalTabProps {
  requests: RequestItem[];
  onApprove: (id: string) => void;
  onReject: (req: RequestItem) => void;
}

interface ReturnTabProps {
  returns: ReturnItem[];
  onValidate: (ret: ReturnItem) => void;
}

interface MaintenanceTabProps {
  history: MaintenanceHistoryItem[];
  onOpenService?: () => void;
  onOpenFuel?: () => void;
}

interface MasterTabProps {
  routines: RoutineItem[];
  onAddRoutine: () => void;
  onEditRoutine?: (routine: RoutineItem) => void; // Tambahan prop untuk Edit Routine
  onDeleteRoutine: (id: string) => void;
}

// ==========================================
// TAB 1: DASHBOARD
// ==========================================
export function DashboardTab({
  pendingCount,
  returnCount,
  activities,
  setTab,
}: DashboardTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:-translate-y-1 transition-transform border-slate-200 shadow-sm"
          onClick={() => setTab("persetujuan")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileClock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">
                Menunggu Persetujuan
              </p>
              <h3 className="text-2xl font-black text-slate-800">
                {pendingCount} Pengajuan
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:-translate-y-1 transition-transform border-slate-200 shadow-sm"
          onClick={() => setTab("pengembalian")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">
                Menunggu Validasi
              </p>
              <h3 className="text-2xl font-black text-slate-800">
                {returnCount} Unit
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Activity className="text-slate-800 w-5 h-5" />
          <h2 className="font-bold text-slate-800 text-lg">
            Aktivitas & Jadwal Terdekat
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agenda / Pengguna</TableHead>
              <TableHead>Kendaraan</TableHead>
              <TableHead>Jadwal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {act.type === "RUTIN" ? (
                        <BusFront className="w-4 h-4" />
                      ) : (
                        act.initials
                      )}
                    </div>
                    <div>
                      <strong className="block text-slate-800">
                        {act.name}
                      </strong>
                      <span className="text-xs text-slate-500">{act.desc}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 border border-slate-200">
                    <CarFront className="w-3.5 h-3.5" /> {act.vehicle}
                  </div>
                </TableCell>
                <TableCell>
                  <strong className="block text-sm text-slate-800">
                    {act.date}
                  </strong>
                  <span className="text-xs text-slate-500">{act.time}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${act.statusColor}`}
                  >
                    {act.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ==========================================
// TAB 2: PERSETUJUAN
// ==========================================
export function ApprovalTab({ requests, onApprove, onReject }: ApprovalTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemohon & Tujuan</TableHead>
              <TableHead>Kendaraan</TableHead>
              <TableHead>Jadwal</TableHead>
              <TableHead className="text-right">Aksi Keputusan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-400"
                >
                  Tidak ada pengajuan.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {req.userInitials}
                      </div>
                      <div>
                        <strong className="block text-slate-800">
                          {req.userName}
                        </strong>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {req.destination}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold border">
                      <CarFront className="w-3.5 h-3.5" /> {req.vehicleName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {req.date}
                    </strong>
                    <span className="text-xs text-slate-500">{req.time}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprove(req.id)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" /> Setuju
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onReject(req)}
                        className="bg-red-100 hover:bg-red-200 text-red-600"
                      >
                        <X className="w-4 h-4 mr-1" /> Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ==========================================
// TAB 3: PENGEMBALIAN & VALIDASI
// ==========================================
export function ReturnTab({ returns, onValidate }: ReturnTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kendaraan & Peminjam</TableHead>
              <TableHead>Waktu Kembali Aktual</TableHead>
              <TableHead>Status User</TableHead>
              <TableHead className="text-right">Form Pengecekan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-400"
                >
                  Tidak ada kendaraan yang menunggu divalidasi.
                </TableCell>
              </TableRow>
            ) : (
              returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-sky-100 text-sky-700 flex items-center justify-center">
                        <BusFront className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-slate-800">
                          {ret.vehicleName}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {ret.userName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <strong className="text-sm text-slate-800">
                      {ret.timeReturned}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Kunci Diserahkan
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onValidate(ret)}
                      className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      <ClipboardCheck className="w-4 h-4 mr-1" /> Validasi Mobil
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ==========================================
// TAB 4: PERAWATAN (Servis & BBM)
// ==========================================
export function MaintenanceTab({ history, onOpenService, onOpenFuel }: MaintenanceTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="cursor-pointer"
          onClick={() => {
            if (onOpenService) onOpenService();
          }}
        >
          <Card className="hover:-translate-y-1 transition-transform border-slate-200 shadow-sm hover:shadow-md h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Catat Servis Mobil
                </p>
                <h3 className="font-black text-slate-800">Input Riwayat</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          className="cursor-pointer"
          onClick={() => {
            if (onOpenFuel) onOpenFuel();
          }}
        >
          <Card className="hover:-translate-y-1 transition-transform border-slate-200 shadow-sm hover:shadow-md h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Fuel className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Catat Pengisian BBM
                </p>
                <h3 className="font-black text-slate-800">Input Struk</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center">
          <History className="w-5 h-5 mr-2 text-slate-700" />
          <h2 className="font-bold text-lg text-slate-800">
            Riwayat Servis & BBM
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kendaraan</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Tanggal & KM</TableHead>
              <TableHead>Total Biaya</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!history || history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-slate-400"
                >
                  Belum ada riwayat tercatat.
                </TableCell>
              </TableRow>
            ) : (
              history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {h.vehicle}
                    </strong>
                    <span className="text-xs text-slate-500">{h.plat}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        h.type.includes("BBM")
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {h.date}
                    </strong>
                    <span className="text-xs text-slate-500">KM: {h.km}</span>
                  </TableCell>
                  <TableCell>
                    <strong className="text-sm text-slate-800">
                      Rp {Number(h.cost).toLocaleString("id-ID")}
                    </strong>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ==========================================
// TAB 5: MASTER DATA
// ==========================================

export interface RoutineItem {
  id: string;
  name: string;
  rute: string;
  hari: string;
  time: string;
  vehicleId: string;
}

export interface VehicleItem {
  id: string;
  name: string;
  platNumber: string;
  capacity?: number;
  status?: string;
}

interface MasterTabProps {
  routines: RoutineItem[];
  onAddRoutine: () => void;
  onEditRoutine: (routine: RoutineItem) => void;
  onDeleteRoutine: (id: string) => void;
}

export function MasterTab({
  routines,
  onAddRoutine,
  onEditRoutine,
  onDeleteRoutine,
}: MasterTabProps) {
  // STATE KENDARAAN
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE MODAL KENDARAAN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);

  // FETCH DARI API
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ga/vehicles");
      const result = await res.json();
      if (result.success) {
        setVehicles(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data kendaraan dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // HANDLER TAMBAH MOBIL
  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  // HANDLER EDIT MOBIL
  const handleEditVehicle = (vehicle: VehicleItem) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  // HANDLER HAPUS MOBIL
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus kendaraan ini secara permanen?"))
      return;

    try {
      const res = await fetch(`/api/ga/vehicles/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Kendaraan berhasil dihapus!");
        fetchVehicles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan saat menghapus.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* BAGIAN 1: DAFTAR KENDARAAN (DATABASE) */}
      <Card className="border-slate-200 shadow-sm overflow-hidden relative z-10">
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CarFront className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-lg text-slate-800">
              Daftar Kendaraan
            </h2>
          </div>
          <Button
            size="sm"
            onClick={handleAddVehicle}
            className="bg-slate-900 hover:bg-slate-800 text-white relative z-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Kendaraan
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kendaraan</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
                  <p className="text-sm font-medium text-slate-500 mt-3">
                    Mengambil data dari database...
                  </p>
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-400"
                >
                  Belum ada data kendaraan yang terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {v.name}
                    </strong>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border mt-1 inline-block uppercase tracking-wide">
                      {v.platNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {v.capacity || "-"} Orang
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        v.status === "Tersedia"
                          ? "bg-emerald-100 text-emerald-700"
                          : v.status === "Dipinjam"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.status || "Tersedia"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVehicle(v)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* BAGIAN 2: JADWAL RUTIN */}
      <Card className="border-slate-200 shadow-sm overflow-hidden relative z-10">
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileClock className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-lg text-slate-800">
              Jadwal Operasional Rutin
            </h2>
          </div>
          <Button
            size="sm"
            onClick={onAddRoutine}
            className="bg-slate-900 hover:bg-slate-800 text-white relative z-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Jadwal
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kegiatan & Rute</TableHead>
              <TableHead>Hari & Waktu</TableHead>
              <TableHead>Kendaraan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!routines || routines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-slate-400"
                >
                  Belum ada jadwal rutin.
                </TableCell>
              </TableRow>
            ) : (
              routines.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {r.name}
                    </strong>
                    <span className="text-xs text-slate-500">{r.rute}</span>
                  </TableCell>
                  <TableCell>
                    <strong className="block text-sm text-slate-800">
                      {r.hari}
                    </strong>
                    <span className="text-xs text-slate-500">{r.time}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-slate-700">
                      {vehicles.find((v) => v.id === r.vehicleId)?.name ||
                        "Kendaraan Dihapus"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* TOMBOL EDIT RUTINITAS */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRoutine(r)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      {/* TOMBOL HAPUS RUTINITAS */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRoutine(r.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* MODAL KENDARAAN (Hanya untuk mengurus Data Kendaraan) */}
      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onRefresh={fetchVehicles}
        initialData={selectedVehicle}
      />
    </div>
  );
}