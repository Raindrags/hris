import { apiClient } from "@/lib/api-client";

export const jadwalService = {
  // Ambil semua daftar shift
  getAllShifts: () => apiClient.get("/shifts"),

  // Buat shift baru
  createShift: (data: any) => apiClient.post("/shifts", data),

  // Update shift
  updateShift: (id: string, data: any) => apiClient.put(`/shifts/${id}`, data),

  // Hapus shift
  deleteShift: (id: string) => apiClient.delete(`/shifts/${id}`),

  // Ambil pegawai untuk proses assignment
  getEmployeesForAssign: () => apiClient.get("/employees/assignable"),

  // Penugasan massal (Batch Assign)
  batchAssignShift: (userIds: string[], shiftId: string) =>
    apiClient.post(`/shifts/${shiftId}/assign`, { userIds }),
};
