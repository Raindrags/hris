export interface AttendanceLog {
  date: string;
  dayName: string;
  isSpecialWorkDay: boolean;
  isHoliday: boolean;
  holidayName?: string | null;
  targetIn: string;
  targetOut: string;
  in: string | null;
  out: string | null;
  lateDuration: string;
  earlyLeaveDuration: string;
  isAbsent: boolean;
  status: string;
  leaveType?: string | null;
  partialLeave?: any;
  isLateApproved?: boolean;
  isEarlyApproved?: boolean;
}

// 1. TAMBAHAN: Interface untuk Detail Shift Pegawai
export interface WorkShiftDetail {
  dayOfWeek: number; // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  [key: string]: any; // Boleh diisi startTime/endTime jika backend mengirimkannya
}

// 2. TAMBAHAN: Interface untuk Induk Shift Pegawai
export interface WorkShift {
  name?: string;
  details?: WorkShiftDetail[];
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

  // 3. TAMBAHAN: Tipe Data untuk Filter Hari Libur
  workShift?: WorkShift;
  shiftType?: string;
}

export interface Division {
  id: string;
  name: string;
}
