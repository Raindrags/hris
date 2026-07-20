import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/app/actions/holiday-action";
import { getUsers } from "@/app/actions/get-user-action";
import { Holiday, UserOption } from "../types/holiday";

// Asumsikan tipe divisi untuk filter
interface Division {
  id: string;
  name: string;
}

export const useHolidayManager = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    startDate: "",
    endDate: "",
    description: "",
  });

  // State Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Holiday | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // State Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [modalPage, setModalPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [holidayRes, userRes] = await Promise.all([
        getHolidays(),
        getUsers(),
      ]);

      // 1. Baca Data Libur dengan aman
      if (Array.isArray(holidayRes)) {
        setHolidays(holidayRes);
      } else if (holidayRes?.data && Array.isArray(holidayRes.data)) {
        setHolidays(holidayRes.data);
      } else {
        setHolidays([]);
      }

      // 2. Baca Data Pegawai dari berbagai variasi respons backend
      let fetchedUsers: UserOption[] = [];

      if (Array.isArray(userRes)) {
        fetchedUsers = userRes;
      } else if (userRes?.data?.data && Array.isArray(userRes.data.data)) {
        // ✨ TANGKAPAN BARU: Ternyata datanya sembunyi di dalam data.data!
        fetchedUsers = userRes.data.data;
      } else if (userRes?.data && Array.isArray(userRes.data)) {
        fetchedUsers = userRes.data;
      } else if (userRes?.users && Array.isArray(userRes.users)) {
        fetchedUsers = userRes.users;
      }

      setUsers(fetchedUsers);

      // 3. Ekstrak list divisi unik dari data user untuk keperluan dropdown filter
      const uniqueDivs = new Map<string, Division>();
      fetchedUsers.forEach((u: any) => {
        if (u?.divisi?.id && u?.divisi?.name) {
          uniqueDivs.set(u.divisi.id, {
            id: String(u.divisi.id),
            name: u.divisi.name,
          });
        }
      });
      setDivisions(Array.from(uniqueDivs.values()));
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormState({ startDate: "", endDate: "", description: "" });
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm((prev) => {
      if (!prev) resetForm();
      return !prev;
    });
  }, [resetForm]);

  const handleSave = async () => {
    if (
      !formState.startDate ||
      !formState.endDate ||
      !formState.description.trim()
    ) {
      toast.error("Tanggal dan deskripsi wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      // HANYA mengirimkan properti yang diizinkan oleh backend
      const payload = {
        startDate: formState.startDate,
        endDate: formState.endDate,
        description: formState.description.trim(),
      };

      const res = editingId
        ? await updateHoliday(editingId, payload)
        : await createHoliday(payload);

      if (res?.success || res?.id || (res && !res.error)) {
        toast.success(editingId ? "Libur diperbarui" : "Libur ditambahkan");
        setShowForm(false);
        resetForm();
        await fetchData();
      } else {
        toast.error(res?.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (data: any) => {
    setFormState({
      startDate: data.startDate || data.date || "",
      endDate: data.endDate || data.date || "",
      description: data.description || "",
    });
    setEditingId(data.id || data._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hari libur ini?")) return;
    setIsLoading(true);
    try {
      const res = await deleteHoliday(id);
      if (res?.success || (res && !res.error)) {
        toast.success("Libur dihapus");
        fetchData();
      } else {
        toast.error(res?.error || "Gagal menghapus");
      }
    } catch (error) {
      toast.error("Gagal menghapus data.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAssignModal = (target: Holiday) => {
    setSearchTerm("");
    setDivisiFilter("all");
    setModalPage(1);
    setSelectedTarget(target);
    setSelectedUserIds(target.users?.map((u) => u.id) || []);
    setIsAssignOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedTarget) return;
    setIsLoading(true);
    try {
      const targetId = selectedTarget.id || (selectedTarget as any)._id;
      const res = await updateHoliday(targetId, {
        userIds: selectedUserIds.length ? selectedUserIds : null,
      });

      if (res?.success || res?.id || (res && !res.error)) {
        toast.success("Penugasan pegawai diperbarui");
        setIsAssignOpen(false);
        fetchData();
      } else {
        toast.error(res?.error || "Gagal menyimpan penugasan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
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

  // Filter & Pagination Logic (Aman dari null/undefined dan string/number mismatch)
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((emp) => {
      const matchSearch =
        (emp.name || "").toLowerCase().includes(term) ||
        (emp.niy || "").toLowerCase().includes(term) ||
        (emp.jabatan || "").toLowerCase().includes(term);
      const matchDivisi =
        divisiFilter === "all" || String(emp.divisi?.id) === divisiFilter;
      return matchSearch && matchDivisi;
    });
  }, [users, searchTerm, divisiFilter]);

  const totalModalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (modalPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, modalPage, itemsPerPage]);

  return {
    holidays,
    isLoading,
    showForm,
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
    handleSave,
    handleEdit,
    handleDelete,
    openAssignModal,
    handleSaveAssignment,
    toggleEmployee,
    toggleAllEmployees,
  };
};
