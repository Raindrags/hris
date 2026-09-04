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
  type: "CUTI" | "IZIN" | "NO_FP";
  reason?: string;
  startDate: Date | string;
  endDate: Date | string;
  startTime?: string;
  endTime?: string;
  category?: string;
  subCategory?: string; // Ditambahkan untuk Izin Khusus
  time?: string | null;
  returnTime?: string | null; // Ditambahkan untuk Izin Keluar
  durationHours?: number | null; // Ditambahkan untuk durasi jam
  durationDays?: number | null; // Ditambahkan untuk durasi hari
  sisaJatahIzinKeluar?: number; // Ditambahkan untuk batas sisa izin keluar
  attachmentUrl?: string | null;
  suratDokter?: boolean | string; // Ditambahkan untuk status checklist surat dokter
  fpDatang?: boolean | null;
  fpPulang?: boolean | null;
  user: {
    id: string;
    name: string;
    divisi?: { id: string; name: string } | null;
    category?: string;
    sisaCuti?: number | null;
    isGuru?: boolean | string;
    sisaIzinKeluar?: number | null;
  };
}
