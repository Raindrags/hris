

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
  }
];

export const mockPengembalian = [
  {
    id: "ret-1",
    kendaraan: "Toyota Hiace (B 1234 SCH)",
    peminjam: "Budi Santoso",
    waktuKembali: "Hari ini, 15:05 WIB",
    status: "Kunci Diserahkan",
  }
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
  }
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
  }
];