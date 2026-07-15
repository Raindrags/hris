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

  // Derivasi logika kategori
  const categoryStr = request.user.category?.toLowerCase() || "";
  const isDinasOrKhusus =
    categoryStr.includes("dinas") || categoryStr.includes("izinkhusus");

  const [noDeduction, setNoDeduction] = useState<boolean>(isDinasOrKhusus);

  const filteredSubstitutes = useMemo(() => {
    return potentialSubstitutes.filter((sub) => {
      if (!request.user?.divisi?.id || !sub.divisi?.id) return false;
      return sub.divisi.id === request.user.divisi.id;
    });
  }, [potentialSubstitutes, request.user]);

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

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Gagal menolak pengajuan");
    }

    return true;
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

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Gagal menyetujui pengajuan");
    }

    return true;
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
        // 🛠️ UPDATE: Payload disederhanakan, langsung kirim `noDeduction`
        const payload: any = {
          delegatedToId: delegatedTo || undefined,
          taskDetail: (formData.get("taskDetail") as string) || undefined,
          noDeduction,
        };

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
    filteredSubstitutes,

    // Handlers
    handleProcess,
  };
};
