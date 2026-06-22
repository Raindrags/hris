// src/context/DashboardContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../lib/utils/api';

// Definisikan tipe data sesuai dengan Schema Prisma & UI Anda
interface Vehicle {
  id: string;
  name: string;
  platNumber: string;
  capacity: number;
  type: string;
  status: 'Tersedia' | 'Dipakai' | 'Servis';
}

interface Booking {
  id: string;
  userId: string;
  destination: string;
  date: string;
  timeOut: string;
  timeIn: string;
  passengers: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  user: { name: string; phone?: string };
  vehicle?: Vehicle;
}

interface DashboardContextType {
  persetujuan: Booking[];
  pengembalian: Booking[];
  kendaraan: Vehicle[];
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
  approveBooking: (id: string, vehicleId: string) => Promise<void>;
  rejectBooking: (id: string, reason: string) => Promise<void>;
  returnVehicle: (id: string, actualTimeIn: string) => Promise<void>;
  addVehicle: (data: Omit<Vehicle, 'id' | 'status'>) => Promise<void>;
  rutin: Routine[];
  addRoutine: (data: Omit<Routine, 'id' | 'status' | 'vehicle' | 'user'>) => Promise<void>;
  toggleRoutine: (id: string) => Promise<void>;
}
interface Routine {
  id: string;
  vehicleId: string;
  route: string;
  days: string;
  departure: string;
  status: 'ACTIVE' | 'INACTIVE';
  vehicle?: { name: string; platNumber: string };
  user?: { name: string };
}

interface DashboardStats {
  stats: {
    pendingApprovals: number;
    activeReturns: number;
    availableVehicles: number;
    vehiclesInMaintenance: number;
  };
  upcomingActivities: Array<{
    id: string;
    destination: string;
    date: string;
    timeOut: string;
    timeIn: string;
    user: { name: string };
    vehicle: { name: string };
  }>;
}


const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [persetujuan, setPersetujuan] = useState<Booking[]>([]);
  const [pengembalian, setPengembalian] = useState<Booking[]>([]);
  const [kendaraan, setKendaraan] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rutin, setRutin] = useState<Routine[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);

  // Fungsi untuk menarik semua data terbaru dari Backend
  const refreshAllData = async () => {
    try {
      setIsLoading(true);
      const [pendingData, activeData, vehicleData,routineData] = await Promise.all([
        apiFetch('/api/v1/bookings/pending'),
        apiFetch('/api/v1/bookings/active'),
        apiFetch('/api/v1/vehicles'),
        apiFetch('/api/v1/routines'),
      ]);

      setPersetujuan(pendingData);
      setPengembalian(activeData);
      setKendaraan(vehicleData);
      setRutin(routineData);
    } catch (error) {
      console.error('Gagal mengambil data GA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data pertama kali saat aplikasi dibuka
  useEffect(() => {
    refreshAllData();
  }, []);

  // --- FUNGSI AKSI (MUTASI DATA KE BACKEND) ---

  const approveBooking = async (id: string, vehicleId: string) => {
    await apiFetch(`/api/v1/bookings/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicleId }),
    });
    await refreshAllData(); // Otomatis sync ulang state, badge di sidebar ikut berkurang!
  };

  const rejectBooking = async (id: string, reason: string) => {
    await apiFetch(`/api/v1/bookings/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    await refreshAllData();
  };

  const returnVehicle = async (id: string, actualTimeIn: string) => {
    await apiFetch(`/api/v1/bookings/${id}/return`, {
      method: 'PATCH',
      body: JSON.stringify({ actualTimeIn }),
    });
    await refreshAllData();
  };

  const addVehicle = async (data: Omit<Vehicle, 'id' | 'status'>) => {
    await apiFetch('/api/v1/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await refreshAllData();
  };

  // Tambahkan 2 fungsi ini di dalam DashboardProvider


  const startService = async (vehicleId: string, expectedDate: string, complaint: string) => {
    await apiFetch('/api/v1/maintenance/service/start', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, date: expectedDate, complaint }),
    });
    await refreshAllData(); 
  };

  const completeService = async (logId: string, data: { kilometer: number; cost: number; description: string; type: 'SERVIS' | 'BBM' }) => {
    await apiFetch(`/api/v1/maintenance/service/${logId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await refreshAllData(); 
  };

  const addRoutine = async (data: any) => {
    await apiFetch('/api/v1/routines', { method: 'POST', body: JSON.stringify(data) });
    await refreshAllData();
  };

  const toggleRoutine = async (id: string) => {
    await apiFetch(`/api/v1/routines/${id}/toggle`, { method: 'PATCH' });
    await refreshAllData(); 
  };

  const fetchDashboardStats = async () => {
    try {
      const data = await apiFetch('/api/v1/dashboard/stats');
      setDashboardData(data);
    } catch (error) {
      console.error('Gagal memuat statistik dashboard:', error);
    }
  };


  return (
    <DashboardContext.Provider
      value={{
        persetujuan,
        pengembalian,
        kendaraan,
        rutin,           
        isLoading,
        refreshAllData,
        approveBooking,
        rejectBooking,
        returnVehicle,
        addVehicle,
        addRoutine,      
        toggleRoutine,   
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}