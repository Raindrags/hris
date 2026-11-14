export type ComplaintStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminComplaint {
  id: string;
  kodeTiket: string;
  lokasi: string;
  divisi: string;
  masalah: string;
  status: ComplaintStatus;
  pelapor: string;
  dikerjakanOleh?: string;
  createdAt: string;
}

export interface ActionLog {
  id: string;
  kodeTiket: string;
  action: string;
  actor: string;
  timestamp: string;
  message: string;
}

export interface DashboardStats {
  masuk: number;
  dikerjakan: number;
  selesai: number;
}
