"use client";

import React, { useEffect, useState } from "react";
import {
  Bus,
  Car,
  Package,
  MapPin,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Clock3,
  XCircle,
  CarFront,
  AlertTriangle,
  Repeat,
  Check,
  Users,
  X
} from "lucide-react";
import { useUserBooking } from "@/app/carfleet/context/UserBookingContext";

export default function StatusView() {
  const {
    myBookings,
    fetchMyBookings,
    myRideShares,
    fetchMyRideShares,
    myPackages,
    fetchMyPackages,
    vehicles,       
    fetchVehicles,
    isLoading,
  } = useUserBooking();

  const [swapBookingId, setSwapBookingId] = useState<string | null>(null);
  const [selectedNewVehicleId, setSelectedNewVehicleId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    fetchMyBookings();
    fetchMyRideShares();
    fetchMyPackages();
    if (vehicles.length === 0) fetchVehicles();
  }, [fetchMyBookings, fetchMyRideShares, fetchMyPackages, fetchVehicles, vehicles.length]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleConfirmSwap = () => {
    if (!selectedNewVehicleId || !swapBookingId) return;
    const newVehicle = vehicles.find((v) => v.id === selectedNewVehicleId);
    if (newVehicle) {
      // TODO: Panggil endpoint backend Anda di sini untuk mengupdate vehicleId di tabel Booking
      // await updateBookingVehicle(swapBookingId, newVehicle.id);
      
      setSwapBookingId(null);
      setSelectedNewVehicleId(null);
      showToast(`Berhasil ganti kendaraan ke ${newVehicle.name}. Kunci siap diambil!`, "success");
      fetchMyBookings(); 
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: <Clock3 className="w-4 h-4 mr-1" /> };
      case "APPROVED":
        return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case "REJECTED":
        return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: <XCircle className="w-4 h-4 mr-1" /> };
      case "COMPLETED":
        return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      default:
        return { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", icon: <Info className="w-4 h-4 mr-1" /> };
    }
  };

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
      <Icon className="w-12 h-12 text-slate-300 mb-3" />
      <p className="text-slate-500 font-medium text-sm">{message}</p>
    </div>
  );

  // ✨ FILTER: HANYA TAMPILKAN YANG BUKAN "COMPLETED" DAN BUKAN "REJECTED"
  const activeBookings = myBookings.filter((b: any) => {
    const statusUpper = b.status?.toUpperCase();
    return statusUpper !== "COMPLETED" && statusUpper !== "REJECTED";
  });

  const activeRideShares = myRideShares.filter((r: any) => {
    const statusUpper = r.status?.toUpperCase();
    return statusUpper !== "COMPLETED" && statusUpper !== "REJECTED";
  });

  const activePackages = myPackages.filter((p: any) => {
    const statusUpper = p.status?.toUpperCase();
    return statusUpper !== "COMPLETED" && statusUpper !== "REJECTED";
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 pb-20 relative">
      
      {/* SECTION 1: PEMINJAMAN ARMADA */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-blue-100 text-[#1a365d] rounded-xl">
            <Bus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">Pengajuan Sewa Armada Aktif</h2>
        </div>

        {activeBookings.length === 0 ? (
          <EmptyState message="Tidak ada peminjaman armada yang sedang berjalan." icon={Bus} />
        ) : (
          <div className="space-y-6">
            {activeBookings.map((b: any) => {
              const v = vehicles.find((vec) => vec.id === b.vehicleId);
              const isConflict = b.status === "APPROVED" && v && v.status !== "Tersedia";
              const st = getStatusStyle(b.status);

              return (
                <div key={b.id} className="relative bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isConflict ? "bg-rose-500" : b.status === "APPROVED" ? "bg-emerald-500" : "bg-slate-300"}`}></div>

                  {isConflict && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex justify-center items-center shrink-0">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h4 className="text-rose-800 font-bold">Peringatan: Kendaraan Belum Kembali</h4>
                          <p className="text-rose-600/90 text-sm mt-0.5 leading-relaxed">
                            Mobil <b>{v.name}</b> berstatus <b>{v.status}</b> oleh peminjam sebelumnya. Jadwal Anda aman, silakan ganti mobil.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSwapBookingId(b.id)} 
                        className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 shrink-0 animate-pulse hover:animate-none"
                      >
                        <Repeat size={16} /> Ganti Mobil
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tujuan & Keperluan</p>
                          <h3 className="font-bold text-slate-900 text-xl">{b.destination}</h3>
                          <p className="text-sm text-slate-500 mt-1">{b.purpose || "Operasional"}</p>
                        </div>
                        <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                          {st.icon} {b.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
                        <div className="flex items-center text-slate-600 text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          {new Date(b.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center text-slate-600 text-sm font-medium">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          {b.timeOut} - {b.timeIn} WIB
                        </div>
                      </div>
                    </div>

                    {v && (
                      <div className="w-full md:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center shrink-0">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Kendaraan Terpilih</p>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${isConflict ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"} flex items-center justify-center shrink-0 shadow-inner`}>
                            <CarFront size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{v.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">
                                {v.platNumber}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${isConflict ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                                Status: {v.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {b.status === "APPROVED" && !isConflict && (
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex justify-center items-center">
                        <Check size={16} />
                      </div>
                      <p className="text-emerald-800 font-medium text-sm">Kendaraan siap! Kunci dapat diambil di ruang GA.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: NEBENG (RIDE SHARE) */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">Nebeng Aktif</h2>
        </div>

        {activeRideShares.length === 0 ? (
          <EmptyState message="Tidak ada perjalanan nebeng yang sedang berjalan." icon={Car} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRideShares.map((r: any) => {
              const st = getStatusStyle(r.status);
              return (
                <div key={r.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Titik Turun</p>
                        <h3 className="font-bold text-slate-800">{r.dropOff}</h3>
                      </div>
                    </div>
                    <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p>
                      Menebeng ke tujuan: <strong>{r.booking?.destination || "Memuat..."}</strong>
                    </p>
                    <p className="text-xs mt-1 font-medium">Dipesan: {r.seats} Kursi</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: TITIP BARANG */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">Titip Barang Aktif</h2>
        </div>

        {activePackages.length === 0 ? (
          <EmptyState message="Tidak ada penitipan barang/dokumen yang sedang berjalan." icon={Package} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePackages.map((p: any) => {
              const st = getStatusStyle(p.status);
              return (
                <div key={p.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Barang/Dokumen</p>
                      <h3 className="font-bold text-slate-800">{p.description}</h3>
                    </div>
                    <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <p>Penerima: <strong>{p.receiver}</strong></p>
                    <p className="text-xs mt-1 font-medium">
                      Via perjalanan ke: {p.booking?.destination || "..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL GANTI MOBIL */}
      {swapBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSwapBookingId(null)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-in slide-in-from-bottom-8 duration-300">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[2rem]">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pilih Mobil Pengganti</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hanya menampilkan kendaraan yang <span className="font-bold text-emerald-600">Tersedia</span>.
                </p>
              </div>
              <button onClick={() => setSwapBookingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.filter(v => v.status === 'Tersedia').map(v => {
                  const isSelected = selectedNewVehicleId === v.id;
                  return (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedNewVehicleId(v.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between bg-white 
                        ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-300'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-[#1a365d]'}`}>
                          <CarFront size={20} />
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{v.name}</h4>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1.5 font-medium">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{v.platNumber}</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-slate-400" /> {v.capacity} Seat</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-[2rem]">
              <button onClick={() => setSwapBookingId(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                Batal
              </button>
              <button 
                onClick={handleConfirmSwap} 
                disabled={!selectedNewVehicleId} 
                className="px-6 py-2.5 rounded-xl font-bold bg-[#1a365d] text-white hover:bg-[#12284a] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-blue-900/20"
              >
                Konfirmasi Pilihan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-[70] flex flex-col gap-3 animate-in slide-in-from-right-8 duration-300">
          <div className={`${toast.type === "success" ? "bg-emerald-600" : "bg-slate-900"} text-white px-5 py-3.5 rounded-xl shadow-xl font-medium flex items-center gap-3 min-w-[300px] border border-white/10`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} className="text-blue-400" />}
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}