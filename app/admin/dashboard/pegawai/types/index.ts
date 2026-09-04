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
  supervisorId?: string | null;
  divisiId?: string | null;
  niy?: string;
  phone?: string;
  emergencyContact?: string;
  jabatan?: string;
  jatahCuti?: string | number;
  sortOrder?: string | number;
  isGuru?: boolean;
  supervisor?: Supervisor;
  divisi?: Division;
  jatahIzinKeluar?: string | number;
  sisaIzinKeluar?: string | number;
  joinDate?: string | Date;
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
