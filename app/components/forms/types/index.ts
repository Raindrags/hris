export interface LeaveUserData {
  sisaCuti: number | string;
  [key: string]: unknown;
}

export interface LeaveSubmitPayload {
  startDate: string;
  endDate: string;
  reason: string;
  userId?: string;
}

export interface LeaveFormProps {
  user: LeaveUserData;
  onSuccess: () => void;
  userId?: string;
}

export interface CalendarEventResponse {
  date?: string;
  tanggal?: string;
}

export interface SubstituteUser {
  id: string;
  name: string;
  divisi?: { id: string; name: string } | null;
}

export interface ApprovalRequestData {
  id: string;
  type: "CUTI" | "IZIN";
  reason?: string;
  startDate: Date | string;
  endDate: Date | string;
  startTime?: string;
  endTime?: string;
  category?: string;
  time?: string | null;
  attachmentUrl?: string | null;
  user: {
    id: string;
    name: string;
    divisi?: { id: string; name: string } | null;
    category?: string;
  };
}
