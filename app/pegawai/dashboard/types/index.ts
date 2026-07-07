import type {
  ApprovalRequestData,
  SubstituteUser,
} from "@/app/components/forms/types";

// 2. Re-export agar file lain tetap bisa mengambilnya dari folder types ini
export type { ApprovalRequestData, SubstituteUser };

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isFirstLogin?: boolean;
  // Index signature agar kompatibel dengan properti dinamis di ProfileForm
  [key: string]: any;
}

export interface UserData {
  name: string;
  sisaCuti: number;
  jatahCuti: number;
  isFirstLogin: boolean;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  supervisor: { name: string } | null;
}

export interface RecentRequest {
  id: string;
  type: string;
  status: "APPROVED" | "REJECTED" | "PENDING" | string;
  startDate: Date | string;
  endDate: Date | string;
}

export interface AttendanceSummary {
  onTime: number;
  late: number;
  off: number;
  izin: number;
  cuti: number;
  earlyLeaves: number;
}

// NOTE: interface SubstituteUser LOKAL TELAH DIHAPUS
// Kita murni menggunakan SubstituteUser dari komponen asli untuk menghindari bentrok tipe.

export interface DashboardDataResponse {
  success: boolean;
  user?: UserData;
  recentRequests?: RecentRequest[];
  incomingRequests?: ApprovalRequestData[];
  potentialSubstitutes?: SubstituteUser[]; // <-- Sekarang menggunakan tipe dari komponen asli
  attendanceSummary?: AttendanceSummary;
}
