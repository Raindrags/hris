import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { batchAssignShift } from "@/app/actions/jadwal-action";

export function useBatchAssign(employees: any[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // State baru untuk tanggal efektif
  const [effectiveDate, setEffectiveDate] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, divisiFilter]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.niy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jabatan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDivisi =
        divisiFilter === "all" || emp.divisi?.id === divisiFilter;

      return matchSearch && matchDivisi;
    });
  }, [employees, searchTerm, divisiFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const divisions = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      if (emp.divisi) map.set(emp.divisi.id, emp.divisi);
    });
    return Array.from(map.values());
  }, [employees]);

  const toggleEmployee = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const toggleAll = (checked: boolean, ids: string[]) => {
    if (checked) {
      const newIds = new Set([...selectedUserIds, ...ids]);
      setSelectedUserIds(Array.from(newIds));
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => !ids.includes(id)));
    }
  };

  const openModal = (shift: any) => {
    setSelectedShift(shift);
    setSelectedUserIds([]);
    setEffectiveDate(""); // Reset tanggal saat modal dibuka
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!selectedShift) return;

    // Validasi tanggal efektif
    if (!effectiveDate) {
      toast.error(
        "Silakan tentukan tanggal berlaku (effective date) terlebih dahulu!",
      );
      return;
    }

    // Tambahkan effectiveDate sebagai parameter ketiga
    const res = await batchAssignShift(
      selectedUserIds,
      selectedShift.id,
      effectiveDate,
    );

    if (res?.success) {
      toast.success(
        `Berhasil menugaskan jadwal ke ${selectedUserIds.length} pegawai`,
      );
      setIsOpen(false);
    } else {
      toast.error(res?.error || "Gagal menyimpan penugasan.");
    }
  };

  return {
    isOpen,
    setIsOpen,
    selectedShift,
    openModal,
    selectedUserIds,
    toggleEmployee,
    toggleAll,
    searchTerm,
    setSearchTerm,
    divisiFilter,
    setDivisiFilter,
    divisions,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredEmployees,
    paginatedEmployees,
    effectiveDate,
    setEffectiveDate, // Export state agar bisa diakses oleh BatchAssignModal
    handleSave,
  };
}
