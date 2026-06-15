"use client";

import { useState, useEffect } from "react";
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
  VehicleFormModal,
} from "./GaModal";

export default function GaDashboardView() {
  // ==========================================
  // 1. STATE NAVIGASI TAB & LOADING
  // ==========================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 2. STATE KONTROL MODAL (Pop-up)
  // ==========================================
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // ==========================================
  // 3. STATE DATA BACKEND (Dikosongkan di awal)
  // ==========================================
  const [masterVehicles, setMasterVehicles] = useState<any[]>([]);
  const [routineSchedules, setRoutineSchedules] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingReturns, setPendingReturns] = useState<any[]>([]);
  const [dashboardActivities, setDashboardActivities] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // ==========================================
  // 4. LOGIKA AMBIL DATA (READ)
  // ==========================================
  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/ga/vehicles");
      if (res.ok) setMasterVehicles(await res.json());
    } catch (err) {
      console.error("Gagal menarik data master kendaraan:", err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await fetch("/api/ga/maintenance");
      if (res.ok) setHistoryData(await res.json());
    } catch (err) {
      console.error("Gagal menarik data perawatan:", err);
    }
  };

  const fetchOperationalData = async () => {
    try {
      const [resRoutines, resRequests, resReturns, resActivities] =
        await Promise.all([
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
  };

  // Muat semua data saat komponen pertama kali di-render
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
  }, []);

  // ==========================================
  // 5. LOGIKA HANDLER (AKSI MUTASI API)
  // ==========================================

  // --- Handler Peminjaman ---
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/ga/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "APPROVE" }),
      });

      if (res.ok) {
        toast.success("Peminjaman disetujui! Notifikasi WA terkirim.");
        fetchOperationalData(); // Segarkan data
      } else {
        toast.error("Gagal menyetujui peminjaman.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  const handleOpenReject = (req: any) => {
    setSelectedRequest(req);
    setRejectModalOpen(true);
  };

  const submitReject = async (id: string, reason: string) => {
    try {
      const res = await fetch("/api/ga/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "REJECT", reason }),
      });

      if (res.ok) {
        setRejectModalOpen(false);
        toast.error("Peminjaman ditolak. Alasan terkirim ke WhatsApp.");
        fetchOperationalData();
      } else {
        toast.error("Gagal memproses penolakan.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  // --- Handler Pengembalian ---
  const handleOpenReturn = (ret: any) => {
    setSelectedRequest(ret);
    setReturnModalOpen(true);
  };

  const submitReturn = async (payload: any) => {
    try {
      const res = await fetch("/api/ga/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReturnModalOpen(false);
        toast.success("Validasi Fisik Kendaraan berhasil disimpan.");
        fetchOperationalData();
      } else {
        toast.error("Gagal memproses pengembalian.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  // --- Handler Servis & BBM ---
  const submitService = async (payload: any) => {
    try {
      const res = await fetch("/api/ga/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, entryType: "SERVIS" }),
      });

      if (res.ok) {
        setServiceModalOpen(false);
        toast.success("Riwayat Servis berhasil dicatat!");
        fetchMaintenance();
      } else {
        toast.error("Gagal menyimpan catatan servis.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  const submitFuel = async (payload: any) => {
    try {
      const res = await fetch("/api/ga/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, entryType: "BBM" }),
      });

      if (res.ok) {
        setFuelModalOpen(false);
        toast.success("Pengisian BBM berhasil dicatat!");
        fetchMaintenance();
      } else {
        toast.error("Gagal menyimpan data pengisian BBM.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  // --- Handler Master Data (Kendaraan & Jadwal) ---
  const submitAddVehicle = async (payload: any) => {
    try {
      const res = await fetch("/api/ga/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setVehicleModalOpen(false);
        toast.success("Kendaraan baru berhasil ditambahkan!");
        fetchVehicles();
      } else {
        toast.error("Gagal menyimpan kendaraan baru.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kendaraan ini?")) return;
    try {
      const res = await fetch(`/api/ga/vehicles?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Kendaraan berhasil dihapus.");
        fetchVehicles();
      } else {
        toast.error("Gagal menghapus data kendaraan.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  const submitAddRoutine = async (payload: any) => {
    try {
      const res = await fetch("/api/ga/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRoutineModalOpen(false);
        toast.success("Jadwal Rutin berhasil ditambahkan!");
        fetchOperationalData();
      } else {
        toast.error("Gagal menyimpan jadwal rutin.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const res = await fetch(`/api/ga/routines?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Jadwal rutin berhasil dihapus.");
        fetchOperationalData();
      } else {
        toast.error("Gagal menghapus jadwal rutin.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi server.");
    }
  };

  // ==========================================
  // 6. RENDER UI UTAMA
  // ==========================================
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR COMPONENT */}
      <GaSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingRequests.length}
        returnCount={pendingReturns.length}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-[260px] flex flex-col min-h-screen relative z-0">
        {/* TOPBAR COMPONENT */}
        <GaTopbar activeTab={activeTab} />

        {/* KONTEN TAB DINAMIS */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium text-sm">
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
                  vehicles={masterVehicles}
                  routines={routineSchedules}
                  onAddVehicle={() => setVehicleModalOpen(true)}
                  onAddRoutine={() => setRoutineModalOpen(true)}
                  onDeleteVehicle={deleteVehicle}
                  onDeleteRoutine={deleteRoutine}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* ==========================================
          RENDER SEMUA MODAL (Di Root Level)
          ========================================== */}

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitReject}
        requestData={selectedRequest}
      />

      <ReturnValidationModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSubmit={submitReturn}
        vehicleData={selectedRequest}
      />

      <ServiceFormModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSubmit={submitService}
        vehicles={masterVehicles}
      />

      <FuelFormModal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        onSubmit={submitFuel}
        vehicles={masterVehicles}
      />

      <VehicleFormModal
        isOpen={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        onSubmit={submitAddVehicle}
      />

      <RoutineScheduleFormModal
        isOpen={routineModalOpen}
        onClose={() => setRoutineModalOpen(false)}
        onSubmit={submitAddRoutine}
        vehicles={masterVehicles}
      />
    </div>
  );
}
