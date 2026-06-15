import React from "react";
import { X, KeyRound } from "lucide-react";

// --- 1. MODAL BOOKING ARMADA PENUH ---
export function BookingModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (e: React.FormEvent) => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#112440]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95">
        <button className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h3 className="font-extrabold text-2xl text-[#1a365d] mb-2">Form Sewa Armada Penuh</h3>
        <p className="text-slate-500 text-xs mb-6">Pilih tanggal dan ajukan pemakaian resmi. Tim Sarpras/GA akan meninjau pengajuan ini.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tujuan Perjalanan Dinas</label>
            <input name="destination" type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white p-3 rounded-xl outline-none font-semibold text-sm transition" placeholder="Contoh: Rapat MGMP di Dinas Pendidikan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Ambil</label>
              <input name="timeOut" type="time" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Kembali</label>
              <input name="timeIn" type="time" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm transition" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Penumpang</label>
            <input name="passengers" type="number" min="1" max="15" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm transition" placeholder="Berapa orang?" />
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition mt-2 shadow-lg">
            Kirim Form Sewa
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 2. MODAL IKUT SERTA (NEBENG) ---
export function JoinModal({ isOpen, onClose, onSubmit, activeTrip }: { isOpen: boolean, onClose: () => void, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, activeTrip: any }) {
  if (!isOpen || !activeTrip) return null;
  return (
    <div className="fixed inset-0 bg-[#112440]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
        <button className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h3 className="font-extrabold text-2xl text-[#1a365d] mb-2">Ikut Serta Perjalanan</h3>
        <p className="text-slate-500 text-xs mb-6">Minta tumpangan ke armada perjalanan dinas yang sedang berlangsung hari ini.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tujuan Akhir Mobil</span>
            <strong className="font-extrabold text-[#1a365d] text-sm block">{activeTrip.name} ({activeTrip.fleet})</strong>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Turun Anda</label>
            <input name="dropOff" type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm" placeholder="Contoh: Depan Gerbang Gedung 2" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Orang</label>
            <select name="seats" className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm">
              <option value="1">1 Orang (Hanya Saya)</option>
              <option value="2">2 Orang</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition mt-2 shadow-lg">
            Kirim Permintaan Tumpangan
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 3. MODAL TITIP BARANG ---
export function TitipModal({ isOpen, onClose, onSubmit, activeTrip }: { isOpen: boolean, onClose: () => void, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, activeTrip: any }) {
  if (!isOpen || !activeTrip) return null;
  return (
    <div className="fixed inset-0 bg-[#112440]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
        <button className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h3 className="font-extrabold text-2xl text-[#1a365d] mb-2">Titipkan Barang</h3>
        <p className="text-slate-500 text-xs mb-6">Titipkan berkas atau logistik ukuran sedang pada mobil searah.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perjalanan Pengirim</span>
            <strong className="font-extrabold text-[#1a365d] text-sm block">{activeTrip.name}</strong>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Barang</label>
            <input name="itemDesc" type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm" placeholder="Contoh: Berkas Rapor Map Cokelat" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Penerima</label>
            <input name="receiver" type="text" required className="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 p-3 rounded-xl outline-none font-semibold text-sm" placeholder="Contoh: Ibu Ani Rahmawati (TU)" />
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition mt-2 shadow-lg">
            Daftarkan Titipan
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 4. MODAL KONFIRMASI KEMBALI KENDARAAN ---
export function ReturnModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#112440]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center relative animate-in zoom-in-95">
        <button className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <div className="w-16 h-16 bg-teal-50 text-teal-600 flex items-center justify-center rounded-full mx-auto mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-xl text-[#1a365d] mb-2">Konfirmasi Pengembalian</h3>
        <p className="text-slate-500 text-xs mb-6">Apakah Anda yakin sudah memarkir kendaraan dan menyerahkan kunci ke GA?</p>
        <div className="flex gap-3">
          <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition" onClick={onClose}>Batal</button>
          <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-sm transition" onClick={onConfirm}>Ya, Sudah</button>
        </div>
      </div>
    </div>
  );
}