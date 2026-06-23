'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Info, Users, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; 
import { useDashboard } from '@/app/carfleet/context/DashboardContext';
import AdminBookingDetailModal from '../modals/AdminBookingDetailModal';

export default function PersetujuanPage() {
  const { 
    persetujuan, 
    kendaraan, 
    approveBooking, 
    rejectBooking, 
    fetchBookingDetail,
    // Context Nebeng & Titipan
    persetujuanNebeng,
    persetujuanTitipan,
    approveRideShare,
    rejectRideShare,
    approvePackage,
    rejectPackage
  } = useDashboard();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // HANDLER ARMADA UTAMA
  // ==========================================
  const mobilTersedia = kendaraan.filter((k) => k.status === 'Tersedia');

  const handleOpenDetail = async (id: string) => {
    await fetchBookingDetail(id);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (mobilTersedia.length === 0) {
      alert('Tidak ada mobil yang tersedia saat ini!');
      return;
    }
    const daftarMobil = mobilTersedia.map((m, i) => `${i + 1}. ${m.name} (${m.platNumber})`).join('\n');
    const pilihan = prompt(`Pilih nomor mobil yang akan di-assign:\n${daftarMobil}`);
    
    if (pilihan) {
      const index = parseInt(pilihan) - 1;
      const mobilTerpilih = mobilTersedia[index];
      if (mobilTerpilih) {
        try {
          setLoadingId(id);
          await approveBooking(id, mobilTerpilih.id);
          alert('Peminjaman disetujui!');
        } catch (error: any) { alert(error.message); } 
        finally { setLoadingId(null); }
      } else { alert('Pilihan tidak valid'); }
    }
  };

  const handleReject = async (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (alasan) {
      try {
        setLoadingId(id);
        await rejectBooking(id, alasan);
        alert('Peminjaman ditolak!');
      } catch (error: any) { alert(error.message); } 
      finally { setLoadingId(null); }
    }
  };

  // ==========================================
  // HANDLER NEBENG
  // ==========================================
  const handleApproveNebeng = async (id: string) => {
    if (confirm('Setujui penumpang ini untuk nebeng?')) {
      setLoadingId(id);
      await approveRideShare(id);
      setLoadingId(null);
    }
  };

  const handleRejectNebeng = async (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan nebeng:');
    if (alasan) {
      setLoadingId(id);
      await rejectRideShare(id, alasan);
      setLoadingId(null);
    }
  };

  // ==========================================
  // HANDLER TITIPAN
  // ==========================================
  const handleApproveTitipan = async (id: string) => {
    if (confirm('Setujui titipan barang ini?')) {
      setLoadingId(id);
      await approvePackage(id);
      setLoadingId(null);
    }
  };

  const handleRejectTitipan = async (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan titipan barang:');
    if (alasan) {
      setLoadingId(id);
      await rejectPackage(id, alasan);
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-10">
      
      {/* --- SEKSI 1: ANTREAN ARMADA UTAMA --- */}
      <section>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Antrean Peminjaman Armada
        </h1>
        {persetujuan.length === 0 ? (
          <div className="bg-slate-50 p-6 text-center text-slate-500 rounded-lg border border-dashed text-sm">
            Tidak ada antrean persetujuan armada.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Peminjam Utama</th>
                  <th className="p-4 font-semibold">Tujuan & Penumpang</th>
                  <th className="p-4 font-semibold">Jadwal Pakai</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {persetujuan.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <strong className="block text-slate-900">{item.user?.name || 'User'}</strong>
                      <span className="text-xs text-slate-500">ID: {item.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{item.destination}</span>
                      <Badge variant="outline" className="mt-1">{item.passengers} Orang</Badge>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                      <span className="text-xs text-slate-500">{item.timeOut} - {item.timeIn}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenDetail(item.id)} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 text-xs disabled:opacity-50">
                          <Info size={14} /> Detail
                        </button>
                        <button onClick={() => handleApprove(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-xs disabled:opacity-50">
                          <CheckCircle size={14} /> Setuju
                        </button>
                        <button onClick={() => handleReject(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 text-xs disabled:opacity-50">
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- SEKSI 2: ANTREAN NEBENG --- */}
      <section>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Antrean Join Ride (Nebeng)
        </h1>
        {persetujuanNebeng?.length === 0 || !persetujuanNebeng ? (
          <div className="bg-slate-50 p-6 text-center text-slate-500 rounded-lg border border-dashed text-sm">
            Tidak ada permohonan nebeng saat ini.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Pemohon Nebeng</th>
                  <th className="p-4 font-semibold">Nebeng di Perjalanan</th>
                  <th className="p-4 font-semibold">Detail Nebeng</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {persetujuanNebeng.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <strong className="block text-slate-900">{item.user?.name}</strong>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{item.booking?.destination}</span>
                      <span className="text-xs text-slate-500">
                        {item.booking?.date ? new Date(item.booking.date).toLocaleDateString('id-ID') : '-'}
                      </span>
                      {item.booking?.vehicle && (
                        <Badge variant="outline" className="mt-1 block w-fit">Mobil: {item.booking.vehicle.platNumber}</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="block">{item.seats} Kursi</span>
                      <span className="text-xs text-slate-500">Turun di: {item.dropOff}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleApproveNebeng(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-xs">
                          <CheckCircle size={14} /> Setuju
                        </button>
                        <button onClick={() => handleRejectNebeng(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 text-xs">
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- SEKSI 3: ANTREAN TITIPAN BARANG --- */}
      <section>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" /> Antrean Titipan Barang
        </h1>
        {persetujuanTitipan?.length === 0 || !persetujuanTitipan ? (
          <div className="bg-slate-50 p-6 text-center text-slate-500 rounded-lg border border-dashed text-sm">
            Tidak ada permohonan titip barang saat ini.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Pengirim</th>
                  <th className="p-4 font-semibold">Numpang di Perjalanan</th>
                  <th className="p-4 font-semibold">Detail Barang</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {persetujuanTitipan.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <strong className="block text-slate-900">{item.user?.name}</strong>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{item.booking?.destination}</span>
                      <span className="text-xs text-slate-500">
                        {item.booking?.date ? new Date(item.booking.date).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{item.description}</span>
                      <span className="text-xs text-slate-500">Penerima: {item.receiver}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleApproveTitipan(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-xs">
                          <CheckCircle size={14} /> Setuju
                        </button>
                        <button onClick={() => handleRejectTitipan(item.id)} disabled={loadingId === item.id} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 text-xs">
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Detail Armada Utama */}
      <AdminBookingDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}