import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { SelectUser } from "../types";
import { NoFpService } from "../services/nofp.service";

export const useNoFpAdminForm = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SelectUser[]>([]);

  // Form States
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // ✨ TAMBAHAN: State untuk Jam No FP
  const [fpDatang, setFpDatang] = useState(false);
  const [fpPulang, setFpPulang] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await NoFpService.fetchUsers();
        setUsers(data);
      } catch (error) {
        toast.error("Gagal memuat daftar pegawai.");
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi Form
    if (!userId) return toast.error("Silakan pilih pegawai.");
    if (!date) return toast.error("Silakan pilih tanggal kejadian.");
    if (!time) return toast.error("Silakan isi jam kejadian."); // ✨ TAMBAHAN: Validasi Jam
    if (!fpDatang && !fpPulang)
      return toast.error("Pilih minimal satu: FP Datang atau FP Pulang.");
    if (!reason.trim()) return toast.error("Alasan wajib diisi.");

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("userId", userId);
      formDataObj.append("date", date);
      formDataObj.append("time", time); // ✨ TAMBAHAN: Masukkan Jam ke dalam payload
      formDataObj.append("fpDatang", String(fpDatang));
      formDataObj.append("fpPulang", String(fpPulang));
      formDataObj.append("reason", reason);

      if (file) {
        formDataObj.append("file", file);
      }

      await NoFpService.submitAdminNoFp(formDataObj);
      toast.success("Data No FP berhasil di-inject (Bypass Approval).");

      // Reset form
      setUserId("");
      setDate("");
      setTime(""); // ✨ TAMBAHAN: Reset Jam
      setFpDatang(false);
      setFpPulang(false);
      setReason("");
      setFile(null);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return {
    states: {
      loading,
      users,
      userId,
      date,
      time,
      fpDatang,
      fpPulang,
      reason,
      file,
    },
    actions: {
      setUserId,
      setDate,
      setTime,
      setFpDatang,
      setFpPulang,
      setReason,
      setFile,
      handleSubmit,
    },
  };
};
