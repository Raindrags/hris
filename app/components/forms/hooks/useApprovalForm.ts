// app/hooks/useApprovalForm.ts

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ApprovalRequestData, SubstituteUser } from "../types";

export const useApprovalForm = (
  request: ApprovalRequestData,
  potentialSubstitutes: SubstituteUser[],
  onClose: () => void,
) => {
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [delegatedTo, setDelegatedTo] = useState<string>("");

  // Derivasi logika kategori secara langsung
  const categoryStr = request.user.category?.toLowerCase() || "";
  const isDinasOrKhusus =
    categoryStr.includes("dinas") || categoryStr.includes("izinkhusus");
  const isSakit = categoryStr.includes("sakit");
  const isIzinPribadi = !isDinasOrKhusus && !isSakit;

  // Inisialisasi state berdasarkan kategori
  const [noDeduction, setNoDeduction] = useState<boolean>(isDinasOrKhusus);

  // Optimasi filter menggunakan useMemo
  const filteredSubstitutes = useMemo(() => {
    return potentialSubstitutes.filter((sub) => {
      if (!request.user?.divisi?.id || !sub.divisi?.id) return false;
      return sub.divisi.id === request.user.divisi.id;
    });
  }, [potentialSubstitutes, request.user]);

  // Fungsi API Internal
  const rejectRequestApi = async (id: string, reason: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/requests/${id}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menolak pengajuan");
    return data;
  };

  const approveRequestApi = async (id: string, payload: any) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/requests/${id}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal menyetujui pengajuan");
    return data;
  };

  // Handler Submit
  const handleProcess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (actionType === "REJECT") {
        const reason = formData.get("rejectionReason") as string;
        await rejectRequestApi(request.id, reason);
        toast.info("Pengajuan ditolak.");
      } else if (actionType === "APPROVE") {
        const payload: any = {
          delegatedToId: delegatedTo || undefined,
          taskDetail: (formData.get("taskDetail") as string) || undefined,
          deductions: [] as string[],
        };

        if (!noDeduction) {
          if (formData.get("potongGaji")) payload.deductions.push("Gaji");
          if (formData.get("potongKonsumsi"))
            payload.deductions.push("Tunjangan Konsumsi");
          if (formData.get("potongTransport"))
            payload.deductions.push("Tunjangan Transportasi");
        }

        await approveRequestApi(request.id, payload);
        toast.success("Pengajuan disetujui.");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return {
    // States
    actionType,
    setActionType,
    loading,
    delegatedTo,
    setDelegatedTo,
    noDeduction,
    setNoDeduction,

    // Derived States
    isSakit,
    isIzinPribadi,
    filteredSubstitutes,

    // Handlers
    handleProcess,
  };
};
