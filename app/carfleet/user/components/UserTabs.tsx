"use client";

import React, { useEffect, useState } from "react";
import { Car, ClipboardList, Navigation2, UserPlus, PackagePlus, Archive } from "lucide-react";
import { Vehicle, TripContext, BookingHistory, NebengItem, PackageItem } from "./UserPortalView";

interface BookingTabProps {
  vehicles: Vehicle[];
  selectedFleet: number | string | null;
  setSelectedFleet: React.Dispatch<React.SetStateAction<number | string | null>>;
  selectedDate: number | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<number | null>>;
  onOpenBookingModal: () => void;
}

export function BookingTab({ vehicles, selectedFleet, setSelectedFleet, selectedDate, setSelectedDate, onOpenBookingModal }: BookingTabProps) {
  // PENDING DULU: Menggunakan basic array 30 hari untuk menunggu backend libur
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const isWeekend = (day: number) => day % 7 === 6 || day % 7 === 0;

  const selectedVehicleData = vehicles.find((v) => v.id === selectedFleet);

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2"><Car className="w-4 h-4" /> Armada Tersedia</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.length === 0 ? (
            <div className="col-span-2 p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-500 font-semibold text-sm">Belum ada data armada.</div>
          ) : (
            vehicles.map((v) => {
              const isSelected = selectedFleet === v.id;
              return (
                <div key={v.id} onClick={() => setSelectedFleet(v.id)} className={`bg-white border-2 rounded-3xl p-5 cursor-pointer transition-all ${isSelected ? "border-teal-600 shadow-md" : "border-slate-100 hover:border-teal-300"}`}>
                  <h5 className="font-extrabold text-[#1a365d] text-base">{v.name}</h5>
                  <p className="text-xs text-slate-400 font-bold mt-1">Plat: {v.platNumber}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h5 className="font-extrabold text-[#1a365d] text-base mb-4">Pilih Tanggal (Pending API Libur)</h5>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {daysInMonth.map((day) => {
              const disabled = isWeekend(day);
              const selected = selectedDate === day;
              return (
                <button key={day} disabled={disabled} onClick={() => setSelectedDate(day)} className={`py-2 rounded-xl text-sm font-bold transition ${disabled ? "bg-slate-50 text-slate-300 cursor-not-allowed" : selected ? "bg-teal-600 text-white" : "bg-slate-100 hover:bg-teal-50"}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Ringkasan</h4>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-slate-400">Armada</span>
            <h5 className="font-extrabold text-[#1a365d]">{selectedVehicleData?.name || "-"}</h5>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-slate-400">Tanggal</span>
            <h5 className="font-extrabold text-[#1a365d]">{selectedDate ? `Tanggal ${selectedDate}` : "-"}</h5>
          </div>
          <button disabled={!selectedDate || !selectedFleet} onClick={onOpenBookingModal} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3.5 rounded-2xl transition">Lanjutkan Pemesanan</button>
        </div>
      </div>
    </div>
  );
}

interface NebengTabProps {
  nebengList: NebengItem[];
  packageList: PackageItem[];
  onOpenJoinModal: (trip: TripContext) => void;
  onOpenTitipModal: (trip: TripContext) => void;
}

export function NebengTab({ nebengList, packageList, onOpenJoinModal, onOpenTitipModal }: NebengTabProps) {
  const [activeTrips, setActiveTrips] = useState<TripContext[]>([]);

  useEffect(() => {
    fetch('/api/ga/trips')
      .then(res => res.json())
      .then(json => { if (json.success) setActiveTrips(json.data); })
      .catch(() => console.error("Gagal load trips"));
  }, []);

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider"><Navigation2 className="w-4 h-4 inline mr-2" /> Keberangkatan Hari Ini</h4>
        {activeTrips.length === 0 ? (
           <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-500 font-semibold text-sm">Tidak ada jadwal atau sedang memuat...</div>
        ) : activeTrips.map((trip) => (
          <div key={trip.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-4">
            <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Aktif</span>
            <h5 className="font-extrabold text-[#1a365d] text-lg mt-2 mb-4">{trip.name}</h5>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onOpenJoinModal(trip)} className="bg-teal-600 text-white font-extrabold py-2 px-4 rounded-xl text-xs"><UserPlus className="w-3.5 h-3.5 inline mr-1" /> Ikut Serta</button>
              <button onClick={() => onOpenTitipModal(trip)} className="bg-slate-100 text-[#1a365d] font-extrabold py-2 px-4 rounded-xl text-xs"><PackagePlus className="w-3.5 h-3.5 inline mr-1" /> Titip Barang</button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase text-teal-600 tracking-wider"><Archive className="w-4 h-4 inline mr-2" /> Partisipasi Anda</h4>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h5 className="font-extrabold text-sm mb-3">Tumpangan (Nebeng)</h5>
            {nebengList.length === 0 ? <p className="text-xs text-slate-400">Belum ada data nebeng.</p> : nebengList.map((item, i) => (
              <div key={i} className="bg-teal-50 rounded-2xl p-4 mb-2">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">{item.status}</span>
                <h6 className="font-extrabold text-sm mt-1">{item.tripName}</h6>
                <p className="text-xs text-slate-500">Turun: {item.dropOff} ({item.seats} Kursi)</p>
              </div>
            ))}
          </div>
          <div>
            <h5 className="font-extrabold text-sm mb-3">Titipan Paket</h5>
            {packageList.length === 0 ? <p className="text-xs text-slate-400">Belum ada data titipan.</p> : packageList.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4 mb-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{item.status}</span>
                <h6 className="font-extrabold text-sm mt-1">{item.description}</h6>
                <p className="text-xs text-slate-500">Penerima: {item.receiver}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusTabProps {
  historyList: BookingHistory[];
  onOpenReturnModal: () => void;
}

export function StatusTab({ historyList, onOpenReturnModal }: StatusTabProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-3xl mx-auto">
      <h3 className="text-2xl font-black text-[#1a365d] mb-6">Status Peminjaman</h3>
      {historyList.length === 0 ? (
         <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-500 font-semibold text-sm">Belum ada riwayat peminjaman armada.</div>
      ) : historyList.map((history) => (
        <div key={history.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-lg text-[#1a365d]">{history.vehicle?.name || "Kendaraan"}</h4>
              <p className="text-xs font-bold text-slate-400">Tujuan: {history.destination}</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase">{history.status}</span>
          </div>
          {history.status === "APPROVED" && (
            <button onClick={onOpenReturnModal} className="w-full bg-[#1a365d] text-white font-extrabold py-3 mt-4 rounded-xl">Serahkan Kunci Kendaraan</button>
          )}
        </div>
      ))}
    </div>
  );
}