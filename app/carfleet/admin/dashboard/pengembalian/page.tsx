// src/app/dashboard/pengembalian/page.tsx
'use client';

import { useState } from 'react';
import { KeyRound, CarFront } from 'lucide-react';
import { useDashboard } from '@/app/carfleet/context/DashboardContext';

export default function PengembalianPage() {
  const { pengembalian, returnVehicle } = useDashboard();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReturn = async (id: string, namaMobil: string) => {
    const jamAktual = prompt(`Jam berapa mobil ${namaMobil} dikembalikan? (Format: HH:MM, contoh: 15:30)`);
    
    if (jamAktual) {
      try {
        setLoadingId(id);
        await returnVehicle(id, jamAktual);
        alert('Pengembalian berhasil divalidasi! Mobil kini tersedia kembali.');
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
        <KeyRound className="w-6 h-6 text-indigo-500" /> Validasi Pengembalian
      </h1>

      {pengembalian.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center text-gray-500 rounded-lg border border-dashed">
          Tidak ada kendaraan yang sedang menunggu validasi pengembalian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pengembalian.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <CarFront size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {item.vehicle?.name || 'Mobil'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {item.vehicle?.platNumber || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-5 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-medium">{item.user?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Tujuan:</span>
                  <span className="font-medium">{item.destination}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Rencana Kembali:</span>
                  <span className="font-medium text-amber-600">{item.timeIn}</span>
                </div>
              </div>

              <button
                onClick={() => handleReturn(item.id, item.vehicle?.name || 'Kendaraan')}
                disabled={loadingId === item.id}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loadingId === item.id ? 'Memproses...' : (
                  <>
                    <KeyRound size={16} /> Terima Kunci
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}