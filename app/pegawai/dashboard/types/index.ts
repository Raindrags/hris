import type { ApprovalRequestData } from "@/app/components/forms/types";

export type { ApprovalRequestData };

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isFirstLogin?: boolean;
  // Index signature agar kompatibel (assignable) dengan properti dinamis di ProfileForm
  [key: string]: any;
}

export interface UserData {
  name: string;
  sisaCuti: number;
  jatahCuti: number;
  isFirstLogin: boolean;
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

export interface SubstituteUser {
  id: string;
  name: string;
  // Kita buat fleksibel untuk mengantisipasi data dari API yang berupa objek maupun ID langsung
  divisiId?: string | number | null;
  divisi?: { id?: string | number; name?: string } | string | null;
}

export interface DashboardDataResponse {
  success: boolean;
  user?: UserData;
  recentRequests?: RecentRequest[];
  incomingRequests?: ApprovalRequestData[];
  potentialSubstitutes?: SubstituteUser[];
  attendanceSummary?: AttendanceSummary;
}
