"use client";

import React, { useState, useMemo } from "react";
import { 
  CarFront, Users, Check, Clock, Bolt, 
  ChevronLeft, ChevronRight, AlertTriangle, X 
} from "lucide-react";

interface Vehicle {
  id: string | number;
  name: string;
  platNumber: string;
  capacity: number;
  status: string; // "Tersedia" | "Dipakai" | "Servis"
}

interface BookingViewProps {
  vehicles: Vehicle[];
  allBookings?: any[]; 
  onOpenBookingModal: (vehicleId: string, vehicleName: string, isNow: boolean, date: Date) => void;
}

export default function BookingView({ vehicles, allBookings = [], onOpenBookingModal }: BookingViewProps) {
  // State untuk tanggal yang DIPILIH user
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State untuk navigasi BULAN di Kalender
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  
  const [scheduleModalData, setScheduleModalData] = useState<{
    isOpen: boolean;
    vehicle: Vehicle | null;
    activeBooking: any | null;
  }>({ isOpen: false, vehicle: null, activeBooking: null });

  // Filter jadwal kendaraan berdasarkan TANGGAL YANG DIPILIH
  const vehiclesWithSchedule = useMemo(() => {
    // Gunakan fungsi penyesuaian zona waktu lokal untuk menghindari bug timezone
    const selectedDateString = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000))
                                .toISOString().split('T')[0];

    return vehicles.map((vehicle) => {
      const upcomingBooking = allBookings.find(
        (b) => 
          b.vehicle?.id === vehicle.id && 
          b.status === "APPROVED" && 
          new Date(b.date).toISOString().split('T')[0] === selectedDateString
      );

      return {
        ...vehicle,
        upcomingBooking: upcomingBooking || null,
      };
    });
  }, [vehicles, allBookings, selectedDate]);

  const handleFastTrack = () => {
    const availableVehicle = vehiclesWithSchedule.find(v => v.status === "Tersedia" && !v.upcomingBooking);
    if (availableVehicle) {
      onOpenBookingModal(String(availableVehicle.id), availableVehicle.name, true, selectedDate);
    } else {
      alert("Maaf, saat ini semua kendaraan sedang dipakai atau telah dipesan.");
    }
  };

  // ================= LOGIKA KALENDER =================
  const currentYear = viewMonth.getFullYear();
  const currentMonth = viewMonth.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Minggu

  const handlePrevMonth = () => setViewMonth(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewMonth(new Date(currentYear, currentMonth + 1, 1));

  // Mengecek apakah suatu tanggal memiliki jadwal (untuk indikator titik kuning)
  const hasBookingOnDate = (dateToVerify: Date) => {
    const dateString = new Date(dateToVerify.getTime() - (dateToVerify.getTimezoneOffset() * 60000))
                        .toISOString().split('T')[0];
    return allBookings.some(b => 
        b.status === "APPROVED" && 
        new Date(b.date).toISOString().split('T')[0] === dateString
    );
  };

  // Generate array untuk grid kalender (kotak kosong + tanggal)
  const calendarGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push(<div key={`empty-${i}`} className="py-2"></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const loopDate = new Date(currentYear, currentMonth, d);
    const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
    const isToday = new Date().getDate() === d && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
    const hasBooking = hasBookingOnDate(loopDate);

    calendarGrid.push(
      <div 
        key={`day-${d}`} 
        onClick={() => setSelectedDate(loopDate)}
        className={`py-2 rounded-lg cursor-pointer transition relative flex justify-center items-center font-medium text-sm
          ${isSelected ? "bg-[#1a365d] text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-50 text-slate-700"}
          ${!isSelected && isToday ? "text-[#1a365d] font-bold bg-blue-50/50" : ""}
        `}
      >
        {d}
        
        {/* Indikator titik (Putih jika terpilih, Kuning jika ada jadwal, tidak ada jika kosong) */}
        {hasBooking && (
          <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-amber-500"}`}></span>
        )}
      </div>
    );
  }
  // ================= END LOGIKA KALENDER =================

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pilih Jadwal & Kendaraan</h2>
          <p className="text-slate-500 mt-1">Pilih tanggal di kalender untuk melihat ketersediaan armada.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT COLUMN: CALENDAR ================= */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm lg:sticky lg:top-24">
            
            {/* Header Kalender */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg capitalize">
                {viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            {/* Nama Hari */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                <div key={i} className="text-xs font-bold text-slate-400 py-2">{day}</div>
              ))}
            </div>
            
            {/* Grid Tanggal */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {calendarGrid}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-wider">Keterangan</p>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 bg-[#1a365d] rounded-sm"></span> Hari Terpilih
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span> Ada Jadwal Berjalan
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: VEHICLE LIST ================= */}
        <div className="lg:col-span-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a365d] flex items-center justify-center">
                      <Clock size={20} />
                  </div>
                  <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500">Menampilkan ketersediaan armada.</p>
                  </div>
              </div>
              
              <button onClick={handleFastTrack} className="w-full sm:w-auto px-5 py-2.5 bg-[#1a365d] hover:bg-[#12284a] text-white rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-900/20">
                  <Bolt className="text-yellow-400" size={16} fill="currentColor" /> Pinjam Tercepat
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vehiclesWithSchedule.map((vehicle) => {
              
              if (vehicle.status === "Tersedia" && !vehicle.upcomingBooking) {
                return (
                  <div key={vehicle.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition flex flex-col justify-between h-full group">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                                <CarFront size={24} />
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1">
                              <Check size={14} /> Tersedia
                            </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1">{vehicle.name}</h3>
                        <div className="flex gap-2 text-xs text-slate-500 font-medium mb-5">
                            <span className="bg-slate-50 px-2 py-1 rounded-md text-slate-700 border border-slate-200">{vehicle.platNumber}</span>
                            <span className="px-2 py-1 flex items-center gap-1"><Users size={12} /> {vehicle.capacity} Seat</span>
                        </div>
                    </div>
                    <button 
                      onClick={() => onOpenBookingModal(String(vehicle.id), vehicle.name, false, selectedDate)} 
                      className="w-full py-2.5 bg-blue-50 hover:bg-[#1a365d] hover:text-white text-[#1a365d] rounded-xl text-sm font-bold transition border border-blue-100"
                    >
                        Pilih Mobil Ini
                    </button>
                  </div>
                );
              } 
              else if (vehicle.status === "Dipakai" || vehicle.upcomingBooking) {
                const activeBooking = vehicle.upcomingBooking || allBookings.find(b => b.vehicle?.id === vehicle.id && b.status === "APPROVED");
                return (
                  <div key={vehicle.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full relative overflow-hidden group">
                      <div>
                          <div className="flex justify-between items-start mb-4 relative z-10">
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition">
                                  <CarFront size={24} />
                              </div>
                              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200 shadow-sm flex items-center gap-1">
                                  <Clock size={14} /> {vehicle.status === "Dipakai" ? "Sedang Dipakai" : "Terjadwal"}
                              </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1 relative z-10">{vehicle.name}</h3>
                          <div className="flex gap-2 text-xs text-slate-500 font-medium mb-5 relative z-10">
                              <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-200">{vehicle.platNumber}</span>
                              <span className="px-2 py-1 flex items-center gap-1"><Users size={12} /> {vehicle.capacity} Seat</span>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 relative z-10">
                          <button 
                            onClick={() => setScheduleModalData({ isOpen: true, vehicle, activeBooking: activeBooking || null })} 
                            className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-bold transition border border-amber-200 flex items-center justify-center gap-1"
                          >
                              <Clock size={14} /> Cek Jadwal
                          </button>
                          <button 
                            onClick={() => onOpenBookingModal(String(vehicle.id), vehicle.name, false, selectedDate)} 
                            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition border border-slate-200"
                          >
                              Pinjam Nanti
                          </button>
                      </div>
                  </div>
                );
              }
              else if (vehicle.status === "Servis") {
                return (
                  <div key={vehicle.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 opacity-70 flex flex-col justify-between h-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg border border-rose-200 shadow-sm flex items-center gap-1">
                              <AlertTriangle size={14} /> Sedang Servis
                          </span>
                      </div>
                      <div>
                          <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center">
                                  <CarFront size={24} />
                              </div>
                          </div>
                          <h3 className="font-extrabold text-slate-500 text-lg leading-tight mb-1">{vehicle.name}</h3>
                          <div className="flex gap-2 text-xs text-slate-400 font-medium mb-5">
                              <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{vehicle.platNumber}</span>
                              <span className="px-2 py-1 flex items-center gap-1"><Users size={12} /> {vehicle.capacity} Seat</span>
                          </div>
                      </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* ================= MODAL INFO JADWAL BENTROK ================= */}
      {scheduleModalData.isOpen && scheduleModalData.vehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setScheduleModalData({ isOpen: false, vehicle: null, activeBooking: null })} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-6 border-b border-amber-100 flex justify-between items-start rounded-t-3xl">
                <div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2 inline-block border border-amber-200">Info Jadwal</span>
                    <h3 className="text-xl font-extrabold text-slate-900">{scheduleModalData.vehicle.name}</h3>
                </div>
                <button onClick={() => setScheduleModalData({ isOpen: false, vehicle: null, activeBooking: null })} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 text-slate-400 transition">
                    <X size={18} />
                </button>
            </div>
            
            <div className="p-6 bg-white">
                <p className="text-sm text-slate-500 mb-5">
                  Kendaraan ini memiliki jadwal operasional pada tanggal terpilih. Anda masih bisa meminjamnya jika <b>tidak bertabrakan</b> dengan jadwal ini:
                </p>
                {scheduleModalData.activeBooking ? (
                  <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-400 border-4 border-white shadow-sm"></div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal Berjalan</p>
                              <span className="text-xs font-bold text-[#1a365d] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {scheduleModalData.activeBooking.timeOut} - {scheduleModalData.activeBooking.timeIn} WIB
                              </span>
                          </div>
                          <p className="font-bold text-slate-800 mb-0.5">{scheduleModalData.activeBooking.picName || "Pegawai"}</p>
                          <p className="text-sm text-slate-500">{scheduleModalData.activeBooking.destination}</p>
                      </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-4">Menunggu persetujuan / data detail tidak tersedia.</p>
                )}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-3xl">
                <button 
                  onClick={() => {
                    const v = scheduleModalData.vehicle;
                    setScheduleModalData({ isOpen: false, vehicle: null, activeBooking: null });
                    if (v) onOpenBookingModal(String(v.id), v.name, false, selectedDate);
                  }} 
                  className="w-full py-2.5 rounded-xl font-bold bg-[#1a365d] text-white hover:bg-[#12284a] shadow-lg shadow-blue-900/20"
                >
                    Pinjam di Luar Jam Ini
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}