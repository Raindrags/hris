import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getSpecialWorkDates,
  createSpecialWorkDate,
  updateSpecialWorkDate,
  deleteSpecialWorkDate,
} from "@/app/actions/special-workdate-action";
import { getUsers } from "@/app/actions/get-user-action";
import { SpecialWorkDate, UserOption } from "../types/special-workdate";

export const useSpecialWorkDateManager = () => {
  const [items, setItems] = useState<SpecialWorkDate[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    checkIn: "07:00",
    checkOut: "11:00",
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignItemId, setAssignItemId] = useState<string | null>(null);
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [dateRes, userRes] = await Promise.all([
      getSpecialWorkDates(),
      getUsers(),
    ]);
    if (dateRes.success) setItems(dateRes.data);
    if (userRes.success) setUsers(userRes.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({ date: "", name: "", checkIn: "07:00", checkOut: "11:00" });
  }, []);

  const handleSave = async () => {
    if (
      !formData.date ||
      !formData.name ||
      !formData.checkIn ||
      !formData.checkOut
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }
    const payload = {
      name: formData.name,

      startDate: formData.date,
      endDate: formData.date,

      startTime:
        formData.checkIn && formData.checkIn.trim() !== ""
          ? formData.checkIn
          : null,
      endTime:
        formData.checkOut && formData.checkOut.trim() !== ""
          ? formData.checkOut
          : null,
    };

    let res;
    if (editingId) {
      res = await updateSpecialWorkDate(editingId, payload);
    } else {
      res = await createSpecialWorkDate(payload);
    }

    if (res.success) {
      toast.success(editingId ? "Data diperbarui" : "Data ditambahkan");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } else {
      toast.error(res.error || (res as any).message || "Gagal menyimpan");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Hapus hari kerja khusus ini?")) return;
      const res = await deleteSpecialWorkDate(id);
      if (res.success) {
        toast.success("Data dihapus");
        fetchData();
      } else {
        toast.error(res.error || "Gagal menghapus");
      }
    },
    [fetchData],
  );

  const openEdit = useCallback((item: SpecialWorkDate) => {
    setEditingId(item.id);
    setFormData({
      date: item.date,
      name: item.name || item.description || "",
      checkIn: item.checkIn || "07:00",
      checkOut: item.checkOut || "11:00",
    });
    setDialogOpen(true);
  }, []);

  const openAssignModal = useCallback((item: SpecialWorkDate) => {
    setAssignItemId(item.id);
    setAssignSelectedIds(item.users.map((u) => u.id));
    setAssignModalOpen(true);
  }, []);

  const handleAssignSave = async () => {
    if (!assignItemId) return;
    const res = await updateSpecialWorkDate(assignItemId, {
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
    items,
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
