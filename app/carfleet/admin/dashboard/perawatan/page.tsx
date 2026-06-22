'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { apiFetch } from '@/app/carfleet/lib/utils/api';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';

export default function PerawatanPage() {
  const { completeService } = useDashboard();
  const [ongoingServices, setOngoingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch daftar mobil yang sedang masuk bengkel (Status: ONGOING)
  const fetchOngoingServices = async () => {
    try {
      const history = await apiFetch('/api/v1/maintenance');
      // Filter hanya yang statusnya belum selesai
      setOngoingServices(history.filter((log: any) => log.status === 'ONGOING'));
    } catch (error) {
      console.error('Gagal mengambil data perawatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingServices();
  }, []);

  // Handler saat tombol selesai diklik
  const handleSelesai = async (logId: string) => {
    // Idealnya ini membuka Modal Form untuk input kilometer & harga.
    // Di contoh ini kita pakai prompt sederhana untuk simulasi.
    const biaya = prompt('Masukkan total biaya servis (Rp):');
    const km = prompt('Masukkan Kilometer kendaraan saat ini:');
    const nota = prompt('Detail perbaikan (contoh: Ganti oli & filter):');

    if (biaya && km && nota) {
      try {
        await completeService(logId, {
          kilometer: parseInt(km),
          cost: parseInt(biaya),
          description: nota,
          type: 'SERVIS'
        });
        alert('Servis selesai! Mobil kembali tersedia.');
        fetchOngoingServices(); 
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  if (loading) return <div>Memuat data bengkel...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Daftar Mobil Dalam Perbaikan</h1>
      
      {ongoingServices.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-lg">
          Tidak ada kendaraan yang sedang di bengkel saat ini.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 border-b">Kendaraan</th>
                <th className="p-4 border-b">Tgl Masuk</th>
                <th className="p-4 border-b">Keluhan Awal</th>
                <th className="p-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ongoingServices.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b font-medium">{log.vehicle.name} ({log.vehicle.platNumber})</td>
                  <td className="p-4 border-b">{new Date(log.date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 border-b text-red-600">{log.description}</td>
                  <td className="p-4 border-b">
                    <button 
                      onClick={() => handleSelesai(log.id)}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Selesai & Catat
                    </button>
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