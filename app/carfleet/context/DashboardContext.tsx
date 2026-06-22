// src/context/DashboardContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { mockKendaraan, mockPengembalian, mockPersetujuan } from "../admin/lib/mockdata";
// Tambahkan mockKendaraan ke dalam import

interface DashboardContextType {
  persetujuan: typeof mockPersetujuan;
  setPersetujuan: React.Dispatch<React.SetStateAction<typeof mockPersetujuan>>;
  
  pengembalian: typeof mockPengembalian;
  setPengembalian: React.Dispatch<React.SetStateAction<typeof mockPengembalian>>;
  
  // Tambahkan State untuk Kendaraan
  kendaraan: typeof mockKendaraan;
  setKendaraan: React.Dispatch<React.SetStateAction<typeof mockKendaraan>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [persetujuan, setPersetujuan] = useState(mockPersetujuan);
  const [pengembalian, setPengembalian] = useState(mockPengembalian);
  const [kendaraan, setKendaraan] = useState(mockKendaraan); // State Kendaraan

  return (
    <DashboardContext.Provider value={{ 
      persetujuan, setPersetujuan, 
      pengembalian, setPengembalian,
      kendaraan, setKendaraan // Expose state kendaraan
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard harus digunakan di dalam DashboardProvider");
  }
  return context;
}