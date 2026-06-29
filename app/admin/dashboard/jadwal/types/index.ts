export interface ShiftDetail {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  checkIn: string;
  checkOut: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  isFlexible: boolean;
  details: ShiftDetail[];
}

export interface ShiftFormState {
  name: string;
  isFlexible: boolean;
  details: ShiftDetail[];
}

export interface SpecialWorkDate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SpecialWorkDateFormState {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AssignTarget {
  id: string;
  name: string;
  type: "shift" | "special_work_date";
}

export interface Division {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  niy?: string;
  jabatan?: string;
  role?: string;
  workShiftId?: string;
  divisi?: Division;
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  divisions?: Division[];
  error?: string;
}

// app/admin/pengaturan-jadwal/types/index.ts

export interface Division {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  niy?: string;
  jabatan?: string;
  role?: string;
  workShiftId?: string;
  divisi?: Division;
}

export interface SpecialWorkDate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string; // BARU: Jam Masuk Kerja
  endTime: string;   // BARU: Jam Pulang Kerja
  totalEmployees?: number;
}

export interface SpecialWorkDateFormState {
  name: string;
  startDate: string;
  endDate: string;
  startTime: string; // BARU
  endTime: string;   // BARU
}