// app/admin/pengaturan-jadwal/hooks/useSpecialWorkDate.ts

import { useState, useCallback, useMemo } from "react";
import {
  Employee,
  Division,
  SpecialWorkDate,
  SpecialWorkDateFormState,
} from "../types";
import {
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
  getEmployeesForAssign,
  assignEmployeesToSpecialDate,
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

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SpecialWorkDate | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [modalPage, setModalPage] = useState(1);
  const itemsPerPage = 10;

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

  const openAssignModal = async (target: SpecialWorkDate) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setModalPage(1);
    setSelectedTarget(target);

    setIsLoading(true);
    try {
      const res = await getEmployeesForAssign();
      if (res?.success) {
        setEmployees(res.data || []);
        setDivisions(res.divisions || []);
        setSelectedUserIds(res.assignedUserIds?.[target.id] || []);
        setIsAssignOpen(true);
        console.log("MODAL ASSIGNMENT OPENED");
      } else {
        console.log("LOAD ASSIGNMENT GAGAL:", res?.error);
      }
    } catch (error) {
      console.log("LOAD ASSIGNMENT CRASH:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedTarget) return;
    setIsLoading(true);
    try {
      const res = await assignEmployeesToSpecialDate(
        selectedTarget.id,
        selectedUserIds,
      );
      if (res?.success) {
        console.log("SAVE ASSIGNMENT BERHASIL");
        setIsAssignOpen(false);
        fetchData();
      } else {
        console.log("SAVE ASSIGNMENT GAGAL:", res?.error);
      }
    } catch (error) {
      console.log("SAVE ASSIGNMENT CRASH:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAllEmployees = (checked: boolean, filteredIds: string[]) => {
    if (checked) {
      setSelectedUserIds((prev) =>
        Array.from(new Set([...prev, ...filteredIds])),
      );
    } else {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(term) ||
        (emp.niy || "").toLowerCase().includes(term) ||
        (emp.jabatan || "").toLowerCase().includes(term);
      const matchDivisi =
        divisiFilter === "all" || emp.divisi?.id === divisiFilter;
      return matchSearch && matchDivisi;
    });
  }, [employees, searchTerm, divisiFilter]);

  const totalModalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (modalPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, modalPage, itemsPerPage]);

  return {
    specialDates,
    isLoading,
    showForm,
    setShowForm,
    toggleForm,
    formState,
    setFormState,
    isEditing: !!editingId,
    isAssignOpen,
    setIsAssignOpen,
    selectedTarget,
    divisions,
    selectedUserIds,
    searchTerm,
    setSearchTerm,
    divisiFilter,
    setDivisiFilter,
    modalPage,
    setModalPage,
    totalModalPages,
    filteredEmployees,
    paginatedEmployees,
    fetchData,
    handleSave,
    handleEdit,
    handleDelete,
    openAssignModal,
    handleSaveAssignment,
    toggleEmployee,
    toggleAllEmployees,
  };
}
