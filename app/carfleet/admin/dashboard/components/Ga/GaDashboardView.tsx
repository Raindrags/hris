"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { GaSidebar } from "./SideBar";
import { GaTopbar } from "./TopBar";
import {
  ApprovalTab,
  DashboardTab,
  MaintenanceTab,
  MasterTab,
  ReturnTab,
} from "./GaTabs";
import {
  FuelFormModal,
  RejectModal,
  ReturnValidationModal,
  RoutineScheduleFormModal,
  ServiceFormModal,
} from "./GaModal";

// ==========================================
// 1. TYPESCRIPT INTERFACES
// ==========================================
export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  type: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE";
}

export interface VehicleRequest {
  id: string;
  vehicleId: string;
  employeeName: string;
  department: string;
  startDate: string | Date;
  endDate: string | Date;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  vehicle?: Vehicle;
}

export interface VehicleReturn {
  id: string;
  requestId: string;
  vehicleId: string;
  returnDate: string | Date;
  conditionNote: string;
  status: "PENDING" | "VALIDATED";
  request?: VehicleRequest;
}

export interface RoutineSchedule {
  id: string;
  vehicleId: string;
  taskName: string;
  dueDate: string | Date;
  status: "UPCOMING" | "DONE" | "OVERDUE";
  vehicle?: Vehicle;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  entryType: "SERVIS" | "BBM";
  date: string | Date;
  cost: number;
  description: string;
  odometer?: number;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string | Date;
  type: "INFO" | "WARNING" | "SUCCESS";
}

// Payload Types
type ServicePayload = Omit<MaintenanceRecord, "id" | "entryType">;
type FuelPayload = Omit<MaintenanceRecord, "id" | "entryType">;
type RoutinePayload = Omit<RoutineSchedule, "id" | "status">;
type ReturnPayload = Omit<VehicleReturn, "id" | "status">;

