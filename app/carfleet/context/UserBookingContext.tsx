"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { apiFetch } from "../lib/utils/api";

// ==========================================
// 1. TIPE DATA FORM & STATE
// ==========================================

interface VehicleData {
  id: string | number;
  name: string;
  type?: string;
  licensePlate?: string;
  capacity?: number;
  status?: string;
  platNumber?: string;
}

interface BookingData {
  vehicleId: string | number;
  picName: string;
  contactNumber: string;
  driverName: string;
  purpose: string;
  destination: string;
  date: string;
  timeOut: string;
  timeIn: string;
  passengers: number;
}

interface RideShareData {
  bookingId: string;
  dropOff: string;
  seats: number;
}

// ✨ Tipe Data Baru Untuk Jadwal Rutin
interface RoutineData {
  id: string;
  vehicleId: string;
  route: string;
  days: string;
  departure: string;
  returnTime?: string;
  status: string;
}

// ==========================================
// 2. DEFINISI ISI CONTEXT (TypeScript Interface)
// ==========================================

interface UserBookingContextType {
  isLoading: boolean;
  vehicles: VehicleData[];
  myBookings: any[];
  myRideShares: any[];
  availableRides: any[];

  // ✨ WAJIB ADA AGAR TYPESCRIPT TIDAK ERROR
  routines: RoutineData[];
  fetchRoutines: () => Promise<void>;

  fetchVehicles: () => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  submitBooking: (data: BookingData) => Promise<boolean>;
  fetchMyRideShares: () => Promise<void>;
  submitRideShare: (data: RideShareData) => Promise<boolean>;
  fetchAvailableRides: () => Promise<void>;
}

const UserBookingContext = createContext<UserBookingContextType | undefined>(
  undefined,
);

// ==========================================
// 3. PROVIDER COMPONENT
// ==========================================

export function UserBookingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myRideShares, setMyRideShares] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // ✨ State untuk routines
  const [routines, setRoutines] = useState<RoutineData[]>([]);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await apiFetch("/v1/vehicles");
      setVehicles(data);
    } catch (error: any) {
      console.error("Gagal mengambil daftar kendaraan:", error.message);
    }
  }, []);

  // ✨ Fungsi untuk fetch routines
  const fetchRoutines = useCallback(async () => {
    try {
      const data = await apiFetch("/v1/routines");
      const activeRoutines = (data || []).filter(
        (r: any) => r.status === "ACTIVE",
      );
      setRoutines(activeRoutines);
    } catch (error: any) {
      console.error("Gagal mengambil daftar rutinitas:", error.message);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    try {
      const data = await apiFetch("/bookings/my-status");
      setMyBookings(data);
    } catch (error: any) {
      console.error("Gagal mengambil status booking:", error.message);
    }
  }, []);

  const submitBooking = async (data: BookingData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiFetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchMyBookings();
      return true;
    } catch (error: any) {
      console.error("Gagal submit booking:", error.message);
      alert(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyRideShares = useCallback(async () => {
    try {
      const data = await apiFetch("/ride-shares/my-status");
      setMyRideShares(data);
    } catch (error: any) {
      console.error("Gagal mengambil status nebeng:", error.message);
    }
  }, []);

  const submitRideShare = async (data: RideShareData) => {
    setIsLoading(true);
    try {
      await apiFetch(`/ride-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.bookingId,
          dropOff: data.dropOff,
          seats: data.seats,
        }),
      });
      await fetchMyRideShares();
      return true;
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal mengirim permohonan nebeng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRides = useCallback(async () => {
    try {
      const data = await apiFetch("/bookings/available");
      setAvailableRides(data);
    } catch (error: any) {
      console.error("Gagal mengambil jadwal:", error.message);
    }
  }, []);

  return (
    <UserBookingContext.Provider
      value={{
        isLoading,
        vehicles,
        fetchVehicles,
        myBookings,
        myRideShares,
        submitBooking,
        fetchMyBookings,
        submitRideShare,
        fetchMyRideShares,
        availableRides,
        fetchAvailableRides,

        // ✨ Wajib diekspor agar bisa ditangkap oleh view
        routines,
        fetchRoutines,
      }}
    >
      {children}
    </UserBookingContext.Provider>
  );
}

// ==========================================
// 4. CUSTOM HOOK
// ==========================================

export function useUserBooking() {
  const context = useContext(UserBookingContext);
  if (!context)
    throw new Error(
      "useUserBooking harus digunakan di dalam UserBookingProvider",
    );
  return context;
}
