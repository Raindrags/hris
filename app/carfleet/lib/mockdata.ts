export const mockStats = {
  menungguPersetujuan: 2,
  menungguValidasi: 1,
};

export const mockAktivitas = [
  {
    id: 1,
    pengguna: "Antar Jemput Siswa",
    rute: "Perum. Anggrek - Sekolah",
    kendaraan: "Toyota Hiace",
    jadwal: "Setiap Hari Kerja",
    waktu: "06:00 & 15:30 WIB",
    status: "Jadwal Rutin",
    tipeKendaraan: "bus",
  },
  {
    id: 2,
    pengguna: "Ani Nuraeni",
    rute: "Guru Biologi",
    kendaraan: "Kijang Innova",
    jadwal: "Besok, 4 Jun 2026",
    waktu: "08:00 - 13:00 WIB",
    status: "Menunggu GA",
    tipeKendaraan: "car",
  },
];

export const mockPersetujuan = [
  {
    id: "req-1",
    pemohon: "Ani Nuraeni (Guru Biologi)",
    tujuan: "Rapat Dinas Pendidikan",
    kendaraan: "Kijang Innova (B 5678 SCH)",
    tanggal: "4 Jun 2026",
    waktu: "08:00 - 13:00 WIB",
  },
];

export const mockPengembalian = [
  {
    id: "ret-1",
    kendaraan: "Toyota Hiace (B 1234 SCH)",
    peminjam: "Budi Santoso",
    waktuKembali: "Hari ini, 15:05 WIB",
    status: "Kunci Diserahkan",
  },
];

export const mockRiwayat = [
  {
    id: 1,
    kendaraan: "Toyota Hiace Commuter",
    plat: "B 1234 SCH",
    jenis: "Isi BBM Pertadex",
    tipe: "BBM", // "BBM" atau "SERVIS"
    tanggal: "2 Jun 2026",
    km: "45.000",
    biaya: "Rp 450.000",
  },
];

export const mockKendaraan = [
  {
    id: "k-1",
    nama: "Toyota Hiace Commuter",
    plat: "B 1234 SCH",
    tipe: "Minibus",
    kapasitas: "15 Penumpang",
    status: "Tersedia",
  },
  {
    id: "k-2",
    nama: "Kijang Innova Reborn",
    plat: "B 5678 SCH",
    tipe: "MPV",
    kapasitas: "7 Penumpang",
    status: "Sedang Dipakai",
  },
  {
    id: "k-3",
    nama: "Suzuki APV Arena",
    plat: "B 9012 SCH",
    tipe: "Minivan",
    kapasitas: "8 Penumpang",
    status: "Servis",
  },
];

// 1. Export Interface agar bisa dipakai di berbagai komponen
export interface BookingStatus {
  id: string;
  fleetName: string;
  platNumber: string;
  fleetType: "bus" | "car";
  status:
    | "Menunggu Persetujuan"
    | "Disetujui"
    | "Sedang Digunakan"
    | "Selesai"
    | "Ditolak";
  destination: string;
  date: string;
  timeRange: string;
}

// 2. Export Data Dummy
export const myBookings: BookingStatus[] = [
  {
    id: "REQ-001",
    fleetName: "Toyota Hiace Commuter",
    platNumber: "B 1234 SCH",
    fleetType: "bus",
    status: "Sedang Digunakan",
    destination: "Studi Banding SMA 2 Gedung B",
    date: "Rabu, 3 Jun 2026",
    timeRange: "08:00 - 15:00",
  },
  {
    id: "REQ-002",
    fleetName: "Kijang Innova Reborn",
    platNumber: "B 5678 SCH",
    fleetType: "car",
    status: "Menunggu Persetujuan",
    destination: "Dinas Luar - Kantor Diknas",
    date: "Jumat, 12 Jun 2026",
    timeRange: "09:00 - 12:00",
  },
];
