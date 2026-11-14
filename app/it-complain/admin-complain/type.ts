export type ComplaintStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminComplaint {
  id: string;
  kodeTiket: string;
  type?: "IT" | "CCTV";
  kategoriIT?: string | null;
  lokasi: string;
  tanggalKejadian?: string | null;
  perkiraanJam?: string | null;
  divisi: string;
  masalah: string;
  status: ComplaintStatus;
  rawStatus?: string;
  pelapor: string;
  niy?: string;
  dikerjakanOleh?: string | null;
  solusi?: string | null;
  saran?: string | null;
  keterangan?: string | null;
  rating?: number | null;
  ulasanUser?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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