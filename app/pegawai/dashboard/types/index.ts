// app/pegawai/dashboard/types/index.ts

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isFirstLogin?: boolean;
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
  divisiId?: string;
}

export interface ApprovalRequestData {
  id: string;
  requesterName: string;
  type: string;
  status: string;
  date: string;
}

export interface DashboardDataResponse {
  success: boolean;
  user?: UserData;
  recentRequests?: RecentRequest[];
  incomingRequests?: ApprovalRequestData[];
  potentialSubstitutes?: SubstituteUser[];
  attendanceSummary?: AttendanceSummary;
}
