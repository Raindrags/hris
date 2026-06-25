import React, { useState } from "react";
import {
  Car,
  Bus,
  Check,
  ClipboardList,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BookingViewProps {
  selectedFleet: string | number;
  setSelectedFleet: (id: string | number) => void;
  selectedDate: string; // Menggunakan format "YYYY-MM-DD" agar mencakup bulan & tahun
  setSelectedDate: (date: string) => void;
  openModal: () => void;
}

export default function BookingView({
  selectedFleet,
  setSelectedFleet,
  selectedDate,
  setSelectedDate,
  openModal,
}: BookingViewProps) {
  // 1. STATE UNTUK BULAN DAN TAHUN AKTIF DI KALENDER
  // Default diatur ke Juni 2026 sesuai dengan kebutuhan awal Anda
  const [currentMonth, setCurrentMonth] = useState(5); // 0 = Januari, 5 = Juni, dst.
  const [currentYear, setCurrentYear] = useState(2026);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // 2. LOGIK GENERATOR KALENDER DINAMIS
  // Mendapatkan jumlah hari dalam bulan yang sedang aktif
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Mendapatkan hari pertama jatuh di hari apa (0 = Minggu, 1 = Senin, dst.)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Menghitung slot kosong (padding) di awal kalender agar tatanan hari pas dengan "Senin - Minggu"
  // Jika hari pertama adalah Minggu (0), diubah ke indeks 6. Jika Senin (1), diubah ke indeks 0.
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Fungsi navigasi bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Fungsi helper untuk memformat tampilan tanggal terpilih di Ringkasan
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Belum memilih tanggal";
    const parsedDate = new Date(dateStr);
    return `${parsedDate.getDate()} ${monthNames[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* HEADER */}
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
        {/* ================= KOLOM KIRI ================= */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-xs font-black uppercase text-[#0d9488] tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4" /> Armada Sekolah Tersedia
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPSI 1 */}
            <div
              onClick={() => setSelectedFleet(1)}
              className={`rounded-3xl p-5 cursor-pointer transition-all relative ${
                selectedFleet === 1
                  ? "bg-white border-2 border-[#0d9488] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.15),0_8px_10px_-6px_rgba(13,148,136,0.1)]"
                  : "bg-white border border-slate-100 hover:border-[#0d9488]/30 shadow-sm"
              }`}
            >
              {selectedFleet === 1 && (
                <div className="absolute top-4 right-4 bg-[#0d9488] text-white w-6 h-6 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-[#1a365d] text-base">
                Toyota Hiace Commuter
              </h5>
              <p className="text-xs text-slate-400 font-bold mt-1 mb-3">
                Plat B 1234 SCH • 15 Kursi
              </p>
              <span className="inline-block bg-teal-50 text-[#0d9488] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Pilihan Utama Rombongan
              </span>
            </div>

            {/* OPSI 2 */}
            <div
              onClick={() => setSelectedFleet(2)}
              className={`rounded-3xl p-5 cursor-pointer transition-all relative ${
                selectedFleet === 2
                  ? "bg-white border-2 border-[#0d9488] shadow-[0_10px_25px_-5px_rgba(13,148,136,0.15),0_8px_10px_-6px_rgba(13,148,136,0.1)]"
                  : "bg-white border border-slate-100 hover:border-[#0d9488]/30 shadow-sm"
              }`}
            >
              {selectedFleet === 2 && (
                <div className="absolute top-4 right-4 bg-[#0d9488] text-white w-6 h-6 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
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

          {/* KALENDER DINAMIS */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            {/* Header Kalender dengan Navigasi Bulan */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h5 className="font-extrabold text-[#1a365d] text-base">
                  Ketersediaan Kalender ({monthNames[currentMonth]}{" "}
                  {currentYear})
                </h5>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-white rounded-lg text-slate-600 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-white rounded-lg text-slate-600 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                Tekan tanggal untuk memilih
              </span>
            </div>

            {/* Nama-Nama Hari */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>

            {/* Isi Grid Kalender */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {/* 1. Render Padding/Slot Kosong di awal bulan */}
              {Array.from({ length: paddingDays }).map((_, index) => (
                <div key={`pad-${index}`} className="py-3"></div>
              ))}

              {/* 2. Render Tanggal-Tanggal Aktif (Semua Terbuka & Bisa Diklik) */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayString = String(index + 1).padStart(2, "0");
                const monthString = String(currentMonth + 1).padStart(2, "0");
                const fullDateStr = `${currentYear}-${monthString}-${dayString}`;

                const isSelected = selectedDate === fullDateStr;

                return (
                  <button
                    key={`day-${index + 1}`}
                    onClick={() => setSelectedDate(fullDateStr)}
                    className={`py-3 rounded-xl font-bold transition relative ${
                      isSelected
                        ? "bg-[#0d9488] text-white font-extrabold shadow-md shadow-teal-100"
                        : "bg-slate-50 hover:bg-teal-50 hover:text-[#0d9488] text-slate-700"
                    }`}
                  >
                    {index + 1}
                    {isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= KOLOM KANAN ================= */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase text-[#0d9488] tracking-wider flex items-center gap-2">
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
                {formatDisplayDate(selectedDate)}
              </h5>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3 text-[#0d9488]">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                Kendaraan ini gratis digunakan untuk operasional resmi sekolah
                setelah disetujui GA.
              </p>
            </div>

            <button
              onClick={openModal}
              disabled={!selectedDate}
              className={`w-full font-extrabold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 ${
                selectedDate
                  ? "bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-lg shadow-teal-100 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
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
