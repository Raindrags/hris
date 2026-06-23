import React from 'react';
import { 
  X, Calendar, Clock, MapPin, User, Users, 
  Package, Bus, Phone, Clock3 
} from 'lucide-react';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';

interface AdminBookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminBookingDetailModal({ isOpen, onClose }: AdminBookingDetailModalProps) {
  const { bookingDetail, isDetailLoading, clearBookingDetail } = useDashboard();

  const handleClose = () => {
    clearBookingDetail();
    onClose();
  };

  if (!isOpen) return null;

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col justify-between border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* HEADER MODAL */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Detail Permohonan Armada</h2>
              <p className="text-xs text-slate-500">ID: {bookingDetail?.id || 'Memuat...'}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* 👇 GUNAKAN ISDETAILLOADING DI SINI */}
          {isDetailLoading || !bookingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">Mengambil detail data...</p>
            </div>
          ) : (
            <>
              {/* BANNER STATUS UTAMA */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Status Saat Ini</span>
                  <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border uppercase ${getStatusStyle(bookingDetail.status)}`}>
                    {bookingDetail.status}
                  </span>
                </div>
                {bookingDetail.rejectionReason && (
                  <div className="flex-1 bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                    <p className="text-xs font-bold text-rose-800">Alasan Penolakan:</p>
                    <p className="text-xs text-rose-700 mt-0.5">{bookingDetail.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* GRID INFO UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Pemohon</h3>
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3 text-sm">
                    {/* Menggunakan relasi User dari DashboardContext */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Pemohon:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" /> {bookingDetail.user?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">No. Kontak:</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" /> {bookingDetail.user?.phone || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Jumlah Rombongan:</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md text-xs">
                        {bookingDetail.passengers} Orang
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rute & Penjadwalan</h3>
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3 text-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 text-xs mt-0.5">Tujuan:</span>
                      <span className="font-bold text-slate-800 text-right max-w-[180px] flex items-start justify-end gap-1">
                        <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" /> {bookingDetail.destination}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Tanggal:</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" /> 
                        {new Date(bookingDetail.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Waktu Kerja:</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" /> {bookingDetail.timeOut} - {bookingDetail.timeIn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: DAFTAR PENUMPANG NEBENG */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Daftar Penumpang Nebeng ({bookingDetail.rideShares?.length || 0})
                </h3>
                
                {!bookingDetail.rideShares || bookingDetail.rideShares.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-sm text-slate-400">
                    Tidak ada penumpang nebeng untuk perjalanan ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookingDetail.rideShares.map((ride: any) => (
                      <div key={ride.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs text-indigo-700 font-bold">Menebeng: {ride.seats} Kursi</p>
                            <div className="flex items-start gap-1 text-sm text-slate-700 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="text-xs font-medium">Turun di: {ride.dropOff}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: DAFTAR TITIPAN BARANG */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  Daftar Titipan Barang / Dokumen ({bookingDetail.packages?.length || 0})
                </h3>
                
                {!bookingDetail.packages || bookingDetail.packages.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-sm text-slate-400">
                    Tidak ada titipan barang untuk perjalanan ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookingDetail.packages.map((pkg: any) => (
                      <div key={pkg.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{pkg.description}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Penerima: <span className="font-semibold text-slate-700">{pkg.receiver}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER MODAL */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}