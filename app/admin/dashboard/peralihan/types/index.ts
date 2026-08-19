export interface Supervisor {
  id: string;
  name: string;
  role?: string;
}

export interface PeralihanAtasan {
  id: string;
  atasanLamaId: string;
  atasanBaruId: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  alasan?: string;

  // Field dari mockup lama (opsional)
  atasanLamaName?: string;
  atasanBaruName?: string;

  // Field relasi dari backend NestJS
  atasanLama?: Supervisor;
  atasanBaru?: Supervisor;
}

export interface PeralihanFormState {
  atasanLamaId: string;
  atasanBaruId: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  alasan: string;
}
