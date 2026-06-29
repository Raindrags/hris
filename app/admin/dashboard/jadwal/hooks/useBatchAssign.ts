import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getEmployeesForAssign,
  batchAssignShift,
} from "@/app/actions/jadwal-action";
import { ShiftTemplate, Employee, Division } from "../types";

export function useBatchAssign() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftTemplate | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openModal = async (shift: ShiftTemplate) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setCurrentPage(1);
    setSelectedShift(shift);

    const res = await getEmployeesForAssign();
    if (res.success) {
      setEmployees(res.data || []);
      setDivisions(res.divisions || []);
      const alreadyAssigned = (res.data || [])
        .filter((e: Employee) => e.workShiftId === shift.id)
        .map((e: Employee) => e.id);
      setSelectedUserIds(alreadyAssigned);
      setIsOpen(true);
    } else {
      toast.error(res.error || "Gagal memuat data pegawai");
    }
  };

  const closeModal = () => setIsOpen(false);

  const handleSave = async () => {
    if (!selectedShift) return;
    const res = await batchAssignShift(selectedUserIds, selectedShift.id);
    if (res?.success) {
      toast.success(`Berhasil menugaskan jadwal ke ${selectedUserIds.length} pegawai`);
      closeModal();
    } else {
      toast.error(res.error || "Gagal menyimpan penugasan jadwal");
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = (checked: boolean, filteredIds: string[]) => {
    if (checked) {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(term) ||
        emp.niy?.toLowerCase().includes(term) ||
        emp.jabatan?.toLowerCase().includes(term);
      const matchesDivisi = divisiFilter === "all" || emp.divisi?.id === divisiFilter;
      return matchesSearch && matchesDivisi;
    });
  }, [employees, searchTerm, divisiFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  return {
    isOpen,
    setIsOpen,
    selectedShift,
    divisions,
    selectedUserIds,
    searchTerm,
    setSearchTerm,
    divisiFilter,
    setDivisiFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredEmployees,
    paginatedEmployees,
    openModal,
    closeModal,
    handleSave,
    toggleEmployee,
    toggleAll,
  };
}