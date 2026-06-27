export interface AttendanceLog {
  date: string;
  dayName: string;
  isSpecialWorkDay: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  in: string | null;
  out: string | null;
  lateDuration: string;
  earlyLeaveDuration: string;
  isAbsent: boolean;
  status: string;
  leaveType?: string | null;
  leaveCategory?: string | null;
  partialLeave?: {
    type: string;
    timeRange: string;
  } | null;
}

export interface EmployeeReport {
  id: string;
  name: string;
  niy: string | null;
  jabatan: string | null;
  isGuruRole: boolean;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  summary: {
    onTime: number;
    late: number;
    off: number;
    noFp: number;
    overtime: number;
    hasViolation: boolean;
    alpa?: number;
    cuti?: number;
    izin?: number;
  };
  logs: AttendanceLog[];
}

export interface Division {
  id: string;
  name: string;
}
