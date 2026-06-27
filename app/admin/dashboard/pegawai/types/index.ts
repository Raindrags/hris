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
  divisiId?: string | null;
  niy?: string;
  phone?: string;
  emergencyContact?: string;
  jabatan?: string;
  jatahCuti?: string | number;
  supervisor?: Supervisor;
  divisi?: Division;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  role: string;
  supervisorId: string;
  divisiId: string;
  niy: string;
  phone: string;
  emergencyContact: string;
  jabatan: string;
  jatahCuti: string;
}
