import { SelectUser } from "../types";

export const NoFpService = {
  fetchUsers: async (): Promise<SelectUser[]> => {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Gagal mengambil data pegawai");

    const responseData = await res.json();
    if (Array.isArray(responseData)) return responseData;
    if (responseData?.data && Array.isArray(responseData.data))
      return responseData.data;
    if (responseData?.data?.data && Array.isArray(responseData.data.data))
      return responseData.data.data;
    return [];
  },

  submitAdminNoFp: async (payload: FormData): Promise<any> => {
    const res = await fetch("/api/admin/nofp", {
      method: "POST",
      body: payload,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      // Mengambil properti .error dari response NextResponse jembatan kita
      throw new Error(errorData.error || "Gagal menyimpan data No FP");
    }

    return res.json();
  },
};
