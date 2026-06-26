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

// Tipe data untuk Armada dari Backend
interface VehicleData {
  id: string | number;
  name: string;
  type?: string;
  licensePlate?: string;
  capacity?: number;
}

interface BookingData {
  vehicleId: string | number; // Menggunakan ID dinamis dari backend
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

  // State Data
  vehicles: VehicleData[]; // ✨ State baru untuk daftar mobil
  myBookings: any[];
  myRideShares: any[];
  myPackages: any[];
  availableRides: any[];

  // Fungsi Baru untuk Armada
  fetchVehicles: () => Promise<void>; // ✨ Fungsi fetch baru

  // Fungsi Peminjaman (Sewa Armada)
  fetchMyBookings: () => Promise<void>;
  submitBooking: (data: BookingData) => Promise<boolean>;

  // Fungsi Nebeng (Ride Share)
  fetchMyRideShares: () => Promise<void>;
  submitRideShare: (data: RideShareData) => Promise<boolean>;

  // Fungsi Titip Barang (Package)
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

  const [vehicles, setVehicles] = useState<VehicleData[]>([]); // ✨ State untuk mobil
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myRideShares, setMyRideShares] = useState<any[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // Helper untuk mengambil token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // --- O. FUNGSI AMBIL DAFTAR ARMADA MOBIL ---
  const fetchVehicles = useCallback(async () => {
    try {
      // ✨ Mengarah ke endpoint kendaraan NestJS Anda
      const data = await apiFetch("/api/v1/vehicles", {
        headers: getAuthHeaders(),
      });
      setVehicles(data);
    } catch (error: any) {
      console.error("Gagal mengambil daftar kendaraan:", error.message);
    }
  }, []);

  // --- A. FUNGSI BOOKING (SEWA ARMADA) ---
  const fetchMyBookings = useCallback(async () => {
    try {
      const data = await apiFetch("/api/bookings/my-status", {
        headers: getAuthHeaders(),
      });
      setMyBookings(data);
    } catch (error: any) {
      console.error("Gagal mengambil status booking:", error.message);
    }
  }, []);

  const submitBooking = async (data: BookingData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      await fetchMyBookings(); // Refresh list otomatis
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
      const data = await apiFetch("/api/bookings/my-rideshares", {
        headers: getAuthHeaders(),
      });
      setMyRideShares(data);
    } catch (error: any) {
      console.error("Gagal mengambil status nebeng:", error.message);
    }
  }, []);

  const submitRideShare = async (data: RideShareData) => {
    setIsLoading(true);
    try {
      await apiFetch(`/api/bookings/${data.bookingId}/rideshare`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ dropOff: data.dropOff, seats: data.seats }),
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
      const data = await apiFetch("/api/bookings/my-packages", {
        headers: getAuthHeaders(),
      });
      setMyPackages(data);
    } catch (error: any) {
      console.error("Gagal mengambil status titip barang:", error.message);
    }
  }, []);

  const submitPackage = async (data: PackageData) => {
    setIsLoading(true);
    try {
      await apiFetch(`/api/bookings/${data.bookingId}/package`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
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
      const data = await apiFetch("/api/bookings/available-rides", {
        headers: getAuthHeaders(),
      });
      setAvailableRides(data);
    } catch (error: any) {
      console.error("Gagal mengambil jadwal:", error.message);
    }
  }, []);

  return (
    <UserBookingContext.Provider
      value={{
        isLoading,
        vehicles, // ✨ Diekspos ke komponen
        fetchVehicles, // ✨ Diekspos ke komponen
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
