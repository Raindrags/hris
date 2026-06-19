"use client";

import React from "react";
import { X } from "lucide-react";

// Modal Wrapper UI
const ModalWrapper = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-extrabold text-[#1a365d] text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 bg-white rounded-full p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export function BookingModal({ isOpen, onClose, onSubmit }: any) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Lengkapi Data Sewa">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Tujuan / Keperluan</label>
          <input name="destination" required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" placeholder="Contoh: Kunjungan Dinas Diknas" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Jam Keluar</label>
            <input name="timeOut" required type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Jam Kembali</label>
            <input name="timeIn" required type="time" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah Penumpang</label>
          <input name="passengers" required type="number" min="1" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" placeholder="1" />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white font-extrabold py-3 rounded-xl mt-4">Kirim Permohonan</button>
      </form>
    </ModalWrapper>
  );
}

export function JoinModal({ isOpen, onClose, onSubmit, activeTrip }: any) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Ikut Serta (Nebeng)">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 font-semibold mb-4 bg-teal-50 p-3 rounded-xl text-teal-800">Anda akan nebeng di trip: <strong>{activeTrip?.name}</strong></p>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Lokasi Turun</label>
          <input name="dropOff" required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" placeholder="Contoh: Halte Depan Mall" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Kebutuhan Kursi</label>
          <input name="seats" required type="number" min="1" max="4" defaultValue={1} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white font-extrabold py-3 rounded-xl mt-4">Kirim Notifikasi ke Supir</button>
      </form>
    </ModalWrapper>
  );
}

export function TitipModal({ isOpen, onClose, onSubmit, activeTrip }: any) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Titip Paket Barang">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 font-semibold mb-4 bg-amber-50 p-3 rounded-xl text-amber-800">Dititipkan pada trip: <strong>{activeTrip?.name}</strong></p>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Barang</label>
          <input name="itemDesc" required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" placeholder="Dokumen penting map merah" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Penerima & Kontak</label>
          <input name="receiver" required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500" placeholder="Pak Anton (0812xxxx)" />
        </div>
        <button type="submit" className="w-full bg-[#1a365d] text-white font-extrabold py-3 rounded-xl mt-4">Simpan Log Penitipan</button>
      </form>
    </ModalWrapper>
  );
}

export function ReturnModal({ isOpen, onClose, onConfirm }: any) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Selesaikan Peminjaman">
      <div className="text-center py-4">
        <p className="text-sm font-semibold text-slate-600 mb-6">Apakah Anda yakin sudah memarkir armada kembali di sekolah dan menyerahkan kunci ke ruang GA?</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="bg-slate-100 text-slate-600 font-extrabold py-3 rounded-xl">Batal</button>
          <button onClick={onConfirm} className="bg-[#1a365d] text-white font-extrabold py-3 rounded-xl">Ya, Sudah Selesai</button>
        </div>
      </div>
    </ModalWrapper>
  );
}