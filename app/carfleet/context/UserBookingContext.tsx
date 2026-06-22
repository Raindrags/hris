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

// Tipe untuk Peminjaman (Booking)
interface BookingData {
  vehicleId?: string;
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

// Tipe untuk Nebeng (Ride Share)
interface RideShareData {
  bookingId: string;
  dropOff: string;
  seats: number;
}

// Tipe untuk Titip Barang (Package)
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
  myBookings: any[];
  myRideShares: any[];
  myPackages: any[];
  availableRides: any[];

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

  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myRideShares, setMyRideShares] = useState<any[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // Helper untuk mengambil token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

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
      const data = await apiFetch("/api/ride-shares/my-status", {
        headers: getAuthHeaders(),
      });
      setMyRideShares(data);
    } catch (error: any) {
      console.error("Gagal mengambil status nebeng:", error.message);
    }
  }, []);

  const submitRideShare = async (data: RideShareData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiFetch("/api/ride-shares", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      await fetchMyRideShares(); // Refresh list otomatis
      return true;
    } catch (error: any) {
      console.error("Gagal submit nebeng:", error.message);
      alert(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --- C. FUNGSI TITIP BARANG (PACKAGE) ---
  const fetchMyPackages = useCallback(async () => {
    try {
      const data = await apiFetch("/api/packages/my-status", {
        headers: getAuthHeaders(),
      });
      setMyPackages(data);
    } catch (error: any) {
      console.error("Gagal mengambil status titip barang:", error.message);
    }
  }, []);

  const submitPackage = async (data: PackageData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiFetch("/api/packages", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      await fetchMyPackages(); // Refresh list otomatis
      return true;
    } catch (error: any) {
      console.error("Gagal submit titipan:", error.message);
      alert(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAvailableRides = useCallback(async () => {
    try {
      // API ini mengarah ke endpoint publik/user untuk melihat booking dengan status 'APPROVED'
      const data = await apiFetch("/api/bookings/available", {
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
