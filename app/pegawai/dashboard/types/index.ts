import type {
  ApprovalRequestData,
  SubstituteUser,
} from "@/app/components/forms/types";

export type { ApprovalRequestData, SubstituteUser };

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
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  supervisor: { name: string } | null;
  [key: string]: any;
}

export interface RecentRequest {
  id: string;
  type: string;
  category?: string;
  status: "APPROVED" | "REJECTED" | "PENDING" | string;
  startDate: Date | string;
  endDate: Date | string;
  time?: string | null;
}

export interface AttendanceSummary {
  onTime: number;
  late: number;
  off: number;
  izin: number;
  cuti: number;
  earlyLeaves: number;
}

export interface DeductionSummary {
  transportCount: number;
  konsumsiCount: number;
  gajiCount: number;
  shiftCount: number;
  shiftRate: number; // misal: 5000 atau 30000
  shiftTotal: number;
}

export interface DashboardDataResponse {
  success: boolean;
  user?: UserData;
  recentRequests?: RecentRequest[];
  incomingRequests?: ApprovalRequestData[];
  potentialSubstitutes?: SubstituteUser[];
  attendanceSummary?: AttendanceSummary;
  deductionSummary?: DeductionSummary;
}

export interface DashboardStatsProps {
  userData: UserData;
  attendanceSummary: AttendanceSummary | null;
  deductionSummary?: DeductionSummary | null;
}
