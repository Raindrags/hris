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

interface PackageData {
  bookingId: string;
  description: string;
  receiver: string;
}

// ==========================================
// 2. DEFINISI ISI CONTEXT
// ==========================================

interface UserBookingContextType {
  isLoading: boolean;
  vehicles: VehicleData[];
  myBookings: any[];
  myRideShares: any[];
  myPackages: any[];
  availableRides: any[];

  fetchVehicles: () => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  submitBooking: (data: BookingData) => Promise<boolean>;
  fetchMyRideShares: () => Promise<void>;
  submitRideShare: (data: RideShareData) => Promise<boolean>;
  fetchMyPackages: () => Promise<void>;
  submitPackage: (data: PackageData) => Promise<boolean>;
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
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // --- O. FUNGSI AMBIL DAFTAR ARMADA MOBIL ---
  const fetchVehicles = useCallback(async () => {
    try {
      const data = await apiFetch("/v1/vehicles"); // Biarkan jika memang ini URL-nya
      setVehicles(data);
    } catch (error: any) {
      console.error("Gagal mengambil daftar kendaraan:", error.message);
    }
  }, []);

  // --- A. FUNGSI BOOKING (SEWA ARMADA) ---
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

  // --- B. FUNGSI NEBENG (RIDE SHARE) ---
  const fetchMyRideShares = useCallback(async () => {
    try {
      // ✨ URL sudah disesuaikan dengan Controller
     const data = await apiFetch("/ride-shares/my-status");
      setMyRideShares(data);
    } catch (error: any) {
      console.error("Gagal mengambil status nebeng:", error.message);
    }
  }, []);

  const submitRideShare = async (data: RideShareData) => {
    setIsLoading(true);
    try {
      // ✨ URL disesuaikan, dan bookingId dilempar ke body
      await apiFetch(`/ride-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: data.bookingId, 
          dropOff: data.dropOff, 
          seats: data.seats 
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

  // --- C. FUNGSI TITIP BARANG (PACKAGE) ---
  const fetchMyPackages = useCallback(async () => {
    try {
      // ✨ URL sudah disesuaikan dengan Controller
      const data = await apiFetch("/packages/my-status");
      setMyPackages(data);
    } catch (error: any) {
      console.error("Gagal mengambil status titip barang:", error.message);
    }
  }, []);

  const submitPackage = async (data: PackageData) => {
    setIsLoading(true);
    try {
      // ✨ URL disesuaikan, dan bookingId dilempar ke body
     await apiFetch(`/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.bookingId,
          description: data.description,
          receiver: data.receiver,
        }),
      });
      await fetchMyPackages();
      return true;
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal mengirim permohonan titipan");
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
        myPackages,
        submitBooking,
        fetchMyBookings,
        submitRideShare,
        fetchMyRideShares,
        submitPackage,
        fetchMyPackages,
        availableRides,
        fetchAvailableRides,
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