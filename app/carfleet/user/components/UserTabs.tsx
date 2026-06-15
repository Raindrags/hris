import React from "react";
import {
  Car,
  Bus,
  ClipboardList,
  Info,
  ArrowRight,
  Navigation2,
  UserPlus,
  PackagePlus,
  Archive,
  Smile,
  Box,
  Lightbulb,
  FileEdit,
  ShieldCheck,
  Key,
  KeyRound,
} from "lucide-react";

// ==========================================
// TAB 1: SEWA MANDIRI (BOOKING)
// ==========================================
export function BookingTab({
  selectedFleet,
  setSelectedFleet,
  selectedDate,
  setSelectedDate,
  onOpenBookingModal,
}: any) {
  // Generate 30 hari untuk bulan Juni 2026 (Juni memiliki 30 hari)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Fungsi untuk mengecek apakah suatu tanggal adalah akhir pekan (Sabtu/Minggu)
  // Asumsi: 1 Juni 2026 adalah hari Senin. Maka tanggal 6, 7, 13, 14, dst adalah akhir pekan.
  const isWeekend = (day: number) => {
    return day % 7 === 6 || day % 7 === 0;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-[#1a365d]">
          Sewa Mandiri Kendaraan
        </h3>
        <p className="text-slate-500 text-sm">
          Gunakan form ini jika Anda memerlukan satu armada penuh untuk kegiatan
          dinas atau rombongan khusus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4" /> Armada Sekolah Tersedia
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Armada 1 */}
            <div
              className={`bg-white border-2 rounded-3xl p-5 cursor-pointer transition-all relative ${selectedFleet === 1 ? "border-teal-600 shadow-md shadow-teal-600/10" : "border-slate-100"}`}
              onClick={() => setSelectedFleet(1)}
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-[#1a365d] text-base">
                Toyota Hiace Commuter
              </h5>
              <p className="text-xs text-slate-400 font-bold mt-1 mb-3">
                Plat B 1234 SCH • 15 Kursi
              </p>
              <span className="inline-block bg-teal-50 text-teal-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Pilihan Utama Rombongan
              </span>
            </div>

            {/* Armada 2 */}
            <div
              className={`bg-white border-2 rounded-3xl p-5 cursor-pointer transition-all relative ${selectedFleet === 2 ? "border-teal-600 shadow-md shadow-teal-600/10" : "border-slate-100"}`}
              onClick={() => setSelectedFleet(2)}
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-[#1a365d] text-base">
                Kijang Innova Reborn
              </h5>
              <p className="text-xs text-slate-400 font-bold mt-1 mb-3">
                Plat B 5678 SCH • 7 Kursi
              </p>
              <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Perjalanan Dinas Standard
              </span>
            </div>
          </div>

          {/* Kalender Bulan Penuh */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-extrabold text-[#1a365d] text-base">
                Ketersediaan Kalender (Juni 2026)
              </h5>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Penuh
                / Libur
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 border-b border-slate-100 pb-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>

            {/* Grid Tanggal 1-30 */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {daysInMonth.map((day) => {
                const disabled = isWeekend(day) || day === 15; // Contoh disable weekend & tanggal 15 (dianggap sudah di-booking penuh)
                const selected = selectedDate === day;

                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => setSelectedDate(day)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition relative ${
                      disabled
                        ? "bg-rose-50 text-rose-400 cursor-not-allowed opacity-70"
                        : selected
                          ? "bg-teal-600 text-white shadow-md shadow-teal-100 scale-105 z-10"
                          : "bg-slate-50 hover:bg-teal-50 hover:text-teal-600 text-slate-700"
                    }`}
                  >
                    {day}
                    {/* Indikator titik merah kecil untuk hari yang sudah penuh/tidak bisa dipesan */}
                    {disabled && (
                      <span className="absolute top-1 right-1.5 w-1 h-1 bg-rose-400 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan & Submit */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Ringkasan Sesi Sewa
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-400">
                Armada Dipilih
              </span>
              <h5 className="font-extrabold text-[#1a365d] mt-0.5">
                {selectedFleet === 1
                  ? "Toyota Hiace Commuter"
                  : "Kijang Innova Reborn"}
              </h5>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-400">
                Tanggal Pemesanan
              </span>
              <h5 className="font-extrabold text-[#1a365d] mt-0.5">
                {selectedDate
                  ? `${["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][selectedDate % 7]}, ${selectedDate} Juni 2026`
                  : "Belum Memilih Tanggal"}
              </h5>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3 text-teal-700">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                Kendaraan gratis digunakan untuk operasional resmi sekolah
                setelah disetujui GA.
              </p>
            </div>
            <button
              disabled={!selectedDate}
              onClick={onOpenBookingModal}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold py-3.5 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              <span>Isi Form Sewa Armada</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB 2: IKUT SERTA (NEBENG) & TITIP BARANG
// ==========================================
export function NebengTab({
  nebengList,
  packageList,
  onOpenJoinModal,
  onOpenTitipModal,
}: any) {
  const activeTripMock = {
    id: 1,
    name: "Shuttle Bus ke Gedung 2",
    fleet: "Toyota Hiace",
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#1a365d]">
            Ikut Serta & Titip Pengiriman
          </h3>
          <p className="text-slate-500 text-sm">
            Mari hemat anggaran sekolah dengan bergabung ke armada yang searah.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-pulse">
          <Lightbulb className="w-4 h-4" /> Solusi Efisiensi Energi
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom 1: Ketersediaan Mobil Searah */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <Navigation2 className="w-4 h-4" /> Keberangkatan Hari Ini
          </h4>
          <div className="bg-white border border-slate-100 hover:border-teal-600 rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-teal-600"></div>
            <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
              Shuttle Rutin
            </span>
            <h5 className="font-extrabold text-[#1a365d] text-lg mt-1.5 mb-4">
              Shuttle Bus ke Gedung 2
            </h5>
            <div className="space-y-2 text-xs text-slate-500 font-semibold mb-6">
              <p>
                Keberangkatan:{" "}
                <span className="text-slate-700">Gedung 1 (09:00 WIB)</span>
              </p>
              <p>
                Armada:{" "}
                <span className="text-slate-700">
                  Toyota Hiace (B 1234 SCH)
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onOpenJoinModal(activeTripMock)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> Ikut Serta
              </button>
              <button
                onClick={() => onOpenTitipModal(activeTripMock)}
                className="bg-slate-100 hover:bg-slate-200 text-[#1a365d] font-extrabold py-2.5 px-4 rounded-xl text-xs flex justify-center gap-1.5"
              >
                <PackagePlus className="w-3.5 h-3.5" /> Titip Barang
              </button>
            </div>
          </div>
        </div>

        {/* Kolom 2: Aktivitas Nebeng Saya */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
            <Archive className="w-4 h-4" /> Partisipasi Aktif Anda
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h5 className="font-extrabold text-[#1a365d] text-sm mb-3">
                Tumpangan Saya (Nebeng)
              </h5>
              {nebengList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
                  <Smile className="w-8 h-8 mx-auto stroke-1.5 text-slate-300 mb-2" />{" "}
                  Belum ikut perjalanan.
                </div>
              ) : (
                nebengList.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="bg-teal-50 border border-teal-100 rounded-2xl p-4 relative mb-3"
                  >
                    <span className="absolute top-3 right-3 bg-teal-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {item.status}
                    </span>
                    <h6 className="font-extrabold text-[#1a365d] text-sm">
                      {item.tripName}
                    </h6>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Turun di: <strong>{item.dropOff}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>

            <div>
              <h5 className="font-extrabold text-[#1a365d] text-sm mb-3">
                Paket Dititipkan
              </h5>
              {packageList.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
                  <Box className="w-8 h-8 mx-auto stroke-1.5 text-slate-300 mb-2" />{" "}
                  Belum ada titipan.
                </div>
              ) : (
                packageList.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative mb-3"
                  >
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {item.status}
                    </span>
                    <h6 className="font-extrabold text-[#1a365d] text-sm">
                      {item.description}
                    </h6>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Penerima: <strong>{item.receiver}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB 3: STATUS SAYA (PENGEMBALIAN)
// ==========================================
export function StatusTab({ onOpenReturnModal }: any) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 text-center sm:text-left">
        <h3 className="text-2xl font-black text-[#1a365d]">
          Histori & Permohonan
        </h3>
        <p className="text-slate-500 text-sm">
          Selesaikan peminjaman dengan lapor pengembalian kunci fisik.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>

        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 flex items-center justify-center rounded-2xl">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#1a365d] text-lg">
                Toyota Hiace Commuter
              </h4>
              <span className="text-xs text-slate-400 font-bold">
                Plat: B 1234 SCH
              </span>
            </div>
          </div>
          <span className="bg-teal-50 text-teal-600 border border-teal-100 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase">
            Sedang Digunakan
          </span>
        </div>

        {/* Stepper Status */}
        <div className="pt-6 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2 relative">
            <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 -z-0">
              <div className="w-2/3 h-full bg-teal-600"></div>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center border-4 border-white shadow">
                <FileEdit className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center border-4 border-white shadow">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col items-center z-10 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center border-4 border-white shadow">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow">
                <Archive className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 text-center">
          <button
            onClick={onOpenReturnModal}
            className="w-full bg-[#1a365d] hover:bg-[#112440] text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <KeyRound className="w-5 h-5" /> Selesaikan Sewa & Serahkan Kunci
          </button>
        </div>
      </div>
    </div>
  );
}
