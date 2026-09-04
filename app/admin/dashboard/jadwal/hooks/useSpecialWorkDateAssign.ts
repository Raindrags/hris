import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getEmployeesForAssign,
  assignEmployeesToSpecialDate,
  getAssignedSpecialDateEmployees,
} from "@/app/actions/jadwal-action";
import { SpecialWorkDate, Employee, Division } from "../types";

// Parameter onSuccess berguna untuk refresh data tabel di background setelah save
export function useSpecialWorkDateAssign(onSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SpecialWorkDate | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openModal = async (target: SpecialWorkDate) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setCurrentPage(1);
    setSelectedTarget(target);

    // Muat daftar seluruh pegawai untuk modal
    const resEmployees = await getEmployeesForAssign();

    if (resEmployees?.success) {
      setEmployees(resEmployees.data || []);
      setDivisions(resEmployees.divisions || []);

      // =========================================================
      // FIX FINAL: Ambil ID dari properti "users" bawaan target
      // =========================================================
      let alreadyAssigned: string[] = [];

      // Kita gunakan (target as any) agar TypeScript tidak error
      // jika properti 'users' belum terdaftar di file types.ts Anda
      const targetData = target as any;

      if (targetData.users && Array.isArray(targetData.users)) {
        alreadyAssigned = targetData.users.map((u: any) => u.id);
      }

      setSelectedUserIds(alreadyAssigned);
      setIsOpen(true);
    } else {
      toast.error(resEmployees?.error || "Gagal memuat data pegawai");
    }
  };

  const closeModal = () => setIsOpen(false);

  const handleSave = async () => {
    if (!selectedTarget) return;
    const res = await assignEmployeesToSpecialDate(
      selectedTarget.id,
      selectedUserIds,
    );

    if (res?.success) {
      toast.success(`Berhasil menugaskan ${selectedUserIds.length} pegawai`);
      closeModal();
      if (onSuccess) onSuccess();
    } else {
      toast.error(res?.error || "Gagal menyimpan penugasan");
    }
  };

  const toggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = (checked: boolean, filteredIds: string[]) => {
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
        (emp.jabatan || emp.role || "").toLowerCase().includes(term);
      const matchDivisi =
        divisiFilter === "all" || emp.divisi?.id === divisiFilter;
      return matchSearch && matchDivisi;
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
    selectedTarget,
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
