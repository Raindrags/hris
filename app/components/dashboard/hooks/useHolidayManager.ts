import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "@/app/actions/holiday-action";
import { getUsers } from "@/app/actions/get-user-action";
import { Holiday, UserOption } from "../types/holiday";

export const useHolidayManager = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: "", description: "" });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignHolidayId, setAssignHolidayId] = useState<string | null>(null);
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [holidayRes, userRes] = await Promise.all([
      getHolidays(),
      getUsers(),
    ]);
    if (holidayRes.success) setHolidays(holidayRes.data);
    if (userRes.success) setUsers(userRes.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: "", description: "" });
    setSelectedUserIds([]);
  };

  const handleSave = async () => {
    if (!formData.date || !formData.description) {
      toast.error("Tanggal dan deskripsi wajib diisi");
      return;
    }
    const payload = {
      date: formData.date,
      description: formData.description,
      userIds: selectedUserIds.length ? selectedUserIds : null,
    };
    let res;
    if (editingId) {
      res = await updateHoliday(editingId, payload);
    } else {
      res = await createHoliday(payload);
    }
    if (res.success) {
      toast.success(editingId ? "Libur diperbarui" : "Libur ditambahkan");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Hapus hari libur ini?")) return;
      const res = await deleteHoliday(id);
      if (res.success) {
        toast.success("Libur dihapus");
        fetchData();
      } else {
        toast.error(res.error || "Gagal menghapus");
      }
    },
    [fetchData],
  );

  const openEdit = useCallback((holiday: Holiday) => {
    setEditingId(holiday.id);
    setFormData({ date: holiday.date, description: holiday.description });
    setSelectedUserIds(holiday.users.map((u) => u.id));
    setDialogOpen(true);
  }, []);

  const openAssignModal = useCallback((holiday: Holiday) => {
    setAssignHolidayId(holiday.id);
    setAssignSelectedIds(holiday.users.map((u) => u.id));
    setAssignModalOpen(true);
  }, []);

  const handleAssignSave = async () => {
    if (!assignHolidayId) return;
    const res = await updateHoliday(assignHolidayId, {
      userIds: assignSelectedIds.length ? assignSelectedIds : null,
    });
    if (res.success) {
      toast.success("Penugasan pegawai diperbarui");
      setAssignModalOpen(false);
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan penugasan");
    }
  };

  const toggleAssignUser = useCallback((userId: string) => {
    setAssignSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  return {
    // States
    holidays,
    users,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingId,
    formData,
    setFormData,
    assignModalOpen,
    setAssignModalOpen,
    assignSelectedIds,
    setAssignSelectedIds,

    // Handlers
    handleSave,
    handleDelete,
    openEdit,
    resetForm,
    openAssignModal,
    handleAssignSave,
    toggleAssignUser,
  };
};
