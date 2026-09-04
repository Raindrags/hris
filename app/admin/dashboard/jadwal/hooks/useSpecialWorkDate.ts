// app/admin/pengaturan-jadwal/hooks/useSpecialWorkDate.ts

import { useState, useCallback } from "react";
import { SpecialWorkDate, SpecialWorkDateFormState } from "../types";
import {
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
} from "@/app/actions/jadwal-action";

// Pembersih format tanggal otomatis untuk UI
const formatToInputDate = (dateInput: any): string => {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export function useSpecialWorkDate() {
  const [specialDates, setSpecialDates] = useState<SpecialWorkDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<SpecialWorkDateFormState>({
    name: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSpecialWorkDates();
      if (res?.success) {
        setSpecialDates(res.data || []);
        console.log(
          "FETCH DATA: Berhasil memuat data hari kerja khusus.",
          res.data,
        );
      } else {
        console.log("FETCH DATA GAGAL:", res?.error || "Gagal memuat data");
      }
    } catch (error) {
      console.log("FETCH DATA CRASH:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormState({
      name: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm((prev) => {
      if (!prev) resetForm();
      return !prev;
    });
  }, [resetForm]);

  // =========================================================================
  // FIX CRITICAL: Mengonversi "" Menjadi null Agar Diterima Database Backend
  // =========================================================================
  const handleSave = async () => {
    console.log("=== BERHASIL KLIK TOMBOL SIMPAN ===");
    console.log("Data mentah dari Form State:", formState);

    // Validasi dasar frontend untuk kolom wajib
    if (!formState.name.trim() || !formState.startDate || !formState.endDate) {
      console.log(
        "VALIDASI FRONTEND GAGAL: Nama, Tanggal Mulai, atau Tanggal Selesai wajib diisi!",
      );
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formState.name.trim(),
        startDate: formState.startDate,
        endDate: formState.endDate,
        startTime:
          formState.startTime && formState.startTime.trim() !== ""
            ? formState.startTime
            : null,
        endTime:
          formState.endTime && formState.endTime.trim() !== ""
            ? formState.endTime
            : null,
      };

      console.log("Payload FINAL dikirim ke Server Action:", payload);

      const res = editingId
        ? await updateSpecialWorkDate(editingId, payload)
        : await createSpecialWorkDate(payload);

      console.log("RESPON BALASAN DARI SERVER ACTION:", res);

      if (res && (res.success || res.id)) {
        console.log("DATABASE SAKSES: Data berhasil disimpan/diperbarui.");
        setShowForm(false);
        resetForm();
        await fetchData();
      } else {
        console.log(
          "DATABASE GAGAL MENYIMPAN:",
          res?.error || "Unknown Server Error",
        );
      }
    } catch (error) {
      console.log("FATAL ERROR (CRASH DI FRONTEND JALUR HANDLE SAVE):", error);
    } finally {
      setIsLoading(false);
      console.log("=== PROSES SIMPAN SELESAI, LOADING DISABLED REOPENED ===");
    }
  };
  // =========================================================================

  const handleEdit = (data: SpecialWorkDate) => {
    console.log("MEMULAI MODE EDIT DATA:", data);
    setFormState({
      name: data.name,
      startDate: formatToInputDate(data.startDate),
      endDate: formatToInputDate(data.endDate),
      startTime: data.startTime || "",
      endTime: data.endTime || "",
    });
    setEditingId(data.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus agenda hari kerja khusus ini?")) return;
    setIsLoading(true);
    try {
      const res = await deleteSpecialWorkDate(id);
      if (res?.success) {
        console.log("DELETE BERHASIL");
        fetchData();
      } else {
        console.log("DELETE GAGAL:", res?.error);
      }
    } catch (error) {
      console.log("DELETE CRASH:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    specialDates,
    isLoading,
    showForm,
    setShowForm,
    toggleForm,
    formState,
    setFormState,
    isEditing: !!editingId,
    fetchData,
    handleSave,
    handleEdit,
    handleDelete,
  };
}
