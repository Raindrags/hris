export type ComplaintType = "IT" | "CCTV";
export type ITCategory = "Printer" | "PC/Laptop" | "Internet";

export interface UserIdentity {
  nama: string;
  niy: string;
  divisi: string;
}

export interface ITComplaintData {
  masalah: string;
  kategori: ITCategory | "";
  lokasi: string;
}

export interface CCTVComplaintData {
  titikLokasi: string;
  perkiraanJam: string;
  masalah: string;
}

export interface ComplaintSubmission {
  id?: string;
  type: ComplaintType;
  user: UserIdentity;
  data: ITComplaintData | CCTVComplaintData;
  status: "Pending" | "Diproses" | "Selesai";
  createdAt: Date;
}
