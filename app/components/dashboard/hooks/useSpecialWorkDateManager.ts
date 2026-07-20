import { useState, useEffect, useCallback } from "react";
// ⚠️ PENTING: Jangan lupa import Server Actions Bos di sini!
// import { getSpecialWorkDates, saveSpecialWorkDate, deleteSpecialWorkDate, assignUsersToWorkDate } from "@/app/actions/special-work-date-action";

export const useSpecialWorkDateManager = () => {
  // ==========================================
  // 1. STATES
  // ==========================================
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  // State Form Utama (Versi Baru)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  // ==========================================
  // 2. FETCH DATA PADA SAAT LOAD
  // ==========================================
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ⚠️ Buka komentar ini dan sesuaikan dengan fungsi fetch Bos
      // const res = await getSpecialWorkDates();
      // if (res?.success) {
      //   setItems(res.data || []);
      //   setUsers(res.users || []);
      // }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // 3. HANDLERS
  // ==========================================
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
    setEditingId(null);
  }, []);

  // Handler Simpan Data (Create & Update)
  const handleSave = async () => {
    // Validasi Frontend
    if (!formData.startDate || !formData.name.trim()) {
      alert("Tanggal mulai dan Nama Kegiatan wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      // Payload FINAL (Konversi string kosong menjadi null)
      const payload = {
        id: editingId,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
      };

      console.log("Payload FINAL dikirim ke Server Action:", payload);

      // ⚠️ Buka komentar ini untuk memanggil fungsi simpan ke DB Bos
      // const res = await saveSpecialWorkDate(payload);

      // Hapus baris simulasi ini nanti:
      const res = { success: true, error: null };

      if (res.success) {
        alert(
          editingId ? "Data berhasil diperbarui" : "Data berhasil ditambahkan",
        );
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        alert(res.error || "Gagal menyimpan, periksa koneksi atau data");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Terjadi kesalahan sistem saat menyimpan!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Hapus Data
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal kerja khusus ini?")) return;
    setIsLoading(true);
    try {
      // ⚠️ Buka komentar ini untuk memanggil delete action Bos
      // await deleteSpecialWorkDate(id);
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus data!");
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ INI YANG DIPERBAIKI: Buka Modal Edit (Format Baru)
  const openEdit = useCallback((item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
    });
    setDialogOpen(true);
  }, []);

  // Buka Modal Assign User
  const openAssignModal = useCallback((item: any) => {
    setEditingId(item.id);
    setAssignSelectedIds(item.assignedUsers?.map((u: any) => u.id) || []);
    setAssignModalOpen(true);
  }, []);

  // Pilih/Batal Pilih User untuk Assign
  const toggleAssignUser = useCallback((userId: string) => {
    setAssignSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  // Simpan Hasil Assign User
  const handleAssignSave = async () => {
    setIsLoading(true);
    try {
      // ⚠️ Buka komentar ini untuk memanggil aksi assign ke DB
      // await assignUsersToWorkDate(editingId, assignSelectedIds);
      alert("Pegawai berhasil diatur");
      setAssignModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Assign error:", error);
      alert("Gagal mengatur pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. RETURN STATEMENT
  // ==========================================
  return {
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
    handleSave,
    handleDelete,
    openEdit,
    resetForm,
    openAssignModal,
    handleAssignSave,
    toggleAssignUser,
    fetchData,
  };
};
