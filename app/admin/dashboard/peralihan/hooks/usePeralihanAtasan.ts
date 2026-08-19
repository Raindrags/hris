import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { PeralihanAtasan, PeralihanFormState, Supervisor } from "../types";

export function usePeralihanAtasan() {
  const [data, setData] = useState<PeralihanAtasan[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  // TAMBAHAN: State untuk menampung semua user
  const [allUsers, setAllUsers] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm: PeralihanFormState = {
    atasanLamaId: "",
    atasanBaruId: "",
    tanggalMulai: "",
    tanggalBerakhir: "",
    alasan: "",
  };
  const [formState, setFormState] = useState<PeralihanFormState>(initialForm);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Data Peralihan
      const resData = await fetch(`/api/peralihan-atasan`);
      const jsonData = await resData.json();

      if (jsonData.success && Array.isArray(jsonData.data)) {
        setData(jsonData.data);
      } else {
        setData([]);
      }

      // 2. Fetch Data Atasan (Tetap dipertahankan untuk atasan lama)
      const resSup = await fetch(`/api/users/supervisors`);
      const jsonSup = await resSup.json();

      console.log("DEBUG API SUPERVISORS:", jsonSup);

      if (jsonSup.success && Array.isArray(jsonSup.data)) {
        setSupervisors(jsonSup.data);
      } else {
        setSupervisors([]);
        toast.error(`Error Atasan: ${jsonSup.error || "Respons tidak valid"}`);
      }

      // 3. TAMBAHAN: Fetch Semua Users untuk "Dialihkan Kepada"
      const resUsers = await fetch(`/api/users`);
      const jsonUsers = await resUsers.json();

      let extractedUsers = [];

      if (Array.isArray(jsonUsers)) {
        extractedUsers = jsonUsers;
      } else if (jsonUsers && typeof jsonUsers === "object") {
        // Cek lokasi umum (level 1)
        if (Array.isArray(jsonUsers.data)) {
          extractedUsers = jsonUsers.data;
        }
        // Cek lokasi bersarang (level 2) seperti { data: { data: [...] } }
        else if (jsonUsers.data && Array.isArray(jsonUsers.data.data)) {
          extractedUsers = jsonUsers.data.data;
        } else if (jsonUsers.data && Array.isArray(jsonUsers.data.users)) {
          extractedUsers = jsonUsers.data.users;
        }
        // Pencarian otomatis ke seluruh isi JSON jika key-nya unik
        else {
          for (const key in jsonUsers) {
            if (Array.isArray(jsonUsers[key])) {
              extractedUsers = jsonUsers[key];
              break;
            } else if (jsonUsers[key] && typeof jsonUsers[key] === "object") {
              for (const subKey in jsonUsers[key]) {
                if (Array.isArray(jsonUsers[key][subKey])) {
                  extractedUsers = jsonUsers[key][subKey];
                  break;
                }
              }
            }
          }
        }
      }
      setAllUsers(extractedUsers);
    } catch (error) {
      console.error("Fetch Error:", error);
      setData([]);
      setSupervisors([]);
      setAllUsers([]);
      toast.error("Gagal terhubung ke API Next.js");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (!showForm) {
      setEditingId(null);
      setFormState(initialForm);
    }
  };

  const handleSave = async () => {
    if (
      !formState.atasanLamaId ||
      !formState.atasanBaruId ||
      !formState.tanggalMulai ||
      !formState.tanggalBerakhir
    ) {
      return toast.error("Semua field wajib diisi!");
    }

    setIsLoading(true);
    try {
      const url = editingId
        ? `/api/peralihan-atasan/${editingId}`
        : `/api/peralihan-atasan`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || "Gagal menyimpan data");
      }

      toast.success(
        editingId
          ? "Peralihan atasan diperbarui!"
          : "Peralihan atasan ditambahkan!",
      );

      await fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormState(initialForm);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: PeralihanAtasan) => {
    setFormState({
      atasanLamaId: record.atasanLamaId,
      atasanBaruId: record.atasanBaruId,
      tanggalMulai: record.tanggalMulai,
      tanggalBerakhir: record.tanggalBerakhir,
      alasan: record.alasan || "",
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus riwayat peralihan ini?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/peralihan-atasan/${id}`, {
        method: "DELETE",
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || "Gagal menghapus data");
      }

      toast.success("Riwayat peralihan dihapus");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    supervisors,
    allUsers, // TAMBAHAN: di-return untuk diakses oleh Form
    isLoading,
    showForm,
    formState,
    setFormState,
    isEditing: !!editingId,
    toggleForm,
    handleSave,
    handleEdit,
    handleDelete,
  };
}
