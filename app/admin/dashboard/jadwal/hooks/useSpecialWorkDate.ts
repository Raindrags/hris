// app/admin/pengaturan-jadwal/hooks/useSpecialWorkDate.ts

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Employee, Division, SpecialWorkDate, SpecialWorkDateFormState } from "../types";
import {
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
  getEmployeesForAssign,
  assignEmployeesToSpecialDate,
} from "@/app/actions/jadwal-action";

export function useSpecialWorkDate() {
  const [specialDates, setSpecialDates] = useState<SpecialWorkDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Perbarui state form dengan default string kosong untuk jam kerja
  const [formState, setFormState] = useState<SpecialWorkDateFormState>({
    name: "",
    startDate: "",
    endDate: "",
    startTime: "", // BARU
    endTime: "",   // BARU
  });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SpecialWorkDate | null>(null);
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
      if (res?.success) setSpecialDates(res.data || []);
      else toast.error(res?.error || "Gagal memuat data");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
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
      startTime: "", // BARU
      endTime: ""    // BARU
    });
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm((prev) => {
      if (!prev) resetForm();
      return !prev;
    });
  }, [resetForm]);

  const handleSave = async () => {
    // Tambahkan validasi jam kerja wajib diisi
    if (
      !formState.name.trim() || 
      !formState.startDate || 
      !formState.endDate || 
      !formState.startTime || 
      !formState.endTime
    ) {
      return toast.error("Semua kolom termasuk tanggal dan jam kerja wajib diisi!");
    }
    
    setIsLoading(true);
    const res = editingId
      ? await updateSpecialWorkDate(editingId, formState)
      : await createSpecialWorkDate(formState);

    if (res?.success) {
      toast.success(editingId ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
      setShowForm(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res?.error || "Gagal menyimpan data");
    }
    setIsLoading(false);
  };

  const handleEdit = (data: SpecialWorkDate) => {
    setFormState({
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime || "", // BARU
      endTime: data.endTime || "",     // BARU
    });
    setEditingId(data.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus agenda hari kerja khusus ini?")) return;
    setIsLoading(true);
    const res = await deleteSpecialWorkDate(id);
    if (res?.success) {
      toast.success("Berhasil dihapus");
      fetchData();
    } else {
      toast.error(res?.error || "Gagal menghapus");
    }
    setIsLoading(false);
  };

  const openAssignModal = async (target: SpecialWorkDate) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setModalPage(1);
    setSelectedTarget(target);

    setIsLoading(true);
    const res = await getEmployeesForAssign();
    if (res?.success) {
      setEmployees(res.data || []);
      setDivisions(res.divisions || []);
      setSelectedUserIds(res.assignedUserIds?.[target.id] || []);
      setIsAssignOpen(true);
    } else {
      toast.error(res?.error || "Gagal memuat data pegawai");
    }
    setIsLoading(false);
  };

  const handleSaveAssignment = async () => {
    if (!selectedTarget) return;
    setIsLoading(true);
    const res = await assignEmployeesToSpecialDate(selectedTarget.id, selectedUserIds);
    if (res?.success) {
      toast.success(`Berhasil menugaskan ${selectedUserIds.length} pegawai`);
      setIsAssignOpen(false);
      fetchData();
    } else {
      toast.error(res?.error || "Gagal menyimpan penugasan");
    }
    setIsLoading(false);
  };

  const toggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAllEmployees = (checked: boolean, filteredIds: string[]) => {
    if (checked) {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(term) ||
        (emp.niy || "").toLowerCase().includes(term) ||
        (emp.jabatan || "").toLowerCase().includes(term);
      const matchDivisi = divisiFilter === "all" || emp.divisi?.id === divisiFilter;
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