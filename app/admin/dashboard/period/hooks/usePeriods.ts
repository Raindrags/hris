"use client";

import { useState, useEffect, useCallback } from "react";
import { AttendancePeriod, PeriodActionType, PeriodFormData } from "../types";
import { PERIODS_API_URL } from "../constants";

export function usePeriods() {
  const [periods, setPeriods] = useState<AttendancePeriod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State untuk Dialog Form Create & Edit
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ✨ Tambah state ini
  const [formData, setFormData] = useState<PeriodFormData>({
    name: "",
    startDate: undefined,
    endDate: undefined,
  });

  // State untuk Alert Konfirmasi
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<PeriodActionType | "delete" | null>(null); // ✨ Tambah opsi delete
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(PERIODS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
      }
    } catch (error) {
      console.error("Gagal memuat data periode:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // ✨ FUNGSI BUKA MODAL EDIT
  const openEditModal = (period: AttendancePeriod) => {
    setEditingId(period.id);
    setFormData({
      name: period.name,
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
    });
    setIsDialogOpen(true);
  };

  // ✨ FUNGSI RESET FORM (Bisa dipanggil saat modal ditutup)
  const resetForm = () => {
    setFormData({ name: "", startDate: undefined, endDate: undefined });
    setEditingId(null);
  };

  // FUNGSI CREATE
  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) return;

    setSubmitLoading(true);
    try {
      const res = await fetch(PERIODS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchPeriods();
      }
    } catch (error) {
      console.error("Gagal membuat periode:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✨ FUNGSI UPDATE
  const handleUpdatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !editingId) return;

    setSubmitLoading(true);
    try {
      // Asumsi endpoint update adalah /api/periods/:id
      const res = await fetch(`${PERIODS_API_URL}/${editingId}`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchPeriods();
      }
    } catch (error) {
      console.error("Gagal mengupdate periode:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Memicu Alert (Bisa untuk Active, Close, atau Delete)
  const triggerActionConfirmation = (id: string, type: PeriodActionType | "delete") => {
    setSelectedPeriodId(id);
    setAlertType(type);
    setAlertOpen(true);
  };

  // Eksekusi aksi yang ada di Alert
const executeAction = async () => {
    if (!selectedPeriodId || !alertType) return;

    try {
      let res;
      
      // ✨ PERBAIKAN DI SINI: Gunakan toLowerCase() agar "DELETE" atau "delete" tetap terbaca
      if (alertType.toLowerCase() === "delete") {
        res = await fetch(`${PERIODS_API_URL}/${selectedPeriodId}`, {
          method: "DELETE", // Method HTTP DELETE
        });
      } else {
        // Aksi selain hapus (active / close)
        const endpoint = `${PERIODS_API_URL}/${selectedPeriodId}/${alertType}`;
        res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (res.ok) {
        fetchPeriods();
      }
    } catch (error) {
      console.error(`Gagal melakukan aksi ${alertType}:`, error);
    } finally {
      setAlertOpen(false);
      setSelectedPeriodId(null);
      setAlertType(null);
    }
  };

  return {
    states: {
      periods,
      loading,
      isDialogOpen,
      submitLoading,
      formData,
      alertOpen,
      alertType,
      editingId, // ✨ Pastikan diekspor agar terbaca di page.tsx
    },
    actions: {
      setIsDialogOpen,
      setFormData,
      handleCreatePeriod,
      handleUpdatePeriod, // ✨ Pastikan diekspor
      openEditModal,      // ✨ Pastikan diekspor
      setAlertOpen,
      triggerActionConfirmation,
      executeAction,
      setSelectedPeriodId,
      resetForm,          // ✨ Opsional, berguna jika modal di-cancel/close
    },
  };
}