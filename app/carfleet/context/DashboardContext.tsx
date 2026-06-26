"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "../lib/utils/api";

// --- INTERFACES ---
interface Vehicle {
  id: string;
  name: string;
  platNumber: string;
  capacity: number;
  type: string;
  status: "Tersedia" | "Dipakai" | "Servis";
}

interface RideShare {
  id: string;
  seats: number;
  dropOff: string;
  status: string;
}

interface Package {
  id: string;
  description: string;
  receiver: string;
  status: string;
}

interface Booking {
  id: string;
  userId: string;
  destination: string;
  date: string;
  timeOut: string;
  timeIn: string;
  passengers: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  user: { name: string; phone?: string };
  vehicle?: Vehicle;
  rejectionReason?: string;
  rideShares?: RideShare[];
  packages?: Package[];
}

interface Routine {
  id: string;
  vehicleId: string;
  route: string;
  days: string;
  departure: string;
  status: "ACTIVE" | "INACTIVE";
  vehicle?: { name: string; platNumber: string };
  user?: { name: string };
}

export interface RideSharePending {
  id: string;
  seats: number;
  dropOff: string;
  status: string;
  user?: { name: string };
  booking?: {
    destination: string;
    date: string | Date;
    vehicle?: { name: string; platNumber: string };
  };
}

export interface PackagePending {
  id: string;
  description: string;
  receiver: string;
  status: string;
  user?: { name: string };
  booking?: {
    destination: string;
    date: string | Date;
    vehicle?: { name: string; platNumber: string };
  };
}

interface DashboardContextType {
  persetujuan: Booking[];
  pengembalian: Booking[];
  kendaraan: Vehicle[];
  rutin: Routine[];
  isLoading: boolean;

  allBookings: Booking[];
  bookingDetail: Booking | null;
  isDetailLoading: boolean;

  refreshAllData: () => Promise<void>;
  approveBooking: (id: string, vehicleId: string) => Promise<void>;
  rejectBooking: (id: string, reason: string) => Promise<void>;
  returnVehicle: (id: string, actualTimeIn: string) => Promise<void>;
  addVehicle: (data: Omit<Vehicle, "id" | "status">) => Promise<void>;
  addRoutine: (
    data: Omit<Routine, "id" | "status" | "vehicle" | "user">,
  ) => Promise<void>;
  toggleRoutine: (id: string) => Promise<void>;

  startService: (
    vehicleId: string,
    date: string,
    complaint: string,
  ) => Promise<void>;
  fetchAllBookings: () => Promise<void>;
  fetchBookingDetail: (id: string) => Promise<void>;
  clearBookingDetail: () => void;

  completeService: (
    logId: string,
    data: {
      kilometer: number;
      cost: number;
      description: string;
      type: string;
    },
  ) => Promise<void>;

  persetujuanNebeng: RideSharePending[];
  persetujuanTitipan: PackagePending[];
  approveRideShare: (id: string) => Promise<void>;
  rejectRideShare: (id: string, reason: string) => Promise<void>;
  approvePackage: (id: string) => Promise<void>;
  rejectPackage: (id: string, reason: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [persetujuan, setPersetujuan] = useState<Booking[]>([]);
  const [pengembalian, setPengembalian] = useState<Booking[]>([]);
  const [kendaraan, setKendaraan] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rutin, setRutin] = useState<Routine[]>([]);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [bookingDetail, setBookingDetail] = useState<Booking | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  const [persetujuanNebeng, setPersetujuanNebeng] = useState<
    RideSharePending[]
  >([]);
  const [persetujuanTitipan, setPersetujuanTitipan] = useState<
    PackagePending[]
  >([]);

  // ✨ getAuthHeaders() SUDAH DIHAPUS KARENA TIDAK PERLU LAGI