export default function GaDashboardView() {
  // ==========================================
  // 2. STATE NAVIGASI TAB & LOADING AWAL
  // ==========================================
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ==========================================
  // 3. STATE KONTROL MODAL & SELECTED DATA
  // ==========================================
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
  const [fuelModalOpen, setFuelModalOpen] = useState<boolean>(false);
  const [routineModalOpen, setRoutineModalOpen] = useState<boolean>(false);

  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | VehicleReturn | null>(null);
  
  // Menambahkan state khusus untuk menyimpan data jadwal yang akan diedit
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineSchedule | null>(null);

  // ==========================================
  // 4. SUBMITTING STATE (Pencegah Double Click)
  // ==========================================
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ==========================================
  // 5. STATE DATA BACKEND
  // ==========================================
  const [masterVehicles, setMasterVehicles] = useState<Vehicle[]>([]);
  const [routineSchedules, setRoutineSchedules] = useState<RoutineSchedule[]>([]);
  const [pendingRequests, setPendingRequests] = useState<VehicleRequest[]>([]);
  const [pendingReturns, setPendingReturns] = useState<VehicleReturn[]>([]);
  const [dashboardActivities, setDashboardActivities] = useState<DashboardActivity[]>([]);
  const [historyData, setHistoryData] = useState<MaintenanceRecord[]>([]);

  // ==========================================
  // 6. LOGIKA AMBIL DATA (READ)
  // ==========================================
  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/ga/vehicles");
      if (res.ok) setMasterVehicles(await res.json());
    } catch (err) {
      console.error("Gagal menarik data master kendaraan:", err);
    }
  }, []);

  const fetchMaintenance = useCallback(async () => {
    try {
      const res = await fetch("/api/ga/maintenance");
      if (res.ok) setHistoryData(await res.json());
    } catch (err) {
      console.error("Gagal menarik data perawatan:", err);
    }
  }, []);

  const fetchOperationalData = useCallback(async () => {
    try {
      const [resRoutines, resRequests, resReturns, resActivities] = await Promise.all([
        fetch("/api/ga/routines"),
        fetch("/api/ga/requests"),
        fetch("/api/ga/returns"),
        fetch("/api/ga/activities"),
      ]);

      if (resRoutines.ok) setRoutineSchedules(await resRoutines.json());
      if (resRequests.ok) setPendingRequests(await resRequests.json());
      if (resReturns.ok) setPendingReturns(await resReturns.json());
      if (resActivities.ok) setDashboardActivities(await resActivities.json());
    } catch (err) {
      console.error("Gagal menarik data operasional:", err);
    }
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchVehicles(),
        fetchMaintenance(),
        fetchOperationalData(),
      ]);
      setIsLoading(false);
    };
    loadAllData();
  }, [fetchVehicles, fetchMaintenance, fetchOperationalData]);

  // ==========================================
  // 7. LOGIKA HANDLER (AKSI MUTASI API)
  // ==========================================

  const handleApprove = async (id: string) => {
    setProcessingId(id); 
    try {
      const res = await fetch("/api/ga/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "APPROVE" }),
      });

      if (res.ok) {
        toast.success("Peminjaman disetujui! Notifikasi WA terkirim.");
        await fetchOperationalData();
      } else {
        toast.error("Gagal menyetujui peminjaman.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setProcessingId(null); 
    }
  };

  const handleOpenReject = (req: VehicleRequest) => {
    setSelectedRequest(req);
    setRejectModalOpen(true);
  };

  const submitReject = async (id: string, reason: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ga/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "REJECT", reason }),
      });

      if (res.ok) {
        setRejectModalOpen(false);
        toast.error("Peminjaman ditolak. Alasan terkirim ke WhatsApp.");
        await fetchOperationalData();
      } else {
        toast.error("Gagal memproses penolakan.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReturn = (ret: VehicleReturn) => {
    setSelectedRequest(ret);
    setReturnModalOpen(true);
  };

  const submitReturn = async (payload: ReturnPayload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ga/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReturnModalOpen(false);
        toast.success("Validasi Fisik Kendaraan berhasil disimpan.");
        await fetchOperationalData();
      } else {
        toast.error("Gagal memproses pengembalian.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitService = async (payload: ServicePayload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ga/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, entryType: "SERVIS" }),
      });

      if (res.ok) {
        setServiceModalOpen(false);
        toast.success("Riwayat Servis berhasil dicatat!");
        await fetchMaintenance();
      } else {
        toast.error("Gagal menyimpan catatan servis.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFuel = async (payload: FuelPayload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ga/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, entryType: "BBM" }),
      });

      if (res.ok) {
        setFuelModalOpen(false);
        toast.success("Pengisian BBM berhasil dicatat!");
        await fetchMaintenance();
      } else {
        toast.error("Gagal menyimpan data pengisian BBM.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // HANDLER UNTUK TAMBAH RUTINITAS BARU
  const handleAddRoutine = () => {
    setSelectedRoutine(null); // Pastikan data kosong saat tambah baru
    setRoutineModalOpen(true);
  };

  // HANDLER UNTUK EDIT RUTINITAS
  const handleEditRoutine = (routine: RoutineSchedule) => {
    setSelectedRoutine(routine); // Masukkan data rutin yang diklik ke state
    setRoutineModalOpen(true);
  };

  // HANDLER SUBMIT RUTINITAS (BISA POST/TAMBAH ATAU PUT/EDIT)
  const submitRoutine = async (payload: RoutinePayload) => {
    setIsSubmitting(true);
    try {
      const isEdit = !!selectedRoutine;
      const method = isEdit ? "PUT" : "POST"; // Jika edit gunakan PUT/PATCH
      
      // Jika edit, sisipkan ID ke dalam payload
      const bodyData = isEdit ? { ...payload, id: selectedRoutine.id } : payload;

      const res = await fetch("/api/ga/routines", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        setRoutineModalOpen(false);
        setSelectedRoutine(null); // Bersihkan state setelah berhasil
        toast.success(`Jadwal Rutin berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`);
        await fetchOperationalData();
      } else {
        toast.error(`Gagal ${isEdit ? "memperbarui" : "menyimpan"} jadwal rutin.`);
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/ga/routines?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Jadwal rutin berhasil dihapus.");
        await fetchOperationalData();
      } else {
        toast.error("Gagal menghapus jadwal rutin.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // 8. RENDER UI UTAMA
  // ==========================================
  return (
    <div className="flex min-h-screen font-sans bg-slate-50 text-slate-800">
      <GaSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingRequests.length}
        returnCount={pendingReturns.length}
      />

      <main className="flex-1 ml-[260px] flex flex-col min-h-screen relative z-0">
        <GaTopbar activeTab={activeTab} />

        <div className="w-full max-w-6xl p-8 mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-32">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full border-indigo-600 animate-spin"></div>
              <p className="font-medium text-sm text-slate-500">
                Menyinkronkan data dengan server...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab
                  pendingCount={pendingRequests.length}
                  returnCount={pendingReturns.length}
                  activities={dashboardActivities}
                  setTab={setActiveTab}
                />
              )}

              {activeTab === "persetujuan" && (
                <ApprovalTab
                  requests={pendingRequests}
                  onApprove={handleApprove}
                  onReject={handleOpenReject}
                  processingId={processingId}
                />
              )}

              {activeTab === "pengembalian" && (
                <ReturnTab
                  returns={pendingReturns}
                  onValidate={handleOpenReturn}
                />
              )}

              {activeTab === "perawatan" && (
                <MaintenanceTab
                  history={historyData}
                  onOpenService={() => setServiceModalOpen(true)}
                  onOpenFuel={() => setFuelModalOpen(true)}
                />
              )}

              {activeTab === "master" && (
                <MasterTab
                  routines={routineSchedules}
                  onAddRoutine={handleAddRoutine}      // Berubah
                  onEditRoutine={handleEditRoutine}    // Ditambahkan
                  onDeleteRoutine={deleteRoutine}
                  processingId={processingId}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* MODALS */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitReject}
        requestData={selectedRequest as VehicleRequest}
        isSubmitting={isSubmitting}
      />

      <ReturnValidationModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSubmit={submitReturn}
        vehicleData={selectedRequest as VehicleReturn}
        isSubmitting={isSubmitting}
      />

      <ServiceFormModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSubmit={submitService}
        vehicles={masterVehicles}
        isSubmitting={isSubmitting}
      />

      <FuelFormModal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        onSubmit={submitFuel}
        vehicles={masterVehicles}
        isSubmitting={isSubmitting}
      />

      <RoutineScheduleFormModal
        isOpen={routineModalOpen}
        onClose={() => {
          setRoutineModalOpen(false);
          setSelectedRoutine(null); // Bersihkan state saat modal ditutup
        }}
        onSubmit={submitRoutine} // Berubah untuk mengakomodir Create/Edit
        vehicles={masterVehicles}
        isSubmitting={isSubmitting}
        initialData={selectedRoutine} // Kirim data jadwal yang sedang diedit
      />
    </div>
  );
}