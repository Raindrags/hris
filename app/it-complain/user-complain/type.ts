export type ComplaintType = "IT" | "CCTV";
export type ITCategory = "Printer" | "PC/Laptop" | "Internet";

export interface UserIdentity {
  nama: string;
  niy: string;
  divisi: string;
}

export interface ITComplaintData {
  masalah: string;
  kategori: ITCategory | string;
  lokasi: string;
}

export interface CCTVComplaintData {
  titikLokasi: string;
  perkiraanJam: string;
  masalah: string;
}

export interface ComplaintSubmission {
  id?: string;
  kodeTiket?: string;
  type: ComplaintType;
  user: UserIdentity;
  data: ITComplaintData | CCTVComplaintData;
  status:
    | "PENDING"
    | "DIPROSES"
    | "MENUNGGU_KONFIRMASI"
    | "SELESAI"
    | "BATAL"
    | string;
  dikerjakanOleh?: string | null;
  solusi?: string | null;
  saran?: string | null;
  keterangan?: string | null;
  rating?: number | null;
  ulasanUser?: string | null;
  confirmedAt?: Date | string | null;
  createdAt: Date;
  updatedAt?: Date | string;
}

export interface CCTVComplaintData {
  titikLokasi: string;
  tanggalKejadian: string;
  perkiraanJam: string;
  masalah: string;
}