// hooks/useNoFpAdminForm.ts
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

    if (!userId) return toast.error("Silakan pilih pegawai.");
    if (!date) return toast.error("Silakan pilih tanggal kejadian.");
    if (!fpDatang && !fpPulang)
      return toast.error("Pilih minimal satu: FP Datang atau FP Pulang.");
    if (!reason.trim()) return toast.error("Alasan wajib diisi.");

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("userId", userId);
      formDataObj.append("date", date);
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
      setFpDatang(false);
      setFpPulang(false);
      setReason("");
      setFile(null);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      // Pesan error dari pengecekan token di service akan muncul di sini
      toast.error(error.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return {
    states: { loading, users, userId, date, fpDatang, fpPulang, reason, file },
    actions: {
      setUserId,
      setDate,
      setFpDatang,
      setFpPulang,
      setReason,
      setFile,
      handleSubmit,
    },
  };
};
