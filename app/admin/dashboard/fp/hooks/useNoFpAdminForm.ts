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
    if (!fpDatang && !fpPulang)
      return toast.error("Pilih minimal satu: FP Datang atau FP Pulang.");

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("userId", userId);
      formDataObj.append("date", date);
      formDataObj.append("fpDatang", String(fpDatang));
      formDataObj.append("fpPulang", String(fpPulang));

      await NoFpService.submitAdminNoFp(formDataObj);
      toast.success("Data No FP berhasil di-inject (Bypass Approval).");

      // Reset form[cite: 17]
      setUserId("");
      setDate("");
      setFpDatang(false);
      setFpPulang(false);

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
      fpDatang,
      fpPulang,
    },
    actions: {
      setUserId,
      setDate,
      setFpDatang,
      setFpPulang,
      handleSubmit,
    },
  };
};
