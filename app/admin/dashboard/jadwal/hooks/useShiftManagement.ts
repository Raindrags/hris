
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getAllShifts,
  createShift,
  updateShift,
  deleteShift,
} from "@/app/actions/jadwal-action";
import { ShiftTemplate, ShiftFormState } from "../types";
import { generateDefaultDetails, DAYS } from "../constants";

export function useShiftManagement() {
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState<ShiftFormState>({
    name: "",
    isFlexible: false,
    details: generateDefaultDetails(),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const shiftsPerPage = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await getAllShifts();
    if (res.success) {
      setShifts(res.data || []);
      setCurrentPage(1);
    } else {
      toast.error(res.error || "Gagal memuat jadwal");
    }
    setIsLoading(false);
  }, []);

  const totalPages = Math.ceil(shifts.length / shiftsPerPage);
  const paginatedShifts = useMemo(() => {
    const start = (currentPage - 1) * shiftsPerPage;
    return shifts.slice(start, start + shiftsPerPage);
  }, [shifts, currentPage, shiftsPerPage]);

  const toggleForm = () => {
    setShowShiftForm((prev) => !prev);
    if (showShiftForm) {
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingShiftId(null);
    setShiftForm({
      name: "",
      isFlexible: false,
      details: generateDefaultDetails(),
    });
  };

  const handleDetailChange = (index: number, field: keyof ShiftFormState["details"][0], value: string | boolean) => {
    setShiftForm((prev) => {
      const newDetails = [...prev.details];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return { ...prev, details: newDetails };
    });
  };

  const handleSaveShift = async () => {
    if (!shiftForm.name.trim()) return toast.error("Nama template wajib diisi");
    setIsLoading(true);
    const res = editingShiftId
      ? await updateShift(editingShiftId, shiftForm)
      : await createShift(shiftForm);

    if (res?.success) {
      toast.success(editingShiftId ? "Template diupdate!" : "Template dibuat!");
      setShowShiftForm(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res?.error || "Terjadi kesalahan saat menyimpan template");
    }
    setIsLoading(false);
  };

  const handleEditShift = (shift: ShiftTemplate) => {
    const detailsForm = DAYS.map((d) => {
      const existing = shift.details?.find((sd) => sd.dayOfWeek === d.id);
      return {
        dayOfWeek: d.id,
        dayName: d.name,
        isActive: !!existing,
        checkIn: existing ? existing.checkIn : "07:30",
        checkOut: existing ? existing.checkOut : "16:00",
      };
    });

    setShiftForm({
      name: shift.name,
      isFlexible: shift.isFlexible,
      details: detailsForm,
    });
    setEditingShiftId(shift.id);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm("Yakin ingin menghapus template ini?")) return;
    setIsLoading(true);
    const res = await deleteShift(id);
    if (res?.success) {
      toast.success("Template berhasil dihapus");
      fetchData();
    } else {
      toast.error(res?.error || "Gagal menghapus template");
    }
    setIsLoading(false);
  };

  return {
    shifts,
    paginatedShifts,
    isLoading,
    showShiftForm,
    shiftForm,
    setShiftForm,
    currentPage,
    totalPages,
    setCurrentPage,
    fetchData,
    toggleForm,
    handleDetailChange,
    handleSaveShift,
    handleEditShift,
    handleDeleteShift,
    isEditing: !!editingShiftId
  };
}