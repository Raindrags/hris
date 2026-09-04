// File: pegawai/types/index.ts

export interface Division {
  id: string | number;
  name: string;
}

export interface Supervisor {
  id: string | number;
  name?: string;
  fullName?: string;
  role?: string;
}

export interface Employee {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  supervisorId?: string | null;
  supervisor?: { id: string; name?: string };
  divisiId?: string | null;
  divisi?: { id: string; name?: string };
  niy?: string;
  phone?: string;
  emergencyContact?: string;
  jabatan?: string;
  jatahCuti?: string | number;
  sortOrder?: string | number | null;
  joinDate?: string | Date | null;
  isGuru?: boolean;
  jatahIzinKeluar?: string | number;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  supervisorId: string;
  role: string;
  divisiId: string;
  niy: string;
  phone: string;
  emergencyContact: string;
  jabatan: string;
  jatahCuti: string;
  sortOrder?: string;
  isGuru: boolean;
  jatahIzinKeluar: string;
  joinDate: string;
}
