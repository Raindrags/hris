// src/app/dashboard/persetujuan/page.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Asumsi Anda memakai komponen ini
import { useDashboard } from '@/app/carfleet/context/DashboardContext';

export default function PersetujuanPage() {
  const { persetujuan, kendaraan, approveBooking, rejectBooking } = useDashboard();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Ambil hanya mobil yang sedang tersedia
  const mobilTersedia = kendaraan.filter((k) => k.status === 'Tersedia');

  const handleApprove = async (id: string) => {
    // Simulasi Modal: Kita pakai window.prompt untuk memilih mobil (bisa diganti UI Modal Custom nanti)
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
        } catch (error: any) {
          alert(error.message);
        } finally {
          setLoadingId(null);
        }
      } else {
        alert('Pilihan tidak valid');
      }
    }
  };

  const handleReject = async (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan (contoh: Mobil dipakai direksi):');
    if (alasan) {
      try {
        setLoadingId(id);
        await rejectBooking(id, alasan);
        alert('Peminjaman ditolak!');
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-amber-500" /> Antrean Persetujuan
      </h1>

      {persetujuan.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center text-gray-500 rounded-lg border border-dashed">
          Hore! Tidak ada antrean persetujuan saat ini.
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Tujuan & Penumpang</th>
                <th className="p-4 font-semibold">Jadwal Pakai</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {persetujuan.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <strong className="block text-slate-900">{item.user?.name || 'User Tidak Diketahui'}</strong>
                    <span className="text-xs text-slate-500">ID: {item.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium">{item.destination}</span>
                    <Badge variant="outline" className="mt-1">{item.passengers} Penumpang</Badge>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                    <span className="text-xs text-slate-500">{item.timeOut} - {item.timeIn}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={loadingId === item.id}
                        className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 transition font-medium text-xs"
                      >
                        <CheckCircle size={14} /> Setuju
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={loadingId === item.id}
                        className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200 transition font-medium text-xs"
                      >
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
    </div>
  );
}