  const refreshAllData = async () => {
    try {
      setIsLoading(true);

      // ✨ Hapus prefix /api dan buang pengiriman header manual
      const [
        allBookingsData,
        vehicleData,
        routineData,
        nebengData,
        titipanData,
      ] = await Promise.all([
        apiFetch("/admin/bookings/all"),
        apiFetch("/v1/vehicles"),
        apiFetch("/v1/vehicles"), // Note: ini sepertinya salah panggil di kode asli Anda, harusnya routine? (Lihat catatan di bawah)
        apiFetch("/admin/bookings/rideshares/pending"),
        apiFetch("/admin/bookings/packages/pending"),
      ]);

      const pendingData =
        allBookingsData?.filter((b: Booking) => b.status === "PENDING") || [];
      const activeData =
        allBookingsData?.filter((b: Booking) => b.status === "APPROVED") || [];

      setPersetujuan(pendingData);
      setPengembalian(activeData);
      setKendaraan(vehicleData || []);
      setRutin(routineData || []);
      setPersetujuanNebeng(nebengData || []);
      setPersetujuanTitipan(titipanData || []);
    } catch (error) {
      console.error("Gagal mengambil data GA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // ==========================================
  // FUNGSI AKSI ARMADA UTAMA & KENDARAAN
  // ==========================================
  const approveBooking = async (id: string, vehicleId: string) => {
    await apiFetch(`/admin/bookings/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ vehicleId }),
    });
    await refreshAllData();
  };

  const rejectBooking = async (id: string, reason: string) => {
    await apiFetch(`/admin/bookings/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    await refreshAllData();
  };

  const returnVehicle = async (id: string, actualTimeIn: string) => {
    await apiFetch(`/admin/bookings/${id}/return`, {
      method: "PATCH",
      body: JSON.stringify({ actualTimeIn }),
    });
    await refreshAllData();
  };

  const addVehicle = async (data: Omit<Vehicle, "id" | "status">) => {
    await apiFetch("/v1/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await refreshAllData();
  };

  const addRoutine = async (
    data: Omit<Routine, "id" | "status" | "vehicle" | "user">,
  ) => {
    await apiFetch("/v1/routines", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await refreshAllData();
  };

  const toggleRoutine = async (id: string) => {
    await apiFetch(`/v1/routines/${id}/toggle`, {
      method: "PATCH",
    });
    await refreshAllData();
  };

  const startService = async (
    vehicleId: string,
    date: string,
    complaint: string,
  ) => {
    await apiFetch(`/v1/vehicles/${vehicleId}/service`, {
      method: "PATCH",
      body: JSON.stringify({ date, complaint }),
    });
    await refreshAllData();
  };

  const completeService = async (
    logId: string,
    data: {
      kilometer: number;
      cost: number;
      description: string;
      type: string;
    },
  ) => {
    await apiFetch(`/v1/vehicles/${logId}/complete-service`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    await refreshAllData();
  };

  // ==========================================
  // FUNGSI AKSI: NEBENG & TITIPAN
  // ==========================================
  const approveRideShare = async (id: string) => {
    await apiFetch(`/admin/bookings/rideshares/${id}/approve`, {
      method: "PATCH",
    });
    await refreshAllData();
  };

  const rejectRideShare = async (id: string, reason: string) => {
    await apiFetch(`/admin/bookings/rideshares/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    await refreshAllData();
  };

  const approvePackage = async (id: string) => {
    await apiFetch(`/admin/bookings/packages/${id}/approve`, {
      method: "PATCH",
    });
    await refreshAllData();
  };

  const rejectPackage = async (id: string, reason: string) => {
    await apiFetch(`/admin/bookings/packages/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    await refreshAllData();
  };

  // ==========================================
  // FUNGSI DETAIL / MODAL
  // ==========================================
  const fetchAllBookings = async () => {
    try {
      setIsDetailLoading(true);
      const data = await apiFetch("/admin/bookings/all");
      setAllBookings(data || []);
    } catch (error) {
      console.error("Gagal mengambil semua histori permohonan:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const fetchBookingDetail = async (id: string) => {
    try {
      setIsDetailLoading(true);
      const data = await apiFetch(`/admin/bookings/${id}`);
      setBookingDetail(data);
    } catch (error) {
      console.error(`Gagal mengambil detail booking ID ${id}:`, error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const clearBookingDetail = () => {
    setBookingDetail(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        persetujuan,
        pengembalian,
        kendaraan,
        rutin,
        isLoading,
        allBookings,
        bookingDetail,
        isDetailLoading,
        persetujuanNebeng,
        persetujuanTitipan,
        refreshAllData,
        approveBooking,
        rejectBooking,
        returnVehicle,
        addVehicle,
        addRoutine,
        toggleRoutine,
        startService,
        completeService,
        fetchAllBookings,
        fetchBookingDetail,
        clearBookingDetail,
        approveRideShare,
        rejectRideShare,
        approvePackage,
        rejectPackage,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}
